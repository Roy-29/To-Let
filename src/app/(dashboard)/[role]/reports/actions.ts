"use server";

import { getCurrentUser } from "@/lib/session";
import { startReportReview, resolveReport, dismissReport } from "@/services/reportService";
import { revalidatePath } from "next/cache";

export async function startReportReviewAction(reportId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  await startReportReview(user.id, reportId);
  revalidatePath("/reports");
  revalidatePath(`/reports/${reportId}`);
}

export async function resolveReportAction(reportId: string, resolutionNote: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  await resolveReport(user.id, reportId, resolutionNote);
  revalidatePath("/reports");
  revalidatePath(`/reports/${reportId}`);
}

export async function dismissReportAction(reportId: string, resolutionNote: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  await dismissReport(user.id, reportId, resolutionNote);
  revalidatePath("/reports");
  revalidatePath(`/reports/${reportId}`);
}
