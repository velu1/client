import React, { useState, useEffect, useRef } from "react";
import {
  // Select,
  // MenuItem,
  // FormControl,
  // InputLabel,
  TextField,
  CircularProgress,
} from "@mui/material";
import FieldMappingTable from "./FieldMappingTable";
import { getPartsInPrinterConfig } from "../../api/settings";
import { toast } from "react-fox-toast";
import Capture from "./Capture";
import { TrailRunOcrData } from "../../api/administration/template";
import { CreateTemplate } from "../../api/administration/template";
import { areFieldMappingsValid } from "../../utils/validations";
import { Part as BasePart } from "../../mock/dummyData";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
interface TemplateData {
  _id?: string;
  id?: string;
  templateName: string;
  manufacturer: string;
  partNumber: string[];
  ocr: any;
}

interface Part extends BasePart {
  incrementId?: string;
  extracted_sticker?: string;
  [key: string]: any; // For additional fields in the API response
}

interface Field {
  fieldName: string;
  fieldValue: string;
  fieldIdentifier: string;
  identifier: string;
  position: string;
  startPosition: string;
  endPosition: string;
}

interface EntityTemplateProps {
  manufacturerOptions: TemplateData[];
  onTemplateCreated?: () => void;
  templateData: any;
  field: Field[];
  isFromTemplate: React.MutableRefObject<boolean>;
  setField: React.Dispatch<React.SetStateAction<Field[]>>;
  setTemplateData: React.Dispatch<React.SetStateAction<Part | null>>;
}

//  NEW: Development configuration for testing
const DEV_CONFIG = {
  isDev: false, //  Set to true for testing
  testData: {
    ocrData: {
      isShow: true, //  Set to true to enable OCR test data
      data: [
        {
          fieldName: "partNumber",
          fieldValue: "TEST-OCR-PN-001",
          fieldIdentifier: "partNumber",
        },
        {
          fieldName: "quantity",
          fieldValue: "50",
          fieldIdentifier: "quantity",
        },
        {
          fieldName: "lotNumber",
          fieldValue: "LOT123",
          fieldIdentifier: "lotNumber",
        },
      ],
    },
    eciaData: {
      isShow: true, //  Set to true to enable ECIA test data
      data: [
        {
          fieldName: "partNumber",
          fieldValue: "1P",
          fieldIdentifier: "partNumber",
        },
        { fieldName: "quantity", fieldValue: "Q", fieldIdentifier: "quantity" },
        {
          fieldName: "lotNumber",
          fieldValue: "1T",
          fieldIdentifier: "lotNumber",
        },
      ],
    },
    customQRPositional: {
      isShow: false, //  Set to true to enable Custom QR Positional test data
      selectedBarcode: "TESTPN001QTY050LOT123",
      data: [
        { fieldName: "partNumber", startPosition: "1", endPosition: "9" },
        { fieldName: "quantity", startPosition: "10", endPosition: "15" },
        { fieldName: "lotNumber", startPosition: "16", endPosition: "21" },
      ],
    },
    customQRDelimited: {
      isShow: false, //  Set to true to enable Custom QR Delimited test data
      selectedBarcode: "TESTPN001,QTY050,LOT123",
      delimiter: ",",
      data: [
        { fieldName: "partNumber", position: "1", identifier: "" },
        { fieldName: "quantity", position: "2", identifier: "" },
        { fieldName: "lotNumber", position: "3", identifier: "" },
      ],
    },
    customQRDelimitedWithIdentifier: {
      isShow: false, //  Set to true to enable Custom QR Delimited with Identifier test data
      selectedBarcode: "PN:TESTPN001,QTY:050,LOT:123",
      delimiter: ",",
      data: [
        { fieldName: "partNumber", position: "1", identifier: "PN:" },
        { fieldName: "quantity", position: "2", identifier: "QTY:" },
        { fieldName: "lotNumber", position: "3", identifier: "LOT:" },
      ],
    },
    manufacturerData: {
      isShow: true, //  Set to true to enable manufacturer test data
      manufacturer: "TEST_MANUFACTURER",
      templateName: "TEST_TEMPLATE_001",
    },
  },
};

