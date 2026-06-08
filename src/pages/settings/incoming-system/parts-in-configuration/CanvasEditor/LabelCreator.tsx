import React, { useState } from "react";
import { Stack, Typography, Button, TextField, Box } from "@mui/material";
import CanvasEditor from "./CanvasEditor";

interface LabelCreatorProps {
  width: number;
  height: number;
  item: any[];
  entityTableRows: any[];
  onSaveData: (data: {
    widthMm: number;
    heightMm: number;
    items: any[];
  }) => void;
}

const LabelCreator: React.FC<LabelCreatorProps> = ({
  width,
  height,
  item,
  entityTableRows,
  onSaveData,
}) => {
  const [widthMm, setWidthMm] = useState<number>(width);
  const [heightMm, setHeightMm] = useState<number>(height);
  const [showCanvas, setShowCanvas] = useState<boolean>(false);
  const [locked, setLocked] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(false); // new state

  const handleSubmit = () => {
    if (widthMm > 0 && heightMm > 0) {
      setLocked(true);
      setShowCanvas(true);
    } else {
      alert("Please enter valid positive values.");
    }
  };

  const handleEdit = () => {
    setLocked(false);
  };

  const onSave = (data: any) => {
    onSaveData(data);
  };

  return (
   <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        backgroundColor: "white",
      }}
    >
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
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
          Label Setup
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </Box>

      {/* Collapsible Content */}
      <Box
        className={`transition-all duration-300 overflow-hidden ${
          collapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100 px-6 py-6"
        }`}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <TextField
            label="Width (mm)"
            type="number"
            value={widthMm}
            onChange={(e) => !locked && setWidthMm(Number(e.target.value))}
            required
            disabled={locked}
            size="small"
          />
          <TextField
            label="Height (mm)"
            type="number"
            value={heightMm}
            onChange={(e) => !locked && setHeightMm(Number(e.target.value))}
            required
            disabled={locked}
            size="small"
          />
          {!locked ? (
            <Button
              variant="contained"
              sx={{ bgcolor: "var(--primary)", color: "white", px: 4 }}
              onClick={handleSubmit}
            >
              Create
            </Button>
          ) : (
            <Button
              variant="contained"
              sx={{ bgcolor: "var(--primary)", color: "white", px: 4 }}
              onClick={handleEdit}
            >
              Edit Size
            </Button>
          )}
        </Stack>

        {(showCanvas || item?.length > 0) && (
          <CanvasEditor
            widthMm={widthMm}
            heightMm={heightMm}
            onSave={onSave}
            itemsData={item || []}
            entityTableRows={entityTableRows}
          />
        )}
      </Box>
    </Box>
  );
};

export default LabelCreator;
