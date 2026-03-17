import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { TextField, MenuItem } from "@mui/material";
import { Checkbox } from "../../ui/checkbox";
import note from "../../../assets/newIcons/settings/note.svg";
import { styled } from "@mui/material";
import { Switch } from "@mui/material";
import QRCodeDialog from "./QrCodeDialog";

interface EntityMappingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  templateName: string;
  manufacturer: string;
  fieldMapping: {
    partNumber: string;
    quantity: string;
    lotNumber: string;
    manufacturingDate: string;
  };
}

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
        backgroundColor: "white",
        opacity: 1,
        border: "1px solid black",
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

const manufacturers = ["Samsung", "Sony", "Texas Instruments"];

const EntityMappingDialog: React.FC<EntityMappingDialogProps> = ({
  isOpen,
  onClose,
  imageUrl,
  templateName,
  manufacturer,
  fieldMapping,
}) => {
  const [localTemplateName, setLocalTemplateName] = useState(templateName);
  const [localManufacturer, setLocalManufacturer] = useState(manufacturer);
  const [localFieldMapping, setLocalFieldMapping] = useState(fieldMapping);
  const [disableOcr, setDisableOcr] = useState(false);
  const [showBarCode, setShowBarCode] = useState(false);
  console.log(disableOcr);

  useEffect(() => {
    if (isOpen) {
      setLocalTemplateName(templateName);
      setLocalManufacturer(manufacturer);
      setLocalFieldMapping(fieldMapping);
      setDisableOcr(false);
    }
  }, [isOpen, templateName, manufacturer, fieldMapping]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      modal={true}
    >
      <DialogContent className="bg-white rounded-lg p-4 shadow-lg w-[95%] max-w-2xl md:!max-w-5xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-sm md:text-xl font-semibold text-center">
            Entity Mapping
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row items-center justify-between border border-primary rounded-md overflow-y-auto md:overflow-hidden max-h-80 md:max-h-none">
          {/* Image */}
          <div className="flex justify-center md:justify-start w-full sm:w-[40%]">
            <div className="p-2">
              <img
                src={imageUrl}
                alt="Label"
                className="object-contain max-h-[100px] md:max-h-[350px]"
              />
            </div>
          </div>

          {/* Mapping Form */}
          <div className="flex flex-col w-full md:w-[60%] p-4">
            {showBarCode && (
              <QRCodeDialog open={showBarCode} onOpenChange={setShowBarCode} />
            )}
            {/* Top Inputs */}
            <div className="flex flex-col md:flex-row md:justify-between mb-4">
              <div className="w-full md:w-[45%]">
                <TextField
                  label="Template name"
                  value={localTemplateName}
                  onChange={(e) => setLocalTemplateName(e.target.value)}
                  size="small"
                  fullWidth
                  InputLabelProps={{
                    sx: {
                      backgroundColor: "white",
                      padding: "0 4px",
                    },
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      height: 36,
                      fontSize: "small",
                    },
                  }}
                />
              </div>

              <div className="w-full mt-4 md:mt-0 md:w-[30%]">
                <TextField
                  label="Manufacturer"
                  value={localManufacturer}
                  onChange={(e) => setLocalManufacturer(e.target.value)}
                  size="small"
                  select
                  fullWidth
                >
                  {manufacturers.map((mfg) => (
                    <MenuItem key={mfg} value={mfg}>
                      {mfg}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap md:flex-none justify-between p-2 rounded-md mb-4 bg-sidebar">
              <Button
                variant="default"
                className="rounded-md text-xs md:text-sm bg-primary"
              >
                OCR Data
              </Button>
              <Button
                variant="outline"
                className="rounded-md text-xs md:text-sm text-border-custom bg-transparent"
                onClick={() => {
                  setShowBarCode(true);
                }}
              >
                Barcode/QR code data
              </Button>
              <Button
                variant="outline"
                className="rounded-md text-xs md:text-sm text-border-custom bg-transparent"
              >
                Trial Run
              </Button>
            </div>

            {/* OCR toggle */}
            <div className="flex items-center gap-2 mb-4">
              <Checkbox />
              <span className="text-sm text-gray-600">Disable OCR data</span>
              <img src={note} alt="img" className="h-4 w-4" />
            </div>

            {/* Field Mapping Table */}
            <div className="border rounded-md bg-sidebar w-full md:w-[90%]">
              <div className="grid grid-cols-2 bg-primary rounded-t-md text-white text-sm font-semibold p-2">
                <div className="font-BreeSerif">Field name</div>
                <div className="font-BreeSerif">Field identifier</div>
              </div>

              <div className="flex flex-col gap-2 p-2 font-BreeSerif">
                {/* Part number */}
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-13 md:w-32 text-[11px] md:text-sm text-gray-700 font-BreeSerif">
                    Part number
                  </div>
                  <div className="flex-grow">
                    <TextField
                      value={localFieldMapping.partNumber}
                      size="small"
                      onChange={(e) =>
                        setLocalFieldMapping((prev) => ({
                          ...prev,
                          partNumber: e.target.value,
                        }))
                      }
                      fullWidth
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 36,
                          fontSize: "small",
                          backgroundColor: "white",
                        },
                      }}
                    />
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <CustomSwitch />
                    <img src={note} alt="note" className="h-4 w-4" />
                  </div>
                </div>

                {/* Quantity No */}
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-13 md:w-32  text-[11px] md:text-sm text-gray-700 font-BreeSerif">
                    Quantity No
                  </div>
                  <div className="flex-grow">
                    <TextField
                      value={localFieldMapping.quantity}
                      size="small"
                      onChange={(e) =>
                        setLocalFieldMapping((prev) => ({
                          ...prev,
                          quantity: e.target.value,
                        }))
                      }
                      fullWidth
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 36,
                          fontSize: "small",
                          backgroundColor: "white",
                        },
                      }}
                    />
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <CustomSwitch />
                    <img src={note} alt="note" className="h-4 w-4" />
                  </div>
                </div>

                {/* Lot number */}
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-13 md:w-32 text-[11px] md:text-sm text-gray-700 font-BreeSerif">
                    Lot number
                  </div>
                  <div className="flex-grow">
                    <TextField
                      value={localFieldMapping.lotNumber}
                      size="small"
                      onChange={(e) =>
                        setLocalFieldMapping((prev) => ({
                          ...prev,
                          lotNumber: e.target.value,
                        }))
                      }
                      fullWidth
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 36,
                          fontSize: "small",
                          backgroundColor: "white",
                        },
                      }}
                    />
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <CustomSwitch />
                    <img src={note} alt="note" className="h-4 w-4" />
                  </div>
                </div>

                {/* Manufacturing Date */}
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-13 md:w-32 text-[11px] md:text-sm text-gray-700 font-BreeSerif">
                    Manuf date
                  </div>
                  <div className="flex-grow">
                    <TextField
                      value={localFieldMapping.manufacturingDate}
                      size="small"
                      onChange={(e) =>
                        setLocalFieldMapping((prev) => ({
                          ...prev,
                          manufacturingDate: e.target.value,
                        }))
                      }
                      fullWidth
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 36,
                          fontSize: "small",
                          backgroundColor: "white",
                        },
                      }}
                    />
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <CustomSwitch />
                    <img src={note} alt="note" className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            className="text-[10px] md:text-xs border border-primary"
          >
            Save & capture
          </Button>
          <Button
            variant="outline"
            className="text-[10px] md:text-xs border border-primary"
          >
            Trial run
          </Button>
          <Button
            variant="default"
            className="text-[10px] md:text-xs bg-primary px-4 md:px-8"
          >
            Clear
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EntityMappingDialog;
