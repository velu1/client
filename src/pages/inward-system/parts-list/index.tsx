import { DataTable } from "../../../components/datatable-server/DataTable";
import { useCallback, useEffect, useState, useRef } from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";
import DialogComponent from "../../../components/common/DialogComponent";
import { partsTableColumns } from "./parts-list.config";
import EditableRecordForm from "../../../components/parts/EditableRecordForm";
import SelectedRecordSummary from "../../../components/parts/SelectedRecordSummary";
import ReturnQuantityDialog from "../../../components/parts/ReturnQuantityDialog";
import QrCodePreview from "../../../components/inward-system/parts-in/QRCodePreview";
import {
  updatePart,
  scrapPart,
  returnPart,
  getAllPartsData,
  // getPartByUniqueId,
} from "../../../api/parts";
import {
  getPartsInPrinterConfig,
  PrinterConfigurationResponse,
} from "../../../api/settings";
import { toast } from "react-fox-toast";
import { Part as BasePart } from "../../../mock/dummyData";
import { PartsListCard } from "../../../components/mobilecard/PartsListCard";
import { usePrinterStore } from "../../../utils/printerService";
import PrinterConfigPreview from "../../../components/inward-system/parts-in/PrinterConfigPreview";
import { resolveQRContent } from "../../../utils/fieldMapper";

// Extend the base Part interface with API-specific fields
interface Part extends BasePart {
  incrementId?: string;
  extracted_sticker?: string;
  [key: string]: any; // For additional fields in the API response
}

