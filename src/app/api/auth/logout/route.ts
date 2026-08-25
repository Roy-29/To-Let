import { NextRequest, NextResponse } from "next/server";
import * as authService from "@/services/authService";
import { errorResponse } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    await authService.logout();
    return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  } catch (error) {
    const res = errorResponse(error);
    return NextResponse.json({ success: res.success, error: res.error }, { status: res.statusCode });
  }
}
