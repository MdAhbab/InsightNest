/**
 * Typed API endpoint functions for InsightNest.
 * All types are defined here from the backend contract (audit §3) +
 * the old frontend types.ts for compatibility.
 */

import {
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiAuthPost,
  apiUpload,
  apiDownloadUrl,
  PageResponse,
} from "./client";

// ─── Shared ───────────────────────────────────────────────────────────────────

export type { PageResponse };

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  roles: string[]; // e.g. ["LEARNER"] | ["FACULTY"] | ["UNIVERSITY_REP"] | ["ADMIN"]
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export function authRegister(payload: {
  fullName: string;
  email: string;
  password: string;
  role: "LEARNER" | "FACULTY" | "UNIVERSITY_REP";
}): Promise<AuthResponse> {
  return apiAuthPost<AuthResponse>("/auth/register", payload);
}

export function authLogin(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiAuthPost<AuthResponse>("/auth/login", payload);
}

export function authRefresh(payload: { refreshToken: string }): Promise<AuthResponse> {
  return apiAuthPost<AuthResponse>("/auth/refresh", payload);
}

export function authLogout(payload: { refreshToken: string }): Promise<void> {
  return apiPost<void>("/auth/logout", payload);
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  roles: string[];
  status?: string;
  createdAt?: string;
}

export interface PublicUserDto {
  id: number;
  fullName: string;
  roles: string[];
  joinedAt?: string;
  learnerProfile?: LearnerProfileDto;
  facultyProfile?: FacultyProfileDto;
}

export function usersMe(): Promise<UserDto> {
  return apiGet<UserDto>("/users/me");
}

export function usersGetPublic(id: number): Promise<PublicUserDto> {
  return apiGet<PublicUserDto>(`/users/${id}/public`);
}

export function usersList(params?: {
  page?: number;
  size?: number;
  q?: string;
}): Promise<PageResponse<UserDto>> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  if (params?.q) sp.set("q", params.q);
  const qs = sp.toString();
  return apiGet<PageResponse<UserDto>>(`/users${qs ? `?${qs}` : ""}`);
}

export function usersPatchStatus(id: number, suspended: boolean): Promise<UserDto> {
  return apiPatch<UserDto>(`/users/${id}/status`, { suspended });
}

export function usersChangePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  return apiPost<void>("/users/me/password", payload);
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface LearnerProfileDto {
  id?: number;
  educationHistory?: string;
  cgpa?: string;
  ieltsScore?: string;
  projects?: string;
  publications?: string;
  hobbies?: string;
  nationality?: string;
  socialLinks?: string;
  bio?: string;
}

export interface FacultyProfileDto {
  id?: number;
  expertise?: string;
  researchInterests?: string;
  department?: string;
  website?: string;
  linkedIn?: string;
  taughtCourses?: string;
  publications?: string;
  bio?: string;
}

export function learnerProfileGet(): Promise<LearnerProfileDto> {
  return apiGet<LearnerProfileDto>("/profile/learner");
}

export function learnerProfilePut(data: LearnerProfileDto): Promise<LearnerProfileDto> {
  return apiPut<LearnerProfileDto>("/profile/learner", data);
}

export function facultyProfileGet(): Promise<FacultyProfileDto> {
  return apiGet<FacultyProfileDto>("/profile/faculty");
}

export function facultyProfilePut(data: FacultyProfileDto): Promise<FacultyProfileDto> {
  return apiPut<FacultyProfileDto>("/profile/faculty", data);
}

// ─── Universities ─────────────────────────────────────────────────────────────

export interface UniversityDto {
  id: number;
  name: string;
  country: string;
  city: string;
  ranking?: number | null;
  website?: string;
  description?: string;
  archived?: boolean;
  createdAt?: string;
  // extended (§3.1)
  foundedYear?: number | null;
  studentCount?: number | null;
  tags?: string[] | null;
}

export function universitiesList(params?: {
  page?: number;
  size?: number;
  q?: string;
}): Promise<PageResponse<UniversityDto>> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  if (params?.q) sp.set("q", params.q);
  const qs = sp.toString();
  return apiGet<PageResponse<UniversityDto>>(`/universities${qs ? `?${qs}` : ""}`);
}

