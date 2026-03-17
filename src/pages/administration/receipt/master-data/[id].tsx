import { TextField, MenuItem, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import arrowD from "../../../../assets/newIcons/sidebar/arrowDown.svg";
import { useEffect, useState, useRef } from "react";
import { Button } from "../../../../components/ui/button";
import MasterDataDialog from "../../../../components/admins/MasterDataDialog";
import { getAllTemplate } from "../../../../api/administration/master";
import { toast } from "react-fox-toast";
import * as XLSX from "xlsx";
import AddTemplateDialog from "../../../../components/admins/AddTemplateDialog";
import { uploadTemplateData } from "../../../../api/administration/master";
import { useNavigate } from "react-router-dom";

const CustomArrowIcon = (props: any) => (
  <span {...props}>
    <img src={arrowD} alt="arrowD" className="h-3 w-3 cursor-pointer mr-2" />
  </span>
);

interface TemplateMapping {
  label: string;
  path: string;
  _id: string;
}

interface Template {
  id: string;
  templateName: string;
  templateMapping: TemplateMapping[];
  isDeleted: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface ValidationState {
  columnName: string;
  isValid: boolean;
  message?: string;
}

const MasterDataDetailPage = () => {
  const { id } = useParams();
  if (id !== "1") return null;
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [loading, setLoading] = useState(false);
  const [headerRowNo, setHeaderRowNo] = useState("1");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [validationStatus, setValidationStatus] = useState<ValidationState[]>(
    []
  );
  const [validating, setValidating] = useState(false);
  const [allValid, setAllValid] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Update allValid status whenever validationStatus changes
  useEffect(() => {
    if (validationStatus.length > 0) {
      const isAllValid = validationStatus
        .filter((status) => status.columnName.toLowerCase() !== "id code")
        .every((status) => status.isValid);
      setAllValid(isAllValid);
    } else {
      setAllValid(false);
    }
  }, [validationStatus]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getAllTemplate("master");
      if (response?.data?.data) {
        setTemplates(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const templateId = event.target.value;
    setSelectedTemplate(templateId);
    setValidationStatus([]);
    setAllValid(false);

    // If file is already selected, re-validate with the new template
    if (selectedFile && templateId) {
      validateFile(selectedFile, templateId, Number(headerRowNo));
    } else {
      // Clear validation status if no template or file
      setValidationStatus([]);
      if (!templateId) {
        setSelectedFile(null);
        setFileData([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleHeaderRowChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHeaderRowNo(event.target.value);
    // Re-validate if file is already selected
    if (selectedFile && selectedTemplate) {
      validateFile(selectedFile, selectedTemplate, Number(event.target.value));
    }
  };

  const handleClear = () => {
    setSelectedTemplate("");
    setHeaderRowNo("1");
    setSelectedFile(null);
    setFileData([]);
    setValidationStatus([]);
    setAllValid(false);
    setSubmitting(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setCurrentPage(1);
    validateFile(file, selectedTemplate, Number(headerRowNo));
  };

  const validateFile = async (
    file: File,
    templateId: string,
    headerRow: number
  ) => {
    try {
      setValidating(true);

      // Find the selected template
      const template = templates.find((t) => t.id === templateId);

      // Read the excel file
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          });

          // Check if headerRow is valid
          if (headerRow > jsonData.length) {
            toast.error("Header row number exceeds the file length!");
            setValidating(false);
            return;
          }

          // Get headers from the specified row (convert to 0-indexed)
          const headers = jsonData[headerRow - 1] as string[];
          if (!headers || headers.length === 0) {
            toast.error("Unable to extract headers from the specified row!");
            setValidating(false);
            return;
          }

          const allFileDataRows = jsonData.slice(headerRow - 1) as any[];
          const filteredFileDataRows = [
            allFileDataRows[0], // Keep header row
            ...allFileDataRows
              .slice(1)
              .filter(
                (row) =>
                  Array.isArray(row) &&
                  row.some(
                    (cell) =>
                      cell !== undefined &&
                      cell !== null &&
                      String(cell).trim() !== ""
                  )
              ),
          ];
          setFileData(filteredFileDataRows);

          // Template validation - only if template is selected
          let validationResults: ValidationState[] = [];

          if (template && template.templateMapping) {
            validationResults = template.templateMapping.map((mapping) => {
              const headerIndex = headers.findIndex(
                (h) =>
                  h && h?.trim().toLowerCase() === mapping.label.toLowerCase()
              );

              return {
                columnName: mapping.label,
                isValid: headerIndex !== -1,
                message:
                  headerIndex !== -1
                    ? "Column found"
                    : "Column not found in uploaded file",
              };
            });
          } else if (templateId) {
            // Template selected but not found or no mapping
            toast.error("Selected template has no column mappings");
          }

          setValidationStatus(validationResults);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          toast.error("Failed to parse Excel file");
        } finally {
          setValidating(false);
        }
      };

      reader.onerror = () => {
        toast.error("Error reading file");
        setValidating(false);
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate file");
      setValidating(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (!selectedTemplate || !selectedFile || fileData.length === 0) {
        toast.error("Missing required data for submission");
        return;
      }

      const template = templates.find((t) => t.id === selectedTemplate);
      if (!template) {
        toast.error("Template not found");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          // const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, {
          //   header: 1,
          // });
          const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, {
                    header: 1,   // read as array of arrays
                    defval: "",  // ensures empty cells are "", not undefined
                  }).filter((row) => row.some((cell) => cell !== "")); // remove completely empty rows
          
          

          const headers = jsonData[Number(headerRowNo) - 1];
          const rawRows = jsonData.slice(Number(headerRowNo)) as string[][];

          // ✅ Filter out completely empty rows
          const rows = rawRows.filter(
            (row) =>
              Array.isArray(row) &&
              row.some(
                (cell) =>
                  cell !== undefined &&
                  cell !== null &&
                  String(cell).trim() !== ""
              )
          );

          const formatHeader = (header: string): string => {
            const trimmed = header.trim().toLowerCase();

            const correctionMap: { [key: string]: string } = {
              "internal part number": "internalPartNo",
              quatity: "quantity", // typo correction
              // Add more corrections here if needed
            };

            if (correctionMap[trimmed]) {
              return correctionMap[trimmed];
            }

            return trimmed
              .replace(/[^a-zA-Z0-9 ]/g, "") // remove special characters
              .split(" ")
              .map((word, index) =>
                index === 0
                  ? word
                  : word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join("");
          };

          const parsedObjects = rows.map((row) => {
            const obj: { [key: string]: any } = {};
            headers.forEach((header, index) => {
              const formattedKey = formatHeader(header);
              let cellValue = row[index];

              // Ensure partNumber is always a string
              if (formattedKey === "partNumber") {
                cellValue = String(cellValue);
              }

              obj[formattedKey] = cellValue;
            });
            return obj;
          });

          const payload = {
            type: "upload",
            uploadData: parsedObjects,
          };

          const response = await uploadTemplateData(payload, "masterData");
          toast.success("Upload successful!");
          navigate("/administration/receipt/master-data");
          console.log("API Response:", response);
        } catch (err) {
          console.error("Error preparing data for upload:", err);
          toast.error("Failed to prepare or upload data");
        } finally {
          setSubmitting(false);
        }
      };

      reader.readAsBinaryString(selectedFile);
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Error during file submission");
      setSubmitting(false);
    }
  };

  // const getSelectedTemplateDetails = () => {
  //   return templates.find((t) => t.id === selectedTemplate);
  // };

  return (
    <div className="md:p-6 flex flex-col gap-6">
      {showDialog && (
        <MasterDataDialog
          isOpen={showDialog}
          onClose={() => {
            setShowDialog(false);
          }}
          title="Master data template"
          type="master"
        />
      )}

      {showTemplateDialog && (
        <AddTemplateDialog
          type="master"
          open={showTemplateDialog}
          onClose={() => {
            setShowTemplateDialog(false);
            fetchTemplates();
          }}
          validationStatus={validationStatus}
          fileHeaders={fileData.length > 0 ? fileData[0] : []}
        />
      )}

      <div className="flex flex-wrap gap-4">
        <Button
          variant="default"
          className="!bg-primary shadow-none normal-case text-[11px] md:text-sm"
          onClick={handleBrowseClick}
        >
          Browse file
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
        />

        <Button
          variant="outline"
          className="border-primary text-primary normal-case text-[11px] md:text-sm"
          onClick={handleClear}
        >
          Clear
        </Button>

        <Button
          variant="outline"
          className="border-primary text-primary normal-case text-[11px] md:text-sm"
          disabled={!selectedFile}
          onClick={() => {
            setShowTemplateDialog(true);
          }}
        >
          New template
        </Button>

        <Button
          variant="default"
          className="bg-primary normal-case text-[11px] md:text-sm"
          onClick={() => setShowDialog(true)}
        >
          More options
        </Button>
      </div>

      {/* Input Fields */}
      <div className="flex flex-wrap gap-8">
        {/* Select Template */}
        <div className="min-w-full md:!min-w-[300px]">
          <TextField
            select
            label="Template"
            name="template"
            size="small"
            fullWidth
            value={selectedTemplate}
            onChange={handleTemplateChange}
            SelectProps={{
              IconComponent: CustomArrowIcon,
            }}
            disabled={loading}
          >
            <MenuItem value="">Select Template</MenuItem>
            {templates.map((template) => (
              <MenuItem key={template.id} value={template.id}>
                {template.templateName}
              </MenuItem>
            ))}
          </TextField>
        </div>

        {/* Header Row No */}
        <div className="min-w-full md:!min-w-[300px]">
          <TextField
            label="Header row no."
            size="small"
            fullWidth
            value={headerRowNo}
            onChange={handleHeaderRowChange}
            sx={{ backgroundColor: "white" }}
            type="number"
            inputProps={{ min: 1 }}
          />
        </div>
      </div>

      {/* File Information */}
      {selectedFile && (
        <div className="mt-2">
          <p className="text-sm font-medium">
            Selected file: {selectedFile.name}
          </p>
        </div>
      )}

      {/* Validation Status */}
      {validating ? (
        <div className="flex justify-center items-center py-6">
          <CircularProgress size={30} className="text-primary" />
          <span className="ml-2">Validating file...</span>
        </div>
      ) : (
        validationStatus.length > 0 && (
          <div className="mt-4 border rounded-md p-4 bg-white">
            <h3 className="text-lg font-semibold mb-3">Validation Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {validationStatus
                .filter(
                  (status) => status.columnName.toLowerCase() !== "id code"
                )
                .map((status, index) => (
                  <div
                    key={index}
                    className="flex items-center border rounded p-2"
                  >
                    <span
                      className={`h-3 w-3 rounded-full mr-2 ${
                        status.isValid ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="flex-1">{status.columnName}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {status.isValid ? "✓" : "✗"}
                    </span>
                  </div>
                ))}
            </div>

            {!allValid && validationStatus.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm">
                <p className="font-medium text-red-800 mb-2">
                  Missing Columns:
                </p>
                <ul className="list-disc list-inside text-red-700">
                  {validationStatus
                    .filter((status) => !status.isValid)
                    .map((status, index) => (
                      <li key={index}>{status.columnName}</li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )
      )}
      {fileData.length > 0 && (
        <div className="mt-4 border rounded-md p-4 overflow-x-auto bg-white">
          <h3 className="text-lg font-semibold mb-3">
            File Preview (Header Row: {headerRowNo})
          </h3>

          {(() => {
            const dataRows = fileData.slice(1); // Exclude header row from data
            const headerRow = fileData[0];
            const totalItems = dataRows.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentData = dataRows.slice(startIndex, endIndex);
            const serialNumberOffset = startIndex + 1; // Serial number starts from 1

            return (
              <>
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                  <thead>
                    <tr className="bg-blue-50 font-semibold">
                      <th className="px-3 py-3 text-sm border-r border-gray-200 text-blue-900 font-medium bg-blue-50">
                        S.No
                      </th>
                      {Array.isArray(headerRow) &&
                        headerRow.map((cell, cellIndex) => (
                          <th
                            key={cellIndex}
                            className="px-3 py-3 text-sm border-r border-gray-200 last:border-r-0 text-blue-900 font-medium bg-blue-50"
                          >
                            <div
                              className="truncate max-w-[150px]"
                              title={cell || ""}
                            >
                              {cell || `Column ${cellIndex + 1}`}
                            </div>
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentData.map((row, rowIndex) => (
                      <tr
                        key={startIndex + rowIndex}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-3 py-3 text-sm border-r border-gray-200 text-gray-900 font-medium">
                          {serialNumberOffset + rowIndex}
                        </td>
                        {Array.isArray(row) &&
                          row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-3 py-3 text-sm border-r border-gray-200 last:border-r-0 text-gray-900"
                            >
                              <div
                                className="truncate max-w-[150px]"
                                title={cell || ""}
                              >
                                {cell || "-"}
                              </div>
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)}{" "}
                    of {totalItems} entries
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = pageNumber === currentPage;

                        // Show first page, last page, current page, and pages around current
                        const showPage =
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          Math.abs(pageNumber - currentPage) <= 1;

                        if (!showPage) {
                          // Show ellipsis for gaps
                          if (pageNumber === 2 && currentPage > 4) {
                            return (
                              <span
                                key={pageNumber}
                                className="px-2 py-1 text-sm text-gray-500"
                              >
                                ...
                              </span>
                            );
                          }
                          if (
                            pageNumber === totalPages - 1 &&
                            currentPage < totalPages - 3
                          ) {
                            return (
                              <span
                                key={pageNumber}
                                className="px-2 py-1 text-sm text-gray-500"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-3 py-1 border rounded text-sm ${
                              isCurrentPage
                                ? "bg-primary text-white border-primary"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Bottom Buttons */}
      <div className="flex justify-center md:justify-end gap-4 mt-6">
        <Button
          variant="outline"
          className="border-primary text-primary normal-case px-5"
          onClick={handleClear}
        >
          Clear
        </Button>
        <Button
          variant="default"
          className="bg-primary normal-case px-5"
          disabled={!selectedFile || !allValid || validating || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <CircularProgress size={16} className="mr-2 text-white" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </div>
  );
};

export default MasterDataDetailPage;
