import React from "react";
import { DataTable } from "../../../../components/datatable-server/DataTable.tsx";
import { useCallback, useEffect, useState } from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";
import TextField from "@mui/material/TextField";
// import MenuItem from "@mui/material/MenuItem";
// import excelIcon from "/icons/excel.svg";
// import pdfIcon from "/icons/pdf.svg";
// import arrowDown from "../../../../assets/newIcons/sidebar/arrowDown.svg";
import { useNavigate } from "react-router-dom";
import backA from "../../../../assets/newIcons/backArrow.svg";
import upDownArr from "../../../../assets/newIcons/inverdSystem/upDownArrow.svg";
import { ButtonWithIcon } from "../../../../components/ui/button-with-icon";
import { generateServerSideReport } from "../../../../utils/reportGenerator";
import { Search } from "lucide-react";
import { AccessorKeyColumnDef } from "@tanstack/react-table";
import {
  getAllInvoiceData,
  createInvoiceData,
  updateInvoiceData,
  deleteInvoiceData,
} from "../../../../api/administration/receipt.ts";
import {
  InvoiceDataItem,
  InvoicePayload,
} from "../../../../types/layout.types.ts";
import DialogComponent from "../../../../components/common/DialogComponent";
import { toast } from "react-fox-toast";
import { useLocation } from "react-router-dom";
import AddColumnsDialogLocal from "../../../../components/common/AddColumnsDialogLocal.tsx";
import { receiptDataTableColumns } from "./receipt-data.config.tsx";
import { ReceiptDataCard } from "../../../../components/mobilecard/ReceiptDataCard.tsx";

// Define the master data item interface

// Interface for form errors
type FormErrors = {
  receiptNumber?: string;
  dateOfReceipt?: string;
  partNumber?: string;
  internalPartNo?: string;
  partLocation?: string;
  receiptQuantity?: string;
  inwardQty?: string;
  manufacturer?: string;
  description?: string;
  status?: string;
};

// Removed inline masterDataTableColumns definition as it's now imported from master-data.config.tsx

// const CustomArrowIcon = (props: any) => (
//   <span {...props}>
//     <img src={arrowDown} alt="arrowD" className="h-3 w-3 cursor-pointer" />
//   </span>
// );

