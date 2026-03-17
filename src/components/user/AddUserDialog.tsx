import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAllRoles } from "../../api/administration/roles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import { Button } from "../ui/button";
import { SelectChangeEvent } from "@mui/material";
import { UserForDisplay } from "../../pages/administration/user-management/user";

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: UserForDisplay) => void;
  roles?: Array<{ _id: string; name: string }>;
  users?: UserForDisplay[];
  setRoleId?: React.Dispatch<React.SetStateAction<string>>;
}

interface RolesForDisplay {
  id: string;
  name: string;
  description: string;
  permissionCount: number;
  defaultRole: boolean;
  createdAt: string;
  time: string;
}

const initialData: UserForDisplay = {
  organization: "-",
  isUserActive: false,
  status: "success",
  firstName: "",
  lastName: "",
  // phoneNumber: "",
  // userId: "",
  // pin: "",
  email: "",
  role: { _id: "", name: "" },
  id: "",
};

export default function AddUserDialog({
  open,
  onClose,
  onSave,
  setRoleId,
}: UserDialogProps) {
  const [userData, setUserData] = useState<UserForDisplay>(initialData);
  const [roles, setRoles] = useState<RolesForDisplay[]>([]);
  const [formErrors, setFormErrors] = useState<{
    // phoneNumber?: string;
    email?: string;
    pin?: string;
    role?: string;
  }>({});

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getAllRoles({
          pagination: {
            page: 1,
            pageSize: 100,
            searchQuery: "",
            sortColumn: "name",
            sortOrder: "asc",
            download: false,
          },
        });
        if (response?.data?.data) {
          setRoles(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching roles", err);
      }
    };

    fetchRoles();
  }, []);

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // const handleChange =
  //   (field: keyof UserForDisplay) =>
  //   (e: React.ChangeEvent<HTMLInputElement>) => {
  //     let value = e.target.value;

  //     setUserData((prev) => {
  //       const updated = { ...prev };

  //       // if (field === "pin") {
  //       //   if (/^\d{0,6}$/.test(value)) {
  //       //     updated[field] = value as never;
  //       //   }
  //       // } else
  //       if (field === "phoneNumber") {
  //         if (/^\d{0,10}$/.test(value)) {
  //           updated[field] = value as never;

  //           if (formErrors.phoneNumber) {
  //             setFormErrors((prevErrors) => ({
  //               ...prevErrors,
  //               phoneNumber: "",
  //             }));
  //           }
  //         }
  //       } else if (field === "firstName") {
  //         updated[field] = value
  //           .replace(/[^a-zA-Z\s]/g, "")
  //           .slice(0, 80) as never;
  //       } else if (field === "lastName") {
  //         updated[field] = value
  //           .replace(/[^a-zA-Z\s]/g, "")
  //           .slice(0, 30) as never;
  //       } else if (field === "email") {
  //         updated[field] = value.replace(/[^a-zA-Z0-9@._-]/g, "") as never;

  //         // Clear email error when user starts typing
  //         if (formErrors.email) {
  //           setFormErrors((prevErrors) => ({
  //             ...prevErrors,
  //             email: "",
  //           }));
  //         }} else {
  //           updated[field] = value.replace(/[^a-zA-Z0-9\s]/g, "") as never;
  //         }
  //         // } else if (field === "userId") {
  //         //   updated[field] = value as never; // Allow all characters
  //         // } else {
        

  //       return updated;
  //     });
  //   };


  const handleChange =
  (field: keyof UserForDisplay) =>
  (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    setUserData((prev) => {
      const updated = { ...prev };

      // First name: only letters and spaces, max 80 characters
      if (field === "firstName") {
        updated[field] = value
          .replace(/[^a-zA-Z\s]/g, "")
          .slice(0, 80) as never;

      // Last name: only letters and spaces, max 30 characters
      } else if (field === "lastName") {
        updated[field] = value
          .replace(/[^a-zA-Z\s]/g, "")
          .slice(0, 30) as never;

      // Email ID: allow alphanumeric + common email characters
      } else if (field === "email") {
        updated[field] = value.replace(/[^a-zA-Z0-9@._-]/g, "") as never;

        // Clear email error when user starts typing
        if (formErrors.email) {
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            email: "",
          }));
        }

      // Default: alphanumeric and space only
      } else {
        updated[field] = value.replace(/[^a-zA-Z0-9\s]/g, "") as never;
      }

      return updated;
    });
  };


  const handleRoleChange = (e: SelectChangeEvent<string>): void => {
    const selectedId = e.target.value;
    const selectedRole = roles.find((role) => role.id === selectedId);

    if (selectedRole) {
      setUserData({
        ...userData,
        role: { _id: selectedRole.id, name: selectedRole.name },
      });

      if (setRoleId) {
        setRoleId(selectedId);
      }

      // Clear role error when user selects a role
      if (formErrors.role) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          role: "",
        }));
      }
    }
  };

  const isFormValid =
    userData.firstName.trim() &&
    userData.lastName.trim() &&
    // userData.phoneNumber.trim() &&
    // userData.phoneNumber.length === 10 &&
    // userData.pin.trim() &&
    // userData.pin.length === 6 &&
    userData.email.trim() &&
    isValidEmail(userData.email) &&
    userData.role?._id &&
    userData.role?.name;

  const handleSubmit = async () => {
    const newErrors: {
      // phoneNumber?: string;
      email?: string;
      pin?: string;
      role?: string;
    } = {};

    // Validate phone number
    // if (!userData.phoneNumber || userData.phoneNumber.length !== 10) {
    //   newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    // }

    // Validate email
    if (!userData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(userData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate PIN
    // if (!userData.pin.trim()) {
    //   newErrors.pin = "PIN is required";
    // } else if (userData.pin.length !== 6) {
    //   newErrors.pin = "PIN must be exactly 6 digits";
    // }

    // Validate role selection
    if (!userData.role?._id) {
      newErrors.role = "Please select a role";
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      toast.warn("Please fix the errors in the form.");
      return;
    }

    if (onSave && isFormValid) {
      try {
        await onSave(userData);
        toast.success("User added successfully!");
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            "Failed to add user. Please try again."
        );
      }
    } else {
      toast.warn("Please fill all required fields correctly.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
        Add user
      </DialogTitle>
      <DialogContent>
        <Box component="form" noValidate>
          <div className="flex flex-wrap gap-8 border border-primary rounded-md p-4">
            {/* <div className="w-full md:w-[48%]">
              <TextField
                label="User Id"
                value={userData.userId}
                size="small"
                fullWidth
                onChange={handleChange("userId")}
              />
            </div> */}
            <div className="w-full md:w-[48%]">
              <TextField
                label="Email id *"
                placeholder="Enter valid email address"
                size="small"
                fullWidth
                value={userData.email}
                onChange={handleChange("email")}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </div>

            <div className="w-full md:w-[48%]">
              <TextField
                label="First name *"
                placeholder="Enter first name"
                size="small"
                fullWidth
                value={userData.firstName}
                onChange={handleChange("firstName")}
              />
            </div>

            <div className="w-full md:w-[48%]">
              <TextField
                label="Last name *"
                placeholder="Enter last name"
                size="small"
                fullWidth
                value={userData.lastName}
                onChange={handleChange("lastName")}
              />
            </div>

            {/* <div className="w-full md:w-[48%]">
              <TextField
                label="Phone number *"
                placeholder="+91 Enter phone number"
                size="small"
                fullWidth
                value={userData.phoneNumber}
                onChange={handleChange("phoneNumber")}
                error={!!formErrors.phoneNumber}
                helperText={formErrors.phoneNumber}
              />
            </div> */}

            {/* <div className="w-full md:w-[48%]">
              <TextField
                label="Pin *"
                placeholder="Enter 6-digit pin"
                size="small"
                fullWidth
                value={userData.pin}
                onChange={handleChange("pin")}
                error={!!formErrors.pin}
                helperText={formErrors.pin}
              />
            </div> */}

            <div className="w-full md:w-[48%]">
              <FormControl fullWidth size="small" error={!!formErrors.role}>
                <InputLabel>Role *</InputLabel>
                <Select
                  value={userData.role?._id || ""}
                  label="Role *"
                  onChange={handleRoleChange}
                >
                  {(roles ?? []).map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.role && (
                  <div className="text-red-500 text-xs mt-1 ml-3">
                    {formErrors.role}
                  </div>
                )}
              </FormControl>
            </div>
          </div>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-end", p: 2, gap: 2 }}>
        <Button
          variant="outline"
          onClick={onClose}
          className="border border-primary text-primary"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={handleSubmit}
          className="bg-primary px-8"
          disabled={!isFormValid}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