const EntityTemplate: React.FC<EntityTemplateProps> = ({
  manufacturerOptions,
  onTemplateCreated,
  templateData,
  field,
  setField,
  isFromTemplate,
  setTemplateData,
}) => {
  console.log("🏗️ ==== ENTITY TEMPLATE COMPONENT STARTED ====");
  console.log("📊 Props received:", {
    manufacturerOptionsCount: manufacturerOptions?.length,
    templateData: !!templateData,
    fieldCount: field?.length,
  });

  const [formData, setFormData] = useState({
    receiptNumber: "",
    manufacturer: "",
    templateName: "",
    fieldName: "",
    fieldIdentifier: "",
    delimiter: "",
  });

  console.log("Form Data", formData);
  console.log("ManufacturerOptions", manufacturerOptions);
  const [isEdit] = useState(!!templateData?.id);

  // const [shouldClearAfterEditSave, setShouldClearAfterEditSave] =
  //   useState(false);

  var isEditMode = Boolean(templateData);

  const [collapsed, setCollapsed] = useState(false);
  const [fieldMappingError, setFieldMappingError] = useState("");
  const [entityTableRows, setEntityTableRows] = useState<
    { slNo: number; name: string; id: string }[]
  >([]);
  console.log("EntityTableRows", entityTableRows);
  console.log("TemplateData", templateData);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const edit = searchParams.get("edit") === "true";
  const isECIARef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isECIA, setIsECIA] = useState(false);
  const [fieldNames, setFieldNames] = useState<string[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [templateError, setTemplateError] = useState("");
  const [isTrialRun, setIsTrialRun] = useState(false);
  const [delimiterEnabled, setDelimiterEnabled] = useState(false);
  const [positionalEnabled, setPositionalEnabled] = useState(false);
  const [identifierEnabled, setIdentifierEnabled] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState<string>("");
  const [activeTabs, setActiveTabs] = useState<string>("");
  const [isOcrValid, setIsOcrValid] = useState(false);
  const [isQrValid, setIsQrValid] = useState(false);
  const [shouldEnableNext, setShouldEnableNext] = useState(false);
  const [ocrFieldsTouched, setOcrFieldsTouched] = useState(false);
  const [qrFieldsTouched, setQrFieldsTouched] = useState(false);
  console.log("Datas", isQrValid, qrFieldsTouched, setShouldEnableNext);
  console.log("isEditMode", isEditMode);
  const [switchDisable, setswitchDisable] = useState(false);
  const [ocrFieldData, setOcrFieldData] = useState<Field[]>([
    {
      fieldName: "partNumber",
      fieldValue: "",
      fieldIdentifier: "",
      position: "",
      identifier: "",

      startPosition: "",
      endPosition: "",
    },
    {
      fieldName: "quantity",
      fieldValue: "",
      fieldIdentifier: "",
      position: "",
      identifier: "",

      startPosition: "",
      endPosition: "",
    },
  ]);
  const [qrcodeFieldData, setQrcodeFieldData] = useState<Field[]>([
    {
      fieldName: "partNumber",
      fieldValue: "",
      fieldIdentifier: "",
      position: "",
      identifier: "",

      startPosition: "",
      endPosition: "",
    },
    {
      fieldName: "quantity",
      fieldValue: "",
      fieldIdentifier: "",
      position: "",
      identifier: "",

      startPosition: "",
      endPosition: "",
    },
  ]);

  console.log("qrcodefileddata", qrcodeFieldData);
  console.log("selectedManu", selectedManufacturer);
  useEffect(() => {
    console.log("🌟 Initial selectedManufacturer:", selectedManufacturer);
  }, []);

  const [ocrExtractedData, setOcrExtractedData] = useState<{
    partNumber: string;
    quantity: number;
    partNumberExtracted: boolean;
    quantityExtracted: boolean;
    allFieldsExtracted: boolean;
  } | null>(null);

  console.log("Field Values", field);

  const fetchPrinterConfig = async () => {
    try {
      setIsLoading(true);
      const data = await getPartsInPrinterConfig();

      setEntityTableRows(data.entityTableRows || []);

      const extractedFieldNames = (data.priority || []).map(
        (item: any) => item.value
      );
      setFieldNames(extractedFieldNames);
    } catch (error) {
      console.error("Failed to fetch printer config:", error);
      toast.error("Failed to load printer configuration");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrinterConfig();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      // Clear fieldIdentifier for each field
      setOcrFieldData((prev) =>
        prev.map((field) => ({ ...field, fieldIdentifier: "" }))
      );

      setQrcodeFieldData((prev) =>
        prev.map((field) => ({ ...field, fieldIdentifier: "" }))
      );

      setField((prev) =>
        prev.map((field) => ({ ...field, fieldIdentifier: "" }))
      );
    }
  }, [isEditMode]);

  // Inside EntityTemplate:

  // 1 Retrieve from localStorage when first mounting:
  useEffect(() => {
    const storedField = localStorage.getItem("entity_field");

    if (storedField) {
      setField(JSON.parse(storedField));

      // Optional: clear after retrieving to avoid reuse after reload
      localStorage.removeItem("entity_field");

      console.log("Recovered field from localStorage.");
    } else if (templateData && !isEdit) {
      // fallback to your previous behavior
      const placeholders = templateData?.ocr?.placeholders || {};
      const fieldKeys = Object.keys(placeholders);

      setField(
        fieldKeys.map((key) => ({
          fieldName: key,
          fieldValue: placeholders[key]?.value || "",
          fieldIdentifier: "",
          position: "",
          identifier: "",

          startPosition: "",
          endPosition: "",
        }))
      );
    }
  }, [templateData, isEdit]);

  // Store ONLY fieldValues to localStorage when field is updated
  useEffect(() => {
    if (field.length > 0) {
      // Create a simplified object with fieldName: fieldValue
      const fieldValues = field.reduce((acc, item) => {
        acc[item.fieldName] = item.fieldValue;
        return acc;
      }, {} as Record<string, string>);

      localStorage.setItem("entity_fieldValues", JSON.stringify(fieldValues));

      console.log("Stored fieldValues to localStorage.");
    }
  }, [field]);

  // Clear upon tab reload
  window.addEventListener("beforeunload", () => {
    localStorage.removeItem("entity_fieldValues");

    console.log("Cleared localStorage.");
  });

  // detach event when the component unmounts
  useEffect(() => {
    return () => {
      window.removeEventListener("beforeunload", () =>
        localStorage.removeItem("entity_fieldValues")
      );
    };
  }, []);

  // (Optionally) detach the event when the component unmounts
  useEffect(() => {
    return () => {
      window.removeEventListener("beforeunload", () =>
        localStorage.removeItem("entity_field")
      );
    };
  }, []);

  const handleSetECIA = (value: boolean) => {
    isECIARef.current = value;
    setIsECIA(value); // still update state for UI
  };

  //  NEW: Development data initialization
  useEffect(() => {
    if (DEV_CONFIG.isDev && !isEditMode) {
      console.log("🧪 ==== DEV MODE: INITIALIZING TEST DATA ====");

      // Set manufacturer and template name
      if (DEV_CONFIG.testData.manufacturerData.isShow) {
        console.log("🧪 Setting manufacturer test data");
        setSelectedManufacturer(
          DEV_CONFIG.testData.manufacturerData.manufacturer
        );
        setFormData((prev) => ({
          ...prev,
          templateName: DEV_CONFIG.testData.manufacturerData.templateName,
        }));
      }

      // Set OCR test data
      if (DEV_CONFIG.testData.ocrData.isShow) {
        console.log("🧪 Setting OCR test data");
        const ocrTestData = DEV_CONFIG.testData.ocrData.data.map((item) => ({
          fieldName: item.fieldName,
          fieldValue: item.fieldValue,
          fieldIdentifier: item.fieldIdentifier,
          position: "",
          identifier: "",
          startPosition: "",
          endPosition: "",
        }));
        setOcrFieldData(ocrTestData);
      }

      // Set ECIA test data
      if (DEV_CONFIG.testData.eciaData.isShow) {
        console.log("🧪 Setting ECIA test data");
        const eciaTestData = DEV_CONFIG.testData.eciaData.data.map((item) => ({
          fieldName: item.fieldName,
          fieldValue: item.fieldValue,
          fieldIdentifier: item.fieldIdentifier,
          position: "",
          identifier: "",
          startPosition: "",
          endPosition: "",
        }));
        setQrcodeFieldData(eciaTestData);
        setField(eciaTestData);
      }

      // Set Custom QR Positional test data
      if (DEV_CONFIG.testData.customQRPositional.isShow) {
        console.log("🧪 Setting Custom QR Positional test data");
        setSelectedBarcode(
          DEV_CONFIG.testData.customQRPositional.selectedBarcode
        );
        setPositionalEnabled(true);

        const positionalTestData =
          DEV_CONFIG.testData.customQRPositional.data.map((item) => ({
            fieldName: item.fieldName,
            fieldValue: "",
            fieldIdentifier: "",
            position: "",
            identifier: "",
            startPosition: item.startPosition,
            endPosition: item.endPosition,
          }));
        setQrcodeFieldData(positionalTestData);
        setField(positionalTestData);
      }

      // Set Custom QR Delimited test data
      if (DEV_CONFIG.testData.customQRDelimited.isShow) {
        console.log("🧪 Setting Custom QR Delimited test data");
        setSelectedBarcode(
          DEV_CONFIG.testData.customQRDelimited.selectedBarcode
        );
        setDelimiterEnabled(true);
        setFormData((prev) => ({
          ...prev,
          delimiter: DEV_CONFIG.testData.customQRDelimited.delimiter,
        }));

        const delimitedTestData =
          DEV_CONFIG.testData.customQRDelimited.data.map((item) => ({
            fieldName: item.fieldName,
            fieldValue: "",
            fieldIdentifier: "",
            position: item.position,
            identifier: item.identifier,
            startPosition: "",
            endPosition: "",
          }));
        setQrcodeFieldData(delimitedTestData);
        setField(delimitedTestData);
      }

      // Set Custom QR Delimited with Identifier test data
      if (DEV_CONFIG.testData.customQRDelimitedWithIdentifier.isShow) {
        console.log("🧪 Setting Custom QR Delimited with Identifier test data");
        setSelectedBarcode(
          DEV_CONFIG.testData.customQRDelimitedWithIdentifier.selectedBarcode
        );
        setDelimiterEnabled(true);
        setIdentifierEnabled(true);
        setFormData((prev) => ({
          ...prev,
          delimiter:
            DEV_CONFIG.testData.customQRDelimitedWithIdentifier.delimiter,
        }));

        const delimitedIdentifierTestData =
          DEV_CONFIG.testData.customQRDelimitedWithIdentifier.data.map(
            (item) => ({
              fieldName: item.fieldName,
              fieldValue: "",
              fieldIdentifier: "",
              position: item.position,
              identifier: item.identifier,
              startPosition: "",
              endPosition: "",
            })
          );
        setQrcodeFieldData(delimitedIdentifierTestData);
        setField(delimitedIdentifierTestData);
      }

      console.log("🧪 ==== DEV MODE: TEST DATA INITIALIZATION COMPLETE ====");
    }
  }, [isEditMode]);

  const handleCapture = async (base64Data: string | null) => {
    console.log("📸 ==== HANDLE CAPTURE STARTED ====");
    console.log("📸 Base64 data length:", base64Data?.length || 0);

    if (!base64Data || base64Data.trim() === "") {
      console.log("❌ No base64 data provided");
      return;
    }

    try {
      setIsLoading(true);
      console.log("🔄 Setting loading state to true");

      const fieldIds = field
        .filter((row) => row.fieldName)
        .map((row) => row.fieldName);
      console.log("📋 Field IDs for capture:", fieldIds);

      const ocrPlaceholders = ocrFieldData.reduce((acc, row) => {
        const key = row.fieldName;
        acc[key] = {
          value: row.fieldValue?.toUpperCase() || "",
        };
        return acc;
      }, {} as Record<string, { value: string }>);
      console.log("🔤 OCR Placeholders:", ocrPlaceholders);

      let payload: any = {
        image_base64: base64Data,
        trialRun: true,
        fields: fieldIds,
      };
      console.log("📦 Base payload created");

      // ✅ Handle ECIA Standard
      if (isECIARef.current) {
        console.log("🏷️ ==== ECIA STANDARD PAYLOAD CONSTRUCTION ====");

        const eciaStandard = field.reduce((acc, f) => {
          if (!f.fieldName) return acc;

          const fieldKey = f.fieldName.trim();
          const fieldKeyLower = fieldKey.toLowerCase();

          const eciaValue = f.fieldValue?.trim().toUpperCase() || "";
          const ocrMatch = ocrFieldData.find(
            (ocr) => ocr.fieldName.trim().toLowerCase() === fieldKeyLower
          );
          const ocrValue = ocrMatch?.fieldValue?.trim().toUpperCase() || "";

          console.log(
            `🏷️ Field ${fieldKey}: ECIA=${eciaValue}, OCR=${ocrValue}`
          );

          // ✅ Use ECIA value if present and differs from OCR
          // ✅ Else fallback to OCR value
          if (eciaValue && eciaValue !== ocrValue) {
            acc[fieldKey] = eciaValue;
          } else if (ocrValue) {
            acc[fieldKey] = ocrValue;
          } else {
            acc[fieldKey] = "";
          }

          return acc;
        }, {} as Record<string, string>);

        console.log("🏷️ Final ECIA Standard:", eciaStandard);

        payload.barcode = {
          customQR: false,
          eciaStandard,
        };

        if ((ocrFieldsTouched || isEditMode) && isOcrValid) {
          console.log("🔤 Adding OCR to ECIA payload");
          payload.ocr = {
            enabledFlg: true,
            placeholders: ocrPlaceholders,
          };
        }
        console.log("🏷️ ==== ECIA STANDARD PAYLOAD COMPLETE ====");
      }

      // ✅ Handle Barcode QR + OCR fallback
      else if (
        selectedBarcode &&
        selectedBarcode.trim().length > 0 &&
        activeTabs !== "ECIA"
      ) {
        console.log("📱 ==== CUSTOM QR PAYLOAD CONSTRUCTION ====");
        console.log("📱 Selected barcode:", selectedBarcode);

        const isCustomQR = true;
        const customQRType = positionalEnabled ? "positional" : "delimited";
        console.log("📱 Custom QR Type:", customQRType);

        const delimiterChar = formData.delimiter || "";
        const cleanedBarcode = delimiterChar
          ? selectedBarcode.split(delimiterChar).join("")
          : selectedBarcode;

        const totalLength = positionalEnabled
          ? cleanedBarcode.length
          : delimiterChar
          ? selectedBarcode.split(delimiterChar).length
          : 1;

        console.log(
          "📱 Delimiter:",
          delimiterChar,
          "Total Length:",
          totalLength
        );

        const barcode: any = {
          customQR: isCustomQR,
          customQRType,
          [customQRType]: {
            totalLength,
            type: formData.delimiter,
            identifier: identifierEnabled,
            fields: field.reduce((acc, field) => {
              if (!field.fieldName) return acc;

              const key = field.fieldName;
              console.log(`📱 Processing field ${key} for ${customQRType}`);

              acc[key] = positionalEnabled
                ? {
                    startIndex: parseInt(field.startPosition) || "None",
                    endIndex: parseInt(field.endPosition) || "None",
                  }
                : {
                    position: parseInt(field.position) || "None",
                    identifier: field.identifier || "",
                  };

              return acc;
            }, {} as Record<string, any>),
          },
        };

        if (!positionalEnabled && delimiterEnabled && identifierEnabled) {
          console.log("📱 Adding delimiter and identifier flags");
          barcode[customQRType].delimiter = true;
          barcode[customQRType].identifier = true;
        }

        payload.barcode = barcode;
        console.log("📱 Custom QR Barcode payload:", barcode);

        if ((ocrFieldsTouched || isEditMode) && isOcrValid) {
          console.log("🔤 Adding OCR to Custom QR payload");
          payload.ocr = {
            enabledFlg: true,
            placeholders: ocrPlaceholders,
          };
        }
        console.log("📱 ==== CUSTOM QR PAYLOAD COMPLETE ====");
      }

      // ✅ Fallback to OCR-only payload
      else if (!selectedBarcode && activeTabs !== "ECIA") {
        console.log("🔤 ==== OCR-ONLY PAYLOAD CONSTRUCTION ====");
        payload.ocr = {
          enabledFlg: true,
          placeholders: ocrPlaceholders,
        };
        console.log("🔤 OCR-only payload:", payload.ocr);
        console.log("🔤 ==== OCR-ONLY PAYLOAD COMPLETE ====");
      }

      console.log("📦 ==== FINAL PAYLOAD FOR TRIAL RUN ====");
      console.log("📦 Payload:", JSON.stringify(payload, null, 2));

      const response = await TrailRunOcrData(payload);
      console.log("✅ Trial run response:", response);

      const extracted = response?.data?.[0];

      if (extracted) {
        console.log("📊 Extracted data:", extracted);
        setOcrExtractedData(extracted);
      }

      const updatedRows = entityTableRows.map((row) => ({
        ...row,
        value: response?.[row.id] || "",
      }));

      setEntityTableRows(updatedRows);
      console.log("📋 Updated entity table rows");
    } catch (error) {
      console.error("❌ Trial run error:", error);
      toast.error("Failed to run trial OCR");
    } finally {
      setIsLoading(false);
      console.log("🔄 Setting loading state to false");
      console.log("📸 ==== HANDLE CAPTURE ENDED ====");
    }
  };

  const handleFieldsChange = (updatedFields: Field[]) => {
    const placeholders = updatedFields.reduce((acc, field) => {
      if (!field.fieldIdentifier) return acc;

      acc[field.fieldIdentifier] = {
        value: field.fieldValue,
      };

      return acc;
    }, {} as Record<string, { value: string }>);

    console.log("placeholders:", placeholders);
  };

  const handleTemplateNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // No restriction on characters now — allow special characters too
    setFormData((prev) => ({
      ...prev,
      templateName: value,
    }));

    // Clear any previous error
    setTemplateError("");
  };

  // Extract unique manufacturer names
  // const uniqueManufacturers = Array.from(
  //   new Map(
  //     manufacturerOptions.map((item) => [
  //       item.manufacturer,
  //       { id: item._id, name: item.manufacturer },
  //     ])
  //   ).values()
  // );

  // console.log("Unique Manufacturers",uniqueManufacturers);

  useEffect(() => {
    if (templateData && !isEdit && !isFromTemplate.current) {
      const placeholders = templateData?.ocr?.placeholders || {};
      const fieldKeys = Object.keys(placeholders);

      setField(
        fieldKeys.map((key) => ({
          fieldName: key,
          fieldValue: placeholders[key]?.value || "",
          fieldIdentifier: "",
          position: "",
          identifier: "",
          startPosition: "",
          endPosition: "",
        }))
      );

      setFormData((prev) => ({
        ...prev,
        templateName: templateData.templateName || "",
      }));

      setSelectedManufacturer(templateData.manufacturer || "");
      console.log(
        "📥 useEffect (not edit): setting manufacturer to",
        templateData.manufacturer
      );

      isFromTemplate.current = true;
    }
  }, [templateData, isEdit]);

  if (templateData && isEdit && !isFromTemplate.current) {
    if (templateData.manufacturer) {
      console.log(
        "✅ Setting manufacturer from templateData:",
        templateData.manufacturer
      );
      setSelectedManufacturer(templateData.manufacturer);
      console.log(
        "✏️ useEffect (edit): setting manufacturer to",
        templateData.manufacturer
      );
    } else {
      console.warn("⚠️ templateData.manufacturer is empty or undefined");
    }

    setFormData((prev) => ({
      ...prev,
      templateName: templateData.templateName || "",
    }));

    isFromTemplate.current = true;
  }

  // const UpdatedFieldNames = (
  //   entityTableRows: { id: string; name: string }[],
  //   fields: Field[]
  // ): string[] => {
  //   return entityTableRows
  //     .map((row) => {
  //       const matchedField = fields.find((f) => f.fieldIdentifier === row.id);
  //       return matchedField?.fieldName;
  //     })
  //     .filter((name): name is string => Boolean(name));
  // };

  // Utility to extract field data safely
  // const getFieldByName = (name: string) => {
  //   return field.find((f) => f.fieldName === name);
  // };

  // ✅ Delimited payload (without identifier)
  const getDelimiterPayload = (): any => {
    // const partNumber = getFieldByName("partNumber");
    // const quantity = getFieldByName("quantity");
    // const lotNumber = getFieldByName("lotNumber");
    const delimiterChar = formData.delimiter;
    const totalLength = delimiterChar
      ? selectedBarcode.split(delimiterChar).length
      : 1;
    const payload: any = {
      ...(edit && { id: templateData._id }),
      templateName: formData.templateName,
      fields: field.filter((row) => row.fieldName).map((row) => row.fieldName),
      trialRun: true,
      barcode: {
        customQR: true,
        selectedData: selectedBarcode,
        customQRType: "delimited",
        delimited: {
          totalLength,
          type: formData.delimiter,
          identifier: false,
          fields: qrcodeFieldData.reduce((acc, f) => {
            if (f.fieldName && f.position) {
              acc[f.fieldName] = {
                position: parseInt(f.position) || 0,
                identifier: "",
              };
            }
            return acc;
          }, {} as Record<string, any>),
        },
      },
      manufacturer: selectedManufacturer,
    };

    // ✅ Add OCR if present
    if ((ocrFieldsTouched || isEditMode) && isOcrValid) {
      payload.ocr = {
        enabledFlg: true,
        placeholders: ocrFieldData.reduce((acc, row) => {
          if (row.fieldName && row.fieldValue) {
            acc[row.fieldName] = { value: row.fieldValue };
          }
          return acc;
        }, {} as Record<string, { value: string }>),
      };
    }

    return payload;
  };

  // ✅ Identifier-enabled Delimited payload
  const getIdentifierPayload = (): any => {
    // const partNumber = getFieldByName("partNumber");
    // const quantity = getFieldByName("quantity");
    // const lotNumber = getFieldByName("lotNumber");
    const delimiterChar = formData.delimiter;
    const totalLength = delimiterChar
      ? selectedBarcode.split(delimiterChar).length
      : 1;

    const payload: any = {
      ...(edit && { id: templateData._id }),
      templateName: formData.templateName,
      fields: qrcodeFieldData
        .filter((row) => row.fieldName)
        .map((row) => row.fieldName),
      trialRun: true,
      barcode: {
        customQR: true,
        selectedData: selectedBarcode,
        customQRType: "delimited",
        delimited: {
          totalLength,
          type: formData.delimiter,
          identifier: true,
          fields: qrcodeFieldData.reduce((acc, f) => {
            if (f.fieldName) {
              acc[f.fieldName] = {
                position: parseInt(f.position || "0"),
                identifier: f.identifier || "",
              };
            }
            return acc;
          }, {} as Record<string, { position: number; identifier: string }>),
        },
      },
      manufacturer: selectedManufacturer,
    };

    // ✅ Conditionally include OCR placeholders
    if ((ocrFieldsTouched || isEditMode) && isOcrValid) {
      payload.ocr = {
        enabledFlg: true,
        placeholders: ocrFieldData.reduce((acc, row) => {
          if (row.fieldName && row.fieldValue) {
            acc[row.fieldName] = { value: row.fieldValue };
          }
          return acc;
        }, {} as Record<string, { value: string }>),
      };
    }

    return payload;
  };

  // ✅ Positional payload
  const getPositionalPayload = (): any => {
    // const partNumber = getFieldByName("partNumber");
    // const quantity = getFieldByName("quantity");
    // const lotNumber = getFieldByName("lotNumber");

    const payload: any = {
      ...(edit && { id: templateData._id }),
      templateName: formData.templateName,
      fields: field.filter((row) => row.fieldName).map((row) => row.fieldName),
      trialRun: true,
      barcode: {
        customQR: true,
        selectedData: selectedBarcode,
        customQRType: "positional",
        positional: {
          totalLength: selectedBarcode.length,
          fields: qrcodeFieldData.reduce((acc, f) => {
            if (f.fieldName) {
              acc[f.fieldName] = {
                startIndex: parseInt(f.startPosition || "0"),
                endIndex: parseInt(f.endPosition || "0"),
              };
            }
            return acc;
          }, {} as Record<string, { startIndex: number; endIndex: number }>),
        },
      },
      manufacturer: selectedManufacturer,
    };

    // ✅ Conditionally include OCR placeholders
    if ((ocrFieldsTouched || isEditMode) && isOcrValid) {
      payload.ocr = {
        enabledFlg: true,
        placeholders: ocrFieldData.reduce((acc, row) => {
          if (row.fieldName && row.fieldValue) {
            acc[row.fieldName] = { value: row.fieldValue };
          }
          return acc;
        }, {} as Record<string, { value: string }>),
      };
    }

    return payload;
  };

  const handleClearClick = () => {
    console.log("ManufacturerOptions", manufacturerOptions);

    // Clear OCR Field Data
    setOcrFieldData([
      {
        fieldName: "partNumber",
        fieldValue: "",
        fieldIdentifier: "",
        position: "",
        identifier: "",
        startPosition: "",
        endPosition: "",
      },
      {
        fieldName: "quantity",
        fieldValue: "",
        fieldIdentifier: "",
        position: "",
        identifier: "",
        startPosition: "",
        endPosition: "",
      },
    ]);

    // Clear QR Field Data
    setQrcodeFieldData([
      {
        fieldName: "partNumber",
        fieldValue: "",
        fieldIdentifier: "",
        position: "",
        identifier: "",
        startPosition: "",
        endPosition: "",
      },
      {
        fieldName: "quantity",
        fieldValue: "",
        fieldIdentifier: "",
        position: "",
        identifier: "",
        startPosition: "",
        endPosition: "",
      },
    ]);

    setswitchDisable(true);

    // Clear manufacturer selection
    setSelectedManufacturer("");

    // Clear template name
    setFormData((prev) => ({
      ...prev,
      templateName: "",
    }));

    //  Clear localStorage UI states on manual clear
    localStorage.removeItem("templateUIStates");
  };

  const handleSaveTemplate = async (isEciaStandard: boolean) => {
    console.log("💾 ==== SAVE TEMPLATE STARTED ====");
    console.log("💾 Is ECIA Standard:", isEciaStandard);

    let payload: any;

    // === 1. ECIA Barcode Standard ===
    if (isEciaStandard) {
      console.log("🏷️ ==== BUILDING ECIA STANDARD SAVE PAYLOAD ====");

      const fields = field
        .filter((row) => row.fieldName)
        .map((row) => row.fieldName);
      console.log("🏷️ Fields:", fields);

      //  FIX: Use ocrFieldData for OCR placeholders (like trial run does)
      const placeholders = ocrFieldData.reduce((acc, row) => {
        if (!row.fieldName) return acc;
        acc[row.fieldName] = { value: row.fieldValue || "" };
        return acc;
      }, {} as Record<string, { value: string }>);
      console.log("🏷️ OCR Placeholders:", placeholders);

      //  FIX: Use field array for ECIA standard (which contains ECIA values)
      const eciaStandard = field.reduce((acc, f) => {
        if (f.fieldName) {
          const fallback =
            ocrFieldData.find((o) => o.fieldName === f.fieldName)?.fieldValue ||
            "";
          acc[f.fieldName] = f.fieldValue?.trim()
            ? f.fieldValue.toUpperCase()
            : fallback.toUpperCase();
        }
        return acc;
      }, {} as Record<string, string>);
      console.log("🏷️ ECIA Standard:", eciaStandard);

      payload = {
        ...(edit && { id: templateData._id }),
        templateName: formData.templateName,
        manufacturer: selectedManufacturer,
        fields,
        trialRun: true,
        ocr: {
          placeholders,
        },
        barcode: {
          customQR: false,
          eciaStandard,
        },
      };
      console.log("🏷️ ==== ECIA STANDARD SAVE PAYLOAD COMPLETE ====");

      // === 2. Positional Barcode ===
    } else if (positionalEnabled) {
      console.log("📍 ==== BUILDING POSITIONAL SAVE PAYLOAD ====");
      payload = getPositionalPayload();
      console.log("📍 Positional payload:", payload);
      console.log("📍 ==== POSITIONAL SAVE PAYLOAD COMPLETE ====");

      // === 3. Delimited with Identifier ===
    } else if (delimiterEnabled && identifierEnabled) {
      console.log(
        "🔖 ==== BUILDING DELIMITED WITH IDENTIFIER SAVE PAYLOAD ===="
      );
      payload = getIdentifierPayload();
      console.log("🔖 Delimited with identifier payload:", payload);
      console.log(
        "🔖 ==== DELIMITED WITH IDENTIFIER SAVE PAYLOAD COMPLETE ===="
      );

      // === 4. Plain Delimited ===
    } else if (delimiterEnabled && !identifierEnabled) {
      console.log("📝 ==== BUILDING PLAIN DELIMITED SAVE PAYLOAD ====");
      payload = getDelimiterPayload();
      console.log("📝 Plain delimited payload:", payload);
      console.log("📝 ==== PLAIN DELIMITED SAVE PAYLOAD COMPLETE ====");

      // === 5. Fallback to OCR Template ===
    } else {
      console.log("🔤 ==== BUILDING OCR-ONLY SAVE PAYLOAD ====");

      //  FIX: Use ocrFieldData for OCR-only templates
      const fields = ocrFieldData
        .filter((row) => row.fieldName)
        .map((row) => row.fieldName);

      const placeholders = ocrFieldData.reduce((acc, row) => {
        if (!row.fieldName) return acc;
        acc[row.fieldName] = { value: row.fieldValue || "" };
        return acc;
      }, {} as Record<string, { value: string }>);

      if (!edit) {
        payload = {
          templateName: formData.templateName,
          manufacturer: selectedManufacturer,
          fields,
          trialRun: true,
          ocr: {
            placeholders,
          },
          partNumber: ocrExtractedData?.partNumber,
        };
        console.log("🔤 OCR-only save payload:", payload);
        console.log("🔤 ==== OCR-ONLY SAVE PAYLOAD COMPLETE ====");
      } else {
        payload = {
          id: templateData._id,
          templateName: formData.templateName,
          manufacturer: selectedManufacturer,
          fields,
          trialRun: true,
          ocr: {
            placeholders,
          },
          partNumber: ocrExtractedData?.partNumber,
        };
        console.log("🔤 OCR-only save payload:", payload);
        console.log("🔤 ==== OCR-ONLY SAVE PAYLOAD COMPLETE ====");
      }
    }
    console.log("💾 ==== FINAL SAVE PAYLOAD ====");
    console.log("💾 Payload:", JSON.stringify(payload, null, 2));

    // === Submit payload ===
    try {
      console.log("🚀 Submitting template creation request");
      console.log(
        "🛠️ Final selectedManufacturer before save:",
        selectedManufacturer
      );

      const response = await CreateTemplate(payload);
      console.log("✅ Template creation success:", response);

      toast.success("Template created successfully");
      navigate("/template");

      handleClearClick();
      setTemplateData(null);
      fetchPrinterConfig();

      console.log("🧹 ==== STARTING CLEANUP AFTER SUCCESSFUL SAVE ====");

      // Reset all form and states
      setFormData({
        receiptNumber: "",
        manufacturer: "",
        templateName: "",
        fieldName: "",
        fieldIdentifier: "",
        delimiter: "",
      });

      setField([
        {
          fieldName: "partNumber",
          fieldValue: "",
          fieldIdentifier: "",
          position: "",
          identifier: "",
          startPosition: "",
          endPosition: "",
        },
        {
          fieldName: "quantity",
          fieldValue: "",
          fieldIdentifier: "",
          identifier: "",
          position: "",
          startPosition: "",
          endPosition: "",
        },
      ]);

      setOcrFieldData((prevFields) =>
        prevFields.map((field) => ({
          ...field,
          fieldValue: "",
          fieldIdentifier: "",
        }))
      );

      // Reset qrcodeFieldData
      setQrcodeFieldData((prevFields) =>
        prevFields.map((field) => ({
          ...field,
          fieldValue: "",
          fieldIdentifier: "",
        }))
      );

      // Reset overall field (used by ECIA)
      setField((prevFields) =>
        prevFields.map((field) => ({
          ...field,
          fieldValue: "",
          fieldIdentifier: "",
        }))
      );

      setSelectedManufacturer("");
      setIsTrialRun(false);
      setOcrExtractedData(null);
      setTemplateError("");
      setIsECIA(false);
      setEntityTableRows([]);
      isEditMode = false; // <--- VERY IMPORTANT
      isFromTemplate.current = false;

      //  NEW: Clear localStorage UI states after successful creation
      localStorage.removeItem("templateUIStates");
      console.log("🗑️ Cleared localStorage");

      console.log("🧹 ==== CLEANUP COMPLETE ====");

      if (onTemplateCreated) {
        onTemplateCreated();
      }
    } catch (error: any) {
      console.error("❌ Template creation failed:", error.response.data);
      toast.error(error?.response?.data?.data);
      //  IMPORTANT: Don't clear session storage on error
    }

    console.log("💾 ==== SAVE TEMPLATE ENDED ====");
  };

  const formatFieldName = (camelCase: string) => {
    return camelCase
      .replace(/([A-Z])/g, " $1") // insert space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // capitalize first letter
  };

  // useEffect(() => {
  //   let error = "";
  //   let enable = false;

  //   if (ocrFieldsTouched && !qrFieldsTouched) {
  //     if (isOcrValid) {
  //       enable = true;
  //     } else {
  //       error = "Please complete OCR fields";
  //       enable = false;
  //     }
  //   } else if (!ocrFieldsTouched && qrFieldsTouched) {
  //     if (isQrValid) {
  //       enable = true;
  //     } else {
  //       error = "Please complete QRCode fields";
  //       enable = false;
  //     }
  //   } else if (ocrFieldsTouched && qrFieldsTouched) {
  //     if (isOcrValid && isQrValid) {
  //       enable = true;
  //     } else if (!isOcrValid) {
  //       error = "Please complete OCR fields";
  //       enable = false;
  //     } else if (!isQrValid) {
  //       error = "Please complete QRCode fields";
  //       enable = false;
  //     }
  //   } else {
  //     error = "";
  //     enable = false;
  //   }

  //   setFieldMappingError(error);
  //   setShouldEnableNext(enable);
  // }, [ocrFieldsTouched, qrFieldsTouched, isOcrValid, isQrValid]);

  const isFieldMappingValid = isECIA
    ? areFieldMappingsValid(qrcodeFieldData, true, true)
    : activeTabs === "QRCODE"
    ? areFieldMappingsValid(qrcodeFieldData, true)
    : areFieldMappingsValid(ocrFieldData, false);

  const isFormValid = isTrialRun
    ? ocrExtractedData?.allFieldsExtracted === true &&
      ocrExtractedData?.partNumberExtracted === true &&
      ocrExtractedData?.quantityExtracted === true
    // : selectedManufacturer &&
    :  formData.templateName.trim() &&
      !templateError &&
      isFieldMappingValid &&
      (activeTabs !== "QRCODE" ||
        (activeTabs === "QRCODE" &&
          (isECIA === true || selectedBarcode.trim().length > 0)));

  console.log("shouldEnableNext", shouldEnableNext);
  console.log("isFormValid", isFormValid);

  console.log("🏗️ ==== ENTITY TEMPLATE COMPONENT RENDERING ====");
  console.log("🎛️ Current states:", {
    isTrialRun,
    // selectedManufacturer,
    templateName: formData.templateName,
    isFormValid,
    activeTabs,
    isECIA,
  });

  useEffect(() => {
    if (!isTrialRun) {
      setOcrExtractedData(null);
    }
  }, [isTrialRun]);

  return (
    <div className="bg-white rounded-md shadow-sm border">
      <div className="flex items-center justify-between px-4 py-2">
        {!isTrialRun ? (
          <span className="text-sm font-medium text-gray-800">
            Entity Template
          </span>
        ) : (
          <button
            onClick={() => setIsTrialRun(false)}
            className="flex items-center text-[#676e6e] font-semibold text-sm"
          >
            <svg
              className="w-4 h-4 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Trial Run
          </button>
        )}

        <div className="flex items-center gap-2">
          {isEditMode && (
            <button
              onClick={handleClearClick}
              className="bg-[#676e6e]/20 rounded-full p-1 hover:bg-[#676e6e]/30 transition"
              title="Clear Fields"
            >
              <svg
                className="w-5 h-5 text-[#676e6e]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          )}

          <button
            className="bg-[#676e6e]/20 rounded-full p-1 hover:bg-[#676e6e]/30 transition"
            onClick={() => setCollapsed((prev) => !prev)}
          >
            <svg
              className={`w-5 h-5 text-[#676e6e] transition-transform duration-300 ${
                collapsed ? "" : "rotate-180"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          collapsed
            ? "max-h-0 opacity-0"
            : "max-h-[2000px] opacity-100 px-6 py-6"
        }`}
      >
        <div className="flex flex-col md:flex-row gap-4 mb-4 w-full items-start">
          {/* <div className="w-full md:w-[20%]">
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel
                id="manufacturer-label"
                shrink
                sx={{
                  backgroundColor: "white",
                  padding: "0 4px",
                  fontSize: "small",
                }}
              >
                Manufacturer
              </InputLabel>
              <Select
                value={selectedManufacturer}
                onChange={(e) => setSelectedManufacturer(e.target.value)}
                sx={{
                  borderRadius: "5px",
                  py: -2.5,
                  "& .MuiSelect-select": {
                    paddingY: "6px",
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Select Manufacturer
                </MenuItem>
                {manufacturerOptions.map((mfr) => (
                  <MenuItem key={mfr.id} value={mfr.manufacturer}>
                    {mfr.manufacturer}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div> */}

          <div className="w-full md:w-[20%] flex gap-4">
            <TextField
              label="Template Name"
              variant="outlined"
              size="small"
              fullWidth
              value={formData.templateName}
              onChange={handleTemplateNameChange}
              error={!!templateError}
              helperText={templateError}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
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
        </div>

        <div className="mb-6">
          {!isTrialRun ? (
            <FieldMappingTable
              delimiterEnabled={delimiterEnabled}
              setDelimiterEnabled={setDelimiterEnabled}
              entityTableRows={entityTableRows}
              setEntityTableRows={setEntityTableRows}
              fieldNames={fieldNames}
              onFieldsChange={handleFieldsChange}
              switchDisable={switchDisable}
              isECIA={isECIA}
              setIsECIA={setIsECIA}
              formData={formData}
              setSwitchDisable={setswitchDisable}
              setFormData={setFormData}
              fieldData={field}
              setFieldData={setField}
              setSelectedData={setSelectedBarcode}
              setIsPositional={setPositionalEnabled}
              setIsIdentifier={setIdentifierEnabled}
              setActiveTabs={setActiveTabs}
              templateData={templateData}
              setIsOcrValid={setIsOcrValid}
              setIsQrValid={setIsQrValid}
              isTemplate={true}
              qrcodeFieldData={qrcodeFieldData}
              setQrcodeFieldData={setQrcodeFieldData}
              ocrFieldData={ocrFieldData}
              setOcrFieldData={setOcrFieldData}
              fieldMappingError={fieldMappingError}
              setFieldMappingError={setFieldMappingError}
              setOcrFieldsTouched={setOcrFieldsTouched}
              setQrFieldsTouched={setQrFieldsTouched}
              onECIASwitch={handleSetECIA}
            />
          ) : (
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="flex flex-col relative w-[50%]">
                <Capture onCapture={handleCapture} isTrial={true} />
                {isLoading && (
                  <div className="flex justify-center items-center mt-4">
                    <CircularProgress size={24} className="text-[#676e6e]" />
                    <span className="ml-2 text-gray-600">
                      Processing image...
                    </span>
                  </div>
                )}
              </div>
              <div className="flex w-full md:w-[35%] bg-white rounded-md border overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-[#f3e6d6] text-primary text-sm">
                    <tr>
                      <th className="p-2 border text-[#676e6e] font-medium">
                        Field Name
                      </th>
                      <th className="p-2 border text-[#676e6e] font-medium">
                        Extracted Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {field.map((row, index) => {
                      const fieldKey =
                        row.fieldName as keyof typeof ocrExtractedData;
                      const fieldValue = ocrExtractedData?.[fieldKey] as
                        | string
                        | string[]
                        | undefined;

                      const displayValue = Array.isArray(fieldValue)
                        ? fieldValue.join(", ")
                        : fieldValue ?? "";
                      console.log(
                        "FieldKey vs fieldValue",
                        fieldKey,
                        fieldValue
                      );

                      return (
                        <tr key={index} className="border-b">
                          <td className="p-2 border">
                            {formatFieldName(row.fieldName)}
                          </td>
                          <td className="p-2 border">
                            {displayValue || (
                              <span className="text-gray-400 italic"> </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            className={`px-5 py-1.5 rounded text-white transition ${
              isFormValid || activeTabs === "QRCODE"
                ? "bg-[#676e6e] hover:bg-[#b28545]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            disabled={!(isFormValid || activeTabs === "QRCODE")}
            onClick={(e) => {
              e.preventDefault();
              if (isTrialRun) {
                handleSaveTemplate(isECIA);
              } else {
                setIsTrialRun(true);
              }
            }}
          >
            {isTrialRun ? "Save" : "Next/Trial Run"}
          </button>
        </div>
      </div>
    </div>
  );

  console.log("🏗️ ==== ENTITY TEMPLATE COMPONENT ENDED ====");
};

export default EntityTemplate;
