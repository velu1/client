import axiosInstance from "../axios";

interface PartsNumber {
  uniqueId: string;
  templateId: string;
  partNumber: string;
}

interface OcrFieldPlaceholders {
  [key: string]: {
    value: string;
  };
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

export interface TrailRunPayload {
  image_base64: string;
  trialRun: boolean;
  fields: string[];
  ocr: {
    enabledFlg: boolean;
    placeholders: OcrFieldPlaceholders;
  };
}

type CreateTemplate = {
  templateName: string;
  manufacturer: string;
  fields: string[];
  trialRun: boolean;
  ocr: {
    placeholders: Record<string, { value: string }>;
  };
};

export const getAllTemplates = async (payload: PaginateData) => {
  try {
    const response = await axiosInstance.post(
      `/incoming/api/inward/template/all`,
      payload
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
      `/incoming/api/inward/template/${id}`
    );
    if (response) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

//Part Number

export const addPartsNumber = async (data: PartsNumber) => {
  try {
    const payload = {
      uniqueId: data.uniqueId || "",
      templateId: data.templateId,
      partNumber: data.partNumber,
    };

    const response = await axiosInstance.post(
      "/incoming/api/inward/templateHistory",
      payload
    );

    if (response) {
      return response.data;
    }
  } catch (error) {
    console.error("Error adding part number:", error);
    throw error;
  }
};

export const deletePartNumber = async (id: string) => {
  try {
    const response = await axiosInstance.delete(
      `/incoming/api/inward/partNumber/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting part number:", error);
    throw error;
  }
};

//Trail Run

export const TrailRunOcrData = async (data: any) => {
  try {
    const response = await axiosInstance.post("/incoming/api/trailRun", data);

    return response.data;
  } catch (error) {
    console.error("Error during trail run OCR:", error);
    throw error;
  }
};

export const CreateTemplate = async (data: any) => {
  try {
    const response = await axiosInstance.post(
      "/incoming/api/inward/template",
      data
    );

    return response.data;
  } catch (error) {
    console.error("Error during template creation:", error);
    throw error;
  }
};

export const getStickerData = async (data: any) => {
  try {
    const response = await axiosInstance.post(
      "/incoming/api/stickerData",
      data
    );

    return response.data;
  } catch (error: any) {
    console.error("Error during template creation:", error);
    throw error;
  }
};

export const getManufacturers = async () => {
  try {
    const response = await axiosInstance.get(
      "/incoming/api/template-manufacturer/all"
    );
    if (response) {
      return response;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
