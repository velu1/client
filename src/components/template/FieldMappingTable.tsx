import { useState, useEffect, useRef } from "react";
import ScanBarcodeDialog from "./ScanBarcodeDialog";
import { Checkbox } from "../ui/checkbox";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import deleteImg from "../../assets/newIcons/delete.svg";
import { TextField } from "@mui/material";
import CustomSwitch from "../common/CustomSwitch";
import { areFieldMappingsValid } from "../../utils/validations";
interface Field {
  fieldName: string;
  fieldValue: string;
  fieldIdentifier: string;
  position: string;
  identifier: string;
  startPosition: string;
  endPosition: string;
}

// interface QRFieldItem {
//   position?: string;
//   startIndex?: number | string;
//   endIndex?: number | string;
// }

const FieldMappingTable: React.FC<{
  isTemplate?: boolean;
  delimiterEnabled: boolean;
  setActiveTabs: (val: string) => void;
  setDelimiterEnabled: (val: boolean) => void;
  setIsPositional: (val: boolean) => void;
  setIsIdentifier: (val: boolean) => void;
  onValidationChange?: (isValid: boolean) => void;
  entityTableRows: {
    slNo: number;
    name: string;
    id: string;
    defaultTableRow?: boolean;
  }[];
  setEntityTableRows: React.Dispatch<
    React.SetStateAction<
      { slNo: number; name: string; id: string; defaultTableRow?: boolean }[]
    >
  >;
  setIsOcrValid: React.Dispatch<React.SetStateAction<boolean>>;
  setIsQrValid: React.Dispatch<React.SetStateAction<boolean>>;
  fieldNames: string[];
  onFieldsChange?: (fields: Field[]) => void;
  isECIA: boolean;
  setIsECIA: (val: boolean) => void;
  fieldData: Field[];
  setFieldData: (fields: Field[]) => void;
  setSelectedData: (val: string) => void;
  qrcodeFieldData: Field[];
  setQrcodeFieldData: React.Dispatch<React.SetStateAction<Field[]>>;
  ocrFieldData: Field[];
  setOcrFieldData: React.Dispatch<React.SetStateAction<Field[]>>;
  fieldMappingError: string;
  setFieldMappingError: React.Dispatch<React.SetStateAction<string>>;
  setOcrFieldsTouched: React.Dispatch<React.SetStateAction<boolean>>;
  setQrFieldsTouched: React.Dispatch<React.SetStateAction<boolean>>;
  onECIASwitch?: (val: boolean) => void;
  switchDisable: boolean;
  setSwitchDisable: React.Dispatch<React.SetStateAction<boolean>>;

  formData: {
    receiptNumber: string;
    manufacturer: string;
    templateName: string;
    fieldName: string;
    fieldIdentifier: string;
    delimiter: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      receiptNumber: string;
      manufacturer: string;
      templateName: string;
      fieldName: string;
      fieldIdentifier: string;
      delimiter: string;
    }>
  >;
  templateData?: any; // Add templateData prop to check if we're in edit mode
}> = ({
  delimiterEnabled,
  setDelimiterEnabled,
  onValidationChange,
  entityTableRows,
  switchDisable,
  setEntityTableRows,
  onFieldsChange,
  isECIA,
  setIsECIA,
  setSwitchDisable,
  formData,
  setActiveTabs,
  fieldData,
  setFieldData,
  setFormData,
  setSelectedData,
  setIsPositional,
  setIsIdentifier,
  templateData,
  isTemplate,
  setIsOcrValid,
  setIsQrValid,
  qrcodeFieldData,
  setQrcodeFieldData,
  ocrFieldData,
  setOcrFieldData,
  // fieldMappingError,
  setOcrFieldsTouched,
  setQrFieldsTouched,
  onECIASwitch,
}) => {
  console.log("📋 ==== FIELD MAPPING TABLE COMPONENT STARTED ====");

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "OCR";
  });

  console.log("TemplateDataMappingTable", templateData);

  const hasInitializedFields = useRef(false);
  const lastActiveTab = useRef(activeTab);
  const [useECIAStandard, setUseECIAStandard] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState<string>("");
  const [positionalEnabled, setPositionalEnabled] = useState(false);

  const currentFieldData = activeTab === "OCR" ? ocrFieldData : qrcodeFieldData;

  const [useCustom, setUseCustom] = useState(false);
  console.log("Fields", fieldData);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Rename extraIdentifier to identifier switch to control column rendering
  const [identifierEnabled, setIdentifierEnabled] = useState(false);

  // Check if we're in edit mode
  const isEditMode = Boolean(templateData);

  const pageReloadedRef = useRef(false);

  useEffect(() => {
    const navEntry = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    const navType = navEntry?.type;
    const isTrueReload =
      navType === "reload" || performance?.navigation?.type === 1;

    if (isTrueReload) {
      // Always override on reload
      console.log("Page reloaded, forcing activeTab to OCR");
      setActiveTab("OCR");
      setActiveTabs("OCR");
      localStorage.setItem("activeTab", "OCR");
      lastActiveTab.current = "OCR";
    }
  }, []);

  // Function to check if a field should be disabled during edit
  const isFieldDisabledInEdit = (fieldName: string): boolean => {
    if (!isEditMode) return false;

    const disabledFields = [
      "partnumber",
      "part number",
      "internal part number",
      "internalpartnumber",
      "internal partnumber",
    ];

    return disabledFields.includes(fieldName.toLowerCase().trim());
  };

  // Function to get proper field name display
  const getProperFieldName = (fieldName: string): string => {
    const fieldNameMap: { [key: string]: string } = {
      partnumber: "Part Number",
      quantity: "Quantity",
      lotnumber: "Lot Number",
      lotNumber: "Lot Number",
      "internal part number": "Internal Part Number",
      internalpartnumber: "Internal Part Number",
      "internal partnumber": "Internal Part Number",
      manufacturedate: "Manufacture Date",
      mfgDate: "Date Code",
      datecode: "Date Code",
    };

    return fieldNameMap[fieldName.toLowerCase()] || fieldName;
  };

  const handleDelimiterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, delimiter: e.target.value }));
  };

  useEffect(() => {
    console.log("activeTab", activeTab);

    localStorage.setItem("activeTab", activeTab);
    setActiveTabs(activeTab); // Keep parent in sync too
  }, [activeTab]);

  useEffect(() => {
    if (!hasInitializedFields.current && !isEditMode) {
      const defaultFields = ["partNumber", "quantity"];

      const parsed = JSON.parse(
        localStorage.getItem("entity_fieldValues") || "{}"
      );

      const updatedFields = defaultFields.map((id) => ({
        fieldName: id,
        fieldValue: parsed[id] ?? "",
        fieldIdentifier: "",
        position: "",
        identifier: "",
        startPosition: "",
        endPosition: "",
      }));

      setFieldData(updatedFields);
      hasInitializedFields.current = true;
    }
  }, [isEditMode, isTemplate]);

  useEffect(() => {
    console.log("activeTab", activeTab);

    localStorage.setItem("activeTab", activeTab);
    setActiveTabs(activeTab); // Keep parent in sync too
  }, [activeTab]);

  useEffect(() => {
    if (
      !hasInitializedFields.current &&
      !isEditMode &&
      !templateData // ✅ added guard to skip when editing and template exists
    ) {
      const defaultFields = ["partNumber", "quantity"];

      const parsed = JSON.parse(
        localStorage.getItem("entity_fieldValues") || "{}"
      );

      const updatedFields = defaultFields.map((id) => ({
        fieldName: id,
        fieldValue: parsed[id] ?? "",
        fieldIdentifier: "",
        position: "",
        identifier: "",
        startPosition: "",
        endPosition: "",
      }));

      setFieldData(updatedFields);
      hasInitializedFields.current = true;
    }
  }, [isEditMode, isTemplate, templateData]);

  const handleFieldChange = (
    index: number,
    key: keyof Field,
    value: string,
    source?: "ocr" | "qr"
  ) => {
    const currentData =
      activeTab === "OCR" ? [...ocrFieldData] : [...qrcodeFieldData];

    if (source === "ocr") {
      setOcrFieldsTouched(true);
    } else if (source === "qr") {
      setQrFieldsTouched(true);
    }

    if (key === "fieldName" && value.trim().toLowerCase() === "lot number") {
      currentData[index][key] = "lotNumber";
    } else {
      currentData[index][key] = value;
    }

    if (key === "identifier") {
      currentData[index].identifier = value;
    }

    if (key === "fieldValue" && value !== "none" && value !== "") {
      for (let i = 0; i < currentData.length; i++) {
        if (i !== index && currentData[i].fieldValue === value) {
          currentData[i].fieldValue = "";
          currentData[i].position = "";
          currentData[i].startPosition = "";
          currentData[i].endPosition = "";
        }
      }
    }

    if (key === "fieldIdentifier" && selectedBarcode) {
      const cleanValue = value?.trim?.() ?? "";

      if (!cleanValue) {
        currentData[index].position = "";
        currentData[index].startPosition = "";
        currentData[index].endPosition = "";
        activeTab === "OCR"
          ? setOcrFieldData(currentData)
          : setQrcodeFieldData(currentData);
        updateValidation(currentData);
        onFieldsChange?.(currentData);
        return;
      }

      const delimiter = formData.delimiter || ",";

      // ✅ Positional logic — skip RS, CS, etc.
      if (positionalEnabled) {
        const skipMarkers = ["RS", "CS"];
        const original = selectedBarcode;
        let cleaned = "";
        const mapCleanToOriginal: number[] = [];

        for (let i = 0; i < original.length; ) {
          const twoChar = original.slice(i, i + 2);
          if (skipMarkers.includes(twoChar)) {
            i += 2;
          } else {
            cleaned += original[i];
            mapCleanToOriginal.push(i);
            i++;
          }
        }

        const matchIndex = cleaned.indexOf(cleanValue);
        if (matchIndex !== -1) {
          const startOriginal = mapCleanToOriginal[matchIndex];
          const endOriginal =
            mapCleanToOriginal[matchIndex + cleanValue.length - 1];

          if (startOriginal !== undefined && endOriginal !== undefined) {
            currentData[index].startPosition = (startOriginal + 1).toString();
            currentData[index].endPosition = (endOriginal + 1).toString();
          } else {
            currentData[index].startPosition = "";
            currentData[index].endPosition = "";
          }
        } else {
          currentData[index].startPosition = "";
          currentData[index].endPosition = "";
        }
      }

      // ✅ Delimiter logic
      if (delimiterEnabled) {
        const escapedDelimiter = delimiter.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );
        const splitData = selectedBarcode.split(new RegExp(escapedDelimiter));
        const matchIndex = splitData.findIndex(
          (item) => item.trim() === cleanValue
        );

        if (matchIndex !== -1) {
          currentData[index].position = (matchIndex + 1).toString();
          let charIndex = 0;
          for (let i = 0; i < splitData.length; i++) {
            if (i === matchIndex) {
              const start = charIndex + 1;
              const end = start + splitData[i].length - 1;
              currentData[index].startPosition = start.toString();
              currentData[index].endPosition = end.toString();
              break;
            }
            charIndex += splitData[i].length + delimiter.length;
          }
        } else {
          currentData[index].position = "";
          currentData[index].startPosition = "";
          currentData[index].endPosition = "";
        }
      }
    }

    if (activeTab === "OCR") {
      setOcrFieldData(currentData);
    } else {
      setQrcodeFieldData(currentData);
    }

    updateValidation(currentData);
    onFieldsChange?.(currentData);
  };

  useEffect(() => {
    updateValidation(fieldData);
  }, [fieldData]);

  const handleRemove = (index: number) => {
    const currentData =
      activeTab === "OCR" ? [...ocrFieldData] : [...qrcodeFieldData];

    const removedField = currentData[index];

    // Remove from entityTableRows
    const updatedEntityRows = entityTableRows.filter(
      (row) =>
        row.id !== removedField.fieldIdentifier &&
        row.name !== removedField.fieldName
    );
    setEntityTableRows(updatedEntityRows);

    // Remove from local fields state
    const updatedFields = currentData.filter((_, i) => i !== index);

    if (activeTab === "OCR") {
      setOcrFieldData(updatedFields);
    } else {
      setQrcodeFieldData(updatedFields);
    }

    updateValidation(updatedFields);
    onFieldsChange?.(updatedFields);
  };

  const handleAdd = () => {
    const currentData =
      activeTab === "OCR" ? [...ocrFieldData] : [...qrcodeFieldData];

    if (
      currentData.length === 0 ||
      currentData[currentData.length - 1].fieldName.trim() !== ""
    ) {
      const newField = {
        fieldName: "",
        fieldValue: "",
        fieldIdentifier: "",
        position: "",
        identifier: "",
        startPosition: "",
        endPosition: "",
      };

      const updatedFields = [...currentData, newField];

      if (activeTab === "OCR") {
        setOcrFieldData(updatedFields);
      } else {
        setQrcodeFieldData(updatedFields);
      }

      updateValidation(updatedFields);
      onFieldsChange?.(updatedFields);
    }
  };

  const updateValidation = (updatedFields: typeof fieldData) => {
    const isQRTab = activeTab === "QRCODE" || activeTab === "BARCODE";
    console.log("isQRTab", isQRTab);

    const isValid = areFieldMappingsValid(updatedFields, isQRTab, isECIA);
    onValidationChange?.(isValid);
  };

  useEffect(() => {
    if (lastActiveTab.current !== activeTab) {
      // Don't reset values
      lastActiveTab.current = activeTab;
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== lastActiveTab.current) {
      // Reset only toggles, not field values
      setDelimiterEnabled(false);
      setIdentifierEnabled(false);
      setIsIdentifier(false);
      setPositionalEnabled(false);
      setIsPositional(false);

      // Also reset visual-only toggles (if needed)
      if (activeTab !== "QRCODE") {
        setUseCustom(false);
        setUseECIAStandard(false);
      }

      lastActiveTab.current = activeTab;
    }
  }, [activeTab]);

  useEffect(() => {
    if (pageReloadedRef.current) return;
    if (isEditMode && templateData) {
      // ✅ Set template name and manufacturer on edit
      if (templateData.templateName) {
        setFormData((prev) => ({
          ...prev,
          templateName: templateData.templateName,
        }));
      }

      const hasECIA =
        templateData.barcode?.eciaStandard &&
        Object.keys(templateData.barcode.eciaStandard).length > 0;

      const hasBarcode =
        templateData.barcode && Object.keys(templateData.barcode).length > 0;

      const hasOCR =
        templateData.ocr?.placeholders &&
        Object.keys(templateData.ocr.placeholders).length > 0;

      // ✅ Always populate ECIA fields if present
      if (hasECIA) {
        setUseECIAStandard(true);
        setIsECIA(true);

        const eciaFields: Field[] = Object.entries(
          templateData.barcode.eciaStandard || {}
        ).map(([fieldName, identifier]) => ({
          fieldName,
          fieldValue: typeof identifier === "string" ? identifier : "",
          identifier: typeof identifier === "string" ? identifier : "",
          fieldIdentifier: "",
          position: "",
          startPosition: "",
          endPosition: "",
        }));

        setQrcodeFieldData(eciaFields);
      }

      // ✅ NEW: Populate custom QRCode fields DYNAMICALLY
      else if (hasBarcode && templateData.barcode.customQR) {
        setUseCustom(true);

        // Set QR type flags
        setPositionalEnabled(
          templateData.barcode.customQRType === "positional"
        );
        setDelimiterEnabled(templateData.barcode.customQRType === "delimited");

        // ✅ FIX: Set actual selectedData, not just "customQR"
        setSelectedBarcode(templateData.barcode.selectedData || "");
        setSelectedData(templateData.barcode.selectedData || "");

        // ✅ FIX: Set delimiter from correct path
        if (templateData.barcode.delimited?.type) {
          setFormData((prev) => ({
            ...prev,
            delimiter: templateData.barcode.delimited.type,
          }));
        }

        // ✅ FIX: Set identifier from correct path
        setIdentifierEnabled(!!templateData.barcode.delimited?.identifier);

        const qrFieldEntries =
          templateData.barcode.positional?.fields ||
          templateData.barcode.delimited?.fields;

        if (qrFieldEntries && typeof qrFieldEntries === "object") {
          // ✅ NEW: Build fields DYNAMICALLY from templateData.fields array
          const dynamicFields: Field[] = (templateData.fields || []).map(
            (fieldName: string) => {
              const fieldData = qrFieldEntries[fieldName];

              return {
                fieldName,
                fieldValue: "",
                fieldIdentifier: "",
                position: fieldData?.position?.toString?.() ?? "",
                identifier: fieldData?.identifier ?? "",
                startPosition: fieldData?.startIndex?.toString?.() ?? "",
                endPosition: fieldData?.endIndex?.toString?.() ?? "",
              };
            }
          );

          setQrcodeFieldData(dynamicFields);
          setFieldData(dynamicFields);
        }
      }

      // ✅ NEW: Populate OCR fields DYNAMICALLY
      if (hasOCR) {
        // Build OCR fields dynamically from templateData.fields array
        const dynamicOcrFields: Field[] = (templateData.fields || []).map(
          (fieldName: string) => {
            const placeholder = templateData.ocr.placeholders[fieldName];

            return {
              fieldName,
              fieldValue: placeholder?.value ?? "",
              fieldIdentifier: "",
              position: "",
              identifier: "",
              startPosition: "",
              endPosition: "",
            };
          }
        );

        setOcrFieldData(dynamicOcrFields);

        // If no barcode data, set OCR data as main field data
        if (!hasBarcode) {
          setFieldData(dynamicOcrFields);
        }
      }

      // ✅ Set active tab preference
      if (hasOCR) {
        setActiveTab("OCR");
        lastActiveTab.current = "OCR";
      } else if (hasECIA) {
        setActiveTab("QRCODE");
        lastActiveTab.current = "QRCODE";
      } else if (hasBarcode) {
        setActiveTab("QRCODE");
        lastActiveTab.current = "QRCODE";
      } else {
        setActiveTab("OCR");
        lastActiveTab.current = "OCR";
      }
    }
  }, [isEditMode, templateData]);

  const handleTabSwitch = (tab: string) => {
    console.log("🔄 ==== TAB SWITCH ====");
    console.log("🔄 Switching from", activeTab, "to", tab);
    setActiveTab(tab);
    setActiveTabs(tab);
    localStorage.setItem("activeTab", tab);
    console.log("🔄 ==== TAB SWITCH COMPLETE ====");
  };

  //OCR table
  const renderOcrTable = () => (
    <div className="rounded-md md:overflow-hidden border">
      <table className="w-full text-sm text-left border">
        <thead className="bg-[#f3e6d6] text-primary text-sm">
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">Field Name</th>
            <th className="p-2 border">Field Identifier</th>
            <th className="p-2 text-center"></th>
          </tr>
        </thead>
        <tbody>
          {currentFieldData.map((field, index) => (
            <tr key={index} className="border-b">
              <td className="p-2 text-center">{index + 1}</td>

              <td className="p-2">
                {index >= 2 &&
                (activeTab === "OCR" || activeTab === "QRCODE") ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={field.fieldName}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          "fieldName",
                          e.target.value,
                          "ocr"
                        )
                      }
                      displayEmpty
                      disabled={isFieldDisabledInEdit(field.fieldName)}
                      inputProps={{ "aria-label": "Select field" }}
                      sx={{
                        backgroundColor: isFieldDisabledInEdit(field.fieldName)
                          ? "#f5f5f5"
                          : "#fff",
                        borderRadius: "4px",
                        fontSize: "14px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#d1d5db",
                        },
                        "& .MuiSelect-select": {
                          paddingTop: "3px",
                          paddingBottom: "6px",
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Select</em>
                      </MenuItem>
                      {entityTableRows
                        .filter((row) => {
                          const hardcodedValues = [
                            "partNumber",
                            "partnumber",
                            "quantity",
                          ];
                          return (
                            row.defaultTableRow === true &&
                            !hardcodedValues.includes(row.id.toLowerCase())
                          );
                        })
                        .map((row) => {
                          const selectedValues = fieldData
                            .filter((_, i) => i !== index)
                            .map((f) => f.fieldName);

                          const isDisabled = selectedValues.includes(row.id);

                          return (
                            <MenuItem
                              key={row.id}
                              value={row.id}
                              disabled={isDisabled}
                            >
                              {row.name}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </FormControl>
                ) : (
                  <input
                    type="text"
                    value={getProperFieldName(field.fieldName)}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "fieldName",
                        e.target.value,
                        "ocr"
                      )
                    }
                    className={`w-full border px-2 py-1 rounded text-sm ${
                      index < 2 || isFieldDisabledInEdit(field.fieldName)
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    readOnly={
                      index < 2 || isFieldDisabledInEdit(field.fieldName)
                    }
                    disabled={isFieldDisabledInEdit(field.fieldName)}
                  />
                )}
              </td>

              <td className="p-2 border">
                <input
                  type="text"
                  value={field.fieldValue}
                  onChange={(e) =>
                    handleFieldChange(
                      index,
                      "fieldValue",
                      e.target.value,
                      "ocr"
                    )
                  }
                  className={`w-full border px-2 py-1 rounded text-sm `}
                  // readOnly={isFieldDisabledInEdit(field.fieldName)}
                  // disabled={isFieldDisabledInEdit(field.fieldName)}
                />
              </td>

              {index >= 2 && (
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleRemove(index)}
                    disabled={isFieldDisabledInEdit(field.fieldName)}
                    className={
                      isFieldDisabledInEdit(field.fieldName)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  >
                    <img
                      src={deleteImg}
                      alt="delete"
                      className="h-5 w-5 md:w-4 md:h-4"
                    />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTable = () => (
    <div className="rounded-md  md:overflow-hidden border">
      <table
        key={`${activeTab}_${useCustom}_${useECIAStandard}_${delimiterEnabled}_${identifierEnabled}_${positionalEnabled}`}
        className="w-[200%] md:w-full text-sm text-left border"
      >
        <thead className="bg-[#f3e6d6] text-primary text-sm">
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">Field Name</th>
            {delimiterEnabled && identifierEnabled && (
              <th className="p-2 border">Identifier</th>
            )}
            {identifierEnabled ||
            positionalEnabled ||
            delimiterEnabled ||
            activeTab === "ECIA" ? (
              <th className="p-2 border">Field Value</th>
            ) : (
              <th className="p-2 border">Field Value</th>
            )}{" "}
            {delimiterEnabled && !identifierEnabled && (
              <>
                {/* <th className="p-2 border">Identifier</th> */}
                <th className="p-2 border">Position</th>
              </>
            )}
            {delimiterEnabled && identifierEnabled && !positionalEnabled && (
              <th className="p-2 border">Position</th>
            )}
            {positionalEnabled && (
              <>
                <th className="p-2 border">Start Position</th>
                <th className="p-2 border">End Position</th>
              </>
            )}
            {(activeTab === "OCR" || activeTab === "QRCODE") && (
              <th className="p-2 text-center"></th>
            )}
          </tr>
        </thead>
        <tbody>
          {currentFieldData.map((field, index) => (
            <tr key={index} className="border-b">
              <td className="p-2 text-center">{index + 1}</td>
              <td className="p-2">
                {index >= 2 &&
                (activeTab === "OCR" || activeTab === "QRCODE") ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={field.fieldName}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          "fieldName",
                          e.target.value,
                          "qr"
                        )
                      }
                      displayEmpty
                      disabled={isFieldDisabledInEdit(field.fieldName)}
                      inputProps={{ "aria-label": "Select field" }}
                      sx={{
                        backgroundColor: isFieldDisabledInEdit(field.fieldName)
                          ? "#f5f5f5"
                          : "#fff",
                        borderRadius: "4px",
                        fontSize: "14px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#d1d5db",
                        },
                        "& .MuiSelect-select": {
                          paddingTop: "3px",
                          paddingBottom: "6px",
                        },
                      }}
                    >
                     <MenuItem value="">
                        <em>Select</em>
                      </MenuItem>
                      {entityTableRows
                        .filter((row) => {
                          const hardcodedValues = [
                            "partNumber",
                            "partnumber",
                            "quantity",
                          ];
                          return (
                            row.defaultTableRow === true &&
                            !hardcodedValues.includes(row.id.toLowerCase())
                          );
                        })
                        .map((row) => {
                          const selectedValues = fieldData
                            .filter((_, i) => i !== index)
                            .map((f) => f.fieldName);

                          const isDisabled = selectedValues.includes(row.id);

                          return (
                            <MenuItem
                              key={row.id}
                              value={row.id}
                              disabled={isDisabled}
                            >
                              {row.name}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </FormControl>
                ) : (
                  <input
                    type="text"
                    value={getProperFieldName(field.fieldName)}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "fieldName",
                        e.target.value,
                        "qr"
                      )
                    }
                    className={`w-full border px-2 py-1 rounded text-sm ${
                      index < 2 || isFieldDisabledInEdit(field.fieldName)
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    readOnly={
                      index < 2 || isFieldDisabledInEdit(field.fieldName)
                    }
                    disabled={isFieldDisabledInEdit(field.fieldName)}
                  />
                )}
              </td>

              {delimiterEnabled && identifierEnabled ? (
                <>
                  <td className="p-2 border">
                    <input
                      type="text"
                      value={field.identifier}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          "identifier",
                          e.target.value,
                          "qr"
                        )
                      }
                      className={`w-full border px-2 py-1 rounded text-sm `}
                      // readOnly={isFieldDisabledInEdit(field.fieldName)}
                      // disabled={isFieldDisabledInEdit(field.fieldName)}
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="text"
                      value={field.fieldIdentifier}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          "fieldIdentifier",
                          e.target.value,
                          "qr"
                        )
                      }
                      className={`w-full border px-2 py-1 rounded text-sm `}
                      // readOnly={isFieldDisabledInEdit(field.fieldName)}
                      // disabled={isFieldDisabledInEdit(field.fieldName)}
                    />
                  </td>
                  {!positionalEnabled && (
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={field.position}
                        onChange={(e) =>
                          handleFieldChange(index, "position", e.target.value)
                        }
                        className={`w-full border px-2 py-1 rounded text-sm $`}
                        // readOnly={isFieldDisabledInEdit(field.fieldName)}
                        // disabled={isFieldDisabledInEdit(field.fieldName)}
                      />
                    </td>
                  )}
                </>
              ) : (
                <>
                  {/* Always show this first cell */}
                  <td className="p-2 border">
                    {useECIAStandard ? (
                      <input
                        type="text"
                        value={field.fieldValue}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "fieldValue",
                            e.target.value,
                            "qr"
                          )
                        }
                        className="w-full border px-2 py-1 rounded text-sm"
                      />
                    ) : (
                      <input
                        type="text"
                        value={field.fieldIdentifier}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "fieldIdentifier",
                            e.target.value,
                            "qr"
                          )
                        }
                        className={`w-full border px-2 py-1 rounded text-sm`}
                        // readOnly={isFieldDisabledInEdit(field.fieldName)}
                        // disabled={isFieldDisabledInEdit(field.fieldName)}
                      />
                    )}
                  </td>

                  {/* If OCR or QRCODE, show additional fieldValue (that's fine) */}
                  {/* {(activeTab === "OCR" || activeTab === "QRCODE") && (
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={field.fieldValue}
                        onChange={(e) =>
                          handleFieldChange(index, "fieldValue", e.target.value)
                        }
                        className="w-full border px-2 py-1 rounded text-sm"
                      />
                    </td>
                  )} */}

                  {/* If identifierEnabled, show additional fieldIdentifier (but normally it's a separate column, not duplicated)*/}
                  {identifierEnabled && !useECIAStandard && (
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={field.fieldIdentifier}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "fieldIdentifier",
                            e.target.value,
                            "qr"
                          )
                        }
                        className="w-full border px-2 py-1 rounded text-sm"
                      />
                    </td>
                  )}
                </>
              )}

              {delimiterEnabled &&
                !identifierEnabled &&
                activeTab !== "OCR" && (
                  <>
                    {!positionalEnabled && !identifierEnabled && (
                      <td className="p-2 border">
                        <input
                          type="text"
                          value={field.position}
                          onChange={(e) =>
                            handleFieldChange(index, "position", e.target.value)
                          }
                          className={`w-full border px-2 py-1 rounded text-sm`}
                          // readOnly={isFieldDisabledInEdit(field.fieldName)}
                          // disabled={isFieldDisabledInEdit(field.fieldName)}
                        />
                      </td>
                    )}
                  </>
                )}

              {positionalEnabled && (
                <>
                  <td className="p-2 border">
                    <input
                      type="text"
                      value={field.startPosition}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          "startPosition",
                          e.target.value
                        )
                      }
                      className={`w-full border px-2 py-1 rounded text-sm `}
                      // readOnly={isFieldDisabledInEdit(field.fieldName)}
                      // disabled={isFieldDisabledInEdit(field.fieldName)}
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="text"
                      value={field.endPosition}
                      onChange={(e) =>
                        handleFieldChange(index, "endPosition", e.target.value)
                      }
                      className={`w-full border px-2 py-1 rounded text-sm `}
                      // readOnly={isFieldDisabledInEdit(field.fieldName)}
                      // disabled={isFieldDisabledInEdit(field.fieldName)}
                    />
                  </td>
                </>
              )}

              {((activeTab === "OCR" && index >= 2) ||
                (activeTab === "QRCODE" && index >= 2)) && (
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleRemove(index)}
                    disabled={isFieldDisabledInEdit(field.fieldName)}
                    className={
                      isFieldDisabledInEdit(field.fieldName)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  >
                    <img
                      src={deleteImg}
                      alt="delete"
                      className="h-5 w-5 md:w-4 md:h-4"
                    />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderEciaTable = () => (
    <div className="rounded-md md:overflow-hidden border">
      <table className="w-full text-sm text-left border">
        <thead className="bg-[#f3e6d6] text-primary text-sm">
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">Field Name</th>
            <th className="p-2 border">Field Identifier</th>
            <th className="p-2 text-center border"></th>
          </tr>
        </thead>
        <tbody>
          {currentFieldData.map((field, index) => (
            <tr key={index} className="border-b">
              <td className="p-2 text-center">{index + 1}</td>

              <td className="p-2">
                {index >= 2 &&
                (activeTab === "OCR" || activeTab === "QRCODE") ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={field.fieldName}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          "fieldName",
                          e.target.value,
                          "qr"
                        )
                      }
                      displayEmpty
                      disabled={isFieldDisabledInEdit(field.fieldName)}
                      inputProps={{ "aria-label": "Select field" }}
                      sx={{
                        backgroundColor: isFieldDisabledInEdit(field.fieldName)
                          ? "#f5f5f5"
                          : "#fff",
                        borderRadius: "4px",
                        fontSize: "14px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#d1d5db",
                        },
                        "& .MuiSelect-select": {
                          paddingTop: "3px",
                          paddingBottom: "6px",
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Select</em>
                      </MenuItem>
                      {entityTableRows
                        .filter((row) => {
                          // Filter out hardcoded values from dropdown options
                          const hardcodedValues = [
                            "partNumber",
                            "partnumber",
                            "quantity",
                          ];
                          return !hardcodedValues.includes(
                            row.id.toLowerCase()
                          );
                        })
                        .map((row) => {
                          const selectedValues = fieldData
                            .filter((_, i) => i !== index)
                            .map((f) => f.fieldName);

                          const isDisabled = selectedValues.includes(row.id);

                          return (
                            <MenuItem
                              key={row.id}
                              value={row.id}
                              disabled={isDisabled}
                            >
                              {row.name}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </FormControl>
                ) : (
                  <input
                    type="text"
                    value={getProperFieldName(field.fieldName)}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "fieldName",
                        e.target.value,
                        "qr"
                      )
                    }
                    className={`w-full border px-2 py-1 rounded text-sm ${
                      index < 2 || isFieldDisabledInEdit(field.fieldName)
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    readOnly={
                      index < 2 || isFieldDisabledInEdit(field.fieldName)
                    }
                    disabled={isFieldDisabledInEdit(field.fieldName)}
                  />
                )}
              </td>

              <td className="p-2 border">
                <input
                  type="text"
                  value={field.fieldValue}
                  onChange={(e) =>
                    handleFieldChange(index, "fieldValue", e.target.value, "qr")
                  }
                  className={`w-full border px-2 py-1 rounded text-sm `}
                  // readOnly={isFieldDisabledInEdit(field.fieldName)}
                  // disabled={isFieldDisabledInEdit(field.fieldName)}
                />
              </td>

              {index >= 2 && (
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleRemove(index)}
                    disabled={isFieldDisabledInEdit(field.fieldName)}
                    className={
                      isFieldDisabledInEdit(field.fieldName)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  >
                    <img
                      src={deleteImg}
                      alt="delete"
                      className="h-5 w-5 md:w-4 md:h-4"
                    />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  useEffect(() => {
    if (activeTab === "OCR") {
      setFieldData(ocrFieldData);
    } else if (activeTab === "QRCODE" || activeTab === "BARCODE") {
      setFieldData(qrcodeFieldData);
    }
  }, [ocrFieldData, qrcodeFieldData, activeTab]);

  useEffect(() => {
    const isValid = currentFieldData.every(
      (field) => field.fieldName.trim() && field.fieldValue.trim()
    );

    if (activeTab === "OCR") {
      setIsOcrValid(isValid);
    } else if (activeTab === "QRCODE") {
      setIsQrValid(isValid); // ✅ This covers ECIA as it's within QRCODE tab
    }

    onValidationChange?.(isValid);
  }, [currentFieldData, activeTab, useECIAStandard]);

  console.log("qrcodeFieldData:", qrcodeFieldData);

  const isOcrCompletelyFilled = ocrFieldData.every(
    (field) => field.fieldName.trim() !== "" && field.fieldValue.trim() !== ""
  );

  useEffect(() => {
    if (isOcrCompletelyFilled) {
      setSwitchDisable(false); // Re-enable QRCode tab once OCR is filled
    }
  }, [isOcrCompletelyFilled]);

  // 🔥 NEW: Add restoration flag to prevent premature saves
  const [isRestoringState, setIsRestoringState] = useState(false);
  const hasAttemptedRestore = useRef(false);

  // 🔥 ENHANCED: Comprehensive logging for state changes
  useEffect(() => {
    console.log("📋 FieldMappingTable state changed:", {
      activeTab,
      useCustom,
      useECIAStandard,
      selectedBarcode: selectedBarcode
        ? selectedBarcode.substring(0, 20) + "..."
        : "",
      delimiterEnabled,
      positionalEnabled,
      identifierEnabled,
      isEditMode,
      isRestoringState,
      delimiter: formData.delimiter,
    });
  }, [
    activeTab,
    useCustom,
    useECIAStandard,
    selectedBarcode,
    delimiterEnabled,
    positionalEnabled,
    identifierEnabled,
    isEditMode,
    isRestoringState,
    formData.delimiter,
  ]);

  const saveStatesToSession = () => {
    console.log("💾 ==== SAVING STATES TO LOCALSTORAGE ====");
    const states = {
      useECIAStandard,
      useCustom,
      delimiterEnabled,
      positionalEnabled,
      identifierEnabled,
      selectedBarcode,
      delimiter: formData.delimiter,
    };

    localStorage.setItem("templateUIStates", JSON.stringify(states));
    console.log("💾 States saved to localStorage:", states);
    console.log("💾 ==== SAVING STATES TO LOCALSTORAGE COMPLETE ====");
  };

  const loadStatesFromSession = () => {
    console.log("📥 ==== LOADING STATES FROM LOCALSTORAGE ====");
    console.log("📥 hasAttemptedRestore:", hasAttemptedRestore.current);

    // 🔥 Prevent multiple restoration attempts
    if (hasAttemptedRestore.current) {
      console.log("📥 Already attempted restore, skipping");
      return;
    }

    setIsRestoringState(true); // 🔥 Prevent saving during restoration
    hasAttemptedRestore.current = true;

    const saved = localStorage.getItem("templateUIStates");
    if (saved) {
      try {
        const states = JSON.parse(saved);
        console.log("📥 Loaded states from localStorage:", states);

        // 🔥 Batch state updates to prevent multiple renders
        setUseECIAStandard(states.useECIAStandard || false);
        setUseCustom(states.useCustom || false);
        setDelimiterEnabled(states.delimiterEnabled || false);
        setPositionalEnabled(states.positionalEnabled || false);
        setIdentifierEnabled(states.identifierEnabled || false);
        setSelectedBarcode(states.selectedBarcode || "");

        // 🔥 Also update parent component's selectedBarcode
        if (states.selectedBarcode) {
          setSelectedData(states.selectedBarcode);
        }

        if (states.delimiter) {
          setFormData((prev) => ({ ...prev, delimiter: states.delimiter }));
        }

        console.log("📥 ==== LOADING STATES FROM LOCALSTORAGE COMPLETE ====");
      } catch (error) {
        console.error("❌ Failed to load UI states from localStorage:", error);
      }
    } else {
      console.log("📥 No saved states found in localStorage");
    }

    // 🔥 Allow saving again after 200ms delay
    setTimeout(() => {
      setIsRestoringState(false);
      console.log("📥 State restoration complete - saving enabled");
    }, 200);
  };

  // const clearStatesFromSession = () => {
  //   console.log("🗑️ ==== CLEARING STATES FROM LOCALSTORAGE ====");
  //   localStorage.removeItem("templateUIStates");
  //   localStorage.removeItem("activeTab");
  //   hasAttemptedRestore.current = false; // 🔥 Reset restoration flag
  //   setIsRestoringState(false);
  //   console.log("🗑️ ==== CLEARING STATES FROM LOCALSTORAGE COMPLETE ====");
  // };

  // Enhanced state loading with multiple triggers
  useEffect(() => {
    console.log("🔄 ==== STATE LOADING TRIGGER: isEditMode change ====");
    if (!isEditMode && !isRestoringState) {
      loadStatesFromSession();
    }
  }, [isEditMode]);

  // Load states when component mounts
  useEffect(() => {
    console.log("🔄 ==== STATE LOADING TRIGGER: Component mount ====");
    if (!isEditMode && !isRestoringState) {
      loadStatesFromSession();
    }
  }, []);

  // 🔥 MODIFIED: Load states when switching back to QRCODE tab (for trial run return)
  useEffect(() => {
    console.log(
      "🔄 ==== STATE LOADING TRIGGER: ActiveTab change to QRCODE ===="
    );
    if (!isEditMode && activeTab === "QRCODE" && !isRestoringState) {
      // 🔥 Small delay to ensure tab switch is complete
      setTimeout(() => {
        loadStatesFromSession();
      }, 50);
    }
  }, [activeTab, isEditMode]);

  // Auto-check Custom when selectedBarcode exists but no selection is made
  useEffect(() => {
    console.log("🔄 ==== AUTO-CHECK CUSTOM TRIGGER ====");
    console.log(
      "🔄 selectedBarcode:",
      !!selectedBarcode,
      "useCustom:",
      useCustom,
      "useECIAStandard:",
      useECIAStandard,
      "isRestoringState:",
      isRestoringState
    );

    // 🔥 Only auto-check if not currently restoring state
    if (
      selectedBarcode &&
      !useCustom &&
      !useECIAStandard &&
      !isRestoringState
    ) {
      console.log("🔄 Auto-checking Custom because selectedBarcode exists");
      setUseCustom(true);
    }
  }, [selectedBarcode, useCustom, useECIAStandard, isRestoringState]);

  // Save states on every relevant change
  useEffect(() => {
    console.log("🔄 ==== STATE SAVING TRIGGER ====");
    console.log(
      "🔄 isEditMode:",
      isEditMode,
      "isRestoringState:",
      isRestoringState
    );

    // 🔥 Only save if not in edit mode AND not currently restoring state
    if (!isEditMode && !isRestoringState) {
      console.log("🔄 Proceeding with state save");
      saveStatesToSession();
    } else {
      console.log("🔄 Skipping state save - edit mode or restoring");
    }
  }, [
    useCustom,
    useECIAStandard, // 🔥 Add useECIAStandard to dependency array
    delimiterEnabled,
    positionalEnabled,
    identifierEnabled,
    selectedBarcode,
    formData.delimiter,
    isEditMode,
    isRestoringState, // 🔥 Add restoration flag to dependencies
  ]);

  // Handle tab switching with logging
  const handleQRCodeTabClick = () => {
    console.log("📱 ==== QRCODE TAB CLICK ====");
    console.log(
      "📱 Can access QRCODE tab:",
      isEditMode || isOcrCompletelyFilled
    );
    if (isEditMode || isOcrCompletelyFilled) {
      handleTabSwitch("QRCODE");
    }
    console.log("📱 ==== QRCODE TAB CLICK COMPLETE ====");
  };

  // 🔥 MODIFIED: Enhanced checkbox handlers with state persistence
  const handleECIAStandardChange = (checked: boolean) => {
    console.log("☑️ ==== ECIA CHECKBOX CHANGE ====");
    console.log("☑️ checked:", checked, "isRestoringState:", isRestoringState);

    const isChecked = checked === true;
    setUseECIAStandard(isChecked);
    if (isChecked) {
      setUseCustom(false);
      setActiveTabs("ECIA");
      setIsECIA(true);
      onECIASwitch?.(true);
    } else {
      setIsECIA(false);
      onECIASwitch?.(false);
    }

    console.log("☑️ ==== ECIA CHECKBOX CHANGE COMPLETE ====");
  };

  const handleCustomChange = (checked: boolean) => {
    console.log("📦 ==== CUSTOM CHECKBOX CHANGE ====");
    console.log("📦 checked:", checked, "isRestoringState:", isRestoringState);

    const isChecked = checked === true;
    setUseCustom(isChecked);
    if (isChecked) {
      setUseECIAStandard(false);
      onECIASwitch?.(false);
      setIsECIA(false);
      setIsDialogOpen(true);
    }

    console.log("📦 ==== CUSTOM CHECKBOX CHANGE COMPLETE ====");
  };

  // 🔥 MODIFIED: Enhanced delimiter/positional handlers
  const handleDelimiterToggle = () => {
    const newState = !delimiterEnabled;
    setDelimiterEnabled(newState);

    if (newState) {
      setPositionalEnabled(false);
      setIsPositional(false);
    } else {
      setIdentifierEnabled(false);
      setIsIdentifier(false);
    }
  };

  const handlePositionalToggle = () => {
    const newState = !positionalEnabled;
    setPositionalEnabled(newState);
    setIsPositional(newState);

    if (newState) {
      setDelimiterEnabled(false);
      setIdentifierEnabled(false);
      setIsIdentifier(false);
    }
  };

  const handleIdentifierToggle = () => {
    const newState = !identifierEnabled;
    setIdentifierEnabled(newState);
    setIsIdentifier(newState);
  };

  // 🔥 NEW: Handle recapture functionality
  const handleRecapture = () => {
    setIsDialogOpen(true);
  };

  console.log("📋 ==== FIELD MAPPING TABLE COMPONENT RENDERING ====");

  //To clear localStorage for templateUIStates
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("🔄 Force reload detected — clearing templateUIStates");
      localStorage.removeItem("templateUIStates");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    return () => {
      console.log("🔙 Component unmounting — clearing templateUIStates");
      localStorage.removeItem("templateUIStates");
    };
  }, []);

  return (
    <>
      <div className="overflow-x-auto w-full">
        <div className="flex justify-between mb-2 bg-sidebar w-full md:w-[25%] p-1 rounded-lg custom-responsive">
          <button
            className={`px-8 py-2 rounded-sm text-sm cursor-pointer ${
              activeTab === "OCR"
                ? "bg-[#676e6e] text-white"
                : "bg-[#f3e6d6] text-primary"
            }`}
            onClick={() => handleTabSwitch("OCR")}
          >
            OCR Data
          </button>

          {/* 🔥 MODIFIED: QRCODE button without auto-ECIA setting */}
          <button
            className={`px-6 py-2 rounded-sm text-sm cursor-pointer ${
              activeTab === "QRCODE"
                ? "bg-[#676e6e] text-white"
                : "bg-[#f3e6d6] text-primary"
            } ${
              !isOcrCompletelyFilled && !isEditMode
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={handleQRCodeTabClick}
            disabled={(!isEditMode && !isOcrCompletelyFilled) || switchDisable}
          >
            QRCODE Data 
          </button>
        </div>

        {/* {fieldMappingError && (
          <p className="text-red-500 text-sm mt-2">{fieldMappingError}</p>
        )} */}

        {activeTab === "QRCODE" && (
          <div className="mb-2 flex gap-6 items-center">
            {/* 🔥 MODIFIED: Custom checkbox with enhanced handler */}
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={useCustom}
                onCheckedChange={handleCustomChange}
                className="border-primary text-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
              />
              Custom
            </label>

            {/* 🔥 MODIFIED: ECIA checkbox with enhanced handler */}
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={useECIAStandard}
                onCheckedChange={handleECIAStandardChange}
                className="border-primary text-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
              />
              ECIA Standard
            </label>
          </div>
        )}

        {activeTab === "QRCODE" && !useECIAStandard && (
          <>
            <div className="mb-5 mt-5 w-[50%] relative">
              <TextField
                label="Selected Data"
                variant="outlined"
                size="small"
                fullWidth
                value={selectedBarcode || ""}
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "white",
                    paddingY: 0,
                    paddingX: "8px",
                    fontSize: "small",
                    paddingRight: selectedBarcode ? "40px" : "8px", // 🔥 Add space for icon
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ccc",
                    borderWidth: "1.5px",
                  },
                  "& .MuiInputLabel-root": {
                    backgroundColor: "white",
                    padding: "0 4px",
                  },
                }}
              />

              {/* 🔥 NEW: Change icon positioned absolutely */}
              {selectedBarcode && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                  onClick={handleRecapture}
                  title="Change selected data"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#676e6e"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              )}
            </div>

            {selectedBarcode && (
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center gap-2 mb-2">
                  <div className="flex flex-col items-center gap-1">
                    {/* 🔥 MODIFIED: Delimiter checkbox with enhanced handler */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={delimiterEnabled}
                        onCheckedChange={handleDelimiterToggle}
                        className="border-primary text-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
                      />
                      Delimiter
                    </label>

                    {/* 🔥 MODIFIED: Identifier switch with enhanced handler */}
                    {delimiterEnabled && (
                      <label className="flex items-center mt-4 gap-2 cursor-pointer">
                        <CustomSwitch
                          checked={identifierEnabled}
                          onCheckedChange={handleIdentifierToggle}
                        />
                        <span
                          className={`${
                            identifierEnabled ? "text-primary" : "text-tertiary"
                          }`}
                        >
                          Identifier
                        </span>
                      </label>
                    )}
                  </div>
                </div>
                {/* 🔥 MODIFIED: Positional checkbox with enhanced handler */}
                <div className="flex flex-col items-start w-[200px] md:w-[250px] ml-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={positionalEnabled}
                      onCheckedChange={handlePositionalToggle}
                      className="border-primary text-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
                    />
                    Positional
                  </label>

                  {delimiterEnabled && (
                    <div className="w-full md:w-full flex gap-4 mt-4">
                      <TextField
                        label="Delimiter"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={formData.delimiter}
                        onChange={handleDelimiterChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            backgroundColor: "white",
                            paddingY: 0,
                            paddingX: "8px",
                            fontSize: "small",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#ccc",
                            borderWidth: "1.5px",
                          },
                          "& .MuiInputLabel-root": {
                            backgroundColor: "white",
                            padding: "0 4px",
                          },
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className="relative w-full overflow-y-scroll md:overflow-visible md:w-[50%] mt-5">
          {useECIAStandard
            ? renderEciaTable()
            : activeTab === "OCR"
            ? renderOcrTable()
            : renderTable()}
        </div>

        <div className="mt-3">
          <button
            type="button"
            className="px-5 py-1.5 bg-[#676e6e] text-white rounded hover:bg-[#b28545]"
            onClick={handleAdd}
          >
            Add
          </button>
        </div>

        <ScanBarcodeDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onCaptureComplete={(imageDataUrl, barcode) => {
            console.log("Captured Image:", imageDataUrl);
            console.log("Selected Barcode:", barcode);
            setSelectedBarcode(barcode);
            setSelectedData(barcode);
            // State will be automatically saved via useEffect
          }}
        />
      </div>
      <style>
        {`
      @media (min-width: 400px) and (max-width: 767px) {
        .custom-responsive {
          padding-left:20px ;
          padding-right:20px ;
          width:70%;
          font-size: 0.875rem;
        }
      }
    `}
      </style>
    </>
  );

  console.log("📋 ==== FIELD MAPPING TABLE COMPONENT ENDED ====");
};

export default FieldMappingTable;
