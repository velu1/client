import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "var(--font-BreeSerif)",
  },
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "var(--primary)", // grey
          fontFamily: "var(--font-BreeSerif)",
          "&.Mui-focused": {
            color: "var(--primary)",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontFamily: "var(--font-BreeSerif)",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000000",
            borderWidth: "1px", // Adjusted border width to make it thinner
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000000",
            borderWidth: "1px",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000000",
            borderWidth: "1px",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily: "var(--font-BreeSerif)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: "var(--font-BreeSerif)",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: "black",
          fontFamily: "var(--font-BreeSerif)",
          "&.Mui-focused": {
            color: "black",
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontFamily: "var(--font-BreeSerif)",
        },
        root: {
          color: "#808080",
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "var(--primary)",
          "&.Mui-checked": {
            color: "var(--primary)",
          },
        },
      },
    },
  },
});

export default theme;
