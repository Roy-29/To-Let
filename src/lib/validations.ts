import { z } from "zod";

// ─── Common ────────────────────────────────────────────
export const idSchema = z.string().cuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Auth ──────────────────────────────────────────────
export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address").max(255),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128)
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    role: z.enum(["TENANT", "LANDLORD"], {
      error: "Role must be TENANT or LANDLORD",
    }),
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Profile ───────────────────────────────────────────
export const tenantProfileSchema = z.object({
  phone: z.string().max(20).optional(),
  profileImage: z.string().url().optional(),
  preferredLocation: z.string().max(255).optional(),
  minimumBudget: z.number().min(0).optional(),
  maximumBudget: z.number().min(0).optional(),
  preferredPropertyType: z
    .enum(["APARTMENT", "HOUSE", "ROOM", "SUBLET", "HOSTEL", "OFFICE", "OTHER"])
    .optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  moveInDate: z.coerce.date().optional(),
  occupancyType: z
    .enum(["FAMILY", "BACHELOR", "STUDENT", "PROFESSIONAL", "ROOMMATE", "OTHER"])
    .optional(),
});

export const landlordProfileSchema = z.object({
  phone: z.string().max(20).optional(),
  profileImage: z.string().url().optional(),
});

// ─── Property ──────────────────────────────────────────
export const propertyCreateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().max(5000).optional(),
  propertyType: z.enum(["APARTMENT", "HOUSE", "ROOM", "SUBLET", "HOSTEL", "OFFICE", "OTHER"]),
  address: z.string().min(5, "Address must be at least 5 characters").max(500),
  area: z.string().max(100).optional(),
  city: z.string().min(2).max(100),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  rent: z.number().positive("Rent must be positive"),
  securityDeposit: z.number().min(0).optional(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  size: z.number().positive().optional(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().positive().optional(),
  availableFrom: z.coerce.date().optional(),
  furnishingStatus: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).optional(),
  parking: z.boolean().default(false),
  rules: z.string().max(2000).optional(),
});

export const propertyUpdateSchema = propertyCreateSchema.partial();

