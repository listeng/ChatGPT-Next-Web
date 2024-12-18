import { NextRequest, NextResponse } from "next/server";
import { ONEAPI_BACKEND_URL } from "@/app/constant";
import { getServerSideConfig } from "@/app/config/server";

const serverConfig = getServerSideConfig();

async function models(req: NextRequest) {
  const response = await fetch(
    (serverConfig.oneapi_backend_url || ONEAPI_BACKEND_URL) + "/api/modellist",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const result = await response.json();

  return NextResponse.json(JSON.parse(result["data"]), {
    status: 200,
  });
}

export const GET = models;
export const POST = models;

export const runtime = "edge";