export function universitiesGet(id: number): Promise<UniversityDto> {
  return apiGet<UniversityDto>(`/universities/${id}`);
}

export function universitiesCreate(data: Partial<UniversityDto>): Promise<UniversityDto> {
  return apiPost<UniversityDto>("/universities", data);
}

export function universitiesUpdate(id: number, data: Partial<UniversityDto>): Promise<UniversityDto> {
  return apiPut<UniversityDto>(`/universities/${id}`, data);
}

// ─── Programs ─────────────────────────────────────────────────────────────────

export interface ProgramDto {
  id: number;
  name: string;
  type?: string;       // "level" in FE mock
  department?: string; // "discipline" in FE mock
  duration?: string;
  description?: string;
  applicationDeadline?: string | null;
  archived?: boolean;
  createdAt?: string;
  university?: { id: number; name: string; country?: string; city?: string } | null;
  // extended (§3.1)
  tuition?: string | null;
}

export function programsList(params?: {
  page?: number;
  size?: number;
  q?: string;
  type?: string;
  department?: string;
  universityId?: number;
}): Promise<PageResponse<ProgramDto>> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  if (params?.q) sp.set("q", params.q);
  if (params?.type) sp.set("type", params.type);
  if (params?.department) sp.set("department", params.department);
  if (params?.universityId != null) sp.set("universityId", String(params.universityId));
  const qs = sp.toString();
  return apiGet<PageResponse<ProgramDto>>(`/programs${qs ? `?${qs}` : ""}`);
}

export function programsGet(id: number): Promise<ProgramDto> {
  return apiGet<ProgramDto>(`/programs/${id}`);
}

export function programsCreate(data: Partial<ProgramDto>): Promise<ProgramDto> {
  return apiPost<ProgramDto>("/programs", data);
}

export function programsUpdate(id: number, data: Partial<ProgramDto>): Promise<ProgramDto> {
  return apiPut<ProgramDto>(`/programs/${id}`, data);
}

// ─── Program Applications ─────────────────────────────────────────────────────

export interface ProgramApplicationDto {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_INFO" | "WITHDRAWN" | string;
  educationSummary?: string;
  statementOfPurpose?: string;
  supportingDocumentPath?: string;
  notes?: string;
  program: ProgramDto;
  learner?: { id: number; fullName: string; roles?: string[] };
  createdAt: string;
}

export function programApply(
  id: number,
  payload: { statement: string; educationSummary?: string }
): Promise<ProgramApplicationDto> {
  // Backend ProgramApplicationRequest requires both educationSummary and
  // statementOfPurpose; ApplyFlow assembles one combined statement string.
  return apiPost<ProgramApplicationDto>(`/programs/${id}/apply`, {
    statementOfPurpose: payload.statement,
    educationSummary: payload.educationSummary ?? payload.statement,
  });
}

export function programApplicationsMe(): Promise<ProgramApplicationDto[]> {
  return apiGet<ProgramApplicationDto[]>("/programs/applications/me");
}

export function programApplicationsAll(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<ProgramApplicationDto>> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  const qs = sp.toString();
  return apiGet<PageResponse<ProgramApplicationDto>>(`/programs/applications${qs ? `?${qs}` : ""}`);
}

export function programApplicationReview(
  id: number,
  payload: { status: "APPROVED" | "REJECTED" | "NEEDS_INFO"; notes?: string }
): Promise<ProgramApplicationDto> {
  return apiPatch<ProgramApplicationDto>(`/programs/applications/${id}`, payload);
}

export function programApplicationWithdraw(id: number): Promise<ProgramApplicationDto> {
  return apiPost<ProgramApplicationDto>(`/programs/applications/${id}/withdraw`);
}

// ─── Scholarships ─────────────────────────────────────────────────────────────

export interface ScholarshipDto {
  id: number;
  title: string;
  description?: string;
  eligibility?: string;
  deadline?: string | null;
  archived?: boolean;
  createdAt?: string;
  // extended (§3.1)
  funder?: string | null;
  amount?: number | null;
  currency?: string | null;
  region?: string | null;
  level?: string | null;
}

