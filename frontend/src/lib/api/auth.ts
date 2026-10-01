import { apiFetch } from "./client";
import { UserProfile } from "../../store/authStore";

export async function registerUser(username: string, email: string, password: string) {
  return apiFetch<{ user: UserProfile; token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export async function loginUser(email: string, password: string) {
  return apiFetch<{ user: UserProfile; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  return apiFetch<{ user: UserProfile }>("/auth/me");
}

export async function deleteAccount() {
  return apiFetch<{ message: string }>("/auth/account", {
    method: "DELETE",
  });
}
