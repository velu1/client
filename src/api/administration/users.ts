import axiosInstance from "../axios";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  // pin: string;
  role: string;
  // userId: number;
  id: string;
  _id?: string;
}

type PaginateData = {
  pagination: {
    page: number;
    pageSize: number;
    searchQuery: string;
    sortColumn: string;
    sortOrder: string;
    download: boolean;
  };
};

export const getAllUsers = async (payload: PaginateData) => {
  try {
    const response = await axiosInstance.post(
      "/baseServices/api/user/all",
      payload
    );
    if (response) {
      return response;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const createUsers = async (data: UserData) => {
  try {
    const response = await axiosInstance.post("baseServices/api/user", data);
    if (response) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const deleteUsers = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`baseServices/api/user/${id}`);
    if (response) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const updateUsers = async (id: string, data: UserData) => {
  try {
    const response = await axiosInstance.patch(
      `baseServices/api/user/${id}`,
      data
    );
    if (response) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
