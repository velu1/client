// import { error } from "console";
import axiosInstance from "../axios";

// Interface for parts history item
export interface PartsHistoryItem {
  id: string;
  internalPartNo: string;
  partNumber: string;
  uniqueId: string;
  quantity: number;
  lotNumber: string[];
  invoiceNumber: string;
  manufacturer: string;
  returnQuantity?: number;
  isReturn: boolean;
  manufactureDate?: string;
  isScraped: boolean;
  iqcStatus: string;
  auditStatus: string;
  partLocation: string;
  dateOfReceipt: string;
  entryPreferences: string;
  extractedImage: string;
  isDeleted: boolean;
  iqcRevalidationStatus: boolean;
  updatedQuantity: number;
  createdAt: string;
  updatedAt: string;
}

// Interface for pagination and filter options
export interface PartsHistoryParams {
  page: number;
  pageSize: number;
  searchQuery?: string;
  sortColumn?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  download?: boolean;
}

// Interface for API response
export interface PartsHistoryResponse {
  tableData: PartsHistoryItem[];
  totalCount: number;
}

// Abort controller to cancel previous requests
let currentController: AbortController | null = null;

/**
 * Fetch parts history data with server-side filtering, sorting, and pagination
 * @param params Pagination and filter parameters
 * @returns Promise with parts history data response
 */
export const getPartsHistory = async (
  params: PartsHistoryParams
): Promise<PartsHistoryResponse> => {
  try {
    // Cancel previous request if it exists
    if (currentController) {
      currentController.abort();
    }

    // Create new abort controller
    currentController = new AbortController();

    // Format the payload as specified
    const payload = {
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        searchQuery: params.searchQuery || "",
        sortColumn: params.sortColumn || "internalPartNo",
        sortOrder: params.sortOrder || "asc",
        startDate: params.startDate,
        endDate: params.endDate,
        download: params.download || false,
      },
    };

    const response = await axiosInstance.post(
      "/incoming/api/partHistoryReports",
      payload,
      { signal: currentController.signal }
    );
    return {
      tableData: response.data.data || [],
      totalCount: response.data.count || 0,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("canceled");
    }
    console.error("Error fetching parts history:", error);
    throw error;
  } finally {
    currentController = null;
  }
};

/**
 * Export parts history data to Excel or PDF
 * @param params Export parameters including date range and format
 * @returns Promise with download URL
 */
export const exportPartsHistory = async (
  params: PartsHistoryParams & { format: "excel" | "pdf" }
): Promise<{ downloadUrl: string }> => {
  try {
    // Format the payload as specified
    const payload = {
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        searchQuery: params.searchQuery || "",
        sortColumn: params.sortColumn || "internalPartNo",
        sortOrder: params.sortOrder || "asc",
        startDate: params.startDate,
        endDate: params.endDate,
        download: true,
        format: params.format,
      },
    };

    const response = await axiosInstance.post(
      "/incoming/api/reports/parts-history/export",
      payload
    );

    return {
      downloadUrl: response.data.downloadUrl,
    };
  } catch (error) {
    console.error(`Error exporting parts history to ${params.format}:`, error);
    throw error;
  }
};
