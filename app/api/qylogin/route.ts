// /app/api/login.ts
import { NextRequest, NextResponse } from "next/server";
import { ONEAPI_BACKEND_URL } from "@/app/constant";
import { getServerSideConfig } from "@/app/config/server";

const serverConfig = getServerSideConfig();

async function doLogin(req: NextRequest) {
  // 从请求体中获取登录数据
  const { code } = await req.json();

  console.log("[Login QY code]", code);
  console.log("[Login URL]", serverConfig.oneapi_backend_url);

  // 发送POST请求
  const response = await fetch((serverConfig.oneapi_backend_url || ONEAPI_BACKEND_URL) + '/api/qychatlogin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({code: code}),
  });

  // 等待响应并解析为JSON
  const loginResult = await response.json();


  // 检查是否有data.token，然后返回
  if (loginResult && loginResult.success) {
    return NextResponse.json(
      { code: true, token: loginResult.data },
      {
        status: 200,
      },
    );
  } else {
    return NextResponse.json(
      { code: false},
      {
        status: 401,
      },
    );
  }
}

async function getUrl(req: NextRequest) {
  const response = await fetch((serverConfig.oneapi_backend_url || ONEAPI_BACKEND_URL) + '/api/qychatlogin', {
    method: 'GET',
  });

  const loginResult = await response.json();

  if (loginResult && loginResult.success) {
    return NextResponse.json(
      { code: true, url: loginResult.data },
      {
        status: 200,
      },
    );
  } else {
    return NextResponse.json(
      { code: false},
      {
        status: 401,
      },
    );
  }
}

export const GET = getUrl;
export const POST = doLogin;

export const runtime = "edge";
