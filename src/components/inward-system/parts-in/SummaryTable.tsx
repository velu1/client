import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "../../datatable-server/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import AddColumnsDialogLocal from "../../common/AddColumnsDialogLocal";
import { PartsInCard } from "../../mobilecard/PartsInCard";
import {
  summaryTableColumns,
  PartsInRow,
} from "../../../pages/inward-system/parts-in/summaryTable.config";
import { getAllPartsIn } from "../../../api/partsIn";
import { toast } from "react-fox-toast";
import pen from "../../../assets/newIcons/inverdSystem/pen.svg";
import { usePrinterStore } from "../../../utils/printerService";
import PrinterConfigPreview from "./PrinterConfigPreview";
import { resolveQRContent } from "../../../utils/fieldMapper";
// import { TextField,InputAdornment } from "@mui/material";
// import { Search } from "lucide-react";

interface SummaryTableProps {
  onRefresh?: () => void;
  printerConfig?: any;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ printerConfig }) => {
  // Debug logging for printerConfig with better timing information
  useEffect(() => {
    console.log(
      "[SummaryTable] Received printerConfig:",
      printerConfig,
      "at time:",
      new Date().toISOString()
    );

    // We know printerConfig will be null initially and then updated
    if (printerConfig) {
      console.log(
        "[SummaryTable] Config loaded successfully with priority items:",
        printerConfig?.priority?.length || 0
      );
    }
  }, [printerConfig]);
  const [data, setData] = useState<PartsInRow[]>([]);
  const [allData, setAllData] = useState<PartsInRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [totalCount, setTotalCount] = useState(0);
  const [refreshTrigger] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  // Dev mode preview states
  const [showConfigPreview, setShowConfigPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    labelData: any;
    qrContent: string;
  }>({ labelData: {}, qrContent: "" });

  // Check if we're in development mode or enable for all environments
  const isDev = false; // Always enable the preview for debugging regardless of environment

  // Import printer functionality
  const { isConnected, printLabel, connectPrinter } = usePrinterStore();

  // Create a memoized fetchData function
  const fetchData = useCallback(() => {
    let isMounted = true;
    setLoading(true);
    getAllPartsIn({
      page,
      pageSize,
      searchQuery: searchTerm,
      sortColumn,
      sortOrder,
    })
      .then((res) => {
        if (!isMounted) return;
        // Map API data to PartsInRow
        const rows: PartsInRow[] = (res.data || []).map((item: any) => ({
          ...item,
        }));
        setData(rows);
        setAllData(rows);
        setTotalCount(res.count || 0);
      })
      .catch((err) => {
        if (!isMounted) return;
        toast.error("Failed to fetch parts-in data", err);
        setData([]);
        setTotalCount(0);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [page, pageSize, searchTerm, sortColumn, sortOrder]);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  // Public method to refresh the data
  // const refreshData = () => {
  //   setRefreshTrigger((prev) => prev + 1);
  //   if (onRefresh) {
  //     onRefresh();
  //   }
  // };

  useEffect(() => {
    if (!sortColumn || allData.length === 0) return;

    const sorted = [...allData].sort((a, b) => {
      const aValue = a[sortColumn as keyof PartsInRow] ?? "";
      const bValue = b[sortColumn as keyof PartsInRow] ?? "";

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc"
        ? aValue > bValue
          ? 1
          : aValue < bValue
          ? -1
          : 0
        : aValue < bValue
        ? 1
        : aValue > bValue
        ? -1
        : 0;
    });

    setData(sorted);
  }, [sortColumn, sortOrder, allData]);

  const renderMobileCard = (row: PartsInRow, index: number) => {
    return (
      <PartsInCard data={row} index={index} visibleColumns={visibleColumns} />
    );
  };

  // Print handler for action column - Real implementation
  const handlePrintClick = async (row: PartsInRow) => {
    try {
      // Check if printerConfig is loaded - this is critical
      if (!printerConfig) {
        console.warn(
          "[SummaryTable] Printer config is null at print time! This is a timing issue."
        );
        toast.error(
          "Printer configuration is still loading. Please try again in a moment."
        );
        return;
      }

      console.log(
        "[SummaryTable] Print requested for row:",
        row.uniqueId,
        "with config:",
        !!printerConfig
      );

      console.log(row, "123 178 420");

      // Map the table data to label format with additional fields for dynamic QR code
      const labelData = {
        ...row,
        copies: 1, // Ensure copies default
      };

      // Generate QR content for preview using dynamic field mapper
      let qrContent = "";
      if (
        printerConfig &&
        printerConfig.priority &&
        printerConfig.priority.length > 0
      ) {
        console.log(
          "[SummaryTable] Using dynamic field mapper for QR content generation"
        );

        // Prepare comprehensive data object with all available fields and their variations
        const comprehensiveData = {
          ...labelData,
          demo: "", // Handle demo field from API config
          newexel: "", // Handle newexel field from API config
        };

        console.log(
          "[SummaryTable] Comprehensive data for field mapping:",
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
        console.log("[SummaryTable] Dynamic field resolution results:");
        debug.forEach(({ priority, fieldName, value, source }) => {
          console.log(
            `  Priority ${priority}: "${fieldName}" = "${value}" (source: ${source})`
          );
        });

        console.log(`[SummaryTable] Final QR content: "${qrContent}"`);
      } else {
        qrContent = `UID:${labelData.uniqueId}\nGRN:${labelData.invoiceNumber}\nBatch:${labelData.lotNumber}`;
        console.log("[SummaryTable] Using fallback QR content format");
      }

      // In development mode, show preview instead of printing
      if (isDev) {
        console.log("[SummaryTable] Dev mode - showing config preview");
        console.log("[SummaryTable] Printer config:", printerConfig);
        console.log("[SummaryTable] Label data:", labelData);
        console.log("[SummaryTable] QR content:", qrContent);

        setPreviewData({
          labelData,
          qrContent,
        });
        setShowConfigPreview(true);
        return;
      }

      // Production mode - actual printing
      // Check if printer is connected
      if (!isConnected) {
        const connected = await connectPrinter();
        if (!connected) {
          toast.error("Failed to connect to printer");
          return;
        }
      }

      // Print the label with printer configuration
      const success = await printLabel(labelData, printerConfig);

      if (success) {
        toast.success(`Label printed for ${row.uniqueId}`);
      } else {
        toast.error("Failed to print label");
      }
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Error occurred while printing");
    }
  };

  const onAddClick = () => {
    setShowDialog(true);
  };

  const allColumns = React.useMemo(() => {
    return summaryTableColumns(handlePrintClick, onAddClick, page, pageSize)
      .filter(
        (col): col is ColumnDef<PartsInRow> & { accessorKey: string } =>
          typeof (col as any).accessorKey === "string"
      )
      .map((col) => ({
        header:
          typeof col.header === "function" ? "Column" : (col.header as string),
        accessorKey: col.accessorKey,
      }));
  }, [page, pageSize]);

  const filteredColumns = React.useMemo(() => {
    return summaryTableColumns(
      handlePrintClick,
      onAddClick,
      page,
      pageSize
    ).filter(
      (col: any) => !col.accessorKey || visibleColumns.includes(col.accessorKey)
    );
  }, [visibleColumns, page, pageSize]);

  useEffect(() => {
    const defaultVisible = allColumns.map((col) => col.accessorKey);
    setVisibleColumns(defaultVisible);
  }, [allColumns]);

  return (
    <div className="w-full">
      {showDialog && (
        <AddColumnsDialogLocal
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          columns={allColumns.filter((col) => col.accessorKey !== "id")}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />
      )}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800">Summary</h2>
        <button
          type="button"
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <img src={pen} alt="columns" className="w-3.5 h-3.5 opacity-60" />
          <span className="hidden sm:inline">Columns</span>
        </button>
      </div>

      <DataTable
        columns={filteredColumns}
        data={data}
        serverSide={true}
        serverSideOptions={{
          totalCount,
          isLoading: loading,
        }}
        onPaginationChange={(pagination) => {
          setPage(pagination.pageIndex + 1);
          setPageSize(pagination.pageSize);
        }}
        onSortingChange={(sorting) => {
          if (sorting.length === 0) {
            setSortColumn("updatedAt");
            setSortOrder("desc");
          } else {
            setSortColumn(sorting[0].id);
            setSortOrder(sorting[0].desc ? "desc" : "asc");
          }
        }}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search parts..."
        mobileCardRenderer={renderMobileCard}
      />

      {/* Printer Config Preview Modal for Dev Mode */}
      {isDev && (
        <PrinterConfigPreview
          isOpen={showConfigPreview}
          onClose={() => setShowConfigPreview(false)}
          printerConfig={printerConfig}
          labelData={previewData.labelData}
          qrContent={previewData.qrContent}
        />
      )}
    </div>
  );
};

// Create a ref-forwarding version of the component
export const SummaryTableWithRef = React.forwardRef<
  { refresh: () => void },
  SummaryTableProps
>((props, ref) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Track if we've received a valid printerConfig at least once
  const [hasReceivedConfig, setHasReceivedConfig] = useState(false);

  // Check when valid printerConfig is received
  useEffect(() => {
    if (props.printerConfig && !hasReceivedConfig) {
      console.log("[SummaryTableWithRef] Received first valid printerConfig");
      setHasReceivedConfig(true);
    }
  }, [props.printerConfig, hasReceivedConfig]);

  // Create a refresh function that can be called from parent
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Expose the refresh function to parent
  React.useImperativeHandle(
    ref,
    () => ({
      refresh,
    }),
    [refresh]
  );

  // Add stability by only allowing renders with valid printerConfig
  if (!props.printerConfig) {
    console.log(
      "[SummaryTableWithRef] Waiting for valid printerConfig before initial render"
    );
    return null;
  }

  return <SummaryTable {...props} key={refreshTrigger} />;
});

export default SummaryTable;
