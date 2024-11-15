import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";
import md5 from "spark-md5";
import { ACCESS_CODE_PREFIX, ModelProvider, ONEAPI_BACKEND_URL, CHATKEY_AESKEY } from "../constant";
import CryptoJS from "crypto-js";

const serverConfig = getServerSideConfig();

function getIP(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  return ip;
}

function parseApiKey(bearToken: string) {
  const token = bearToken.trim().replaceAll("Bearer ", "").trim();
  const isApiKey = !token.startsWith(ACCESS_CODE_PREFIX);

  return {
    accessCode: isApiKey ? "" : token.slice(ACCESS_CODE_PREFIX.length),
    apiKey: isApiKey ? token : "",
  };
}

function decryptAES(encryptedBase64: string, aesKey: string) {
  // 将 base64 编码的字符串解码为 WordArray
  const encryptedWA = CryptoJS.enc.Base64.parse(encryptedBase64);

  // 将密钥字符串转换为 WordArray
  const keyWA = CryptoJS.enc.Utf8.parse(aesKey);

  // 使用密钥的前 16 字节作为 IV
  const ivWA = CryptoJS.enc.Utf8.parse(aesKey).clone();
  ivWA.sigBytes = 16; // 对于 AES，blockSize 通常是 16 字节

  // 解密
  const decryptedWA = CryptoJS.AES.decrypt(encryptedBase64, keyWA, {
    iv: ivWA,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // 转换为 UTF-8 字符串
  const decryptedText = decryptedWA.toString(CryptoJS.enc.Utf8);

  return decryptedText;
}

export async function auth(req: NextRequest, modelProvider: ModelProvider) {
  const authToken = req.headers.get("Authorization") ?? "";

  // check if it is openai api key or user token
  const { accessCode, apiKey } = parseApiKey(authToken);

  const hashedCode = md5.hash(accessCode ?? "").trim();

  const serverConfig = getServerSideConfig();
  console.log("[Auth] allowed hashed codes: ", [...serverConfig.codes]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[User IP] ", getIP(req));
  console.log("[Time] ", new Date().toLocaleString());

  if (accessCode.length < 15) {
    return {
      error: true,
      msg: "you are not allowed to access with this key",
    }
  }

  // 发送POST请求
  const response = await fetch((serverConfig.oneapi_backend_url || ONEAPI_BACKEND_URL) + "/api/chatkey?key=" + accessCode, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // 等待响应并解析为JSON
  const chatkeyResult = await response.json();

  console.log("accessCode:" + accessCode);
  console.log(chatkeyResult);

  if (chatkeyResult && chatkeyResult.success) {
    const api_key = decryptAES(chatkeyResult.api_key, serverConfig.chatkey_aeskey || CHATKEY_AESKEY);

    req.headers.set("Authorization", `Bearer ${api_key}`);
  }

  // if (serverConfig.hideUserApiKey && !!apiKey) {
  //   return {
  //     error: true,
  //     msg: "you are not allowed to access with your own api key",
  //   };
  // }

  // if user does not provide an api key, inject system api key
  // if (!apiKey) {
  //   const serverConfig = getServerSideConfig();

  //   const systemApiKey =
  //     modelProvider === ModelProvider.GeminiPro
  //       ? serverConfig.googleApiKey
  //       : serverConfig.isAzure
  //       ? serverConfig.azureApiKey
  //       : serverConfig.apiKey;
  //   if (systemApiKey) {
  //     console.log("[Auth] use system api key");
  //     req.headers.set("Authorization", `Bearer ${systemApiKey}`);
  //   } else {
  //     console.log("[Auth] admin did not provide an api key");
  //   }
  // } else {
  //   console.log("[Auth] use user api key");
  // }

  return {
    error: false,
    msg: '',
  };
}