export function scholarshipsList(params?: {
  page?: number;
  size?: number;
  q?: string;
  region?: string;
  level?: string;
}): Promise<PageResponse<ScholarshipDto>> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  if (params?.q) sp.set("q", params.q);
  if (params?.region) sp.set("region", params.region);
  if (params?.level) sp.set("level", params.level);
  const qs = sp.toString();
  return apiGet<PageResponse<ScholarshipDto>>(`/scholarships${qs ? `?${qs}` : ""}`);
}

export function scholarshipsGet(id: number): Promise<ScholarshipDto> {
  return apiGet<ScholarshipDto>(`/scholarships/${id}`);
}

export function scholarshipsCreate(data: Partial<ScholarshipDto>): Promise<ScholarshipDto> {
  return apiPost<ScholarshipDto>("/scholarships", data);
}

export function scholarshipsUpdate(id: number, data: Partial<ScholarshipDto>): Promise<ScholarshipDto> {
  return apiPut<ScholarshipDto>(`/scholarships/${id}`, data);
}

// ─── Scholarship Applications ─────────────────────────────────────────────────

export interface ScholarshipApplicationDto {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_INFO" | "WITHDRAWN" | string;
  personalStatement?: string;
  notes?: string;
  scholarship: ScholarshipDto;
  learner?: { id: number; fullName: string; roles?: string[] };
  createdAt: string;
}

export function scholarshipApply(
  id: number,
  payload: { statement: string }
): Promise<ScholarshipApplicationDto> {
  return apiPost<ScholarshipApplicationDto>(`/scholarships/${id}/apply`, {
    personalStatement: payload.statement,
  });
}

export function scholarshipApplicationsMe(): Promise<ScholarshipApplicationDto[]> {
  return apiGet<ScholarshipApplicationDto[]>("/scholarships/applications/me");
}

export function scholarshipApplicationsAll(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<ScholarshipApplicationDto>> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  const qs = sp.toString();
  return apiGet<PageResponse<ScholarshipApplicationDto>>(`/scholarships/applications${qs ? `?${qs}` : ""}`);
}

export function scholarshipApplicationReview(
  id: number,
  payload: { status: "APPROVED" | "REJECTED" | "NEEDS_INFO"; notes?: string }
): Promise<ScholarshipApplicationDto> {
  return apiPatch<ScholarshipApplicationDto>(`/scholarships/applications/${id}`, payload);
}

export function scholarshipApplicationWithdraw(id: number): Promise<ScholarshipApplicationDto> {
  return apiPost<ScholarshipApplicationDto>(`/scholarships/applications/${id}/withdraw`);
}

// ─── Research Projects ────────────────────────────────────────────────────────

export interface ResearchProjectDto {
  id: number;
  title: string;
  description?: string;
  requiredSkills?: string;
  tags?: string;
  status?: "OPEN" | "CLOSED" | "ARCHIVED" | string;
  createdBy?: { id: number; fullName: string; roles?: string[] } | null;
  createdAt?: string;
  // extended (§3.1)
  lab?: string | null;
  institution?: string | null;
  openings?: number | null;
  field?: string | null;
  deadline?: string | null;
  pi?: string | null; // derived: createdBy.fullName
}

export function researchList(params?: {
  page?: number;
  size?: number;
  q?: string;
  status?: string;
  field?: string;
}): Promise<PageResponse<ResearchProjectDto>> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  if (params?.q) sp.set("q", params.q);
  if (params?.status) sp.set("status", params.status);
  if (params?.field) sp.set("field", params.field);
  const qs = sp.toString();
  return apiGet<PageResponse<ResearchProjectDto>>(`/research/projects${qs ? `?${qs}` : ""}`);
}

export function researchGet(id: number): Promise<ResearchProjectDto> {
  return apiGet<ResearchProjectDto>(`/research/projects/${id}`);
}

export function researchCreate(data: Partial<ResearchProjectDto>): Promise<ResearchProjectDto> {
  return apiPost<ResearchProjectDto>("/research/projects", data);
}

export function researchPatchStatus(
  id: number,
  status: "OPEN" | "CLOSED" | "ARCHIVED"
): Promise<ResearchProjectDto> {
  return apiPatch<ResearchProjectDto>(`/research/projects/${id}/status`, { status });
}

