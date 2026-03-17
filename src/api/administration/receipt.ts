//Invoice
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

export const getAllInvoiceData = async (payload: PaginateData) => {
  try {
    const response = await axiosInstance.post(
      "/incoming/api/invoice/all",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching master data:", error);
    throw error;
  }
};

// CREATE invoice data
export const createInvoiceData = async (data: {
  receiptNumber: string;
  dateOfReceipt: string;
  partNumber: string;
  receiptQuantity: string;
}) => {
  try {
    const payload = {
      type: "invoice",
      ...data,
    };
    const response = await axiosInstance.post("/incoming/api/invoice", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating invoice data:", error);
    throw error;
  }
};

// UPDATE invoice data
export const updateInvoiceData = async (
  id: string,
  data: {
    receiptNumber: string;
    dateOfReceipt: string;
    partNumber: string;
    receiptQuantity: string;
  }
) => {
  try {
    const payload = {
      ...data,
      id,
    };

    const response = await axiosInstance.patch(
      "/incoming/api/invoice",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error updating invoice data:", error);
    throw error;
  }
};

// DELETE invoice data
export const deleteInvoiceData = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/incoming/api/invoice/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting invoice data:", error);
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

export const uploadTemplateData = async (data: {
  type: string;
  uploadData: {}[];
}) => {
  try {
    const response = await axiosInstance.post("/incoming/api/masterData", data);
    return response.data;
  } catch (error) {
    console.error("Error creating template:", error);
    throw error;
  }
};