const PartsListPage = () => {
  const [data, setData] = useState<Part[]>([]);
  const [allData, setAllData] = useState<Part[]>([]); // raw data
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showQrPreview, setShowQrPreview] = useState(false);
  const [dialogAction, setDialogAction] = useState<"scrap" | "print" | "other">(
    "other"
  );
  const [dialogTitle, setDialogTitle] = useState("Confirmation");
  const [dialogMessage, setDialogMessage] = useState(
    "Do you want to continue?"
  );
  const [selectedRow, setSelectedRow] = useState<Part | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [printerConfig, setPrinterConfig] =
    useState<PrinterConfigurationResponse | null>(null);
  const tableRef = useRef<any>(null);

  // Add constant for testing mode
  const IS_TEST_MODE = false; // Set to false for production

  // Add preview states
  const [showConfigPreview, setShowConfigPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    labelData: any;
    qrContent: string;
  }>({ labelData: {}, qrContent: "" });

  // Get printer functionality
  const { isConnected, printLabel, connectPrinter, qrPreviewData } =
    usePrinterStore();

  console.log("Data is", data);

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

  // Fetch printer configuration on component mount
  useEffect(() => {
    getPartsInPrinterConfig()
      .then(setPrinterConfig)
      .catch(() => toast.error("Failed to fetch printer config"));
  }, []);

  // Show QR preview when data is available
  useEffect(() => {
    if (qrPreviewData) {
      setShowQrPreview(true);
    }
  }, [qrPreviewData]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Convert from zero-based to one-based pagination for the API
      const page = pagination.pageIndex + 1;

      // Extract sorting information
      const sortColumn = sorting.length > 0 ? sorting[0].id : "uniqueId";
      const sortOrder =
        sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "asc";

      const response = await getAllPartsData(
        searchTerm,
        page,
        pagination.pageSize,
        sortColumn,
        sortOrder
      );

      if (response.status === 200) {
        setData(response.data.data);
        setAllData(response.data.data);
        setTotalCount(response.data.count);
      }
    } catch (error) {
      toast.error("Failed to fetch parts");
      console.error("Error fetching parts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, searchTerm, sorting]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!sorting.length || allData.length === 0) {
      setData(allData); // fallback to original order
      return;
    }

    const { id: sortColumn, desc } = sorting[0];

    const sorted = [...allData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return desc
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }

      return desc
        ? aValue > bValue
          ? -1
          : aValue < bValue
          ? 1
          : 0
        : aValue < bValue
        ? -1
        : aValue > bValue
        ? 1
        : 0;
    });

    setData(sorted);
  }, [sorting, allData]);

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPagination(newPagination);
    },
    []
  );

  const handleSortingChange = useCallback((newSorting: SortingState) => {
    // If the new sorting is empty, revert to default sorting (updatedAt desc)
    if (newSorting.length === 0) {
      const defaultSort: SortingState = [
        {
          id: "updatedAt",
          desc: true,
        },
      ];
      setSorting(defaultSort);
    } else {
      setSorting(newSorting);
    }
  }, []);

  // Use this modified handler for DataTable
  const onTableSortingChange = useCallback(
    (newSorting: SortingState) => {
      handleSortingChange(newSorting);
    },
    [handleSortingChange]
  );

  const handleSearchChange = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, []);

  // const handleUniqueIdSearch = async () => {
  //   const uniqueIdInput = document.getElementById(
  //     "uniqueId"
  //   ) as HTMLInputElement;
  //   if (uniqueIdInput && uniqueIdInput.value) {
  //     setIsLoading(true);
  //     try {
  //       const response = await getPartByUniqueId(uniqueIdInput.value);
  //       if (response.status === 200) {
  //         if (response.data) {
  //           setData([response.data]);
  //           setTotalCount(1);
  //           setSearchTerm(uniqueIdInput.value);
  //         } else {
  //           toast.error("No part found with this Unique ID");
  //         }
  //       }
  //     } catch (error) {
  //       toast.error("Failed to fetch part by Unique ID");
  //       console.error("Error fetching part by Unique ID:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }
  // };

  const handleRowSelection = (part: Part | null) => {
    console.log("Row selected:", part);
    setSelectedRow(part);
    setIsEditing(false);
  };

  // Function to deselect all rows except the one with the specified ID
  const deselectOtherRows = (rowId: string) => {
    if (tableRef.current) {
      const table = tableRef.current;
      // Get all selected rows
      const selectedRows = table.getSelectedRowModel().rows;
      // Deselect all rows that don't match the given ID
      selectedRows.forEach((row: any) => {
        if (row.id !== rowId) {
          row.toggleSelected(false);
        }
      });
    }
  };

  const handleEditClick = () => {
    console.log("selectedRow", selectedRow);
    if (selectedRow) {
      setIsEditing(true);
    }
  };

  const handleSave = async (updatedPart: Part) => {
    if (!selectedRow) return;

    setIsLoading(true);
    try {
      // Prepare data for API
      const payload = {
        partNumber: updatedPart.partNumber,
        quantity: updatedPart.quantity,
        lotNumber: updatedPart.lotNumber,
        manufactureDate: updatedPart.manufactureDate,
        dateOfReceipt: updatedPart.dateOfReceipt,
        receiptNumber: updatedPart.receiptNumber,
        uniqueId: updatedPart.uniqueId,
        id: updatedPart.id,
        manufacturer: updatedPart.manufacturer,
        description: updatedPart.description,
        partLocation: updatedPart.partLocation,
        internalPartNo: updatedPart.internalPartNo,
        expireDate: updatedPart.expireDate || "",
      };

      const response = await updatePart(selectedRow.id, payload);
      if (response.status === 200) {
        fetchData();
        setSelectedRow(response.data);
        setIsEditing(false);
        toast.success("Part updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update part");
      console.error("Error updating part:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrapClick = () => {
    if (!selectedRow) return;

    setDialogAction("scrap");
    setDialogTitle("Scrap Confirmation");
    setDialogMessage(
      `Are you sure you want to scrap part ${selectedRow.partNumber}?`
    );
    setShowDialog(true);
  };

  const handleReturnClick = () => {
    if (!selectedRow) return;

    setShowReturnDialog(true);
  };

  const handleScrapConfirm = async () => {
    if (!selectedRow) return;

    setIsLoading(true);
    try {
      // Prepare data for API
      const payload = {
        ...selectedRow,
        status: "scraped",
      };

      // @ts-ignore expected error non fix
      const response = await scrapPart(selectedRow.id, payload);
      if (response.status === 200) {
        fetchData();
        toast.success("Part scrapped successfully");
      }
    } catch (error) {
      toast.error("Failed to scrap part");
      console.error("Error scrapping part:", error);
    } finally {
      setIsLoading(false);
      setShowDialog(false);
    }
  };

  const handleReturnConfirm = async (returnQuantity: number) => {
    if (!selectedRow) return;

    setIsLoading(true);
    try {
      // Prepare data for API
      const payload = {
        updatedQuantity: returnQuantity,
        uniqueId: selectedRow.uniqueId,
        systemQuantity: selectedRow.quantity,
        isReturn: true,
        status: "returned",
      };

      const response = await returnPart(selectedRow.id, payload);
      if (response.status === 200) {
        fetchData();
        toast.success(`${returnQuantity} items returned successfully`);
      }
    } catch (error) {
      toast.error("Failed to return part");
      console.error("Error returning part:", error);
    } finally {
      setIsLoading(false);
      setShowReturnDialog(false);
    }
  };

  const handleReprintClick = () => {
    if (!selectedRow) return;

    setDialogAction("print");
    setDialogTitle("Print Confirmation");
    setDialogMessage(
      `Are you sure you want to print label for part ${selectedRow.partNumber}?`
    );
    setShowDialog(true);
  };

  const handlePrintConfirm = async () => {
    if (!selectedRow) return;

    setIsLoading(true);
    try {
      // Check if printerConfig is loaded
      if (!printerConfig) {
        console.warn("Printer config is null at print time!");
        toast.error(
          "Printer configuration is still loading. Please try again in a moment."
        );
        return;
      }

      // Map the part data to label format following parts-list response structure
      const labelData = {
        ...selectedRow, // Use ALL fields from the API response
        copies: selectedRow.copies || 1, // Only default copies if not in response
      };

      // Generate QR content using dynamic field mapper (same as parts-in system)
      let qrContent = "";
      if (
        printerConfig &&
        printerConfig.priority &&
        printerConfig.priority.length > 0
      ) {
        console.log(
          "[PartsListPage] Using dynamic field mapper for QR content generation"
        );

        // Prepare comprehensive data object with all available fields and their variations
        const comprehensiveData = {
          ...labelData, // ALL response data from getAllPartsData
          // Remove all hardcoded field mappings - let them come from response
        };

        console.log(
          "[PartsListPage] Comprehensive data for field mapping:",
          comprehensiveData
        );

        // Use dynamic field mapper to resolve QR content
        const { content, debug } = resolveQRContent(
          printerConfig.priority,
          comprehensiveData,
          printerConfig.delimiter || "|",
          printerConfig.entityTableRows,
          true // Enable debug mode for detailed logging
        );

        qrContent = content;

        // Enhanced logging with field resolution details
        console.log("[PartsListPage] Dynamic field resolution results:");
        debug.forEach(({ priority, fieldName, value, source }) => {
          console.log(
            `  Priority ${priority}: "${fieldName}" = "${value}" (source: ${source})`
          );
        });

        console.log(`[PartsListPage] Final QR content: "${qrContent}"`);
      }

      // In test mode, show preview instead of printing
      if (IS_TEST_MODE) {
        console.log("[PartsListPage] Test mode - showing config preview");
        console.log("[PartsListPage] Printer config:", printerConfig);
        console.log("[PartsListPage] Label data:", labelData);
        console.log("[PartsListPage] QR content:", qrContent);

        setPreviewData({
          labelData,
          qrContent,
        });
        setShowConfigPreview(true);
        return;
      }

      // Production mode - actual printing
      if (!isConnected) {
        const connected = await connectPrinter();
        if (!connected) {
          toast.error("Failed to connect to printer");
          return;
        }
      }

      const success = await printLabel(labelData, printerConfig);

      if (success) {
        toast.success(`Label printed for ${selectedRow.uniqueId}`);
      } else {
        toast.error("Failed to print label");
      }
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Error occurred while printing");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogConfirm = () => {
    if (dialogAction === "scrap") {
      handleScrapConfirm();
    } else if (dialogAction === "print") {
      handlePrintConfirm();
    }
    setShowDialog(false);
  };

  // Mobile card renderer for the DataTable
  const renderMobileCard = (row: any, index: number) => {
    const isSelected = selectedRow?.id === row.id;

    const handleCheckboxChange = (checked: boolean) => {
      if (checked) {
        deselectOtherRows(row.id); // Deselect others first
        handleRowSelection(row); // Select this one
      } else {
        handleRowSelection(null); // Unselect all
      }
    };

    return (
      <PartsListCard
        data={row}
        index={index}
        isSelected={isSelected}
        onSelectChange={handleCheckboxChange}
      />
    );
  };

  return (
    <div className="px-2 py-2">
      {showDialog && (
        <DialogComponent
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          title={dialogTitle}
          subtitle={dialogMessage}
          cancelButtonText="No"
          saveButtonText="Yes"
          onSave={handleDialogConfirm}
        />
      )}

      {showReturnDialog && selectedRow && (
        <ReturnQuantityDialog
          isOpen={showReturnDialog}
          onClose={() => setShowReturnDialog(false)}
          onConfirm={handleReturnConfirm}
          part={selectedRow}
        />
      )}

      {/* QR Code Preview Modal */}
      <QrCodePreview
        isOpen={showQrPreview}
        onClose={() => setShowQrPreview(false)}
      />

      {/* Printer Config Preview Modal for Test Mode */}
      {IS_TEST_MODE && (
        <PrinterConfigPreview
          isOpen={showConfigPreview}
          onClose={() => setShowConfigPreview(false)}
          printerConfig={printerConfig}
          labelData={previewData.labelData}
          qrContent={previewData.qrContent}
        />
      )}

      <div>
        <div className="flex flex-col md:flex-row items-center justify-between md:gap-[35%] mb-4 w-full">
          {/* Left: Unique Id + Fetch */}
          <div className="relative space-y-4 w-full">
            {/* <div className="flex flex-wrap items-center gap-3 w-full">
              <div className="relative flex-1 min-w-0">
                <label
                  htmlFor="uniqueId"
                  className="absolute -top-3 left-2 text-xs font-medium text-[#C29B6C] bg-white px-1"
                >
                  Unique Id
                </label>
                <input
                  id="uniqueId"
                  type="text"
                  placeholder="Enter Unique Id"
                  className="w-full p-2 text-sm border border-gray-400 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                className="bg-primary text-white font-medium text-sm px-5 py-2 rounded-sm shadow-sm hover:bg-[#b48b59] whitespace-nowrap"
                onClick={handleUniqueIdSearch}
              >
                Fetch
              </button>
            </div> */}

            {/* Summary title */}
            <div>
              <p className="text-md font-semibold text-gray-700">Summary</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                className={`${
                  selectedRow ? "bg-primary" : "bg-gray-700"
                } text-white text-sm font-medium px-4 py-2 md:px-6 md:py-2 rounded-sm hover:bg-gray-800`}
                onClick={handleEditClick}
                disabled={!selectedRow}
              >
                Edit
              </button>
              <button
                className={`${
                  selectedRow ? "bg-primary" : "bg-gray-700"
                } text-white text-sm font-medium px-4 py-2 md:px-6 md:py-2 rounded-sm hover:bg-gray-800`}
                onClick={handleReprintClick}
                disabled={!selectedRow}
              >
                Reprint
              </button>

              <button
                className={`${
                  selectedRow ? "bg-primary" : "bg-gray-700"
                } text-white text-sm font-medium px-4 py-2 md:px-6 md:py-2 rounded-sm hover:bg-gray-800`}
                onClick={handleReturnClick}
                disabled={!selectedRow}
              >
                Return
              </button>
              <button
                className={`${
                  selectedRow ? "bg-primary" : "bg-gray-700"
                } text-white text-sm font-medium px-4 py-2 md:px-6 md:py-2 rounded-sm hover:bg-gray-800`}
                onClick={handleScrapClick}
                disabled={!selectedRow}
              >
                Scrap
              </button>
            </div>
          </div>

          {/* Right: Search Input */}
          <div
            id="search-container"
            className="w-full max-w-md mt-10 md:mt-0 md:max-w-sm"
          ></div>
        </div>

        {/* Selected record editable form */}
        {selectedRow && isEditing && (
          <EditableRecordForm
            selectedPart={selectedRow}
            onCancel={() => setIsEditing(false)}
            onSave={handleSave}
          />
        )}

        {/* Selected record summary (non-editable) */}
        {selectedRow && !isEditing && (
          <SelectedRecordSummary
            selectedPart={selectedRow}
            onEditClick={handleEditClick}
          />
        )}

        <DataTable
          showAddButton={false}
          columns={partsTableColumns(handleRowSelection, deselectOtherRows)}
          data={data}
          serverSide={true}
          serverSideOptions={{
            totalCount,
            isLoading,
          }}
          onPaginationChange={handlePaginationChange}
          onSortingChange={onTableSortingChange}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search "
          initialSearchTerm={searchTerm}
          mobileCardRenderer={renderMobileCard}
          tableRef={tableRef}
        />
      </div>
    </div>
  );
};

export default PartsListPage;
