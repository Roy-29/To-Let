import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { verifyAdmin } from "@/lib/auth";
import { logAudit } from "./auditService";
import { createNotification } from "./notificationService";
import type { ReportCreateInput } from "@/lib/validations";

export async function createReport(reporterId: string, data: ReportCreateInput) {
  const report = await prisma.report.create({
    data: {
      reporterId,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
      description: data.description,
    },
  });

  // Notify admins
  const admins = await prisma.user.findMany({ where: { role: "ADMIN", status: "ACTIVE" } });
  for (const admin of admins) {
    await createNotification(
      admin.id,
      "NEW_REPORT",
      "New Report Submitted",
      `A new report was submitted for ${data.targetType}.`,
      "REPORT",
      report.id
    );
  }

  return report;
}

export async function getReports(adminId: string, filters: any, page = 1, limit = 20) {
  await verifyAdmin(adminId);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.targetType) where.targetType = filters.targetType;
  if (filters.search) {
    where.reason = { contains: filters.search };
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: { reporter: { select: { name: true, email: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.report.count({ where }),
  ]);

  return { reports, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getReportById(adminId: string, reportId: string) {
  await verifyAdmin(adminId);

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { reporter: { select: { name: true, email: true } } },
  });

  if (!report) throw new AppError("REPORT_NOT_FOUND", "Report not found");

  return report;
}

export async function startReportReview(adminId: string, reportId: string) {
  await verifyAdmin(adminId);

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new AppError("REPORT_NOT_FOUND", "Report not found");
  if (report.status !== "OPEN") throw new AppError("INVALID_REPORT_TRANSITION", "Report is not open");

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: { status: "UNDER_REVIEW" },
  });

  await logAudit(adminId, "REPORT_REVIEW_STARTED", "REPORT", reportId);

  return updated;
}

export async function resolveReport(adminId: string, reportId: string, resolutionNote?: string) {
  await verifyAdmin(adminId);

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new AppError("REPORT_NOT_FOUND", "Report not found");
  if (report.status === "RESOLVED" || report.status === "DISMISSED") {
    throw new AppError("REPORT_ALREADY_RESOLVED", "Report is already closed");
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: { status: "RESOLVED", resolvedAt: new Date(), resolutionNote },
  });

  await logAudit(adminId, "REPORT_RESOLVED", "REPORT", reportId, { resolutionNote });

  return updated;
}

export async function dismissReport(adminId: string, reportId: string, resolutionNote?: string) {
  await verifyAdmin(adminId);

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new AppError("REPORT_NOT_FOUND", "Report not found");
  if (report.status === "RESOLVED" || report.status === "DISMISSED") {
    throw new AppError("REPORT_ALREADY_RESOLVED", "Report is already closed");
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: { status: "DISMISSED", resolvedAt: new Date(), resolutionNote },
  });

  await logAudit(adminId, "REPORT_DISMISSED", "REPORT", reportId, { resolutionNote });

  return updated;
}
