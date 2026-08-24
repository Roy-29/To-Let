"use server";

import * as authService from "@/services/authService";
import { errorResponse, successResponse, type ActionResult } from "@/lib/errors";
import { ZodError } from "zod";

function formatZodError(error: ZodError): string {
  return error.issues.map((e) => e.message).join(", ");
}

export async function signupAction(
  formData: FormData
): Promise<ActionResult<{ id: string; name: string; email: string; role: string }>> {
  try {
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      role: formData.get("role") as "TENANT" | "LANDLORD",
    };

    const user = await authService.signup(data);
    return successResponse(user);
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: formatZodError(error) } };
    }
    const res = errorResponse(error);
    return { success: false, error: res.error };
  }
}

export async function loginAction(
  formData: FormData
): Promise<ActionResult<{ id: string; name: string; email: string; role: string }>> {
  try {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const user = await authService.login(data);
    return successResponse(user);
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: formatZodError(error) } };
    }
    const res = errorResponse(error);
    return { success: false, error: res.error };
  }
}

export async function logoutAction(): Promise<ActionResult> {
  try {
    await authService.logout();
    return successResponse(undefined);
  } catch (error) {
    const res = errorResponse(error);
    return { success: false, error: res.error };
  }
}

export async function meAction(): Promise<ActionResult<{
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
} | null>> {
  try {
    const user = await authService.me();
    return successResponse(user);
  } catch (error) {
    const res = errorResponse(error);
    return { success: false, error: res.error };
  }
}
