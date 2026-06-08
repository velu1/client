import React from "react";
import { DataTable } from "../../../../components/datatable-server/DataTable.tsx";
import { useCallback, useEffect, useState } from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import backA from "../../../../assets/newIcons/backArrow.svg";
import { generateServerSideReport } from "../../../../utils/reportGenerator";
import { FileSpreadsheet, FileText, Upload, ArrowLeft } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  createMasterData,
  getAllMasterData,
  updateMasterData,
  deleteMasterData,
} from "../../../../api/administration/master";

import DialogComponent from "../../../../components/common/DialogComponent";
import { toast } from "react-fox-toast";
import { MasterDataCard } from "../../../../components/mobilecard/MasterDataCard";
import { useLocation } from "react-router-dom";
import { masterDataTableColumns } from "./master-data.config";
import AddColumnsDialogLocal from "../../../../components/common/AddColumnsDialogLocal.tsx";

// Define the master data item interface
export interface MasterDataItem {
  id: string;
  partNumber: string;
  internalPartNo: string;
  partLocation?: string;
  quantity: number;
  manufacturer: string;
  description?: string;
}

// Interface for form errors
interface FormErrors {
  partNumber?: string;
  internalPartNo?: string;
  quantity?: string;
  manufacturer?: string;
}

// Removed inline masterDataTableColumns definition as it's now imported from master-data.config.tsx

// const CustomArrowIcon = (props: any) => (
//   <span {...props}>
//     <img src={arrowDown} alt="arrowD" className="h-3 w-3 cursor-pointer" />
//   </span>
// );

