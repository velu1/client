import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  PaginationState,
  useReactTable,
  OnChangeFn,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import React from "react";
import { useMediaQuery, BREAKPOINTS } from "../../utils/hooks/useMediaQuery";

interface ActionButton<TData> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: TData) => void;
}

interface DataTableProps<TData> {
  showAddButton?: boolean;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  actions?: ActionButton<TData>[];
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onSearchChange?: (searchTerm: string) => void;
  searchPlaceholder?: string;
  title?: string;
  headerButtons?: React.ReactNode;
  initialSearchTerm?: string;
  onAddClick?: () => void;
  mobileCardRenderer?: (row: TData, index: number) => React.ReactNode;
}

export function DataTable<TData>({
  columns,
  data,
  actions,
  onPaginationChange,
  onSortingChange,

  mobileCardRenderer,
}: Readonly<DataTableProps<TData>>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const isMobile = useMediaQuery(BREAKPOINTS.md);

  const totalItems = data.length;
  const start = pagination.pageIndex * pagination.pageSize + 1;
  const end = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    totalItems
  );

  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const newSorting =
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting)
        : updaterOrValue;

    setSorting(newSorting);
    if (onSortingChange) {
      onSortingChange(newSorting);
    }
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (
    updaterOrValue
  ) => {
    const newPagination =
      typeof updaterOrValue === "function"
        ? updaterOrValue(pagination)
        : updaterOrValue;

    setPagination(newPagination);
    if (onPaginationChange) {
      onPaginationChange(newPagination);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    state: {
      sorting,
      pagination,
    },
    pageCount: Math.ceil(totalItems / pagination.pageSize),
  });

  // const handleAddClick = () => {
  //   if (onAddClick) {
  //     onAddClick();
  //     return;
  //   }

  //   const path = location.pathname;
  //   navigate(`${path}/new`);
  // };

  const getAccessorKey = (column: ColumnDef<TData, unknown>) => {
    return "accessorKey" in column ? (column.accessorKey as string) : undefined;
  };

  return (
    <div className="relative">
      {isMobile ? (
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="text-center p-8">
              <p>No results found</p>
            </div>
          ) : (
            <>
              {mobileCardRenderer ? (
                table
                  .getRowModel()
                  .rows.map((row, index) => (
                    <React.Fragment key={`mobile-card-${index}`}>
                      {mobileCardRenderer(
                        row.original,
                        pagination.pageIndex * pagination.pageSize + index
                      )}
                    </React.Fragment>
                  ))
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {table.getRowModel().rows.map((row, rowIndex) => (
                        <tr
                          key={`mobile-row-${rowIndex}`}
                          className="border-b last:border-b-0"
                        >
                          <td className="p-3 var(--font-BreeSerif)">
                            {columns[0] &&
                              getAccessorKey(columns[0]) &&
                              flexRender(columns[0].cell, {
                                row: { original: row.original },
                                cell: {
                                  getValue: () =>
                                    row.original[
                                      getAccessorKey(columns[0]) as keyof TData
                                    ],
                                },
                              } as any)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          <div className="py-4 px-3 flex flex-col items-center justify-between border-t mt-4">
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 rounded-md text-sm flex items-center disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="text-sm">
                Page {pagination.pageIndex + 1} of {table.getPageCount()}
              </span>

              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 rounded-md text-sm flex items-center disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-black text-xs">
              <div>{`Showing ${start}-${end} of ${totalItems}`}</div>
              <Select
                value={itemsPerPage}
                onValueChange={(value) => {
                  setItemsPerPage(value);
                  const newPageSize = parseInt(value);
                  setPagination((prev) => ({
                    ...prev,
                    pageSize: newPageSize,
                    pageIndex: 0,
                  }));
                }}
              >
                <SelectTrigger className="w-[90px] h-8 bg-white rounded-sm text-black border border-primary text-xs">
                  <SelectValue placeholder="Show 10" />
                </SelectTrigger>
                <SelectContent className="text-primary">
                  <SelectItem value="5">Show 5</SelectItem>
                  <SelectItem value="10">Show 10</SelectItem>
                  <SelectItem value="20">Show 20</SelectItem>
                  <SelectItem value="30">Show 30</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto scrollbar-thin shadow-sm border-white rounded-md h-[64vh] bg-white">
            <table className="w-full text-sm text-gray-400 align-top">
              <thead className="sticky top-0 border-b border-gray-200 bg-primary/20 text-primary font-bree z-100">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-2 text-left text-gray-700 cursor-pointer select-none whitespace-nowrap"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          <span style={{ fontFamily: "Bree Serif, serif" }}>
                            {typeof header.column.columnDef.header === "string"
                              ? header.column.columnDef.header
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </span>
                          {header.column.getCanSort() && (
                            <>
                              {header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="h-4 w-4" />
                              ) : (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </>
                          )}
                        </div>
                      </th>
                    ))}
                    {actions && (
                      <th className="px-4 py-3 text-left font-bree text-gray-700">
                        Actions
                      </th>
                    )}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (actions ? 1 : 0)}
                      className="px-4 py-8 text-center"
                    >
                      No results found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-200 hover:bg-gray-100 transition-colors text-black"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-2 whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bottom-0 py-4 px-6 flex items-center justify-center mt-4">
            <div className="flex items-center justify-center max-w-screen-xl mx-auto">
              <div className="flex items-center ml-20 gap-4">
                <button
                  type="button"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="flex items-center px-2 py-1 text-black-400 hover:text-gray-600 disabled:text-gray-300 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                {Array.from({ length: table.getPageCount() }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => table.setPageIndex(i)}
                    className={`px-3 py-1 rounded-md text-sm var(--font-BreeSerif) cursor-pointer ${
                      pagination.pageIndex === i
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="flex items-center px-2 py-1 text-black-400 hover:text-gray-600 disabled:text-gray-300 var(--font-BreeSerif) cursor-pointer"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-black text-sm">
              <div>{`Showing ${start}-${end} of ${totalItems}`}</div>
              <Select
                value={itemsPerPage}
                onValueChange={(value) => {
                  setItemsPerPage(value);
                  const newPageSize = parseInt(value);
                  setPagination((prev) => ({
                    ...prev,
                    pageSize: newPageSize,
                    pageIndex: 0,
                  }));
                }}
              >
                <SelectTrigger className="w-[100px] bg-white rounded-sm text-black border border-primary text-xs">
                  <SelectValue placeholder="Show 10" />
                </SelectTrigger>
                <SelectContent className="text-primary var(--font-BreeSerif)">
                  <SelectItem value="5">Show 5</SelectItem>
                  <SelectItem value="10">Show 10</SelectItem>
                  <SelectItem value="20">Show 20</SelectItem>
                  <SelectItem value="30">Show 30</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
