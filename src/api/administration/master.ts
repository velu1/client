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

export const getAllMasterData = async (payload: PaginateData) => {
  try {
    const response = await axiosInstance.post(
      "/incoming/api/masterData/all",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching master data:", error);
    throw error;
  }
};

export const createMasterData = async (data: {
  partNumber: string;
  partLocation?: string;
  internalPartNo: string;
  manufacturer: string;
  quantity: string;
  description?: string;
}) => {
  try {
    const payload = {
      type: "master",
      ...data,
    };
    const response = await axiosInstance.post(
      "/incoming/api/masterData",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error creating master data:", error);
    throw error;
  }
};

export const updateMasterData = async (
  id: string,
  data: {
    partNumber?: string;
    partLocation?: string;
    internalPartNo: string;
    manufacturer?: string;
    quantity?: string;
    description?: string;
  }
) => {
  try {
    const payload = {
      ...data,
      id,
    };

    const response = await axiosInstance.patch(
      "/incoming/api/masterData",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error updating master data:", error);
    throw error;
  }
};

export const deleteMasterData = async (id: string) => {
  try {
    const response = await axiosInstance.delete(
      `/incoming/api/masterData/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting master data:", error);
    throw error;
  }
};

//Templates

export const getAllTemplate = async (type: string) => {
  try {
    const response = await axiosInstance.get(
      `/incoming/api/excelTemplate/${type}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching template data:", error);
    throw error;
  }
};

export const deleteTemplate = async (id: string) => {
  try {
    const response = await axiosInstance.delete(
      `/incoming/api/excelTemplate/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting master data:", error);
    throw error;
  }
};

export const createNewTemplate = async (data: {
  templateName: string;
  type: string;
  templateMapping: {
    label: string;
    path: string;
  }[];
}) => {
  try {
    const response = await axiosInstance.post(
      "/incoming/api/excelTemplate",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating template:", error);
    throw error;
  }
};

export const uploadTemplateData = async (
  data: {
    type: string;
    uploadData: {}[];
  },
  type: string
) => {
  try {
    const response = await axiosInstance.post(`/incoming/api/${type}`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating template:", error);
    throw error;
  }
};
