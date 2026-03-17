import React, { useState, useEffect } from "react";
import deleteImg from "../../assets/newIcons/delete.svg";
import { areFieldMappingsValid } from "../../utils/validations";

type EntityTableRow = {
  slNo: number;
  name: string;
  id: string;
  default?: boolean;
};

// const DEFAULT_FIELDS = [
//   { fieldName: "Part Number", fieldIdentifier: "partNumber" },
//   { fieldName: "Quantity", fieldIdentifier: "quantity" },
// ];

const toCamelCase = (str: string): string => {
  const result = str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (chr) => chr.toUpperCase());
  console.log(`📝 toCamelCase: "${str}" → "${result}"`);
  return result;
};

const FieldMappingTable: React.FC<{
  onValidationChange?: (isValid: boolean) => void;
  entityTableRows: EntityTableRow[];
  setPrioritySelections: React.Dispatch<React.SetStateAction<string[]>>;
  setEntityTableRows: React.Dispatch<React.SetStateAction<EntityTableRow[]>>;
}> = ({
  onValidationChange,
  entityTableRows,
  setEntityTableRows,
  setPrioritySelections,
}) => {
  const [fields, setFields] = useState(() => {
    return entityTableRows.map((row) => ({
      fieldName: row.name,
      fieldIdentifier: row.id,
      default: row.default || false,
      fieldValue: "",
      position: "",
      startPosition: "",
      endPosition: "",
    }));
  });

  useEffect(() => {
    const updatedFields = entityTableRows.map((row) => ({
      fieldName: row.name,
      fieldIdentifier: row.id,
      default: row.default || false,
      fieldValue: "",
      position: "",
      startPosition: "",
      endPosition: "",
    }));
    setFields(updatedFields);
    console.log("updatedFields", updatedFields);
  }, [entityTableRows]);

  const handleFieldChange = (
    index: number,
    key:
      | "fieldName"
      | "fieldIdentifier"
      | "position"
      | "startPosition"
      | "endPosition"
      | "fieldValue",
    value: string
  ) => {
    if (fields[index]?.default) return;

    const updatedFields = [...fields];
    updatedFields[index][key] = value;
    setFields(updatedFields);
    updateValidation(updatedFields);

    // Log the change for Add button validation
    console.log(`Field ${index} changed: ${key} = "${value}"`);
  };

  useEffect(() => {
    updateValidation(fields);
  }, [fields]);

  const handleRemove = (index: number) => {
    const fieldToRemove = fields[index];
    if (fieldToRemove?.default) return;

    // If the field has a fieldIdentifier, it means it's saved in entityTableRows
    if (
      fieldToRemove.fieldIdentifier &&
      fieldToRemove.fieldIdentifier.trim() !== ""
    ) {
      // Remove from entityTableRows only if it exists there
      const updatedEntityRows = entityTableRows.filter(
        (row) => row.id !== fieldToRemove.fieldIdentifier
      );
      setEntityTableRows(updatedEntityRows);
    }

    // Always remove from fields array at the specific index
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    updateValidation(updatedFields);
  };
  const handleAddOrSave = () => {
    console.log("=== ADD BUTTON CLICKED ===");

    // Only add if validation passes (button should be disabled if invalid, but double-check)
    if (!isAddButtonEnabled()) {
      console.warn("Add button clicked but validation failed");
      return;
    }

    // Always add a new empty row at the bottom
    setFields((prev) => [
      ...prev,
      {
        fieldName: "",
        fieldValue: "",
        fieldIdentifier: "",
        position: "",
        startPosition: "",
        endPosition: "",
        default: false,
      },
    ]);
  };

  // Function to check if Add button should be enabled
  const isAddButtonEnabled = () => {
    // If we only have the default fields (Part Number, Quantity), allow adding
    if (fields.length <= 2) {
      return true;
    }

    // Check the last field (the one above where the new field would be added)
    const lastField = fields[fields.length - 1];

    // The Add button should be disabled if the last field's fieldName is empty
    const isLastFieldEmpty =
      !lastField.fieldName || lastField.fieldName.trim() === "";

    console.log("Add button validation:", {
      fieldsLength: fields.length,
      lastFieldName: lastField.fieldName,
      isLastFieldEmpty,
      buttonEnabled: !isLastFieldEmpty,
    });

    // Enable button only if the last field is NOT empty
    return !isLastFieldEmpty;
  };

  // Function to save any unsaved fields to entityTableRows
  const saveUnsavedFields = () => {
    console.log("=== SAVING UNSAVED FIELDS ===");
    console.log("Current fields before sync:", fields);
    console.log("Current entityTableRows before sync:", entityTableRows);

    const updatedEntityRows = [...entityTableRows];
    let hasChanges = false;
    const newFieldsAdded: EntityTableRow[] = [];

    // Check all fields for unsaved data
    fields.forEach((field, index) => {
      if (field.default) return; // Skip default fields

      const fieldName = field.fieldName.trim();
      console.log(
        `Checking field ${index}: "${fieldName}", identifier: "${field.fieldIdentifier}"`
      );

      if (fieldName && !field.fieldIdentifier) {
        // This field has a name but no identifier, meaning it's not saved yet
        console.log(`🔥 FOUND UNSAVED FIELD: "${fieldName}"`);

        // Check if it already exists in entityTableRows
        const exists = updatedEntityRows.some((row) => row.name === fieldName);
        if (!exists) {
          const newRow: EntityTableRow = {
            slNo: updatedEntityRows.length + 1,
            name: fieldName,
            id: toCamelCase(fieldName),
          };
          updatedEntityRows.push(newRow);
          newFieldsAdded.push(newRow);

          // Update the field with identifier
          field.fieldIdentifier = toCamelCase(fieldName);
          hasChanges = true;
          console.log(`✅ Added unsaved field to entityTableRows:`, newRow);
        }
      }
    });

    console.log(`Total new fields added: ${newFieldsAdded.length}`);
    console.log("New fields added:", newFieldsAdded);

    if (hasChanges) {
      setEntityTableRows(updatedEntityRows);
      setPrioritySelections(updatedEntityRows.map((item) => item.id));

      console.log(
        "🚀 FINAL entityTableRows that should be saved:",
        updatedEntityRows
      );

      // Return the updated array for immediate use
      return updatedEntityRows;
    } else {
      console.log("❌ No unsaved fields found");
      return entityTableRows;
    }
  };

  // Expose the save function to parent
  React.useEffect(() => {
    (window as any).saveUnsavedFieldsRef = saveUnsavedFields;
    console.log("🔄 Updated saveUnsavedFields reference with current state");
  }, [fields, entityTableRows]);

  const updateValidation = (updatedFields: typeof fields) => {
    const isValid = areFieldMappingsValid(updatedFields);
    onValidationChange?.(isValid);
  };

  const renderTable = () => (
    <div className="rounded-md overflow-hidden border">
      <table className="w-full text-sm text-left border">
        <thead className="bg-[#d5d5d5] text-primary text-sm">
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">Field Name</th>
            <th className="p-2 text-center border"></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={index} className="border-b">
              <td className="p-2 text-center">{index + 1}</td>
              <td className="p-2">
                <input
                  type="text"
                  readOnly={field.default}
                  value={field.fieldName}
                  onChange={(e) =>
                    handleFieldChange(index, "fieldName", e.target.value)
                  }
                  className="w-full border px-2 py-1 rounded text-sm"
                />
              </td>
              <td className="p-1 text-center">
                {!field.default && (
                  <button onClick={() => handleRemove(index)} type="button">
                    <img src={deleteImg} alt="delete" className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="overflow-x-auto w-full">
      <div className="relative w-full">{renderTable()}</div>
      <div className="mt-3">
        <button
          type="button"
          className={`px-10 rounded-sm py-1.5 transition-colors ${
            isAddButtonEnabled()
              ? "bg-[#676e6e] text-white hover:bg-[#b28545] cursor-pointer"
              : "bg-gray-300 text-white cursor-not-allowed"
          }`}
          onClick={handleAddOrSave}
          disabled={!isAddButtonEnabled()}
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default FieldMappingTable;
