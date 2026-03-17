import React from "react";
import { DataTable } from "../../datatable-server/DataTable";
import {
  invoiceSummaryTableColumns,
  InvoiceSummaryRow,
} from "../../../pages/inward-system/parts-in/invoiceSummary.config";
import { InvoiceSummaryCard } from "../../mobilecard/InvoiceSummaryCard";
// import { TextField, InputAdornment } from "@mui/material";
// import { Search } from "lucide-react";

interface InvoiceSummaryTableProps {
  data: InvoiceSummaryRow[];
  loading: boolean;
  page: number;
  pageSize: number;
  search: string;
  sortColumn: string;
  sortOrder: "asc" | "desc";
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (col: string, order: "asc" | "desc") => void;
}

const InvoiceSummaryTable: React.FC<InvoiceSummaryTableProps> = ({
  data,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSortChange,
}) => {
  const totalCount = data.length;

  // You can add a useEffect here to fetch data when searchTerm is used, if needed

  const renderMobileCard = (row: InvoiceSummaryRow, index: number) => {
    return <InvoiceSummaryCard data={row} index={index} />;
  };

  // // Print handler for action column
  // const handlePrintClick = (row: InvoiceSummaryRow) => {
  //   // TODO: Implement print logic for invoice table
  //   console.log("Print row (invoice):", row);
  // };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-center items-center mb-4">
        <h2 className="text-xl font-medium">Invoice Summary</h2>
        {/*
        <div className="w-full md:w-64 mt-4 md:mt-0">
          <TextField
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search className="h-4 w-4 text-gray-400" />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </div>
        */}
      </div>
      <DataTable
        columns={invoiceSummaryTableColumns(page, pageSize)}
        data={data}
        serverSide={true}
        serverSideOptions={{
          totalCount,
          isLoading: loading,
        }}
        onPaginationChange={(pagination) => {
          onPageChange(pagination.pageIndex + 1);
          onPageSizeChange(pagination.pageSize);
        }}
        onSortingChange={(sorting) => {
          if (sorting.length > 0) {
            onSortChange(sorting[0].id, sorting[0].desc ? "desc" : "asc");
          }
        }}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search invoice parts..."
        mobileCardRenderer={renderMobileCard}
      />
    </div>
  );
};

export default InvoiceSummaryTable;
