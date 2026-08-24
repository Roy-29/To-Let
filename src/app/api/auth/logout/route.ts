import { NextResponse } from "next/server";
import * as authService from "@/services/authService";
import { errorResponse, successResponse } from "@/lib/errors";

export async function POST() {
  try {
    await authService.logout();
    return NextResponse.json(successResponse(null));
  } catch (error) {
    const res = errorResponse(error);
    return NextResponse.json({ success: res.success, error: res.error }, { status: res.statusCode });
  }
}