// ─── Research Join Requests ───────────────────────────────────────────────────

export interface ResearchRequestDto {
  id: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | string;
  message?: string;
  skills?: string;
  project: { id: number; title: string };
  requester?: { id: number; fullName: string };
  createdAt?: string;
}

export function researchJoin(
  projectId: number,
  payload: { message: string; skills?: string }
): Promise<ResearchRequestDto> {
  return apiPost<ResearchRequestDto>(`/research/projects/${projectId}/join`, payload);
}

export function researchRequestsOwned(): Promise<ResearchRequestDto[]> {
  return apiGet<ResearchRequestDto[]>("/research/requests/owned");
}

export function researchRequestReview(
  id: number,
  payload: { status: "APPROVED" | "REJECTED" }
): Promise<ResearchRequestDto> {
  return apiPatch<ResearchRequestDto>(`/research/requests/${id}`, payload);
}

// ─── Resources ────────────────────────────────────────────────────────────────

export interface ResourceDto {
  id: number;
  title: string;
  description?: string;
  fileName?: string;
  fileSize?: number;
  publicAccess?: boolean;
  uploader?: { id: number; fullName: string } | null;
  createdAt?: string;
  // extended (§3.1)
  author?: string | null;
  year?: number | null;
  pages?: number | null;
  field?: string | null;
  resourceType?: "PDF" | "DATASET" | "VIDEO" | "PAPER" | "BOOK" | string | null;
}

export function resourcesList(params?: {
  page?: number;
  size?: number;
  q?: string;
  field?: string;
}): Promise<PageResponse<ResourceDto>> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  if (params?.q) sp.set("q", params.q);
  if (params?.field) sp.set("field", params.field);
  const qs = sp.toString();
  return apiGet<PageResponse<ResourceDto>>(`/resources${qs ? `?${qs}` : ""}`);
}

export function resourcesGet(id: number): Promise<ResourceDto> {
  return apiGet<ResourceDto>(`/resources/${id}`);
}

export function resourcesUpload(formData: FormData): Promise<ResourceDto> {
  return apiUpload<ResourceDto>("/resources", formData);
}

export function resourceDownloadUrl(id: number): string {
  const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080/api/v1";
  return `${BASE}/resources/${id}/download`;
}

export function resourceDownload(id: number): Promise<string> {
  return apiDownloadUrl(`/resources/${id}/download`);
}

// ─── Forums ───────────────────────────────────────────────────────────────────

export interface ForumThreadDto {
  id: number;
  title: string;
  body?: string;
  author?: { id: number; fullName: string } | null;
  createdAt?: string;
  // extended (§3.1)
  category?: string | null;
  replyCount?: number;
  lastReplyAt?: string | null;
}

export interface ForumCommentDto {
  id: number;
  body?: string;
  author?: { id: number; fullName: string; roles?: string[] } | null;
  createdAt?: string;
}

export function forumThreadsList(params?: {
  page?: number;
  size?: number;
  q?: string;
  category?: string;
}): Promise<PageResponse<ForumThreadDto>> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  if (params?.q) sp.set("q", params.q);
  if (params?.category) sp.set("category", params.category);
  const qs = sp.toString();
  return apiGet<PageResponse<ForumThreadDto>>(`/forums/threads${qs ? `?${qs}` : ""}`);
}

export function forumThreadsGet(id: number): Promise<ForumThreadDto> {
  return apiGet<ForumThreadDto>(`/forums/threads/${id}`);
}

export function forumThreadsCreate(payload: {
  title: string;
  body: string;
  category?: string;
}): Promise<ForumThreadDto> {
  return apiPost<ForumThreadDto>("/forums/threads", payload);
}

export function forumCommentsList(threadId: number, params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<ForumCommentDto>> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  const qs = sp.toString();
  return apiGet<PageResponse<ForumCommentDto>>(`/forums/threads/${threadId}/comments${qs ? `?${qs}` : ""}`);
}

export function forumCommentsCreate(
  threadId: number,
  payload: { body: string }
): Promise<ForumCommentDto> {
  return apiPost<ForumCommentDto>(`/forums/threads/${threadId}/comments`, payload);
}

