import { useEffect, useState } from "react";
import CompanyProfile from "../../../components/admins/CompanyProfile";
import {
  CompanyProfileData,
  updateCompanyProfile,
  getCompanyProfile,
} from "../../../api/profile";
import { toast } from "react-fox-toast";

const CompanyProfilePage = () => {
  const [profileData, setProfileData] = useState<
    CompanyProfileData & { logo?: string }
  >({});
  const [isLoading, setIsLoading] = useState(true);

  console.log("profile Data", profileData);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await getCompanyProfile();

      //remove data:image/png;base64, from response.image
      const image = response?.image?.replace("data:image/png;base64,", "");
      console.log(image, "opop");
      setProfileData({
        name: response?.name,
        phoneNumber: response?.phoneNumber,
        image: image,
        address: response?.address,
        pinCode: response?.pinCode,
        gstin: response?.gstin,
        cin: response?.cin,
      });
    } catch (error) {
      toast.error("Failed to load company profile");
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (profileData.name) {
      console.log("profileData updated:", profileData);
    }
  }, [profileData]);
  const handleSave = async (data: CompanyProfileData & { logo?: string }) => {
    setIsLoading(true);
    try {
      const response = await updateCompanyProfile({
        name: data.name,
        phoneNumber: data.phoneNumber,
        address: data.address,
        pinCode: data.pinCode,
        gstin: data.gstin,
        cin: data.cin,
        image: data.logo,
      });

      // Update state with the response data directly
      setProfileData(response.data);

      console.log(response.data, "pop");
      toast.success("Company profile updated successfully");
    } catch (error) {
      toast.error("Failed to update company profile");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profileData.name) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <CompanyProfile
        profileData={profileData}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CompanyProfilePage;
