import axiosInstance from "../axios";

interface RoleData {
  name: string;
  description: string;
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

export const getAllRoles = async (payload: PaginateData) => {
  try {
    const response = await axiosInstance.post(
      "/baseServices/api/role/all",
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

export const createRoles = async (data: RoleData) => {
  try {
    const response = await axiosInstance.post("baseServices/api/role", data);
    if (response) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const deleteRoles = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`baseServices/api/role/${id}`);
    if (response) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const updateRoles = async (id: string, data: RoleData) => {
  try {
    const response = await axiosInstance.patch(
      `baseServices/api/role/${id}`,
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