// ─── Webinars ─────────────────────────────────────────────────────────────────

export interface WebinarDto {
  id: number;
  title: string;
  description?: string;
  scheduledAt?: string | null;
  meetingLink?: string;
  status?: "SCHEDULED" | "COMPLETED" | "CANCELED" | "UPCOMING" | "PAST" | string;
  host?: { id: number; fullName: string } | null;
  createdAt?: string;
  // extended (§3.1)
  durationMinutes?: number | null;
  speakerAffiliation?: string | null;
}

export interface WebinarRegistrationDto {
  id: number;
  status?: "REGISTERED" | "CANCELED" | string;
  webinar: { id: number; title: string; scheduledAt?: string | null };
  createdAt?: string;
}

export function webinarsList(params?: {
  page?: number;
  size?: number;
  q?: string;
}): Promise<PageResponse<WebinarDto>> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  if (params?.q) sp.set("q", params.q);
  const qs = sp.toString();
  return apiGet<PageResponse<WebinarDto>>(`/webinars${qs ? `?${qs}` : ""}`);
}

export function webinarsGet(id: number): Promise<WebinarDto> {
  return apiGet<WebinarDto>(`/webinars/${id}`);
}

export function webinarsCreate(data: Partial<WebinarDto>): Promise<WebinarDto> {
  return apiPost<WebinarDto>("/webinars", data);
}

export function webinarsRegister(id: number): Promise<WebinarRegistrationDto> {
  return apiPost<WebinarRegistrationDto>(`/webinars/${id}/register`);
}

export function webinarsCancel(id: number): Promise<WebinarRegistrationDto> {
  return apiPost<WebinarRegistrationDto>(`/webinars/${id}/cancel`);
}

