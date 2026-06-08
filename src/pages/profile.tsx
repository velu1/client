import { TextField } from "@mui/material";
import { Button } from "../components/ui/button";

const ProfilePage = () => {
  return (
    <div className="min-h-[calc(90vh-64px)] w-full flex flex-col justify-between items-center">
      <div className="space-y-6 w-full">
        <div
          className="rounded-md p-4"
          style={{ border: "1px solid var(--primary)" }}
        >
          <div className="flex flex-col md:flex-row space-x-6 gap-5">
            {/* Role Name Field */}
            <TextField
              size="small"
              label="Name"
              variant="outlined"
              placeholder="Enter your name"
              fullWidth
              className="bg-white"
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: "14px",
                },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--primary)",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "var(--primary)",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "14px",
                },
              }}
            />
            {/* Description Field */}
            <TextField
              size="small"
              label="Email Id"
              variant="outlined"
              placeholder="Enter email id here"
              fullWidth
              className="bg-white"
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: "14px",
                },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--primary)",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "var(--primary)",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "14px",
                },
              }}
            />
            <TextField
              size="small"
              label="Role"
              variant="outlined"
              placeholder="Enter Role here"
              fullWidth
              className="bg-white"
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: "14px",
                },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--primary)",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "var(--primary)",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "14px",
                },
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between gap-3">
        <Button variant="outline" className=" sm:w-auto border border-primary">
          Cancel
        </Button>
        <Button
          variant="default"
          className="bg-primary text-white hover:bg-primary/80 px-8"
        >
          Save{" "}
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
