import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

import TextField from "@mui/material/TextField";
import Cookies from "js-cookie";
interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: ProfileData;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  emailId: string;
  phoneNumber: string;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({
  open,
  onClose,
  initialData = {
    firstName: Cookies.get("name")?.split(" ")[0] || "",
    lastName: Cookies.get("name")?.split(" ")[1] || "",
    emailId: Cookies.get("email") || "",
    phoneNumber: Cookies.get("phone") || "",
  },
}) => {
  const [roleData, setRoleData] = React.useState<ProfileData>(initialData);

  const handleChange =
    (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      if (field === "firstName" || field === "lastName") {
        // Allow only letters and spaces
        value = value.replace(/[^a-zA-Z ]/g, "");
      } else if (field === "phoneNumber") {
        // Allow only digits, max 10 digits
        // Only update if value is digits and length <= 10
        if (!/^\d{0,10}$/.test(value)) {
          return; // Reject invalid input
        }
      }

      setRoleData({ ...roleData, [field]: value });
    };

  return (
    <div className="hidden md:block ">
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose();
        }}
      >
        <DialogContent
          className="mx-4 sm:mx-10 p-6 sm:p-8"
          style={{
            maxWidth: "800px",
            width: "80%",
            margin: "auto",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-medium">
              Profile
            </DialogTitle>
          </DialogHeader>

          <div className="md:p-4 space-y-6">
            <div
              className="rounded-lg p-4 md:p-8"
              style={{ border: "2px solid var(--primary)" }}
            >
              {/* Top row with Name and Email ID */}
              <div className="flex flex-col md:flex-row gap-5 mb-5">
                <div className="w-full md:w-1/2">
                  <TextField
                    size="small"
                    label="Name"
                    variant="outlined"
                    placeholder="Enter your first name"
                    fullWidth
                    disabled
                    value={roleData.firstName}
                    onChange={handleChange("firstName")}
                    sx={{
                      "& .MuiInputBase-input": { fontSize: "14px" },
                      "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                        borderColor: "var(--primary)",
                      },
                      "& .MuiInputLabel-root": { fontSize: "14px" },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "var(--primary)",
                      },
                    }}
                  />
                </div>
                {/* <div className="w-full md:w-1/2">
                  <TextField
                    size="small"
                    label="LastName"
                    variant="outlined"
                    placeholder="Enter your last name"
                    fullWidth
                    value={roleData.lastName}
                    disabled
                    onChange={handleChange("lastName")}
                    sx={{
                      "& .MuiInputBase-input": { fontSize: "14px" },
                      "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                        borderColor: "var(--primary)",
                      },
                      "& .MuiInputLabel-root": { fontSize: "14px" },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "var(--primary)",
                      },
                    }}
                  />
                </div> */}
                <div className="w-full md:w-1/2">
                  <TextField
                    size="small"
                    label="Email Id"
                    variant="outlined"
                    placeholder="Enter your email Id"
                    fullWidth
                    disabled
                    value={roleData.emailId}
                    onChange={handleChange("emailId")}
                    sx={{
                      "& .MuiInputBase-input": { fontSize: "14px" },
                      "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                        borderColor: "var(--primary)",
                      },
                      "& .MuiInputLabel-root": { fontSize: "14px" },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "var(--primary)",
                      },
                    }}
                  />
                </div>
              </div>

              {/* Second row with Role field */}
              <div className="flex flex-col md:flex-row gap-5 mb-5">
                {/* <div className="w-full md:w-1/2"> */}
                  {/* <TextField
                    size="small"
                    label="LastName"
                    variant="outlined"
                    placeholder="Enter your last name"
                    fullWidth
                    value={roleData.lastName}
                    disabled
                    onChange={handleChange("lastName")}
                    sx={{
                      "& .MuiInputBase-input": { fontSize: "14px" },
                      "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                        borderColor: "var(--primary)",
                      },
                      "& .MuiInputLabel-root": { fontSize: "14px" },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "var(--primary)",
                      },
                    }}
                  /> */}
                  {/* <TextField
                    size="small"
                    label="Phone Number"
                    variant="outlined"
                    disabled
                    placeholder="Enter your phone Number"
                    fullWidth
                    value={roleData.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                  /> */}
                {/* </div> */}
                {/* <div className="w-full md:w-1/2"> */}
                  {/* <TextField
                    size="small"
                    label="Phone Number"
                    variant="outlined"
                    disabled
                    placeholder="Enter your phone Number"
                    fullWidth
                    value={roleData.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                  /> */}
                {/* </div> */}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileDialog;
