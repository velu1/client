// import React from "react";
// import Dialog from "@mui/material/Dialog";
// import DialogContent from "@mui/material/DialogContent";
// import DialogTitle from "@mui/material/DialogTitle";
// import IconButton from "@mui/material/IconButton";
// import CloseIcon from "@mui/icons-material/Close";
// import TextField from "@mui/material/TextField";
// import { Box, Typography } from "@mui/material";
// interface ContactData {
//   address: string;
//   emailId: string;
//   phoneNumber: string;
//   website: string;
// }

// interface ContactDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   contactData: ContactData;
//   onSave: (data: ContactData) => void;
// }

// const ContactDialog: React.FC<ContactDialogProps> = ({
//   open,
//   onOpenChange,
// }) => {
//   const handleClose = () => {
//     onOpenChange(false);
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={handleClose}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{
//         style: {
//           borderRadius: "12px",
//           padding: "5px",
//         },
//       }}
//     >
//       <DialogTitle className="flex justify-between items-center">
//         <span className="text-2xl font-medium  w-full text-center ">
//           Contact us
//         </span>
//         <IconButton onClick={handleClose} size="small">
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>

//       <DialogContent className="pb-6">
//         <p
//           className="text-center text-lg mb-6"
//           style={{ color: "var(--primary)" }}
//         >
//           Get in touch and let us know, how we can help
//         </p>

//         <div className="space-y-6">
//           {/* Border around address, email, and phone number */}
//           <div
//             className="rounded-lg p-8"
//             style={{ border: "2px solid var(--primary)" }}
//           >
//             <div className="space-y-4">
//               {/* Modified this section for tablet responsiveness */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                 <div className="w-full lg:w-80 mb-4">
//                   <TextField
//                     size="small"
//                     label="Address"
//                     variant="outlined"
//                     defaultValue="Mysuru, Karnataka 570018,India"
//                     placeholder="Enter"
//                     fullWidth
//                     className="bg-white"
//                     InputProps={{
//                       readOnly: true,
//                     }}
//                     sx={{
//                       "& .MuiInputBase-input": {
//                         fontSize: "12px",
//                       },
//                       "& .MuiOutlinedInput-root": {
//                         "&.Mui-focused fieldset": {
//                           borderColor: "var(--primary)",
//                         },
//                       },
//                       "& .MuiInputLabel-root.Mui-focused": {
//                         color: "var(--primary)",
//                       },
//                       "& .MuiInputLabel-root": {
//                         fontSize: "12px",
//                       },
//                     }}
//                   />
//                 </div>
//                 <div className="w-full lg:w-80">
//                   <TextField
//                     size="small"
//                     label="Email Id"
//                     variant="outlined"
//                     defaultValue="info@mysoreminds.com"
//                     placeholder="Enter"
//                     fullWidth
//                     className="bg-white"
//                     InputProps={{
//                       readOnly: true,
//                     }}
//                     sx={{
//                       "& .MuiInputBase-input": {
//                         fontSize: "12px",
//                       },
//                       "& .MuiOutlinedInput-root": {
//                         "&.Mui-focused fieldset": {
//                           borderColor: "var(--primary)",
//                         },
//                       },
//                       "& .MuiInputLabel-root.Mui-focused": {
//                         color: "var(--primary)",
//                       },
//                       "& .MuiInputLabel-root": {
//                         fontSize: "12px",
//                       },
//                     }}
//                   />
//                 </div>
//               </div>
//               <div className="w-full lg:w-80">
//                 <TextField
//                   size="small"
//                   label="Phone Number"
//                   variant="outlined"
//                   defaultValue="+91 8277995300"
//                   placeholder="Enter"
//                   fullWidth
//                   className="bg-white"
//                   InputProps={{
//                     readOnly: true,
//                   }}
//                   sx={{
//                     "& .MuiInputBase-input": {
//                       fontSize: "12px",
//                     },
//                     "& .MuiOutlinedInput-root": {
//                       "&.Mui-focused fieldset": {
//                         borderColor: "var(--primary)",
//                       },
//                     },
//                     "& .MuiInputLabel-root.Mui-focused": {
//                       color: "var(--primary)",
//                     },
//                     "& .MuiInputLabel-root": {
//                       fontSize: "12px",
//                     },
//                   }}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Website field outside the border */}
//           <div className="space-y-2 ml-6">
//             <p className="mb-2" style={{ color: "var(--primary)" }}>
//               Want to know more?
//             </p>
//             <div className="w-full lg:w-80">
//               <Box
//                 sx={{
//                   border: "1px solid rgba(0, 0, 0, 0.23)",
//                   borderRadius: "4px",
//                   padding: "8.5px 14px",
//                   backgroundColor: "white",
//                   cursor: "pointer",
//                   "&:hover": {
//                     borderColor: "var(--primary)",
//                   },
//                 }}
//                 onClick={() =>
//                   window.open(
//                     "https://www.mysoreminds.com",
//                     "_blank"
//                   )
//                 }
//               >
//                 <Typography
//                   variant="body2"
//                   sx={{
//                     fontSize: "12px",
//                     color: "black",
//                     textDecoration: "underline",
//                   }}
//                 >
//                   www.mysoreminds.com
//                 </Typography>
//               </Box>
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default ContactDialog;


import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Typography, Button } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

export interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactDialog: React.FC<ContactDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: "12px",
          padding: "5px",
        },
      }}
    >
      <DialogTitle className="flex justify-between items-center">
        <span className="text-2xl font-medium w-full text-center">
          Contact Us
        </span>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <p
          className="text-center text-lg mb-6"
          style={{ color: "var(--primary)" }}
        >
          Get in touch and let us know how we can help
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left - Contact Info */}
          <div
            className="rounded-lg p-6 space-y-4"
            style={{ border: "2px solid var(--primary)" }}
          >
            <Box className="flex items-start space-x-3">
              <LocationOnIcon sx={{ color: "var(--primary)" }} />
              <Typography variant="body2">
                No: 7698, 3rd Floor, GNS Arcade, 80 feet road, 4th Stage,
                Vijaynagara, Mysuru 570032
              </Typography>
            </Box>

            <Box className="flex items-center space-x-3">
              <EmailIcon sx={{ color: "var(--primary)" }} />
              <Typography variant="body2">info@mysoreminds.com</Typography>
            </Box>

            <Box className="flex items-center space-x-3">
              <PhoneIcon sx={{ color: "var(--primary)" }} />
              <Typography variant="body2">+91 8277995300</Typography>
            </Box>

            <Typography
              variant="subtitle2"
              className="mt-6"
              sx={{ color: "var(--primary)" }}
            >
              Want to know more?
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: "1px solid rgba(0, 0, 0, 0.23)",
                borderRadius: "4px",
                padding: "8.5px 14px",
                backgroundColor: "white",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "var(--primary)",
                },
              }}
              onClick={() =>
                window.open("https://www.mysoreminds.com", "_blank")
              }
            >
              <LanguageIcon sx={{ color: "var(--primary)", mr: 1 }} />
              <Typography
                variant="body2"
                sx={{
                  fontSize: "12px",
                  color: "black",
                  textDecoration: "underline",
                }}
              >
                www.mysoreminds.com
              </Typography>
            </Box>
          </div>

          {/* Right - YouTube Video + Download PDF */}
          <div className="flex flex-col items-center space-y-4">
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/NQHO0JB_-E8"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                borderRadius: "8px",
                border: "1px solid var(--primary)",
              }}
            ></iframe>

            <Button
              variant="contained"
              style={{
                backgroundColor: "var(--primary)",
                textTransform: "none",
                borderRadius: "8px",
              }}
              startIcon={<CloudDownloadIcon />}
              onClick={() => {
                const link = document.createElement("a");
                link.href = "/pdfs/User-Manual.pdf";
                link.download = "DigiTrail User-Manual.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Download Manual
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
