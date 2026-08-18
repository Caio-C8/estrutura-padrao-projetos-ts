import { NextResponse } from "next/server";
import type { AppEnvironment, HealthResponse } from "@repo/contracts";

export function GET() {
  const response: HealthResponse = {
    status: "ok",
    service: "web",
    environment: (process.env.NEXT_PUBLIC_APP_ENV ??
      "development") as AppEnvironment,
    version: process.env.APP_VERSION ?? "0.1.0",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
