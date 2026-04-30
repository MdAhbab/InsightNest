import apiClient from "./client";
import { User } from "../types";

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export const registerUser = async (payload: {
  fullName: string;
  email: string;
  password: string;
  role: "LEARNER" | "FACULTY";
}): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/register", payload);
  return response.data;
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/login", payload);
  return response.data;
};

export const refreshToken = async (payload: {
  refreshToken: string;
}): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/refresh", payload);
  return response.data;
};
