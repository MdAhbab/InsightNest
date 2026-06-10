import apiClient from "./client";
import {
  Page,
  University,
  Program,
  Scholarship,
  ResearchProject,
  Resource,
  ForumThread,
  Webinar,
  Faq,
  ProgramApplication,
  ScholarshipApplication,
  WebinarRegistration,
  ResearchRequest,
} from "../types";

export const getUniversities = async (page = 0, size = 20): Promise<Page<University>> => {
  const res = await apiClient.get<Page<University>>("/universities", { params: { page, size } });
  return res.data;
};

export const getPrograms = async (page = 0, size = 20): Promise<Page<Program>> => {
  const res = await apiClient.get<Page<Program>>("/programs", { params: { page, size } });
  return res.data;
};

export const getScholarships = async (page = 0, size = 20): Promise<Page<Scholarship>> => {
  const res = await apiClient.get<Page<Scholarship>>("/scholarships", { params: { page, size } });
  return res.data;
};

export const getResearchProjects = async (page = 0, size = 20): Promise<Page<ResearchProject>> => {
  const res = await apiClient.get<Page<ResearchProject>>("/research/projects", { params: { page, size } });
  return res.data;
};

export const getResources = async (page = 0, size = 20): Promise<Page<Resource>> => {
  const res = await apiClient.get<Page<Resource>>("/resources", { params: { page, size } });
  return res.data;
};

export const getForumThreads = async (page = 0, size = 20): Promise<Page<ForumThread>> => {
  const res = await apiClient.get<Page<ForumThread>>("/forums/threads", { params: { page, size } });
  return res.data;
};

export const getWebinars = async (page = 0, size = 20): Promise<Page<Webinar>> => {
  const res = await apiClient.get<Page<Webinar>>("/webinars", { params: { page, size } });
  return res.data;
};

export const getFaqs = async (): Promise<Faq[]> => {
  const res = await apiClient.get<Faq[]>("/faqs");
  return res.data;
};

export const submitContact = async (payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> => {
  await apiClient.post("/contact", payload);
};

export const getMyProgramApplications = async (): Promise<ProgramApplication[]> => {
  const res = await apiClient.get<ProgramApplication[]>("/programs/applications/me");
  return res.data;
};

export const getMyScholarshipApplications = async (): Promise<ScholarshipApplication[]> => {
  const res = await apiClient.get<ScholarshipApplication[]>("/scholarships/applications/me");
  return res.data;
};

export const getMyWebinarRegistrations = async (): Promise<WebinarRegistration[]> => {
  const res = await apiClient.get<WebinarRegistration[]>("/webinars/registrations/me");
  return res.data;
};

export const getMyResearchRequests = async (): Promise<ResearchRequest[]> => {
  const res = await apiClient.get<ResearchRequest[]>("/research/requests/owned");
  return res.data;
};

export const getUsersPage = async (): Promise<Page<unknown>> => {
  const res = await apiClient.get<Page<unknown>>("/users", { params: { size: 1 } });
  return res.data;
};

export const getContactPage = async (): Promise<Page<unknown>> => {
  const res = await apiClient.get<Page<unknown>>("/contact", { params: { size: 1 } });
  return res.data;
};

export const downloadResource = async (id: number, fileName: string): Promise<void> => {
  const res = await apiClient.get<Blob>(`/resources/${id}/download`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};
