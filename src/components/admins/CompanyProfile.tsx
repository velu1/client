import React, { useState, useRef } from "react";
import { TextField } from "@mui/material";
import { Button } from "../../components/ui/button";
import { CompanyProfileData } from "../../api/profile";
// import { uploadImage } from "../../api/profile";

interface ProfileData extends CompanyProfileData {
  logo?: string;
  name?: string;
  image?: string;
}

interface CompanyProfileProps {
  profileData: ProfileData;
  isLoading?: boolean;
  onSave: (data: ProfileData) => Promise<void>;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({
  profileData,
  isLoading = false,
  onSave,
}) => {
  console.log(profileData, "profileData");

  const [isModified, setIsModified] = useState(false);

  const [formData, setFormData] = useState<ProfileData>({
    ...profileData,
    logo:
      profileData.logo ||
      (profileData.image ? `${profileData.image}` : undefined),
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ProfileData, string>>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProfileData, string>> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Company name is required";
    }

    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (formData.phoneNumber.length !== 10) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.pinCode?.trim()) {
      newErrors.pinCode = "Pincode is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange =
    (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // Allow only numbers for pinCode and phoneNumber
      if (field === "pinCode" || field === "phoneNumber") {
        value = value.replace(/\D/g, ""); // Remove non-digits

        // Limit phoneNumber to 10 digits
        if (field === "phoneNumber" && value.length > 10) {
          value = value.slice(0, 10);
        }
      } else if (field !== "address") {
        // Remove special characters for all other fields (except address)
        // Allow only letters, numbers, spaces, and hyphens
        value = value.replace(/[^a-zA-Z0-9\s\-]/g, "");
      }

      setFormData({
        ...formData,
        [field]: value,
      });

      setIsModified(true); // mark form as modified

      if (errors[field]) {
        setErrors({
          ...errors,
          [field]: "",
        });
      }
    };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData({
            ...formData,
            logo: event.target.result as string,
          });
          setIsModified(true);
        }
      };

      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    let updatedData = { ...formData };
    console.log(updatedData, "opo");

     if (updatedData.logo) {
       const base64 = updatedData.logo.replace("data:image/png;base64,", "");
       localStorage.setItem("companyLogo", base64);
       window.dispatchEvent(new Event("companyLogoUpdated")); 
     }
    await onSave(updatedData);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header div with rounded corners */}
      <div
        className="w-full h-40 bg-[#9ebcdb2b] rounded-b-full -mt-10"
        style={{
          width: "100%",
        }}
      ></div>

      {/* Logo container positioned to overlap the header */}
      <div className="w-full flex justify-center -mt-20">
        <div className="relative z-10">
          <div
            className="w-32 h-32 md:w-48 md:h-48 border-2 border-[#c09966] flex items-center justify-center overflow-hidden bg-white rounded-sm"
            style={{ borderColor: "var(--primary, #c09966)" }}
          >
            {formData.logo ? (
              <>
                <img
                  src={formData.logo}
                  alt="Company Logo"
                  className="w-full h-full object-contain"
                />
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 2H16C18.2091 2 20 3.79086 20 6V18C20 20.2091 18.2091 22 16 22H8C5.79086 22 4 20.2091 4 18V6C4 3.79086 5.79086 2 8 2Z"
                    stroke="#c09966"
                    strokeWidth="2"
                  />
                  <path
                    d="M9 12H12M15 12H12M12 12V9M12 12V15"
                    stroke="#c09966"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div
            onClick={triggerFileInput}
            className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center cursor-pointer bg-transparent"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c09966"
              strokeWidth="2"
              className="absolute top-1 right-1 cursor-pointer"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col items-center mt-6 mb-8 md:mb-12">
        <Button
          variant="outline"
          size="default"
          onClick={triggerFileInput}
          className="bg-[#c09966] text-white hover:text-white mb-2 min-w-32 cursor-pointer"
          style={{ backgroundColor: "var(--primary, #c09966)" }}
        >
          {!formData.logo ? "Upload" : "Edit"}
        </Button>

        <div
          className="w-2/3 md:w-1/3 h-0.5 mt-2"
          style={{ backgroundColor: "var(--primary, #c09966)" }}
        ></div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-25 md:gap-y-10 w-full px-4 md:px-8 max-w-screen-lg mx-auto">
        <div className="w-full">
          <TextField
            size="small"
            label="Company name *"
            variant="outlined"
            value={formData.name || ""}
            onChange={handleChange("name")}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            className="bg-white"
            inputProps={{ maxLength: 100 }}
          />
        </div>

        <div className="w-full">
          <TextField
            size="small"
            label="Phone number *"
            variant="outlined"
            value={formData.phoneNumber || ""}
            onChange={handleChange("phoneNumber")}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            fullWidth
            className="bg-white"
          />
        </div>

        <div className="w-full">
          <TextField
            size="small"
            label="GSTIN"
            variant="outlined"
            value={formData.gstin || ""}
            onChange={handleChange("gstin")}
            placeholder="Enter"
            fullWidth
            className="bg-white"
            inputProps={{ maxLength: 25 }}
          />
        </div>

        <div className="w-full">
          <TextField
            size="small"
            label="CIN"
            variant="outlined"
            value={formData.cin || ""}
            onChange={handleChange("cin")}
            placeholder="Enter"
            fullWidth
            className="bg-white"
            inputProps={{ maxLength: 25 }}
          />
        </div>

        <div className="w-full">
          <TextField
            size="small"
            label="Address *"
            variant="outlined"
            value={formData.address || ""}
            onChange={handleChange("address")}
            error={!!errors.address}
            helperText={errors.address}
            placeholder="Enter"
            fullWidth
            className="bg-white"
            inputProps={{ maxLength: 250 }}
          />
        </div>

        <div className="w-full">
          <TextField
            size="small"
            label="Pincode *"
            variant="outlined"
            value={formData.pinCode || ""}
            onChange={handleChange("pinCode")}
            error={!!errors.pinCode}
            helperText={errors.pinCode}
            fullWidth
            className="bg-white"
            inputProps={{ maxLength: 10 }}
          />
        </div>
      </div>

      <div className="w-full flex justify-center md:justify-end mt-8 md:mt-16 gap-4 px-4 md:px-8">
        <Button
          variant="outline"
          size="default"
          className="min-w-24 md:min-w-32 px-4 md:px-8"
          style={{
            borderColor: "#c09966",
            color: "#c09966",
          }}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className={`min-w-24 md:min-w-32 px-4 md:px-8 ${
            !isModified ? "opacity-50 cursor-not-allowed" : ""
          }`}
          style={{
            backgroundColor: "var(--primary, #c09966)",
            color: "#fff",
          }}
          disabled={isLoading || !isModified}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default CompanyProfile;
