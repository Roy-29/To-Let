import { NextResponse } from "next/server";
import * as authService from "@/services/authService";
import { errorResponse, successResponse } from "@/lib/errors";

export async function GET() {
  try {
    const user = await authService.me();
    return NextResponse.json(successResponse(user));
  } catch (error) {
    const res = errorResponse(error);
    return NextResponse.json({ success: res.success, error: res.error }, { status: res.statusCode });
  }
}
