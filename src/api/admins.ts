import axiosInstance from "./axios";

let currentController: AbortController | null = null;

export interface AdminApiOptions {
  page: number;
  itemsPerPage: number;
  sortBy: string[];
  sortDesc: boolean[];
}

export interface SearchCriteria {
  term: string;
  fields: string[];
  startsWith: boolean;
  endsWith: boolean;
}

/**
 * Fetches all admin users with pagination, sorting and search functionality
 */
export const getAllAdmins = async (
  searchTerm?: string,
  options?: AdminApiOptions
) => {
  try {
    // Cancel any in-flight requests
    if (currentController) {
      currentController.abort();
    }
    currentController = new AbortController();
    const response = await axiosInstance.post(
      "/admin/admin/getAll",
      {
        options: {
          page: options?.page || 1,
          itemsPerPage: options?.itemsPerPage || 10,
          sortBy: options?.sortBy || ["updatedAt"],
          sortDesc: options?.sortDesc || [true],
        },
        ...(searchTerm && {
          search: [
            {
              term: searchTerm,
              fields: ["role", "name", "status"],
              startsWith: true,
              endsWith: false,
            },
          ],
        }),
      },
      { signal: currentController.signal }
    );

    if (response.data.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching admins:", error);
    throw error;
  }
};

export const createAdmin = async (adminData: any) => {
  try {
    const response = await axiosInstance.post("/admin/admin/create", adminData);
    return response.data;
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
};
export const updateAdminStatus = async (
  adminId: string,
  isEnabled: boolean
) => {
  try {
    const response = await axiosInstance.put(`/admin/admin/update/${adminId}`, {
      isEnabled: isEnabled,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating admin status:", error);
    throw error;
  }
};

export const updateAdmin = async (adminId: string, adminData: any) => {
  try {
    const response = await axiosInstance.put(
      `/admin/admin/update/${adminId}`,
      adminData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating admin:", error);
    throw error;
  }
};
export const getAdminById = async (adminId: string) => {
  try {
    const response = await axiosInstance.post(`/admin/admin/getOne/${adminId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin by ID:", error);
    throw error;
  }
};
