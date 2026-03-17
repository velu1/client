import { useState, useEffect } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
// import { DateTimePicker } from "../../../../components/common/DateTimePicker";
// import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
// import Divider from "@mui/material/Divider";
// import Tooltip from "@mui/material/Tooltip";
// import note from "../../../../assets/newIcons/settings/note.svg";
// import qrCode from "../../../../assets/newIcons/settings/qrCode.svg";
// import qrCodeB from "../../../../assets/newIcons/settings/qrCodeBlack.svg";
// import gui from "../../../../assets/newIcons/settings/gui.svg";
// import guiB from "../../../../assets/newIcons/settings/guiBlack.svg";
// import activePrinter from "../../../../assets/newIcons/settings/qrButton.svg";
// import inactivePrinter from "../../../../assets/newIcons/settings/dataM.svg";
// import dataMW from "../../../../assets/newIcons/settings/dataMW.svg";
// import arrowD from "../../../../assets/newIcons/sidebar/arrowDown.svg";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-fox-toast";
import {
  getPartsInPrinterConfig,
  updatePartsInPrinterConfig,
  PrinterConfigurationResponse,
} from "../../../../api/settings";
import FieldMappingTable from "../../../../components/partsInConfiguration/FieldMappingTable";
import CApp from "./CanvasEditor/CApp";

const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 35,
  height: 20,
  marginLeft: 10,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(16px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 3,
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "var(--primary)",
        opacity: 1,
        border: "1px solid var(--primary)",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 0 0 1px #ccc",
    width: 13,
    height: 13,
    borderRadius: "50%",
    backgroundColor: "white",
    border: "2px solid #434A52",
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "transparent",
    border: "1px solid #434A52",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

// const CustomArrowIcon = (props: any) => (
//   <span {...props}>
//     <img src={arrowD} alt="arrowD" className="h-3 w-3 cursor-pointer" />
//   </span>
// );

const FormGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 16,
  width: "100%",
});

const FormItem = styled("div")({
  marginBottom: "16px",
});

type EntityTableRow = {
  slNo: number;
  name: string;
  id: string;
  default?: boolean;
  defaultTableRow?: boolean;
};

// Define options for the priority dropdowns
// const priorityOptions = [
//   { value: "partNumber", label: "Part number" },
//   { value: "LOT NUMBER", label: "LOT NUMBER" },
//   { value: "quantity", label: "Quantity" },
//   { value: "Manuf Date", label: "Manuf Date" },
//   { value: "Manufacturer", label: "Manufacturer" },
//   { value: "uniqueId", label: "Unique id" },
// ];

const PartsInConfigurationPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedUnique, setCollapsedUnique] = useState(false);

  const [entityTableRows, setEntityTableRows] = useState<EntityTableRow[]>([
    { slNo: 1, name: "Part Number", id: "partNumber" },
    { slNo: 2, name: "Quantity", id: "quantity" },
  ]);

  const [config, setConfig] = useState<PrinterConfigurationResponse | null>(
    null
  );
  const [labelData, setLabelData] = useState<
    PrinterConfigurationResponse["labelData"]
  >({
    heightMm: 0,
    widthMm: 0,
    items: [],
  });

  const [printType, setPrintType] = useState<"qr" | "dataMatrix">("qr");
  const [originalEntityTableRows, setOriginalEntityTableRows] = useState<
    EntityTableRow[]
  >([]);
  const [formData, setFormData] = useState({
    partsInNamingSeries: "",
    namingSeries: "",
    delimiter: "",
    audit: false,
    invoice: false,
    panelBoards: false,
  });

  const [errors, setErrors] = useState({
    partsInNamingSeries: "",
  });

  // Priority selections state
  const [prioritySelections, setPrioritySelections] = useState<Array<string>>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [priorityDropdownOptions, setPriorityDropdownOptions] = useState<
    EntityTableRow[]
  >([]);

  const [, setIsFormValid] = useState(false);
    const [collapsedFieldPriority, setCollapsedFieldPriority] = useState(false);

  // ... existing code ...

  useEffect(() => {
    const isValid =
      formData.partsInNamingSeries.trim() !== "" &&
      formData.delimiter.trim() !== "" &&
      entityTableRows.every((row) => row.name && row.name.trim() !== "") &&
      // Check that all priority selections are filled based on entity table rows
      prioritySelections
        .slice(0, entityTableRows.length) // Only check priorities up to the number of entity rows
        .every((priority) => priority && priority.trim() !== "");

    setIsFormValid(isValid);
  }, [formData, prioritySelections, entityTableRows]); // Add entityTableRows to dependencies

 

  const toCamelCase = (str: string): string => {
    const trimmed = str?.trim();

    // Skip if it's a single word and contains both lowercase and uppercase (likely camelCase or PascalCase)
    if (
      !trimmed?.includes(" ") &&
      /[A-Z]/.test(trimmed) &&
      /[a-z]/.test(trimmed) &&
      !/^[A-Z][a-z]+$/.test(trimmed)
    ) {
      console.log(
        `🔒 Skipped toCamelCase: already in camelCase or PascalCase → "${trimmed}"`
      );
      return trimmed;
    }

    // Generate camelCase string
    const camel = trimmed
      ?.toLowerCase()
      ?.replace(/[^a-zA-Z0-9]+(.)/g, (_match, chr) => chr?.toUpperCase())
      ?.replace(/^[^a-zA-Z0-9]+/, "");

    // Ensure first character is always lowercase
    const result = camel?.charAt(0)?.toLowerCase() + camel?.slice(1);

    console.log(`📝 Converted toCamelCase: "${str}" → "${result}"`);
    return result;
  };

  // const normalizeString = (str: string): string =>
  //   str?.toLowerCase().replace(/\s+/g, "").trim();
  const fetchPrinterConfig = async () => {
    try {
      setLoading(true);
      const data = await getPartsInPrinterConfig();
      setConfig(data);

      // Store ALL original entityTableRows (both true and false)
      const allOriginalRows = data.entityTableRows.map((row: any) => ({
        ...row,
        id: toCamelCase(row.id),
      }));
      setOriginalEntityTableRows(allOriginalRows);

      // Set entityTableRows (filtered for default ones - UI display only)
      let entityTable = allOriginalRows.filter(
        (row: any) => row.defaultTableRow === true
      );
      setEntityTableRows(entityTable);
      const priorityOptionsWithNone = [
        { slNo: 0, name: "None", id: "none", defaultTableRow: false },
        ...allOriginalRows,
      ];
      // Set ALL entityTableRows for priority dropdown (no filtering)
      setPriorityDropdownOptions(priorityOptionsWithNone);

      setLabelData(data.labelData);
      // Set form data from fetched configuration
      setFormData({
        partsInNamingSeries: data.partsInNamingSeries || "",
        namingSeries: data.namingSeries || "",
        delimiter: data.delimiter || "",
        audit: data.audit || false,
        invoice: data.invoice || false,
        panelBoards: data.panelBoards || false,
      });

      // Set print type
      setPrintType(data.printType === "DataMatrix" ? "dataMatrix" : "qr");

      // Initialize priority selections from data
      const maxPriority = Math.max(
        ...data.priority.map((item) => parseInt(item.priority))
      );

      const newPrioritySelections = Array(maxPriority).fill("");
      data.priority.forEach((item) => {
        const index = parseInt(item.priority) - 1;
        if (index >= 0 && index < newPrioritySelections.length) {
          // Store the actual value (which should correspond to the ID)
          newPrioritySelections[index] = item.value;
        }
      });

      setPrioritySelections(newPrioritySelections);
    } catch (error) {
      console.error("Failed to fetch printer config:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPrinterConfig();
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      partsInNamingSeries: "",
    };

    // Validate parts naming series (mandatory)
    if (!formData.partsInNamingSeries.trim()) {
      newErrors.partsInNamingSeries = "PartsIn naming series is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    console.log("=== MAIN SAVE BUTTON CLICKED ===");
    console.log("entityTableRows before validation:", entityTableRows);

    // Save any unsaved fields from the FieldMappingTable and get the updated array
    let finalEntityTableRows = entityTableRows;
    if ((window as any).saveUnsavedFieldsRef) {
      finalEntityTableRows = (window as any).saveUnsavedFieldsRef();
      console.log(
        "IMMEDIATE RETURN from saveUnsavedFields:",
        finalEntityTableRows
      );

      // Wait a bit for state updates to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      "entityTableRows after saving unsaved fields:",
      entityTableRows
    );
    console.log(
      "finalEntityTableRows to be used in payload:",
      finalEntityTableRows
    );

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }
//     if (!config) {
//       toast.error("Configuration data is missing");
//       return;
//     }

    setSaving(true);
    try {
      // Combine original hidden rows + updated visible rows
      const hiddenRows = originalEntityTableRows.filter(
        (row) => row.defaultTableRow === false
      );
      const visibleRows = finalEntityTableRows.map((row) => ({
        ...row,
        id: toCamelCase(row.id),
        defaultTableRow: true,
      }));

      const completeEntityTableRows = [...hiddenRows, ...visibleRows];

      // Prepare priority data for the API
      const priorityData = prioritySelections
        .map((value, index) => ({ value, originalIndex: index }))
        .filter((item) => item.value && item.value !== "none")
        .map((item, newIndex) => ({
          priority: (newIndex + 1).toString(),
          value: item.value,
        }));

      // Prepare update payload
      const updatePayload = {
        id: config.id,
        type: config.type || "partsInPrinterConfig",
        partsInNamingSeries: formData.partsInNamingSeries,
        namingSeries: formData.namingSeries,
        delimiter: formData.delimiter,
        audit: formData.audit,
        invoice: formData.invoice,
        panelBoards: formData.panelBoards,
        // Set the correct print type format
        printType: printType === "qr" ? "QrCode" : "DataMatrix",
        priority: priorityData,
        printerName: config.printerName || "",
        entityTableRows: completeEntityTableRows,
        labelData: {
          ...labelData,
          items: labelData.items.map((item) => ({
            ...item,
            value:
              item.type === "value" && item.value
                ? toCamelCase(item.value)
                : item.value,
          })),
        },
      };

      console.log(" FINAL PAYLOAD being sent to API:");
      console.log("Full payload:", updatePayload);
      console.log("EntityTableRows in payload:", updatePayload);

      // Call the API
      const result = await updatePartsInPrinterConfig(updatePayload);
      setConfig(result);
      fetchPrinterConfig();
      toast.success("Printer configuration updated successfully");
    } catch (error) {
      console.error("Failed to update printer config:", error);
      toast.error("Failed to update printer configuration");
    } finally {
      setSaving(false);
    }
  };

  const handlePriorityChange = (index: number, value: string) => {
    const newSelections = [...prioritySelections];

    newSelections[index] = value;
    setPrioritySelections(newSelections);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for the field being edited
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSwitchChange =
    (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [name]: event.target.checked,
      }));
    };

  const handleCancel = () => {
    // Reset form to the original data
    if (config) {
      setFormData({
        partsInNamingSeries: config.partsInNamingSeries || "",
        namingSeries: config.namingSeries || "",
        delimiter: config.delimiter || "",
        audit: config.audit || false,
        invoice: config.invoice || false,
        panelBoards: config.panelBoards || false,
      });

      setPrintType(config.printType === "DataMatrix" ? "dataMatrix" : "qr");

      // Reset priority selections
      const newPrioritySelections = Array(6).fill("");
      config.priority.forEach((item) => {
        const index = parseInt(item.priority) - 1;
        if (index >= 0 && index < 6) {
          // Store the actual value (which should correspond to the ID)
          newPrioritySelections[index] = item.value;
        }
      });
      setPrioritySelections(newPrioritySelections);

      // Clear any errors
      setErrors({
        partsInNamingSeries: "",
      });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const canvaData = (data: any) => {
    setLabelData(data);
  };

  return (
          <Box sx={{ paddingX: "10", maxWidth: "100%"}}>
                     <Box sx={{ display: "flex", gap: 2,mb:2 , justifyContent: "flex-end"}}>      
                    <Button variant="outlined" sx={{ color: "var(--primary)", borderColor: "var(--primary)", paddingX: "15px" }} onClick={handleCancel} disabled={saving}>
                      Cancel
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: "var(--primary)", color: "white", paddingX: "30px" }} onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                   </Button>
                   </Box>
    
                  {/* Top Row */}
                 <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
                    {/* Left - Global Field */}
                    <Box sx={{ flex: 1, width: "100%" }}>
        <div className="bg-white rounded-md shadow-sm border w-full">
          
          {/* 🔸 Updated Header (only this part changed) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.5,
              cursor: "pointer",
              backgroundColor: "#d5d5d5",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
            onClick={() => setCollapsed((prev) => !prev)}
          >
            <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
              Global Field For Extraction
            </Typography>
            <button className="bg-[#676e6e]/20 rounded-full p-1 hover:bg-[#676e6e]/30 transition">
              <svg
                className={`w-5 h-5 text-[#676e6e] transition-transform duration-300 ${
                  collapsed ? "" : "rotate-180"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </Box>
          {/* 🔸 End of updated header */}

          <div
            className={`transition-all duration-300 overflow-hidden ${
              collapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100 px-6 py-6"
            }`}
          >
            <FieldMappingTable
              entityTableRows={entityTableRows}
              setEntityTableRows={setEntityTableRows}
              setPrioritySelections={setPrioritySelections}
            />
          </div>
        </div>

      {/* Unique Identification Section */}
  <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, backgroundColor: "white", mt: 2 }}>
    {/* Header */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1.5,
        cursor: "pointer",
        backgroundColor: "#d5d5d5",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
      onClick={() => setCollapsedUnique((prev) => !prev)} // state toggle for collapse
    >
      <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
        Genral Settings
      </Typography>
      <button className="bg-[#676e6e]/20 rounded-full p-1 hover:bg-[#676e6e]/30 transition">
        <svg
          className={`w-5 h-5 text-[#676e6e] transition-transform duration-300 ${
            collapsedUnique ? "" : "rotate-180"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </Box>

    {/* Collapsible Content */}
    <Box
      className={`transition-all duration-300 overflow-hidden ${
        collapsedUnique
          ? "max-h-0 opacity-0"
          : "max-h-[2000px] opacity-100 px-6 py-6"
      }`}
    >
      <FormGrid
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 5,
        }}
      >
        {/* PartsIn Naming Series */}
        <FormItem>
          <TextField
            fullWidth
            label="Parts naming series(Prfix)"
            placeholder="MMT"
            size="small"
            name="partsInNamingSeries"
            value={formData.partsInNamingSeries}
            onChange={handleInputChange}
            error={!!errors.partsInNamingSeries}
            helperText={errors.partsInNamingSeries}
            required
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiInputBase-input": {
                fontSize: "0.8rem",
                padding: "10px 8px",
              },
            }}
          />
        </FormItem>

        {/* Part Unique ID */}
        <FormItem>
          <TextField
            fullWidth
            label="Part unique Id(starting No)"
            placeholder="1000"
            size="small"
            name="namingSeries"
            value={formData.namingSeries}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiInputBase-input": {
                fontSize: "0.8rem",
                padding: "10px 8px",
              },
            }}
          />
        </FormItem>
      </FormGrid>
        <Typography variant="subtitle1" sx={{ color: "text.secondary",mb:1 }}>
            Invoice(Receipt) Enable/Disable
          </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>Invoice</Typography>
              <CustomSwitch checked={formData.invoice} onChange={handleSwitchChange("invoice")} />
              {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>Audit</Typography>
              <CustomSwitch checked={formData.audit} onChange={handleSwitchChange("audit")} /> */}
      {/* </Box> */}
          
      </Box>
      <br />
      <Typography variant="subtitle1" sx={{ color: "text.secondary",mb:1 }}>
        Field priority For QR Code Label
      </Typography>
      <br />
      <Box>
            <FormGrid
              sx={{
                mb: 0,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
                gap: 4,
              }}
            >
              {/* Delimiter Input */}
              <FormItem>
                <TextField
                  fullWidth
                  label="Delimiter / Field separator"
                  placeholder="|"
                  size="small"
                  name="delimiter"
                  value={formData.delimiter}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiInputBase-input": { fontSize: "0.8rem", padding: "10px 8px" } }}
                />
              </FormItem>

              {/* Priority Selectors */}
              {priorityDropdownOptions
                .filter((option) => option.id !== "none")
                .map((_, index) => (
                  <FormItem key={`priority-${index}`}>
                    <FormControl fullWidth size="small">
                      <InputLabel shrink sx={{ backgroundColor: "white", px: 0.5 }}>Select</InputLabel>
                      <Select
                        value={prioritySelections[index] || ""}
                        onChange={(e) => handlePriorityChange(index, e.target.value)}
                      >
                        {priorityDropdownOptions
                          .filter((option) => {
                            if (option.id === "none") return true;
                            if (option.id === prioritySelections[index]) return true;
                            return !prioritySelections.some((sel, i) => i !== index && sel === option.id);
                          })
                          .map((option) => (
                            <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </FormItem>
                ))}
            </FormGrid>
          </Box>
    </Box>
  </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
        
            </Box>
          </Box>
                  </Box>
                  
      {/* Right - Field Priority + Label Setup */}
      <Box sx={{ flex: 1, maxWidth: "100%"}}>
        
       

        {/* Label Setup */}
        <CApp
          canvaData={canvaData}
          widthMm={labelData?.widthMm}
          heightMm={labelData?.heightMm}
          items={labelData?.items}
          entityTableRows={priorityDropdownOptions}
        
        />
      </Box>
    </Box>
  </Box>
    );
  };

export default PartsInConfigurationPage;
