export type Role = "ADMIN" | "LEARNER" | "FACULTY";

export type User = {
  id: number;
  fullName: string;
  email: string;
  roles: Role[];
};
