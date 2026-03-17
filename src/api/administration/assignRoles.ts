import axiosInstance from "../axios";

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

export const assignRoles = async (payload: PaginateData) => {
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

export const rolePermission = async (payload: {
  rolePermission: any[];
  id: string;
}) => {
  try {
    const response = await axiosInstance.post(
      "/baseServices/api/role-permission",
      payload
    );
    return response;
  } catch (error) {
    console.error("Error sending role permission:", error);
    throw error;
  }
};