const MasterData = () => {
  const location = useLocation();
  const isViewMore = location.state?.isViewMore;
  const [data, setData] = useState<MasterDataItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MasterDataItem | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "id",
    "partNumber",
    "internalPartNo",
    "partLocation",
    "quantity",
    "manufacturer",
    "description",
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
    partNumber: "",
    internalPartNo: "",
    partLocation: "",
    quantity: "",
    manufacturer: "",
    description: "",
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

    if (!formData.internalPartNo.trim()) {
      newErrors.internalPartNo = "Internal Part Number is required";
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = "Quantity is required";
    }

    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = "Manufacturer is required";
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
        // Update existing data - send ID in the payload
        await updateMasterData(editingId, {
          partNumber: formData.partNumber,
          internalPartNo: formData.internalPartNo,
          partLocation: formData.partLocation,
          quantity: formData.quantity,
          manufacturer: formData.manufacturer,
          description: formData.description,
        });

        toast.success("Master data updated successfully");
      } else {
        // Create new data
        await createMasterData({
          partNumber: formData.partNumber,
          internalPartNo: formData.internalPartNo,
          partLocation: formData.partLocation,
          quantity: formData.quantity,
          manufacturer: formData.manufacturer,
          description: formData.description,
        });

        toast.success("Master data added successfully");
      }

      // Reset form and editing state
      handleCancelEdit();

      // Refresh data
      fetchMasterData();
    } catch (error) {
      console.error(
        `Error ${editingId ? "updating" : "creating"} master data:`,
        error
      );
      toast.error(`Failed to ${editingId ? "update" : "add"} master data`);
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

      const response = await getAllMasterData({
        pagination: {
          page,
          pageSize: pagination.pageSize,
          searchQuery: searchTerm,
          sortColumn,
          sortOrder,
          download: false,
        },
      });
      console.log("MasterDataResponse", response);

      if (response && response.data) {
        const transformed: MasterDataItem[] = response.data.map(
          (item: any) => ({
            id: item.id,
            partNumber: item.partNumber,
            internalPartNo: item.internalPartNo,
            partLocation: item.partLocation || "",
            quantity: item.quantity,
            manufacturer: item.manufacturer,
            description: item.description || "",
          })
        );
        setData(transformed);
        setTotalCount(response.count);
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, sorting, searchTerm]);

  useEffect(() => {
    fetchMasterData();
  }, [pagination, sorting, searchTerm]);

  const handleClear = () => {
    setFormData({
      partNumber: "",
      internalPartNo: "",
      partLocation: "",
      quantity: "",
      manufacturer: "",
      description: "",
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

  const handleEditClick = (item: MasterDataItem) => {
    setEditingId(item.id);
    setFormData({
      partNumber: item.partNumber,
      internalPartNo: item.internalPartNo,
      partLocation: item.partLocation || "",
      quantity: item.quantity.toString(),
      manufacturer: item.manufacturer,
      description: item.description || "",
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditClickMobile = (item: MasterDataItem) => {
    setEditingId(item.id);
    setFormData({
      partNumber: item.partNumber,
      internalPartNo: item.internalPartNo,
      partLocation: item.partLocation || "",
      quantity: item.quantity.toString(),
      manufacturer: item.manufacturer,
      description: item.description || "",
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate("/administration/receipt/master-data");
  };

  const handleDeleteClick = (item: MasterDataItem) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await deleteMasterData(itemToDelete.id);
      toast.success("Master data deleted successfully");
      fetchMasterData();
    } catch (error) {
      console.error("Error deleting master data:", error);
      toast.error("Failed to delete master data");
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
      <MasterDataCard
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
    navigate(`/administration/receipt/master-data/${id}`);
  }

  const getFilteredColumns = useCallback(() => {
    return masterDataTableColumns(undefined, undefined, undefined, pagination)
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

    const response = await getAllMasterData({
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
      console.error("Failed to fetch master data or no data returned");
      return {
        tableData: [],
        totalCount: 0,
      };
    }

    console.log("response", response);

    return {
      tableData: response.data.map((item: any) => ({
        id: item.id,
        partNumber: item.partNumber,
        internalPartNo: item.internalPartNo,
        partLocation: item.partLocation || "",
        quantity: item.quantity,
        manufacturer: item.manufacturer,
        description: item.description || "",
      })),
      totalCount: response.data.totalCount,
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
            reportName: "Master Data Report",
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
    const columns = masterDataTableColumns(
      undefined,
      undefined,
      undefined,
      pagination
    );

    return columns
      .filter(
        (col): col is ColumnDef<MasterDataItem> & { accessorKey: string } => {
          return typeof (col as any).accessorKey === "string";
        }
      )
      .filter((col) => !col.accessorKey.toLowerCase().includes("action"))
      .map((col) => ({
        header:
          typeof col.header === "function" ? "Column" : (col.header as string),
        accessorKey: col.accessorKey,
      }));
  }, [pagination]);

  const isFormValid =
    formData.partNumber?.trim() &&
    formData.internalPartNo?.trim() &&
    formData.quantity &&
    Number(formData.quantity) > 0 &&
    formData.manufacturer?.trim();

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
                navigate("/administration/receipt/master-data");
              }}
            />
          </div>
          <div>
            <div className="flex flex-col gap-6 mt-3">
              {/* Top Buttons */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleExport("excel")}
                >
                  <FileSpreadsheet size={14} className="text-green-600" />
                  Excel
                </button>
                <button
                  className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleExport("pdf")}
                >
                  <FileText size={14} className="text-red-500" />
                  PDF
                </button>
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
                columns={masterDataTableColumns(
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
              <div className="flex items-center gap-2 mb-4">
                <button
                  className="flex items-center gap-1.5 bg-[#434a52] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#676e6e] transition-colors cursor-pointer"
                  onClick={handleMasterData}
                >
                  <Upload size={14} />
                  Upload master data
                </button>
                <button
                  className="hidden md:flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleExport("excel")}
                >
                  <FileSpreadsheet size={14} className="text-green-600" />
                  Excel
                </button>
                <button
                  className="hidden md:flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleExport("pdf")}
                >
                  <FileText size={14} className="text-red-500" />
                  PDF
                </button>
              </div>

              {/* Form Fields */}
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                {editingId && (
                  <div className="col-span-1 md:col-span-2 xl:col-span-3">
                    <h2 className="text-sm font-semibold text-[#434a52]">Edit Master Data</h2>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Part number <span className="text-red-400">*</span></label>
                  <input name="partNumber" value={formData.partNumber} onChange={handleChange} maxLength={200}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-800 outline-none transition-all ${errors.partNumber ? "border-red-400 focus:ring-2 focus:ring-red-200" : "border-gray-200 focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/10"}`} />
                  {errors.partNumber && <p className="text-xs text-red-400">{errors.partNumber}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Internal part number <span className="text-red-400">*</span></label>
                  <input name="internalPartNo" value={formData.internalPartNo} onChange={handleChange} maxLength={200}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-800 outline-none transition-all ${errors.internalPartNo ? "border-red-400 focus:ring-2 focus:ring-red-200" : "border-gray-200 focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/10"}`} />
                  {errors.internalPartNo && <p className="text-xs text-red-400">{errors.internalPartNo}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Quantity <span className="text-red-400">*</span></label>
                  <input name="quantity" type="number" min="1" value={formData.quantity} onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-800 outline-none transition-all ${errors.quantity ? "border-red-400 focus:ring-2 focus:ring-red-200" : "border-gray-200 focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/10"}`} />
                  {errors.quantity && <p className="text-xs text-red-400">{errors.quantity}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Part location</label>
                  <input name="partLocation" value={formData.partLocation} onChange={handleChange} maxLength={200}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 outline-none focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/10 transition-all" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Manufacturer <span className="text-red-400">*</span></label>
                  <input name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="Enter manufacturer" maxLength={200}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-800 outline-none transition-all ${errors.manufacturer ? "border-red-400 focus:ring-2 focus:ring-red-200" : "border-gray-200 focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/10"}`} />
                  {errors.manufacturer && <p className="text-xs text-red-400">{errors.manufacturer}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Description</label>
                  <input name="description" value={formData.description} onChange={handleChange} maxLength={200}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 outline-none focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/10 transition-all" />
                </div>
                <div className="relative col-span-1 md:col-span-2 xl:col-span-3">
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
                          disabled={isSubmitting || !isFormValid}
                          className={`w-full md:w-auto bg-[#676e6e] text-white font-semibold px-6 py-1 rounded text-xs md:text-sm ${
                            !isFormValid ? "opacity-50 cursor-not-allowed" : ""
                          }`}
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
                          disabled={isSubmitting || !isFormValid}
                          className={`w-full md:w-auto bg-[#676e6e] text-white font-semibold px-6 py-1 rounded text-xs md:text-sm ${
                            !isFormValid ? "opacity-50 cursor-not-allowed" : ""
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
                columns={masterDataTableColumns(
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
              className="w-30 md:w-auto bg-[#676e6e] text-white font-semibold px-6 py-1 rounded text-xs"
              onClick={(e) => {
                e.preventDefault();
                navigate("/administration/receipt/master-data", {
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

export default MasterData;
