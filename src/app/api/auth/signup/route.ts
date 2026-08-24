import { NextRequest, NextResponse } from "next/server";
import * as authService from "@/services/authService";
import { signupSchema } from "@/lib/validations";
import { errorResponse, successResponse } from "@/lib/errors";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = signupSchema.parse(body);
    const user = await authService.signup(data);
    return NextResponse.json(successResponse(user), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: error.issues.map((e) => e.message).join(", ") } },
        { status: 400 }
      );
    }
    const res = errorResponse(error);
    return NextResponse.json({ success: res.success, error: res.error }, { status: res.statusCode });
  }
}
