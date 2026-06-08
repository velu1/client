import React, { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import { areFieldMappingsValid } from "../../utils/validations";

type EntityTableRow = {
  slNo: number;
  name: string;
  id: string;
  default?: boolean;
};

const toCamelCase = (str: string): string => {
  const result = str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (chr) => chr.toUpperCase());
  return result;
};

const FieldMappingTable: React.FC<{
  onValidationChange?: (isValid: boolean) => void;
  entityTableRows: EntityTableRow[];
  setPrioritySelections: React.Dispatch<React.SetStateAction<string[]>>;
  setEntityTableRows: React.Dispatch<React.SetStateAction<EntityTableRow[]>>;
}> = ({ onValidationChange, entityTableRows, setEntityTableRows, setPrioritySelections }) => {
  const [fields, setFields] = useState(() =>
    entityTableRows.map((row) => ({
      fieldName: row.name,
      fieldIdentifier: row.id,
      default: row.default || false,
      fieldValue: "",
      position: "",
      startPosition: "",
      endPosition: "",
    }))
  );

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
  }, [entityTableRows]);

  const handleFieldChange = (index: number, key: "fieldName" | "fieldIdentifier" | "position" | "startPosition" | "endPosition" | "fieldValue", value: string) => {
    if (fields[index]?.default) return;
    const updatedFields = [...fields];
    updatedFields[index][key] = value;
    setFields(updatedFields);
    updateValidation(updatedFields);
  };

  useEffect(() => {
    updateValidation(fields);
  }, [fields]);

  const handleRemove = (index: number) => {
    const fieldToRemove = fields[index];
    if (fieldToRemove?.default) return;
    if (fieldToRemove.fieldIdentifier?.trim()) {
      setEntityTableRows(entityTableRows.filter((row) => row.id !== fieldToRemove.fieldIdentifier));
    }
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    updateValidation(updatedFields);
  };

  const isAddButtonEnabled = () => {
    if (fields.length <= 2) return true;
    const last = fields[fields.length - 1];
    return !!(last.fieldName && last.fieldName.trim());
  };

  const handleAddOrSave = () => {
    if (!isAddButtonEnabled()) return;
    setFields((prev) => [
      ...prev,
      { fieldName: "", fieldValue: "", fieldIdentifier: "", position: "", startPosition: "", endPosition: "", default: false },
    ]);
  };

  const saveUnsavedFields = () => {
    const updatedEntityRows = [...entityTableRows];
    let hasChanges = false;

    fields.forEach((field) => {
      if (field.default) return;
      const fieldName = field.fieldName.trim();
      if (fieldName && !field.fieldIdentifier) {
        const exists = updatedEntityRows.some((row) => row.name === fieldName);
        if (!exists) {
          const newRow: EntityTableRow = { slNo: updatedEntityRows.length + 1, name: fieldName, id: toCamelCase(fieldName) };
          updatedEntityRows.push(newRow);
          field.fieldIdentifier = toCamelCase(fieldName);
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setEntityTableRows(updatedEntityRows);
      setPrioritySelections(updatedEntityRows.map((item) => item.id));
      return updatedEntityRows;
    }
    return entityTableRows;
  };

  React.useEffect(() => {
    (window as any).saveUnsavedFieldsRef = saveUnsavedFields;
  }, [fields, entityTableRows]);

  const updateValidation = (updatedFields: typeof fields) => {
    onValidationChange?.(areFieldMappingsValid(updatedFields));
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 w-12">#</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Field Name</th>
              <th className="px-4 py-2.5 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fields.map((field, index) => (
              <tr key={index} className="group">
                <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{index + 1}</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    readOnly={field.default}
                    value={field.fieldName}
                    onChange={(e) => handleFieldChange(index, "fieldName", e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-md text-sm border transition-all outline-none ${
                      field.default
                        ? "bg-gray-50 border-gray-100 text-gray-500 cursor-default"
                        : "border-gray-200 bg-white focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/10"
                    }`}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  {!field.default && (
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={handleAddOrSave}
        disabled={!isAddButtonEnabled()}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border border-[#434a52]/30 text-[#434a52] hover:bg-[#434a52]/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Plus size={13} />
        Add field
      </button>
    </div>
  );
};

export default FieldMappingTable;
