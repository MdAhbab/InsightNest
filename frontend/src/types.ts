export type Role = "ADMIN" | "LEARNER" | "FACULTY";

export type User = {
  id: number;
  fullName: string;
  email: string;
  roles: Role[];
};

export type Page<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

export type University = {
  id: number;
  name: string;
  country: string;
  city: string;
  ranking: number | null;
  website: string;
  description: string;
  archived: boolean;
  createdAt: string;
};

export type Program = {
  id: number;
  name: string;
  type: string;
  department: string;
  duration: string;
  description: string;
  applicationDeadline: string | null;
  archived: boolean;
  university: { id: number; name: string; country: string; city: string } | null;
  createdAt: string;
};

export type Scholarship = {
  id: number;
  title: string;
  description: string;
  eligibility: string;
  deadline: string | null;
  archived: boolean;
  createdAt: string;
};

export type ResearchProject = {
  id: number;
  title: string;
  description: string;
  requiredSkills: string;
  tags: string;
  status: "OPEN" | "CLOSED" | "ARCHIVED";
  createdBy: { id: number; fullName: string; roles: Role[] } | null;
  createdAt: string;
};

export type Resource = {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  publicAccess: boolean;
  uploader: { id: number; fullName: string } | null;
  createdAt: string;
};

export type ForumThread = {
  id: number;
  title: string;
  body: string;
  author: { id: number; fullName: string } | null;
  createdAt: string;
};

export type Webinar = {
  id: number;
  title: string;
  description: string;
  scheduledAt: string | null;
  meetingLink: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELED";
  host: { id: number; fullName: string } | null;
  createdAt: string;
};

export type Faq = {
  id: number;
  question: string;
  answer: string;
  active: boolean;
};

export type ProgramApplication = {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_INFO";
  program: { id: number; name: string; university?: { id: number; name: string } };
  createdAt: string;
};

export type ScholarshipApplication = {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_INFO";
  scholarship: { id: number; title: string };
  createdAt: string;
};

export type WebinarRegistration = {
  id: number;
  status: "REGISTERED" | "CANCELED";
  webinar: { id: number; title: string; scheduledAt: string | null };
  createdAt: string;
};

export type ResearchRequest = {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  message: string;
  skills: string;
  project: { id: number; title: string };
  requester: { id: number; fullName: string };
  createdAt: string;
};
