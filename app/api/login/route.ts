// /app/api/login.ts
import { NextRequest, NextResponse } from "next/server";
import { ONEAPI_BACKEND_URL } from "@/app/constant";
import { getServerSideConfig } from "@/app/config/server";

const serverConfig = getServerSideConfig();

async function handle(req: NextRequest) {
  // 从请求体中获取登录数据
  const { username, password } = await req.json();

  console.log("[Login]", username);
  console.log("[Login URL]", serverConfig.oneapi_backend_url);

  // 发送POST请求
  const response = await fetch((serverConfig.oneapi_backend_url || ONEAPI_BACKEND_URL) + '/api/chatlogin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({username: username, password: password}),
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

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