const ReceiptData = () => {
  const location = useLocation();
  const isViewMore = location.state?.isViewMore;
  const [data, setData] = useState<InvoiceDataItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InvoiceDataItem | null>(
    null
  );
  const [totalCount, setTotalCount] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "id",
    "partNumber",
    "receiptNumber",
    "dateOfReceipt",
    "status",
    "receiptQuantity",
    "action",
  ]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "updatedAt",
      desc: true,
    },
  ]);

  const [formData, setFormData] = useState({
    receiptNumber: "",
    receiptQuantity: "",
    partNumber: "",
    dateOfReceipt: "",
  });

  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Prevent negative values for quantity field
    if (name === "quantity" && value.startsWith("-")) {
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear errors when user types
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.partNumber.trim()) {
      newErrors.partNumber = "Part Number is required";
    }

    if (!formData.dateOfReceipt.trim()) {
      newErrors.dateOfReceipt = "Date of Receipt is required";
    }

    if (!formData.receiptNumber.trim()) {
      newErrors.receiptNumber = "Receipt Number is required";
    }

    if (!formData.receiptQuantity.trim()) {
      newErrors.receiptQuantity = "Receipt Quantity is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
   try {
  if (editingId) {
    // Update existing data
    const payload: InvoicePayload = {
      receiptNumber: formData.receiptNumber,
      dateOfReceipt: formData.dateOfReceipt,
      partNumber: formData.partNumber,
      receiptQuantity: formData.receiptQuantity,
    };

    await updateInvoiceData(editingId, payload);
    toast.success("Receipt data updated successfully");
  } else {
    // Create new data
    const payload: InvoicePayload = {
      receiptNumber: formData.receiptNumber,
      dateOfReceipt: formData.dateOfReceipt,
      partNumber: formData.partNumber,
      receiptQuantity: formData.receiptQuantity,
    };

    await createInvoiceData(payload);
    toast.success("Receipt data added successfully");
  }

  handleCancelEdit();
  fetchMasterData();
} catch (error: any) {
  console.error(
    `Error ${editingId ? "updating" : "creating"} Receipt data:`,
    error
  );

  const apiErrorMessage =
    error.response?.data?.data?.message ||
    error.message ||
    `Failed to ${editingId ? "update" : "add"} Receipt data`;

  toast.error(apiErrorMessage);
} finally {
  setIsSubmitting(false);
}

  };

  const fetchMasterData = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = pagination.pageIndex + 1;
      const sortColumn = sorting.length > 0 ? sorting[0].id : "updatedAt";
      const sortOrder = sorting.length > 0 && sorting[0].desc ? "desc" : "asc";

      const response = await getAllInvoiceData({
        pagination: {
          page,
          pageSize: pagination.pageSize,
          searchQuery: searchTerm,
          sortColumn,
          sortOrder,
          download: false,
        },
      });

      console.log("ReceiptDataResponse", response);

      if (response && response.data) {
        const transformed: InvoiceDataItem[] = response.data.map(
          (item: any) => ({
            id: item.id,
            receiptNumber: item.receiptNumber,
            dateOfReceipt: item.dateOfReceipt,
            partNumber: item.partNumber,
            internalPartNo: item.internalPartNo || "",
            partLocation: item.partLocation || "",
            receiptQuantity: item.receiptQuantity,
            inwardQty: item.inwardQty,
            status: item.status,
          })
        );

        setData(transformed);
        setTotalCount(response.count);
      }
    } catch (error) {
      console.error("Error fetching Receipt data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, sorting, searchTerm]);

  useEffect(() => {
    fetchMasterData();
  }, [pagination, sorting, searchTerm]);

  const handleClear = () => {
    setFormData({
      dateOfReceipt: "",
      partNumber: "",
      receiptNumber: "",
      receiptQuantity: "",
    });
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    handleClear();
  };

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPagination(newPagination);
    },
    []
  );

  const handleOpenAddDialog = () => setShowDialog(true);

  const formatDateForInput = (isoDate: string) => {
    if (!isoDate) return "";

    const localDate = new Date(isoDate);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleEditClick = (item: InvoiceDataItem) => {
    setEditingId(item.id);
    setFormData({
      receiptNumber: item.receiptNumber || "",
      receiptQuantity: item.receiptQuantity.toString(),
      partNumber: item.partNumber,
      dateOfReceipt: formatDateForInput(item.dateOfReceipt),
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditClickMobile = (item: InvoiceDataItem) => {
    setEditingId(item.id);
    setFormData({
      receiptNumber: item.receiptNumber || "",
      receiptQuantity: item.receiptQuantity.toString(),
      partNumber: item.partNumber,
      dateOfReceipt: formatDateForInput(item.dateOfReceipt),
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate("/administration/receipt/receipt-data");
  };

  const handleDeleteClick = (item: InvoiceDataItem) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await deleteInvoiceData(itemToDelete.id);
      toast.success("Receipt data deleted successfully");
      fetchMasterData();
    } catch (error) {
      console.error("Error deleting Receipt data:", error);
      toast.error("Failed to delete Receipt data");
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const handleSortingChange = useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
  }, []);

  const handleSearchChange = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    // Reset to first page when searching
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, []);

  // Mobile card renderer for the DataTable
  const renderMobileCard = (row: any, index: number) => {
    return (
      <ReceiptDataCard
        data={row}
        index={index}
        handleEdit={() => {
          handleEditClickMobile(row);
        }}
      />
    );
  };

  function handleMasterData() {
    const id = 1;
    navigate(`/administration/receipt/receipt-data/${id}`);
  }

  const getFilteredColumns = useCallback(() => {
    return receiptDataTableColumns(undefined, undefined, undefined, pagination)
      .filter((col) => {
        const accessorKey = (col as any).accessorKey;
        return (
          accessorKey &&
          !accessorKey.toString().toLowerCase().includes("action") &&
          !accessorKey.toString().toLowerCase().includes("id")
        );
      })
      .map((col) => ({
        header: col.header as string,
        accessorKey: (col as any).accessorKey as string,
      }));
  }, [pagination]);

  const fetchAllMasterData = useCallback(async (options: any) => {
    const sanitizedSortOrder = options.sortOrder === "desc" ? "desc" : "asc";

    const response = await getAllInvoiceData({
      pagination: {
        page: options.page,
        pageSize: options.pageSize,
        searchQuery: options.searchQuery,
        sortColumn: options.sortColumn,
        sortOrder: sanitizedSortOrder,
        download: true,
      },
    });

    if (!response || !response.data) {
      console.error("Failed to fetch Receipt data or no data returned");
      return {
        tableData: [],
        totalCount: 0,
      };
    }

    console.log("response", response);

    return {
      tableData: response.data.map((item: any) => ({
        id: item.id,
        receiptNumber: item.receiptNumber,
        dateOfReceipt: item.dateOfReceipt,
        partNumber: item.partNumber,
        internalPartNo: item.internalPartNo || "",
        partLocation: item.partLocation || "",
        receiptQuantity: item.receiptQuantity,
        inwardQty: item.inwardQty,
        status: item.status,
      })),
      totalCount: response.count,
    };
  }, []);

  const handleExport = useCallback(
    async (format: "excel" | "pdf") => {
      try {
        setIsLoading(true);
        const columns = getFilteredColumns();
        await generateServerSideReport(
          {
            fetchDataFn: fetchAllMasterData,
            columns,
            reportName: "Receipt Data Report",
            primaryColor: "#000000",
            secondaryColor: "#f0f0f0",
            initialParams: {
              sortColumn: sorting.length > 0 ? sorting[0].id : "partNumber",
              sortOrder: sorting.length > 0 && sorting[0].desc ? "desc" : "asc",
              searchQuery: searchTerm,
            },
          },
          format
        );
        toast.success(`${format.toUpperCase()} report generated successfully`);
      } catch (error) {
        toast.error(`Failed to export to ${format.toUpperCase()}`);
        console.error(`Export error:`, error);
      } finally {
        setIsLoading(false);
      }
    },
    [sorting, searchTerm, fetchAllMasterData, getFilteredColumns]
  );

  const allColumns = React.useMemo(() => {
    const columns = receiptDataTableColumns(
      undefined,
      undefined,
      undefined,
      pagination
    );

    return columns
      .filter((col): col is AccessorKeyColumnDef<InvoiceDataItem, any> => {
        return typeof (col as any).accessorKey === "string";
      })
      .filter((col) => !col.accessorKey.toLowerCase().includes("action"))
      .map((col) => ({
        header:
          typeof col.header === "function" ? "Column" : (col.header as string),
        accessorKey: col.accessorKey,
      }));
  }, [pagination]);

  const isFormValid =
    formData.dateOfReceipt.trim() &&
    formData.partNumber.trim() &&
    formData.receiptNumber.trim() &&
    formData.receiptQuantity.toString().trim();

  return (
    <>
      {isViewMore && (
        <div className="px-6 py-2">
          <div>
            <img
              src={backA}
              alt="backImg"
              className="h-3 w-3"
              onClick={(e) => {
                e.preventDefault();
                navigate("/administration/receipt/receipt-data");
              }}
            />
          </div>
          <div>
            <div className="flex flex-col gap-6 mt-3">
              {/* Top Buttons */}
              <div className="flex gap-4 mb-4">
                <ButtonWithIcon
                  variant="outline"
                  size="default"
                  iconSrc={"/icons/excel.svg"}
                  label="Excel"
                  iconPosition="right"
                  className="bg-primary text-white hover:bg-primary cursor-pointer px-2 md:px-5"
                  onClick={() => {
                    handleExport("excel");
                  }}
                />
                <ButtonWithIcon
                  variant="outline"
                  size="default"
                  className="bg-primary text-white hover:bg-primary cursor-pointer px-2 md:px-5"
                  iconSrc={"/icons/pdf.svg"}
                  label="PDF"
                  iconPosition="right"
                  onClick={() => {
                    handleExport("pdf");
                  }}
                />
              </div>

              {/* Bottom Buttons */}
            </div>

            <div className="md:hidden flex flex-col items-end mb-4 md:gap-4">
              <div className="flex flex-col md:flex-row gap-2 w-full"></div>
              <div className="flex gap-3 items-center w-full max-w-md md:mt-0 md:max-w-sm">
                <div className="relative w-[80%]">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search users..."
                    className="pl-3 pr-10 py-1 w-full border bg-white border-black rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <img src={upDownArr} alt="img" className="h-3 w-3" />
              </div>
            </div>
            <div className=" md:hidden block">
              <DataTable
                showAddButton={false}
                columns={receiptDataTableColumns(
                  undefined,
                  undefined,
                  undefined,
                  pagination
                )}
                data={data}
                onPaginationChange={handlePaginationChange}
                onSortingChange={handleSortingChange}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Search "
                initialSearchTerm={searchTerm}
                mobileCardRenderer={renderMobileCard}
              />
            </div>
          </div>
        </div>
      )}
      {!isViewMore && (
        <div className="px-6 py-2">
          {showDialog && (
            <AddColumnsDialogLocal
              isOpen={showDialog}
              onClose={() => setShowDialog(false)}
              columns={allColumns.filter((col) => col.accessorKey !== "id")}
              visibleColumns={visibleColumns}
              setVisibleColumns={setVisibleColumns}
            />
          )}

          {showDeleteDialog && (
            <DialogComponent
              isOpen={showDeleteDialog}
              onClose={() => {
                setShowDeleteDialog(false);
                setItemToDelete(null);
              }}
              title="Confirmation"
              subtitle="Are you sure you want to delete?"
              cancelButtonText="No"
              saveButtonText="Yes"
              onSave={handleDeleteConfirm}
            />
          )}
          <div>
            <div className="flex flex-col gap-6">
              {/* Top Buttons */}
              <div className="flex gap-4 mb-4">
                <button
                  className="bg-[#676e6e] cursor-pointer text-white text-sm font-semibold px-6 py-2 rounded"
                  onClick={handleMasterData}
                >
                  Upload Invoice data
                </button>
                <ButtonWithIcon
                  variant="outline"
                  size="default"
                  iconSrc={"/icons/excel.svg"}
                  label="Excel"
                  iconPosition="right"
                  className="bg-primary  hidden md:flex text-white hover:bg-primary cursor-pointer px-2 md:px-8"
                  onClick={() => {
                    handleExport("excel");
                  }}
                />
                <ButtonWithIcon
                  variant="outline"
                  size="default"
                  className="bg-primary hidden md:flex text-white hover:bg-primary cursor-pointer px-2 md:px-8"
                  iconSrc={"/icons/pdf.svg"}
                  label="PDF"
                  iconPosition="right"
                  onClick={() => {
                    handleExport("pdf");
                  }}
                />
              </div>

              {/* Form Fields */}
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7 border border-primary rounded-md md:border-none p-8 md:p-0"
              >
                {editingId && (
                  <div className="col-span-1 md:col-span-3 xl:col-span-4">
                    <h2 className="text-lg font-semibold text-[#676e6e]">
                      Edit Receipt Data
                    </h2>
                  </div>
                )}
                <TextField
                  label="Receipt Number"
                  name="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  error={!!errors.receiptNumber}
                  helperText={errors.receiptNumber}
                  required
                />

                <TextField
                  label="Receipt Quantity"
                  name="receiptQuantity"
                  type="number"
                  value={formData.receiptQuantity}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  inputProps={{ min: "1" }}
                  error={!!errors.inwardQty}
                  helperText={errors.inwardQty}
                  required
                />

                <TextField
                  label="Part Number"
                  name="partNumber"
                  value={formData.partNumber}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  error={!!errors.partNumber}
                  helperText={errors.partNumber}
                  required
                />

                <TextField
                  label="Date Of Receipt"
                  name="dateOfReceipt"
                  type="date"
                  value={formData.dateOfReceipt}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                {/* <TextField
                  label="Manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="Enter manufacturer"
                  size="small"
                  fullWidth
                  error={!!errors.manufacturer}
                  helperText={errors.manufacturer}
                  required
                />
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                /> */}
                <div className="relative col-span-1 md:col-span-3 xl:col-span-4">
                  <div className="flex flex-row justify-end gap-4 mt-6">
                    {editingId ? (
                      <>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="w-full md:w-auto border border-[#676e6e] text-[#676e6e] font-semibold px-6 py-1 rounded text-xs md:text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full md:w-auto bg-[#676e6e] text-white font-semibold px-6 py-1 rounded text-xs md:text-sm"
                        >
                          {isSubmitting ? "Updating..." : "Update"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleClear}
                          className="w-full md:w-auto border border-[#676e6e] text-[#676e6e] font-semibold px-6 py-1 rounded text-xs md:text-sm"
                        >
                          Clear
                        </button>
                        <button
                          type="submit"
                          disabled={!isFormValid || isSubmitting}
                          className={`w-full md:w-auto font-semibold px-6 py-1 rounded text-xs md:text-sm transition-colors duration-200 ${
                            !isFormValid || isSubmitting
                              ? "bg-gray-300 text-white cursor-not-allowed"
                              : "bg-[#676e6e] text-white hover:bg-[#b08040]"
                          }`}
                        >
                          {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </form>

              {/* Bottom Buttons */}
            </div>

            <div className="hidden md:flex flex-col items-end mb-4 md:gap-4 mt-4">
              <div className="flex flex-col md:flex-row gap-2 w-full"></div>
              <div className="w-full max-w-md mt-10 md:mt-0 md:max-w-sm">
                <div
                  id="search-container"
                  className="w-full md:max-w-sm xl:max-w-md mt-5 md:mt-0"
                ></div>
              </div>
            </div>
            <div className="hidden md:block">
              <DataTable
                showAddButton={false}
                columns={receiptDataTableColumns(
                  handleEditClick,
                  handleDeleteClick,
                  handleOpenAddDialog,
                  pagination
                )}
                data={data}
                serverSide={true}
                serverSideOptions={{
                  totalCount,
                  isLoading,
                }}
                onPaginationChange={handlePaginationChange}
                onSortingChange={handleSortingChange}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Search by Part Number, Internal PN, etc."
                initialSearchTerm={searchTerm}
                searchContainerId="search-container"
                mobileCardRenderer={renderMobileCard}
                visibleColumns={visibleColumns}
              />
            </div>
          </div>
          <div className="md:hidden relative w-full flex justify-end items-center mt-4">
            <button
              className="w-[120px] md:w-auto bg-[#676e6e] text-white font-semibold px-6 py-1 rounded text-xs"
              onClick={(e) => {
                e.preventDefault();
                navigate("/administration/receipt/receipt-data", {
                  state: { isViewMore: true },
                });
              }}
            >
              View Result
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReceiptData;
