import axiosInstance from "../axios";

export const dashboardCard = async () => {
  try {
    const response = await axiosInstance.get(
      "/baseServices/api/role/assign-roles"
    );
    if (response) {
      return response;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
