import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import FormLayout from "../common/FormLayout";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect } from "react";
import { createAdmin, updateAdmin } from "../../api/admins";

interface AdminFormData {
  _id: string;
  name: string;
  phone: string;
  roleName?: string;
  countryCode: string;
}

interface AdminFormProps {
  initialData?: AdminFormData;
  isEdit?: boolean;
}

const AdminForm: React.FC<AdminFormProps> = ({
  initialData = { _id: "", name: "", phone: "", roleName: "Admin" },
  isEdit = false,
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<AdminFormData>({
    defaultValues: initialData,
    mode: "onChange",
  });

  useEffect(() => {
    setValue("roleName", "Admin", { shouldValidate: true });
  }, [setValue]);

  const onSubmit = handleSubmit(async (data: AdminFormData) => {
    setIsSubmitting(true);
    try {
      data.countryCode = "91";
      //remove roleName
      delete data.roleName;
      if (isEdit) {
        //only send name and phone if it is changed
        if (
          data.name !== initialData.name ||
          data.phone !== initialData.phone
        ) {
          await updateAdmin(initialData._id, {
            name: data.name,
            phone: data.phone,
          });
        }
      } else {
        //only send name phone and countryCode
        await createAdmin({
          name: data.name,
          phone: data.phone,
          countryCode: data.countryCode,
        });
      }
      navigate("/admins");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters and spaces - no special characters
    if (/^[A-Za-z\s]*$/.test(value) || value === "") {
      e.target.value = value;
    } else {
      // Prevent non-character input by reverting to previous valid value
      e.target.value = value.slice(0, -1);
    }
  };

  return (
    <FormLayout
      title={isEdit ? initialData.name : "Add  admin"}
      isValid={isValid}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      backLink="/admins"
    >
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-6">
          {/* Name and Phone Number Fields in one row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Name Field */}
            <div>
              <Label htmlFor="name" className="block mb-2 text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                className="w-full"
                placeholder="Enter name"
                onInput={handleNameInput}
                {...register("name", {
                  required: "Name is required",
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message:
                      "Only alphabetic characters and spaces are allowed",
                  },
                })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone Number Field */}
            <div>
              <Label htmlFor="phone" className="block mb-2 text-sm font-medium">
                Phone number
              </Label>
              <Input
                id="phone"
                className="w-full"
                placeholder="+91 XXXXXXXXXX"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^\+?[0-9\s]{10}$/,
                    message: "Please enter a valid phone number",
                  },
                })}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Role Name in second row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label
                htmlFor="roleName"
                className="block mb-2 text-sm font-medium"
              >
                Role name
              </Label>
              <Input
                id="roleName"
                className="w-full"
                placeholder="Enter role"
                disabled // Disabled for edit mode as shown in image
                value="Admin"
                {...register("roleName")}
              />
              {errors.roleName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.roleName.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </FormLayout>
  );
};

export default AdminForm;
