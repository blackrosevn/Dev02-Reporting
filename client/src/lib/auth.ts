import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

export async function loginUser(username: string, password: string): Promise<User> {
  try {
    const response = await apiRequest("POST", "/api/login", {
      username,
      password,
    });
    
    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Login error:", error);
    throw new Error("Đăng nhập thất bại");
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await apiRequest("POST", "/api/logout");
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Đăng xuất thất bại");
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiRequest("GET", "/api/me");
    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}
