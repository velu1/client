import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import TextField from "@mui/material/TextField";
import { SelectChangeEvent } from "@mui/material";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { getAllRoles } from "../../api/administration/roles";
import { UserForDisplay } from "../../pages/administration/user-management/user";

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: UserForDisplay) => void;
  initialData?: UserForDisplay;
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

const defaultUser: UserForDisplay = {
  organization: "-",
  isUserActive: false,
  status: "success",
  // userId: "",
  firstName: "",
  lastName: "",
  // phoneNumber: "",
  // pin: "",
  email: "",
  role: { _id: "", name: "" },
  id: "",
};

export default function EditUserDialog({
  open,
  onClose,
  onSave,
  setRoleId,
  initialData = defaultUser,
}: UserDialogProps) {
  const [userData, setUserData] = React.useState<UserForDisplay>(initialData);
  const [roles, setRoles] = React.useState<RolesForDisplay[]>([]);
  const [errors, setErrors] = React.useState({
    firstName: "",
    lastName: "",
    // phoneNumber: "",
    pin: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    if (open && initialData.id !== userData.id) {
      setUserData(initialData);
    }
  }, [initialData, open]);

  useEffect(() => {
    if (setRoleId) {
      setRoleId(userData.role._id);
    }
  }, [userData.role._id]);

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

  const validateField = (field: keyof typeof errors, value: string) => {
    let error = "";

    switch (field) {
      case "firstName":
      case "lastName":
        if (!value.trim()) error = "This field is required.";
        break;
      // case "phoneNumber":
      //   if (!/^\+?[0-9]{10,15}$/.test(value.trim())) {
      //     error = "Invalid phone number.";
      //   }
      //   break;
      case "pin":
        if (!/^\d{4,6}$/.test(value.trim())) {
          error = "Pin must be 4 to 6 digits.";
        }
        break;
      case "email":
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value.trim())) {
          error = "Invalid email address.";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange =
    (field: keyof UserForDisplay) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // if (field === "pin") {
      //   // Only update state if the value is digits or empty
      //   if (/^\d*$/.test(value)) {
      //     setUserData({ ...userData, [field]: value });
      //     validateField(field as keyof typeof errors, value);
      //   }
      // } else
      // if (field === "phoneNumber") {
      //   // Allow only digits up to 10 characters
      //   if (/^\d{0,10}$/.test(value)) {
      //     setUserData({ ...userData, [field]: value });
      //     validateField(field as keyof typeof errors, value);
      //   }
        if (field === "firstName") {
        const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 80);
        setUserData({ ...userData, [field]: lettersOnly });
        validateField(field as keyof typeof errors, lettersOnly);
      } else if (field === "lastName") {
        const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 30);
        setUserData({ ...userData, [field]: lettersOnly });
        validateField(field as keyof typeof errors, lettersOnly);
      } else if (field === "email") {
        // Allow email as-is (no sanitization)
        setUserData({ ...userData, [field]: value });
        validateField(field as keyof typeof errors, value);
      } else {
        // Remove special characters for all other fields
        const sanitizedValue = value.replace(/[^a-zA-Z0-9\s]/g, "");
        setUserData({ ...userData, [field]: sanitizedValue });
        validateField(field as keyof typeof errors, sanitizedValue);
      }
    };

  const handleRoleChange = (e: SelectChangeEvent<string>) => {
    const selectedId = e.target.value;
    const selectedRole = roles.find((r) => r.id === selectedId);

    if (selectedRole) {
      setUserData({
        ...userData,
        role: { _id: selectedRole.id, name: selectedRole.name },
      });

      if (setRoleId) {
        setRoleId(selectedRole.id);
      }

      setErrors((prev) => ({ ...prev, role: "" }));
    } else {
      setErrors((prev) => ({ ...prev, role: "Role is required." }));
    }
  };

  const isUserDataEqual = (a: UserForDisplay, b: UserForDisplay) => {
    return (
      a.firstName === b.firstName &&
      a.lastName === b.lastName &&
      // a.phoneNumber === b.phoneNumber &&
      // a.pin === b.pin &&
      a.email === b.email &&
      a.role._id === b.role._id
    );
  };

  const isDirty = !isUserDataEqual(userData, initialData);

  const isFormValid =
    Object.values(errors).every((e) => e === "") &&
    userData.firstName.trim() &&
    userData.lastName.trim() &&
    // userData.phoneNumber.trim() &&
    // userData.pin.trim() &&
    userData.email &&
    userData.role._id;

  const handleSubmit = () => {
    if (onSave && isFormValid) {
      onSave(userData);
    }
  };

  return (
    <>
      {open && (
        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            if (!isOpen) onClose();
          }}
        >
          <DialogContent
            className="sm:max-w-3xl p-8"
            style={{ maxWidth: "900px" }}
          >
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-medium">
                {userData.id ? "Edit User" : "Add User"}
              </DialogTitle>
            </DialogHeader>

            <div className="md:p-4 space-y-6">
              <div
                className="rounded-lg p-4 md:p-8"
                style={{ border: "1px solid var(--primary)" }}
              >
                <div className="flex flex-wrap gap-6">
                  {/* <div className="w-full md:w-[48%]">
                    <TextField
                      size="small"
                      label="User Id"
                      fullWidth
                      value={userData.userId}
                    />
                  </div> */}

                  <div className="w-full md:w-[48%]">
                    <TextField
                      size="small"
                      label="Email ID *"
                      placeholder="Enter email"
                      fullWidth
                      value={userData.email}
                      onChange={handleChange("email")}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </div>

                  <div className="w-full md:w-[48%]">
                    <TextField
                      size="small"
                      label="First name *"
                      placeholder="Enter first name"
                      fullWidth
                      value={userData.firstName}
                      onChange={handleChange("firstName")}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                    />
                  </div>

                  <div className="w-full md:w-[48%]">
                    <TextField
                      size="small"
                      label="Last name *"
                      placeholder="Enter last name"
                      fullWidth
                      value={userData.lastName}
                      onChange={handleChange("lastName")}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                    />
                  </div>

                  {/* <div className="w-full md:w-[48%]">
                    <TextField
                      size="small"
                      label="Phone number *"
                      placeholder="+91 Enter phone number"
                      fullWidth
                      value={userData.phoneNumber?.toString() ?? ""}
                      onChange={handleChange("phoneNumber")}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber}
                    />
                  </div> */}

                  {/* <div className="w-full md:w-[48%]">
                    <TextField
                      size="small"
                      label="Pin *"
                      placeholder="Enter pin"
                      fullWidth
                      value={userData.pin?.toString() ?? ""}
                      onChange={handleChange("pin")}
                      error={!!errors.pin}
                      helperText={errors.pin}
                    />
                  </div> */}

                  <div className="w-full md:w-[48%]">
                    <FormControl fullWidth size="small" error={!!errors.role}>
                      <InputLabel id="role-label" shrink>
                        Role *
                      </InputLabel>
                      <Select
                        labelId="role-label"
                        id="role"
                        value={userData.role._id}
                        label="Role *"
                        onChange={handleRoleChange}
                        MenuProps={{
                          disablePortal: true,
                          PaperProps: {
                            style: {
                              minWidth: "300px", // at least as wide as select
                              boxSizing: "border-box",
                              marginLeft: -200,
                              marginTop: -100,
                            },
                          },
                        }}
                      >
                        {roles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.role && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.role}
                        </p>
                      )}
                    </FormControl>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full min-w-24 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-primary text-white hover:bg-primary/80 w-full min-w-24 sm:w-auto"
                disabled={!isFormValid || !isDirty}
              >
                {userData.id ? "Save" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
