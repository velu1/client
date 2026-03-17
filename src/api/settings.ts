import axiosInstance from "./axios";

export interface PrinterConfigurationResponse {
  type: string;
  audit: boolean;
  auditType: string;
  createdAt: string;
  delimiter: string;
  invoice: boolean;
  namingSeries: string;
  panelBoards: boolean;
  partsInNamingSeries: string;
  printType: string;
  printerName: string;
  updatedAt: string;
  priority: {
    priority: string;
    value: string;
    _id?: string;
  }[];
  labelData: {
    heightMm: number;
    widthMm: number;
    items: Item[];
  };
  entityTableRows: {
    slNo: number;
    name: string;
    id: string;
    defaultTableRow?: boolean;
  }[];
  id: string;
}

export interface Item {
  id: string;
  type: string;
  value: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageDataUrl: string;
}

export interface SystemConfigResponse {
  dataSeed: boolean;
  createdAt: string;
  updatedAt: string;
  dateFormat: string;
  reelOrder: string;
  theme: string;
  timeFormat: string;
  id: string;
}

export const getPartsInPrinterConfig =
  async (): Promise<PrinterConfigurationResponse> => {
    try {
      const response = await axiosInstance.get(
        "/baseServices/api/settings/printerConfigurations/partsInPrinterConfig"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching printer configuration:", error);
      throw error;
    }
  };

export const updatePartsInPrinterConfig = async (
  data: Partial<PrinterConfigurationResponse>
): Promise<PrinterConfigurationResponse> => {
  try {
    const response = await axiosInstance.post(
      "/baseServices/api/settings/printerConfigurations",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating printer configuration:", error);
    throw error;
  }
};

export const getSystemConfig = async (): Promise<SystemConfigResponse> => {
  try {
    const response = await axiosInstance.get(
      "/baseServices/api/settings/system-config"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching system configuration:", error);
    throw error;
  }
};

export const updateSystemConfig = async (
  data: Partial<SystemConfigResponse>
): Promise<SystemConfigResponse> => {
  try {
    const response = await axiosInstance.post(
      "/baseServices/api/settings/system-config",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating system configuration:", error);
    throw error;
  }
};
