import axiosInstance from "./axios";
import Cookies from "js-cookie";

interface SendOtpParams {
  phone: string;
  countryCode: string;
}

interface VerifyOtpParams {
  phone: string;
  countryCode: string;
  otp: string;
}

interface AuthResponse {
  status: number;
  message: string;
  data: any;
  toastMessage: string;
}

interface LoginResponse extends AuthResponse {
  data: {
    token: string;
    code: string;
    access_token: string;
    id: string;
    name: string;
    phone: string;
    email: string;
    companyName: string;
  };
}

interface OldLoginResponse extends AuthResponse {
  data: {
    token: string;
  };
}

interface OldLoginParams {
  userId: string;
  pin: string;
  loginDuplicate: boolean;
}

interface LoginParams {
  email: string;
  password: string;
  code: string;
}

interface ForgotPasswordParams {
  emailId: string;
  code: string;
}

interface ResetPasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  code: string;
  userId?: string;
}

export const login = async (params: LoginParams) => {
  try {
    const response = await axiosInstance.post(
      "/baseServices/api/login",
      params
    );
    console.log("ressssssssssssssssssss", response);
    
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const oldLogin = async (
  params: OldLoginParams
): Promise<OldLoginResponse> => {
  try {
    const response = await axiosInstance.post(
      "/baseServices/api/login",
      params
    );
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

/**
 * Send OTP to the provided phone number
 */
export const sendOtp = async (params: SendOtpParams): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post("/admin/auth/send-otp", params);
    return response.data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

/**
 * Verify OTP and login
 */
export const verifyOtp = async (
  params: VerifyOtpParams
): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post("/admin/auth/login", params);
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

export const logout = async (): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post("/admin/auth/logout", {
      refresh_token: Cookies.get("refresh_token"),
    });
    return response.data;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

export const forgotPassword = async (params: ForgotPasswordParams) => {
  try {
    const response = await axiosInstance.post(
      "/baseServices/api/forgot-password",
      params
    );
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const resetPassword = async (params: ResetPasswordParams) => {
  try {
    const response = await axiosInstance.post(
      "/baseServices/api/reset-password",
      params
    );
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};
/**
 * Store authentication data in cookies */
export const storeAuthData = async (
  data: LoginResponse["data"]
): Promise<void> => {
  console.log(data, "data ss");
  const { token, code, access_token, id, name, phone, email, companyName } =
    data;
  Cookies.set("access_token", token);
  Cookies.set("code", code);
  Cookies.set("x_access_token", access_token);
  Cookies.set("id", id);
  Cookies.set("name", name);
  Cookies.set("phone", phone);
  Cookies.set("email", email);
  Cookies.set("orgName", companyName);
};

/**
 * Clear authentication data from cookies
 */
export const clearAuthData = async (): Promise<void> => {
  // await logout();
  Cookies.remove("access_token");
  localStorage.clear();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!Cookies.get("access_token");
};