export function webinarRegistrationsMe(): Promise<WebinarRegistrationDto[]> {
  return apiGet<WebinarRegistrationDto[]>("/webinars/registrations/me");
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export interface ContactMessageDto {
  id?: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt?: string;
}

export function contactSubmit(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  return apiPost<void>("/contact", payload);
}

export function contactList(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<ContactMessageDto>> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  const qs = sp.toString();
  return apiGet<PageResponse<ContactMessageDto>>(`/contact${qs ? `?${qs}` : ""}`);
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export interface FaqDto {
  id: number;
  question: string;
  answer: string;
  active?: boolean;
}

export function faqsList(): Promise<FaqDto[]> {
  return apiGet<FaqDto[]>("/faqs");
}

export function faqsCreate(payload: { question: string; answer: string }): Promise<FaqDto> {
  return apiPost<FaqDto>("/faqs", payload);
}

export function faqsUpdate(id: number, payload: Partial<FaqDto>): Promise<FaqDto> {
  return apiPut<FaqDto>(`/faqs/${id}`, payload);
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationDto {
  id: number;
  title?: string;
  message: string;
  readAt?: string | null;
  createdAt?: string;
}

export function notificationsList(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<NotificationDto>> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  const qs = sp.toString();
  return apiGet<PageResponse<NotificationDto>>(`/notifications${qs ? `?${qs}` : ""}`);
}

export function notificationsMarkRead(id: number): Promise<NotificationDto> {
  return apiPatch<NotificationDto>(`/notifications/${id}/read`);
}

export function notificationsReadAll(): Promise<void> {
  return apiPost<void>("/notifications/read-all");
}

// ─── Saved Items ──────────────────────────────────────────────────────────────

export type SavedItemType =
  | "UNIVERSITY"
  | "PROGRAM"
  | "SCHOLARSHIP"
  | "RESEARCH_PROJECT"
  | "WEBINAR"
  | "RESOURCE";

export interface SavedItemDto {
  id: number;
  itemType: SavedItemType;
  itemId: number;
  createdAt?: string;
  // Optional denormalized snapshot (backend may include)
  title?: string;
  subtitle?: string;
}

export function savedItemsList(): Promise<SavedItemDto[]> {
  return apiGet<SavedItemDto[]>("/saved-items");
}

export function savedItemsCreate(payload: {
  itemType: SavedItemType;
  itemId: number;
}): Promise<SavedItemDto> {
  return apiPost<SavedItemDto>("/saved-items", payload);
}

export function savedItemsDelete(id: number): Promise<void> {
  return apiDelete(`/saved-items/${id}`);
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export interface ConversationDto {
  id: number;
  subject?: string;
  otherParty?: { id: number; fullName: string; roles?: string[] };
  unreadCount?: number;
  lastMessageAt?: string;
  lastPreview?: string;
}

export interface ConversationMessageDto {
  id: number;
  body?: string;
  sender?: { id: number; fullName: string };
  sentAt?: string;
  readByRecipient?: boolean;
}

export interface ConversationDetailDto extends ConversationDto {
  messages?: ConversationMessageDto[];
}

export function messagesList(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<ConversationDto>> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  const qs = sp.toString();
  return apiGet<PageResponse<ConversationDto>>(`/messages${qs ? `?${qs}` : ""}`);
}

export function messagesCreate(payload: {
  recipientId?: number;
  recipientEmail?: string;
  subject: string;
  body: string;
}): Promise<ConversationDto> {
  return apiPost<ConversationDto>("/messages", payload);
}

export function messagesGet(id: number): Promise<ConversationDetailDto> {
  return apiGet<ConversationDetailDto>(`/messages/${id}`);
}

export function messagesReply(id: number, payload: { body: string }): Promise<ConversationMessageDto> {
  return apiPost<ConversationMessageDto>(`/messages/${id}/reply`, payload);
}

/** Returns total unread count across all conversations */
export async function messagesUnreadCount(): Promise<number> {
  try {
    const data = await messagesList({ page: 0, size: 50 });
    return data.content.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
  } catch {
    return 0;
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminStatsDto {
  users?: number;
  universities?: number;
  programs?: number;
  scholarships?: number;
  researchProjects?: number;
  resources?: number;
  webinars?: number;
  threads?: number;
  pendingProgramApplications?: number;
  pendingScholarshipApplications?: number;
  pendingJoinRequests?: number;
  newContactMessages?: number;
}

export interface AuditLogDto {
  id?: number;
  actorName?: string;
  action?: string;
  entityType?: string;
  entityId?: number;
  details?: string;
  createdAt?: string;
}

export function adminGetStats(): Promise<AdminStatsDto> {
  return apiGet<AdminStatsDto>("/admin/stats");
}

export function adminGetAuditLogs(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<AuditLogDto>> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  const qs = sp.toString();
  return apiGet<PageResponse<AuditLogDto>>(`/admin/audit-logs${qs ? `?${qs}` : ""}`);
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export interface AgentCitation {
  type: "PROGRAM" | "SCHOLARSHIP";
  id: number;
  title: string;
  subtitle?: string;
  deadline?: string;
}

export interface CounsellorResponse {
  reply: string;
  citations: AgentCitation[];
}

export interface MatchmakerEntry {
  project: ResearchProjectDto;
  score: number;
  rationale: string;
}

export interface LibrarianSource {
  resourceId: number;
  title: string;
  author?: string;
  year?: number;
  relevance?: string;
}

export interface LibrarianResponse {
  answer: string;
  sources: LibrarianSource[];
}

export interface DigestItem {
  type: string;
  id: number;
  title: string;
  subtitle?: string;
  deadline?: string;
}

export interface DigestResponse {
  generatedAt?: string;
  urgent: DigestItem[];
  approaching: DigestItem[];
  webinars: DigestItem[];
}

export interface ConversationHistoryItem {
  role: "user" | "assistant";
  text: string;
}

export function agentCounsellor(payload: {
  message: string;
  history?: ConversationHistoryItem[];
}): Promise<CounsellorResponse> {
  return apiPost<CounsellorResponse>("/agent/counsellor", payload);
}

export function agentMatchmaker(): Promise<MatchmakerEntry[]> {
  return apiGet<MatchmakerEntry[]>("/agent/matchmaker");
}

export function agentLibrarian(payload: { question: string }): Promise<LibrarianResponse> {
  return apiPost<LibrarianResponse>("/agent/librarian", payload);
}

export function agentDigest(): Promise<DigestResponse> {
  return apiGet<DigestResponse>("/agent/digest");
}
