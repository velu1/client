import axios from "./axios";

export interface GetAllPartsInParams {
  page: number;
  pageSize: number;
  searchQuery: string;
  sortColumn: string;
  sortOrder: "asc" | "desc";
}

export async function getAllPartsIn({
  page,
  pageSize,
  searchQuery,
  sortColumn,
  sortOrder,
}: GetAllPartsInParams) {
  const response = await axios.post("/incoming/api/partsIn/all", {
    pagination: {
      page,
      pageSize,
      searchQuery,
      sortColumn,
      sortOrder,
      download: false,
    },
  });
  return response.data;
}

// Fetch all invoice numbers for dropdown
export async function fetchInvoiceNumbers() {
  const res = await axios.get("/incoming/api/invoicePallet");
  return res.data[0]?.invoiceNumbers || [];
}

// Fetch pallet details for a selected invoice with pagination
export async function fetchPalletDetails({
  invoiceNo,
  page = 1,
  pageSize = 5,
  searchQuery = "",
  sortColumn = "invoiceNumber",
  sortOrder = "asc",
}: {
  invoiceNo: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sortColumn?: string;
  sortOrder?: "asc" | "desc";
}) {
  return axios.post("/incoming/api/invoicePallet", {
    pagination: {
      page,
      pageSize,
      searchQuery,
      sortColumn,
      sortOrder,
      download: false,
    },
    invoiceNo,
  });
}

interface CapturePayload {
  receiptNumber: string;
  entryPreferences: string;
  trialRun: boolean;
  image_base64: string;
}

export interface CaptureResponseData {
  partNumber: string;
  quantity: number;
  lotNumber: string[];
  manufactureDate: string;
  dateOfReceipt: string;
  manufacturer: string;
  internalPartNo: string;
  partLocation: string;
  entryPreferences: string;
  extracted_sticker: string;
  MOQ?: number;
  fields?: string[]; // Array of field names to display dynamically
}

export interface CaptureResponse {
  message?: string;
  data?: {
    partNumber: string;
    quantity: number;
    lotNumber: string[] | [];
    manufactureDate?: string;
    dateOfReceipt: string;
    manufacturer: string;
    internalPartNo: string;
    partLocation: string;
    extracted_sticker: string;
    MOQ?: number;
    mfgDate?: string;
    idCode?: string;
    templateName?: string;
    allFieldsExtracted?: boolean;
    entryPreferences?: string;
    fields?: string[]; // Array of field names to display dynamically
    [key: string]: any; // Allow for additional properties
  };
  status?: boolean;
  statusCode?: number;
}

export interface ValidationResponseData {
  data: {
    partNumber: string;
    quantity: number;
    manufacturer: string;
    dateOfReceipt: string;
    idCode: string;
    internalPartNo: string;
    partLocation: string;
    MOQ?: number;
  };
}

interface PalletDetailsParams {
  invoiceNo: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sortColumn?: string;
  sortOrder?: "asc" | "desc";
}

// Function to fetch invoice numbers for parts-in
export const fetchInvoiceNumbersForPartsIn = async () => {
  const response = await axios.get("/incoming/api/invoiceNumbers");
  return response.data;
};

// Function to fetch pallet details for a specific invoice
export const fetchPalletDetailsForSpecificInvoice = async ({
  invoiceNo,
  page = 1,
  pageSize = 10,
  searchQuery = "",
  sortColumn = "invoiceNumber",
  sortOrder = "asc",
}: PalletDetailsParams) => {
  const response = await axios.get("/incoming/api/palletDetails", {
    params: {
      invoiceNo,
      page,
      pageSize,
      searchQuery,
      sortColumn,
      sortOrder,
    },
  });
  return response.data;
};

// Function to capture image and get part details
export const captureImage = async (
  payload: CapturePayload
): Promise<CaptureResponse> => {
  const response = await axios.post("/incoming/api/capture", payload);  
  return response.data;
};

// Function to validate part number
export const validatePartNumber = async (
  partNumber: string
): Promise<ValidationResponseData> => {
  const response = await axios.get(
    `/incoming/api/validatePartNumber/${partNumber}`
  );
  return response.data;
};


export const associateTemplate = async (
  payload: any
): Promise<CaptureResponse> => {
  const response = await axios.post("/incoming/api/associate-template", payload);  
  return response.data;
};