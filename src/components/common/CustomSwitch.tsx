import React from "react";
import { styled } from "@mui/material/styles";
import MuiSwitch from "@mui/material/Switch";

const CustomSwitchRoot = styled(MuiSwitch)(({ theme }) => ({
  width: 30,
  height: 15,
  marginLeft: 10,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 10,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(14px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 3,
    "&.Mui-checked": {
      transform: "translateX(14px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#c09966",
        opacity: 1,
        border: "1px solid #c09966",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 0 0 1px #ccc",
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "white",
    border: "1px solid #c09966",
  },
  "& .MuiSwitch-track": {
    borderRadius: 13,
    backgroundColor: "transparent",
    border: "1px solid #c09966",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

// The component keeping the same API you want
const CustomSwitch: React.FC<{
  checked: boolean;
  onCheckedChange: () => void;
}> = ({ checked, onCheckedChange }) => {
  return (
    <CustomSwitchRoot
      checked={checked}
      onChange={onCheckedChange}
      inputProps={{ "aria-checked": checked, role: "switch" }}
    />
  );
};

export default CustomSwitch;
