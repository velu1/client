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
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
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
  const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems);

  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const newSorting = typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue;
    setSorting(newSorting);
    if (onSortingChange) onSortingChange(newSorting);
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updaterOrValue) => {
    const newPagination = typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue;
    setPagination(newPagination);
    if (onPaginationChange) onPaginationChange(newPagination);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    state: { sorting, pagination },
    pageCount: Math.ceil(totalItems / pagination.pageSize),
  });

  const pageCount = table.getPageCount() || 1;
  const currentPage = pagination.pageIndex;

  const getPageNumbers = () => {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i);
    const pages: (number | "…")[] = [0];
    if (currentPage > 2) pages.push("…");
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(pageCount - 2, currentPage + 1); i++) pages.push(i);
    if (currentPage < pageCount - 3) pages.push("…");
    pages.push(pageCount - 1);
    return pages;
  };

  const PaginationBar = () => (
    <div className="flex items-center justify-between px-1 pt-4 pb-1 text-sm text-gray-500">
      <span className="text-xs tabular-nums">
        Showing <span className="font-medium text-gray-700">{start}–{end}</span> of{" "}
        <span className="font-medium text-gray-700">{totalItems}</span>
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={15} />
        </button>

        {getPageNumbers().map((page, i) =>
          page === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-gray-400 text-xs select-none">…</span>
          ) : (
            <button
              key={page}
              onClick={() => table.setPageIndex(page as number)}
              className={`min-w-7.5 h-7.5 px-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentPage === page
                  ? "bg-[#434a52] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {(page as number) + 1}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-gray-400">Rows</span>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            const val = e.target.value;
            setItemsPerPage(val);
            setPagination((prev) => ({ ...prev, pageSize: parseInt(val), pageIndex: 0 }));
          }}
          className="px-2 py-1 border border-gray-200 rounded-lg bg-white text-gray-700 outline-none focus:border-[#434a52] focus:ring-1 focus:ring-[#434a52]/20 cursor-pointer transition-all text-xs"
        >
          {["5", "10", "20", "30"].map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {isMobile ? (
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Inbox size={36} className="mb-3 opacity-40" />
              <p className="text-sm">No results found</p>
            </div>
          ) : (
            <>
              {mobileCardRenderer ? (
                table.getRowModel().rows.map((row, index) => (
                  <React.Fragment key={`mobile-card-${index}`}>
                    {mobileCardRenderer(row.original, pagination.pageIndex * pagination.pageSize + index)}
                  </React.Fragment>
                ))
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                      {table.getRowModel().rows.map((row, rowIndex) => (
                        <tr key={`mobile-row-${rowIndex}`} className="hover:bg-gray-50">
                          <td className="p-3 text-gray-700">
                            {columns[0] &&
                              "accessorKey" in columns[0] &&
                              flexRender(columns[0].cell, {
                                row: { original: row.original },
                                cell: { getValue: () => row.original[(columns[0] as any).accessorKey as keyof TData] },
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
          <PaginationBar />
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-100 shadow-sm bg-white overflow-hidden">
            <div className="overflow-x-auto max-h-[68vh] overflow-y-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-1.5">
                            {typeof header.column.columnDef.header === "string"
                              ? header.column.columnDef.header
                              : flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="h-3 w-3 text-[#434a52]" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="h-3 w-3 text-[#434a52]" />
                              ) : (
                                <ChevronsUpDown className="h-3 w-3 text-gray-300" />
                              )
                            )}
                          </div>
                        </th>
                      ))}
                      {actions && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + (actions ? 1 : 0)}>
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <Inbox size={36} className="mb-3 opacity-40" />
                          <p className="text-sm">No results found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-[#f8f9fa] transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-2.5 whitespace-nowrap text-gray-700">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <PaginationBar />
        </>
      )}
    </div>
  );
}
