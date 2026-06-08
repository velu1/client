import React, { useState, useRef } from "react";
import { CompanyProfileData } from "../../api/profile";
import { Camera, Loader2 } from "lucide-react";

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

const inputCls = (hasError: boolean) =>
  `w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-800 placeholder-gray-400 outline-none transition-all ${
    hasError
      ? "border-red-400 focus:ring-2 focus:ring-red-200"
      : "border-gray-200 focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/10"
  }`;

const CompanyProfile: React.FC<CompanyProfileProps> = ({
  profileData,
  isLoading = false,
  onSave,
}) => {
  const [isModified, setIsModified] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    ...profileData,
    logo:
      profileData.logo ||
      (profileData.image ? `${profileData.image}` : undefined),
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProfileData, string>> = {};
    if (!formData.name?.trim()) newErrors.name = "Company name is required";
    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (formData.phoneNumber.length !== 10) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.pinCode?.trim()) newErrors.pinCode = "Pincode is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange =
    (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      if (field === "pinCode" || field === "phoneNumber") {
        value = value.replace(/\D/g, "");
        if (field === "phoneNumber" && value.length > 10) value = value.slice(0, 10);
      } else if (field !== "address") {
        value = value.replace(/[^a-zA-Z0-9\s\-]/g, "");
      }
      setFormData({ ...formData, [field]: value });
      setIsModified(true);
      if (errors[field]) setErrors({ ...errors, [field]: "" });
    };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData({ ...formData, logo: event.target.result as string });
          setIsModified(true);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const updatedData = { ...formData };
    if (updatedData.logo) {
      const base64 = updatedData.logo.replace("data:image/png;base64,", "");
      localStorage.setItem("companyLogo", base64);
      window.dispatchEvent(new Event("companyLogoUpdated"));
    }
    await onSave(updatedData);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Logo / brand card */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div
            className="w-28 h-28 rounded-2xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {formData.logo ? (
              <img
                src={formData.logo}
                alt="Company Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-gray-300">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 2H16C18.2091 2 20 3.79086 20 6V18C20 20.2091 18.2091 22 16 22H8C5.79086 22 4 20.2091 4 18V6C4 3.79086 5.79086 2 8 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M9 12H12M15 12H12M12 12V9M12 12V15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
              <Camera size={20} className="text-white" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 text-xs font-medium text-[#434a52] hover:text-[#676e6e] transition-colors"
        >
          {formData.logo ? "Change logo" : "Upload logo"}
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mb-6" />

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            Company name <span className="text-red-400">*</span>
          </label>
          <input
            value={formData.name || ""}
            onChange={handleChange("name")}
            maxLength={100}
            className={inputCls(!!errors.name)}
          />
          {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            Phone number <span className="text-red-400">*</span>
          </label>
          <input
            value={formData.phoneNumber || ""}
            onChange={handleChange("phoneNumber")}
            className={inputCls(!!errors.phoneNumber)}
          />
          {errors.phoneNumber && (
            <p className="text-xs text-red-400">{errors.phoneNumber}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">GSTIN</label>
          <input
            value={formData.gstin || ""}
            onChange={handleChange("gstin")}
            placeholder="Enter"
            maxLength={25}
            className={inputCls(false)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">CIN</label>
          <input
            value={formData.cin || ""}
            onChange={handleChange("cin")}
            placeholder="Enter"
            maxLength={25}
            className={inputCls(false)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            Address <span className="text-red-400">*</span>
          </label>
          <input
            value={formData.address || ""}
            onChange={handleChange("address")}
            placeholder="Enter"
            maxLength={250}
            className={inputCls(!!errors.address)}
          />
          {errors.address && (
            <p className="text-xs text-red-400">{errors.address}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            Pincode <span className="text-red-400">*</span>
          </label>
          <input
            value={formData.pinCode || ""}
            onChange={handleChange("pinCode")}
            maxLength={10}
            className={inputCls(!!errors.pinCode)}
          />
          {errors.pinCode && (
            <p className="text-xs text-red-400">{errors.pinCode}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
        <button
          type="button"
          disabled={isLoading}
          className="px-6 py-2 text-sm font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading || !isModified}
          className="flex items-center gap-2 px-6 py-2 text-sm font-medium bg-[#434a52] text-white rounded-lg hover:bg-[#676e6e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading && <Loader2 size={14} className="animate-spin" />}
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default CompanyProfile;
