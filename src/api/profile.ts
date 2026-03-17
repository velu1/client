import axiosInstance from "./axios";

export interface ProfileDialog {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  id: string;
  emailId: string;
}

export interface CompanyProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  image?: string;
  name?: string;
  id?: string;
  address?: string;
  emailId?: string;
  pinCode?: string;
  gstin?: string;
  cin?: string;
  role?: { id: string; name: string };
}

export interface CompanyProfileResponse {
  data: {
    address: string;
    createdAt: string;
    name?: string;
    firstName: string;
    lastName: string;
    image: string;
    phoneNumber: string;
    pinCode: string;
    updatedAt: string;
    id: string;
    gstin?: string;
    cin?: string;
    emailId: string;
    role: { name: string; id: string };
  };
  message: string;
}

export interface ImageUploadResponse {
  data: {
    image: string;
  };
}

export const updateCompanyProfile = async (data: CompanyProfileData = {}) => {
  try {
    const response = await axiosInstance.post<CompanyProfileResponse>(
      "/baseServices/api/company-profile",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error with company profile:", error);
    throw error;
  }
};

export const getCompanyProfile = async () => {
  try {
    const response = await axiosInstance.get<CompanyProfileResponse>(
      "/baseServices/api/company-profile"
    );
    console.log("response is ", response);
    // @ts-expect-error non fix
    return response?.data[0];
  } catch (error) {
    console.error("Error with company profile:", error);
    throw error;
  }
};

export const getProfileData = async (id: string) => {
  try {
    const response = await axiosInstance.get<ProfileDialog>(
      `/baseServices/api/profileSettings/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error with company profile:", error);
    throw error;
  }
};

export const updateProfileData = async (data: ProfileDialog, id: string) => {
  try {
    const response = await axiosInstance.patch<ProfileDialog>(
      `/baseServices/api/profileSettings/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error with company profile:", error);
    throw error;
  }
};

export const uploadImage = async (base64Image: string): Promise<string> => {
  try {
    const response = await axiosInstance.post<ImageUploadResponse>(
      "/baseServices/api/company-profile",
      { image: base64Image }
    );

    return response.data.data.image;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