export const propertySearchSchema = z.object({
  city: z.string().optional(),
  area: z.string().optional(),
  minRent: z.coerce.number().min(0).optional(),
  maxRent: z.coerce.number().min(0).optional(),
  propertyType: z
    .enum(["APARTMENT", "HOUSE", "ROOM", "SUBLET", "HOSTEL", "OFFICE", "OTHER"])
    .optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  furnishingStatus: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).optional(),
  availableFrom: z.coerce.date().optional(),
  sortBy: z.enum(["NEWEST", "PRICE_LOW_TO_HIGH", "PRICE_HIGH_TO_LOW"]).default("NEWEST"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Property Image ────────────────────────────────────
export const propertyImageSchema = z.object({
  url: z.string().url(),
  storagePath: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

// ─── Inquiry ─────────────────────────────────────────────
export const inquiryCreateSchema = z.object({
  propertyId: z.string().cuid(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

// ─── Message & Conversation ──────────────────────────────
export const conversationCreateSchema = z.object({
  propertyId: z.string().cuid(),
});

export const messageCreateSchema = z.object({
  conversationId: z.string().cuid(),
  message: z.string().min(1, "Message cannot be empty").max(4000),
});

// ─── Visit Request ───────────────────────────────────────
export const visitCreateSchema = z.object({
  propertyId: z.string().cuid(),
  requestedDate: z.coerce.date().min(new Date(), "Requested date cannot be in the past"),
  requestedTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  message: z.string().max(1000).optional(),
});

// ─── Rental Application ────────────────────────────────────
export const applicationCreateSchema = z.object({
  propertyId: z.string().cuid(),
  moveInDate: z.coerce.date().min(new Date(), "Move in date cannot be in the past").optional(),
  message: z.string().max(1000).optional(),
});

// ─── Tenancy ─────────────────────────────────────────────
export const tenancyCreateSchema = z.object({
  applicationId: z.string().cuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  monthlyRent: z.number().positive(),
  securityDeposit: z.number().nonnegative().optional(),
}).refine(data => !data.endDate || data.endDate >= data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

// ─── Rental Agreement ────────────────────────────────────
export const agreementCreateSchema = z.object({
  tenancyId: z.string().cuid(),
  documentUrl: z.string().url().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
}).refine(data => !data.endDate || data.endDate >= data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

export const agreementUpdateSchema = z.object({
  documentUrl: z.string().url().optional(),
  signedByTenant: z.boolean().optional(),
  signedByLandlord: z.boolean().optional(),
});

// ─── Rent Record ─────────────────────────────────────────
export const rentRecordCreateSchema = z.object({
  tenancyId: z.string().cuid(),
  billingMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format must be YYYY-MM"),
  dueDate: z.coerce.date(),
  amount: z.number().positive(),
});

// ─── Payment ─────────────────────────────────────────────
export const paymentCreateSchema = z.object({
  tenancyId: z.string().cuid(),
  rentRecordId: z.string().cuid().optional(),
  amount: z.number().positive(),
  provider: z.string().optional(),
  providerTransactionId: z.string().optional(),
  metadata: z.string().optional(),
});

// ─── Maintenance Request ───────────────────────────────────
export const maintenanceCreateSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(2000),
  category: z.enum(["PLUMBING", "ELECTRICAL", "AC", "APPLIANCE", "SECURITY", "CLEANING", "OTHER"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export const maintenanceNoteSchema = z.object({
  note: z.string().min(1).max(1000),
});

// ─── ERP Filters ─────────────────────────────────────────
export const erpFilterSchema = z.object({
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  propertyId: z.string().cuid().optional(),
  tenantId: z.string().cuid().optional(),
});

// ─── Admin Users & Moderation ───────────────────────────────
export const adminUserFilterSchema = z.object({
  role: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const propertyModerationSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "REQUEST_CHANGES"]),
  reason: z.string().optional(), // required for reject/changes
});

export const reportCreateSchema = z.object({
  targetType: z.enum(["PROPERTY", "USER"]),
  targetId: z.string().cuid(),
  reason: z.string(), // e.g. "FAKE_LISTING"
  description: z.string().max(1000).optional(),
});

export const reportModerationSchema = z.object({
  action: z.enum(["RESOLVE", "DISMISS"]),
  resolutionNote: z.string().optional(),
});

export const analyticsFilterSchema = z.object({
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
});

// ─── Type exports ──────────────────────────────────────
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TenantProfileInput = z.infer<typeof tenantProfileSchema>;
export type LandlordProfileInput = z.infer<typeof landlordProfileSchema>;
export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;
export type PropertySearchInput = z.infer<typeof propertySearchSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type PropertyImageSchemaInput = z.infer<typeof propertyImageSchema>;
export type InquiryCreateInput = z.infer<typeof inquiryCreateSchema>;
export type ConversationCreateInput = z.infer<typeof conversationCreateSchema>;
export type MessageCreateInput = z.infer<typeof messageCreateSchema>;
export type VisitCreateInput = z.infer<typeof visitCreateSchema>;
export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;
export type TenancyCreateInput = z.infer<typeof tenancyCreateSchema>;
export type AgreementCreateInput = z.infer<typeof agreementCreateSchema>;
export type AgreementUpdateInput = z.infer<typeof agreementUpdateSchema>;
export type RentRecordCreateInput = z.infer<typeof rentRecordCreateSchema>;
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type MaintenanceCreateInput = z.infer<typeof maintenanceCreateSchema>;
export type MaintenanceNoteInput = z.infer<typeof maintenanceNoteSchema>;
export type ErpFilterInput = z.infer<typeof erpFilterSchema>;
export type AdminUserFilterInput = z.infer<typeof adminUserFilterSchema>;
export type PropertyModerationInput = z.infer<typeof propertyModerationSchema>;
export type ReportCreateInput = z.infer<typeof reportCreateSchema>;
export type ReportModerationInput = z.infer<typeof reportModerationSchema>;
export type AnalyticsFilterInput = z.infer<typeof analyticsFilterSchema>;
