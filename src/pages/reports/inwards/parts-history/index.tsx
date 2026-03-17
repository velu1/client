import { DataTable } from "../../../../components/datatable-server/DataTable";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { Button } from "../../../../components/ui/button";
import { ButtonWithIcon } from "../../../../components/ui/button-with-icon";
import {
  DateTimePickerWithRange,
  DateTimeRange,
} from "../../../../components/common/DateTimePickerWithRange";
import { PartsHistoryCard } from "../../../../components/mobilecard/PartsHistoryCard";
// import excelIcon from "/icons/excel.svg";
// import pdfIcon from "/icons/pdf.svg";
import {
  getPartsHistory,
  PartsHistoryItem,
} from "../../../../api/reports/parts-history";
import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { partsHistoryColumns } from "./parts-history.config";
import { subDays } from "date-fns";
import { toast } from "react-fox-toast";
import { generateServerSideReport } from "../../../../utils/reportGenerator";
import AddColumnsDialogLocal from "../../../../components/common/AddColumnsDialogLocal";

const PartsHistoryPage = () => {
  const [data, setData] = useState<PartsHistoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);
  const today = useMemo(() => new Date(), []);
  const [allData, setAllData] = useState<PartsHistoryItem[]>([]);

  // Calculate last 30 days
  const thirtyDaysAgo = useMemo(() => subDays(today, 30), [today]);
  const [selectedRow, setSelectedRow] = useState<PartsHistoryItem | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "id",
    "partNumber",
    "internalPartNo",
    "uniqueId",
    "quantity",
    "lotNumber",
    "InvoiceNumber",
    "action",
    "manufacturer",
    "updatedQuantity",
  ]);

  // Initial date range - last 30 days - memoized to prevent unnecessary re-renders
  const initialDateRange: DateTimeRange = useMemo(
    () => ({
      from: {
        date: thirtyDaysAgo,
        time: {
          hours: 0,
          minutes: 0,
          ampm: "AM",
        },
      },
      to: {
        date: today,
        time: {
          hours: 23,
          minutes: 55,
          ampm: "PM",
        },
      },
    }),
    [thirtyDaysAgo, today]
  );

  const [dateRange, setDateRange] = useState<DateTimeRange | undefined>(
    initialDateRange
  );

  // Pagination state (zero-based page index for react-table)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "updatedAt",
      desc: true,
    },
  ]);

  // Reference to DateTimePickerWithRange
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Format date for API request
  const formatDateForApi = (dateTimeObj?: any) => {
    if (!dateTimeObj?.date) return undefined;

    const { date } = dateTimeObj;
    const { hours = 0, minutes = 0, ampm = "AM" } = dateTimeObj.time || {};

    const result = new Date(date);
    result.setHours(
      ampm === "PM" ? (hours % 12) + 12 : hours % 12,
      minutes,
      0,
      0
    );

    // Format date with fixed timezone offset +05:30
    const pad = (num: number) => String(num).padStart(2, "0");

    const year = result.getFullYear();
    const month = pad(result.getMonth() + 1);
    const day = pad(result.getDate());
    const hour = pad(result.getHours());
    const minute = pad(result.getMinutes());
    const second = pad(result.getSeconds());

    // Use fixed timezone offset of +05:30
    return `${year}-${month}-${day}T${hour}:${minute}:${second}+05:30`;
  };

  // Create a wrapper function to adapt the getPartsHistory API to the report generator interface
  const fetchAllPartsHistory = useCallback(
    async (options: any) => {
      // Ensure sortOrder is always 'asc' or 'desc'
      const sanitizedSortOrder = options.sortOrder === "desc" ? "desc" : "asc";
      console.log(allData, "Options");
      return await getPartsHistory({
        page: options.page,
        pageSize: options.pageSize,
        searchQuery: options.searchQuery,
        sortColumn: options.sortColumn,
        sortOrder: sanitizedSortOrder,
        startDate: options.startDate,
        endDate: options.endDate,
      });
    },
    [allData]
  );

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Convert from zero-based to one-based pagination for the API
      const page = pagination.pageIndex + 1;

      // Extract sorting information from the sorting state
      const sortColumn = sorting.length > 0 ? sorting[0].id : "internalPartNo";
      const sortOrder = sorting.length > 0 && sorting[0].desc ? "desc" : "asc";

      // Format date range for API
      const startDate = formatDateForApi(dateRange?.from);
      const endDate = formatDateForApi(dateRange?.to);

      const response = await getPartsHistory({
        page,
        pageSize: pagination.pageSize,
        searchQuery: searchTerm,
        sortColumn,
        sortOrder,
        startDate,
        endDate,
      });

      console.log(response, "Plp");

      setData(response.tableData);
      setAllData(response.tableData);
      setTotalCount(response.totalCount);
    } catch (error) {
      if (error instanceof Error && error.message === "canceled") {
        setIsLoading(true);
      } else {
        // toast.error("Failed to fetch parts history data");
        console.error("Error fetching parts history:", error);
        setIsLoading(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    searchTerm,
    sorting,
    dateRange,
  ]);

  // Observer to watch for date changes - defined after fetchData to avoid lint errors
  useEffect(() => {
    // Listen for the custom event from DateTimePickerWithRange
    const handleDateTimeApplied = (event: Event) => {
      const customEvent = event as CustomEvent;
      // Update our date range state with the one from the event
      if (customEvent.detail && customEvent.detail.fullRange) {
        setDateRange(customEvent.detail.fullRange);
      }

      // Fetch data with the new date range
      fetchData();
    };

    // Add event listener
    document.addEventListener("datetimerangeapplied", handleDateTimeApplied);

    // Clean up
    return () => {
      document.removeEventListener(
        "datetimerangeapplied",
        handleDateTimeApplied
      );
    };
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle pagination change
  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPagination(newPagination);
    },
    []
  );

  // Handle sorting change
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
      // Ensure special fields are handled properly
      const sortField = newSorting[0].id;
      if (["quantity", "updatedQuantity", "lotNumber"].includes(sortField)) {
        // For special fields, ensure proper sorting
        setSorting([
          {
            id: sortField,
            desc: newSorting[0].desc,
          },
        ]);
      } else {
        setSorting(newSorting);
      }
    }
  }, []);

  const onTableSortingChange = useCallback(
    (newSorting: SortingState) => {
      handleSortingChange(newSorting);
    },
    [handleSortingChange]
  );

  // Handle search change
  const handleSearchChange = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    // Reset to first page when searching
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, []);

  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    // Reset all filters to initial state
    setDateRange(initialDateRange);
    setSearchTerm("");
    setPagination({
      pageIndex: 0,
      pageSize: 10,
    });
    setSorting([
      {
        id: "updatedAt",
        desc: true,
      },
    ]);

    // Dispatch custom event to reset the DateTimePickerWithRange component
    const resetEvent = new CustomEvent("resetdatetimerange", {
      detail: {
        dateRange: initialDateRange,
      },
      bubbles: true,
    });
    document.dispatchEvent(resetEvent);
  }, [initialDateRange]);

  const handleOpenEdit = (row: PartsHistoryItem) => {
    console.log("Edit clicked for row:", row); // Debug log
    setSelectedRow(row);
    setShowColumnsDialog(true);
  };

  useEffect(() => {
    console.log("Dialog state:", showColumnsDialog);
    console.log("Selected row:", selectedRow);
  }, [showColumnsDialog, selectedRow]);

  const handleCloseDialog = () => {
    setShowColumnsDialog(false); // Close the dialog
    setSelectedRow(null); // Reset the selected row
  };

  const getFilteredColumns = useCallback(() => {
    console.log("=== START: getFilteredColumns ===");
    const allColumns = partsHistoryColumns();
    console.log("All columns before filtering:", allColumns);

    const columns = allColumns
      .filter((col) => {
        const accessorKey = (col as any).accessorKey;
        console.log("Filtering column:", {
          accessorKey,
          header: (col as any).header,
        });
        return (
          accessorKey &&
          !accessorKey.toString().toLowerCase().includes("action") &&
          // Modified condition to only filter standalone 'id' and not 'emailId'
          !(
            accessorKey.toString().toLowerCase() === "id" ||
            accessorKey.toString().toLowerCase().endsWith(".id") ||
            accessorKey.toString().toLowerCase().startsWith("id.")
          )
        );
      })
      .map((col) => {
        console.log("Mapping column: New ", {
          header: col.header,
          accessorKey: (col as any).accessorKey,
        });

        return {
          header: col.header as string,
          accessorKey: (col as any).accessorKey as string,
          getValue: (row: any) => {
            const key = (col as any).accessorKey;
            console.log("Getting value for column:", {
              key,
              header: col.header,
            });
            console.log("Row data:", row);

            if (key.includes(".")) {
              const [parent, child] = key.split(".");
              return row[parent]?.[child] || row[key] || "";
            }
            return row[key] || "";
          },
        };
      });

    console.log("Final filtered and mapped columns:", columns);
    console.log("=== END: getFilteredColumns ===");
    return columns;
  }, []);

  // Handle export to Excel/PDF
  const handleExport = useCallback(
    async (format: "excel" | "pdf") => {
      try {
        setIsLoading(true);

        // Format date range for API
        const startDate = formatDateForApi(dateRange?.from);
        const endDate = formatDateForApi(dateRange?.to);

        // Create columns for the report based on our table columns
        const reportColumns = getFilteredColumns()
          .filter((col) => {
            const columnDef = col as any;
            return columnDef.accessorKey && columnDef.accessorKey !== "serial";
          })
          .map((col) => {
            const columnDef = col as any;
            return {
              header: col.header as string,
              accessorKey: columnDef.accessorKey as string,
            };
          });

        console.log("Report Columns", reportColumns);

        // Use the new server-side report generator with our wrapper function
        await generateServerSideReport(
          {
            fetchDataFn: fetchAllPartsHistory,
            columns: reportColumns,
            reportName: "Parts History Report",
            primaryColor: "var(--primary)",
            secondaryColor: "#f0f0f0",
            initialParams: {
              sortColumn: sorting.length > 0 ? sorting[0].id : "internalPartNo",
              sortOrder: sorting.length > 0 && sorting[0].desc ? "desc" : "asc",
              searchQuery: searchTerm,
              startDate,
              endDate,
            },
          },
          format
        );
        console.log("Export params:", {
          sortColumn: sorting.length > 0 ? sorting[0].id : "internalPartNo",
          sortOrder: sorting.length > 0 && sorting[0].desc ? "desc" : "asc",
          searchQuery: searchTerm,
          startDate,
          endDate,
        });

        toast.success(`${format.toUpperCase()} report generated successfully`);
      } catch (error) {
        toast.error(`Failed to export to ${format.toUpperCase()}`);
        console.error(`Error exporting to ${format}:`, error);
      } finally {
        setIsLoading(false);
      }
    },
    [dateRange, searchTerm, sorting, fetchAllPartsHistory, getFilteredColumns]
  );

  // Mobile card renderer for the DataTable
  const renderMobileCard = (row: PartsHistoryItem, index: number) => {
    return (
      <PartsHistoryCard
        data={row}
        index={index}
        showColumnsDialog={showColumnsDialog}
        setShowColumnsDialog={setShowColumnsDialog}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        allColumns={allColumns}
      />
    );
  };

  const allColumns = React.useMemo(() => {
    const columns = partsHistoryColumns();

    return columns
      .filter(
        (col): col is ColumnDef<PartsHistoryItem> & { accessorKey: string } => {
          return typeof (col as any).accessorKey === "string";
        }
      )
      .filter((col) => !col.accessorKey.toLowerCase().includes("action"))
      .map((col) => ({
        header:
          typeof col.header === "function" ? "Column" : (col.header as string),
        accessorKey: col.accessorKey,
      }));
  }, []);

  const areDateRangesEqual = (
    range1?: DateTimeRange,
    range2?: DateTimeRange
  ) => {
    if (!range1 || !range2) return false;

    const format = (dateTimeObj: any) => formatDateForApi(dateTimeObj);

    return (
      format(range1.from) === format(range2.from) &&
      format(range1.to) === format(range2.to)
    );
  };

  const isDateRangeChanged = useMemo(() => {
    return !areDateRangesEqual(dateRange, initialDateRange);
  }, [dateRange, initialDateRange]);

  return (
    <div className="px-6 py-2">
      {showColumnsDialog && selectedRow && (
        <AddColumnsDialogLocal
          key={selectedRow.id}
          isOpen={showColumnsDialog}
          onClose={handleCloseDialog}
          columns={allColumns.filter((col) => col.accessorKey !== "id")}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          selectedRow={selectedRow}
        />
      )}

      <div>
        <div className="flex md:flex-col xl:flex-row flex-col items-start md:items-start xl:items-center justify-between mb-4 md:gap-4 xl:gap-30">
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <div ref={datePickerRef}>
              <DateTimePickerWithRange disableFutureDates={true} />
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button
                className="bg-primary text-white hover:bg-primary cursor-pointer px-2 md:px-8"
                variant="outline"
                size="default"
                onClick={handleResetFilters}
                disabled={!isDateRangeChanged}
              >
                Reset
              </Button>
              <ButtonWithIcon
                variant="outline"
                size="default"
                iconSrc={"/icons/excel.svg"}
                label="Excel"
                iconPosition="right"
                className="bg-primary text-white hover:bg-primary cursor-pointer px-2 md:px-5"
                onClick={() => handleExport("excel")}
                disabled={isLoading}
              />
              <ButtonWithIcon
                variant="outline"
                size="default"
                className="bg-primary text-white hover:bg-primary cursor-pointer px-2 md:px-6"
                iconSrc={"/icons/pdf.svg"}
                label="PDF"
                iconPosition="right"
                onClick={() => handleExport("pdf")}
                disabled={isLoading}
              />
            </div>
          </div>
          <div
            id="search-container"
            className="w-full md:max-w-sm xl:max-w-md mt-5 md:mt-0"
          ></div>
        </div>
        <DataTable
          showAddButton={false}
          columns={partsHistoryColumns(handleOpenEdit, pagination)}
          data={data}
          serverSide={true}
          serverSideOptions={{
            totalCount,
            isLoading,
          }}
          onPaginationChange={handlePaginationChange}
          onSortingChange={onTableSortingChange}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search by Part Number, Internal PN, etc."
          initialSearchTerm={searchTerm}
          mobileCardRenderer={renderMobileCard}
          visibleColumns={visibleColumns}
        />
      </div>
    </div>
  );
};

export default PartsHistoryPage;
