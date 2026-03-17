import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { useState, useEffect, useCallback } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { getSystemConfig, updateSystemConfig } from "../../../api/settings";
import { toast } from "react-fox-toast";
import Typography from "@mui/material/Typography";

const dateFormats = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  { value: "YYYY/MM/DD", label: "YYYY/MM/DD" },
];

const timeFormats = [
  { value: "12hr", label: "12 Hour (AM/PM)" },
  { value: "24hr", label: "24 Hour" },
];

const SystemConfigPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [timeFormat, setTimeFormat] = useState("24hr");
  // const [configId, setConfigId] = useState("");

  // Debounced save function
  const saveChanges = useCallback(
    async (newDateFormat: string, newTimeFormat: string) => {
      // if (!configId) return; 

      try {
        setSaving(true);

        // Format time according to 12hr or 24hr format
        const formattedTimeFormat =
          newTimeFormat === "12hr" ? "hh:mm a" : "hh:mm";

        const updatePayload = {
          dateFormat: newDateFormat,
          timeFormat: formattedTimeFormat,
          theme: "Light", // Keep theme light as requested
        };

        await updateSystemConfig(updatePayload);
        toast.success("System configuration updated");
      } catch (error) {
        console.error("Failed to update system config:", error);
        toast.error("Failed to update system configuration");
      } finally {
        setSaving(false);
      }
    },
    []
  );

  useEffect(() => {
    const fetchSystemConfig = async () => {
      try {
        setLoading(true);
        const data = await getSystemConfig();

        // Set date format
        setDateFormat(data.dateFormat);

        // Set time format based on API response
        if (data.timeFormat.includes("a")) {
          setTimeFormat("12hr");
        } else {
          setTimeFormat("24hr");
        }

        // Store the config ID for updates
        // setConfigId(data.id);
      } catch (error) {
        console.error("Failed to fetch system config:", error);
        // toast.error("Failed to load system configuration");
      } finally {
        setLoading(false);
      }
    };

    fetchSystemConfig();
  }, []);

  // Handle date format change
  const handleDateFormatChange = async (newValue: string) => {
    setDateFormat(newValue);
    await saveChanges(newValue, timeFormat);
  };

  // Handle time format change
  const handleTimeFormatChange = async (newValue: string) => {
    setTimeFormat(newValue);
    await saveChanges(dateFormat, newValue);
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

  return (
    <div className="flex flex-col md:items-start items-center w-full">
      <div className="flex flex-col gap-4 w-full md:w-1/3 px-4">
        <h1 className="text-xl font">Theme Settings</h1>
        <FormControl fullWidth size="small">
          <InputLabel id="theme-select-label">Select Theme</InputLabel>
          <Select
            labelId="theme-select-label"
            label="Select Theme"
            defaultValue={"Light"}
            disabled
          >
            <MenuItem value="Light">Light</MenuItem>
            <MenuItem value="Dark">Dark</MenuItem>
          </Select>
        </FormControl>
        <h1 className="text-xl">Date &amp; Time Format</h1>
        <FormControl fullWidth size="small">
          <InputLabel id="date-format-label">Date Format</InputLabel>
          <Select
            labelId="date-format-label"
            label="Date Format"
            value={dateFormat}
            onChange={(e) => handleDateFormatChange(e.target.value)}
            disabled={saving}
          >
            {dateFormats.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel id="time-format-label">Time Format</InputLabel>
          <Select
            labelId="time-format-label"
            label="Time Format"
            value={timeFormat}
            onChange={(e) => handleTimeFormatChange(e.target.value)}
            disabled={saving}
          >
            {timeFormats.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {saving && (
          <Typography
            variant="caption"
            sx={{
              color: "var(--primary)",
              mt: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CircularProgress size={16} sx={{ color: "var(--primary)" }} />
            Saving changes...
          </Typography>
        )}
      </div>
    </div>
  );
};

export default SystemConfigPage;
