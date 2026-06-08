import { axiosInstance } from "./axios";

interface EditPartPayload {
  partNumber: string;
  quantity: number;
  lotNumber: string[];
  manufactureDate: string;
  dateOfReceipt: string;
  receiptNumber: string;
  uniqueId: string;
  id: string;
  manufacturer: string;
  description: string;
  partLocation: string;
  internalPartNo: string;
  expireDate: string;
  status?: string;
}

interface ReturnPartPayload {
  updatedQuantity: number;
  uniqueId: string;
  systemQuantity: number;
  isReturn: boolean;
  status: string;
}

// interface PaginationOptions {
//   page: number;
//   pageSize: number;
//   searchQuery: string;
//   sortColumn: string;
//   sortOrder: "asc" | "desc";
//   download: boolean;
// }

/**
 * Update part details
 * @param id Part ID
 * @param data Updated part data
 * @returns Promise with the updated part data
 */
export const updatePart = async (id: string, data: EditPartPayload) => {
  try {
    const response = await axiosInstance.patch(
      `/incoming/api/partsList/${id}`,
      data
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark a part as scrapped
 * @param id Part ID
 * @param data Part data with status set to "scraped"
 * @returns Promise with the updated part data
 */
export const scrapPart = async (id: string, data: EditPartPayload) => {
  try {
    const partData = { ...data, status: "scraped" };
    const response = await axiosInstance.patch(
      `/incoming/api/partsList/${id}`,
      partData
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Return a part with updated quantity
 * @param id Part ID
 * @param data Return part payload
 * @returns Promise with the updated part data
 */
export const returnPart = async (id: string, data: ReturnPartPayload) => {
  try {
    const response = await axiosInstance.patch(
      `/incoming/api/partsList/${id}`,
      data
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all parts with the new API endpoint
 * @param searchQuery Search query
 * @param page Page number
 * @param pageSize Number of items per page
 * @param sortColumn Column to sort by
 * @param sortOrder Sort order (asc/desc)
 * @returns Promise with the parts data
 */
export const getAllPartsData = async (
  searchQuery: string = "",
  page: number = 1,
  pageSize: number = 10,
  sortColumn: string = "uniqueId",
  sortOrder: "asc" | "desc" = "asc"
) => {
  try {
    const response = await axiosInstance.post("/incoming/api/partsIn/all", {
      pagination: {
        page,
        pageSize,
        searchQuery,
        sortColumn,
        sortOrder,
        download: false,
      },
    });

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all parts
 * @param searchTerm Search term
 * @param options Pagination and sorting options
 * @returns Promise with the parts data
 */
export const getAllParts = async (
  searchTerm: string,
  options: {
    page: number;
    itemsPerPage: number;
    sortBy: string[];
    sortDesc: boolean[];
  }
) => {
  try {
    const { page, itemsPerPage, sortBy, sortDesc } = options;

    const response = await axiosInstance.get("/incoming/api/partsList", {
      params: {
        search: searchTerm,
        page,
        limit: itemsPerPage,
        sortBy: sortBy.join(","),
        sortDesc: sortDesc.join(","),
      },
    });

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get part by ID
 * @param id Part ID
 * @returns Promise with the part data
 */
export const getPartById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/incoming/api/partsList/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get part by unique ID
 * @param uniqueId Unique ID
 * @returns Promise with the part data
 */
export const getPartByUniqueId = async (uniqueId: string) => {
  try {
    const response = await axiosInstance.get(
      `/incoming/api/partsList/uniqueId/${uniqueId}`
    );
    return response;
  } catch (error) {
    throw error;
  }
};
