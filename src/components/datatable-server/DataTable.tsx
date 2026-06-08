import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  PaginationState,
  useReactTable,
  OnChangeFn,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { DataTableSkeleton } from "./DatatableSkeleton";
import { useNavigate, useLocation } from "react-router-dom";
import React from "react";
import { useMediaQuery, BREAKPOINTS } from "../../utils/hooks/useMediaQuery";
import { MobileCardSkeletonLoader } from "../mobilecard/MobileCardSkeleton";

interface ActionButton<TData> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: TData) => void;
}

interface ServerSideOptions {
  totalCount: number;
  isLoading?: boolean;
}

interface DataTableProps<TData> {
  showAddButton?: boolean;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  actions?: ActionButton<TData>[];
  serverSide?: boolean;
  serverSideOptions?: ServerSideOptions;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onSearchChange?: (searchTerm: string) => void;
  searchPlaceholder?: string;
  title?: string;
  headerButtons?: React.ReactNode;
  initialSearchTerm?: string;
  onAddClick?: () => void;
  searchContainerId?: string;
  mobileCardRenderer?: (row: TData, index: number) => React.ReactNode;
  tableRef?: React.RefObject<any>;
  visibleColumns?: string[];
}

export function DataTable<TData extends object>({
  showAddButton = false,
  columns,
  data,
  actions,
  visibleColumns,
  serverSide = false,
  serverSideOptions,
  onPaginationChange,
  onSortingChange,
  onSearchChange,
  searchPlaceholder = "Search...",
  initialSearchTerm = "",
  onAddClick,
  searchContainerId,
  mobileCardRenderer,
  tableRef,
}: Readonly<DataTableProps<TData>>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [fetchedOnce, setFetchedOnce] = useState(false);
  console.log(fetchedOnce);

  const isMobile = useMediaQuery(BREAKPOINTS.md);

  const totalItems = serverSideOptions?.totalCount || 30;
  const start = pagination.pageIndex * pagination.pageSize + 1;
  const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems);

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  useEffect(() => {
    if (!serverSideOptions?.isLoading && data.length > 0) setFetchedOnce(true);
  }, [serverSideOptions?.isLoading, data]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (serverSide && onSearchChange) onSearchChange(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, serverSide, onSearchChange]);

  // External search container support (unchanged)
  useEffect(() => {
    if (serverSide && onSearchChange && searchContainerId) {
      const container = document.getElementById(searchContainerId);
      if (container) {
        container.innerHTML = "";
        const searchInput = document.createElement("div");
        searchInput.className = "relative w-full";
        const inputElement = document.createElement("input");
        inputElement.type = "text";
        inputElement.value = searchTerm;
        inputElement.placeholder = searchPlaceholder;
        inputElement.className =
          "pl-9 pr-4 py-2 w-full border border-gray-200 bg-white rounded-lg text-sm text-gray-700 outline-none focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/15 transition-all";
        const iconContainer = document.createElement("div");
        iconContainer.className = "absolute inset-y-0 left-3 flex items-center pointer-events-none";
        iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
        inputElement.addEventListener("input", (e) => setSearchTerm((e.target as HTMLInputElement).value));
        inputElement.addEventListener("keypress", (e) => {
          if (e.key === "Enter" && onSearchChange) onSearchChange((e.target as HTMLInputElement).value);
        });
        searchInput.appendChild(iconContainer);
        searchInput.appendChild(inputElement);
        container.appendChild(searchInput);
      }
    }
    return () => {
      if (searchContainerId) {
        const container = document.getElementById(searchContainerId);
        if (container) container.innerHTML = "";
      }
    };
  }, [serverSide, onSearchChange, searchContainerId, searchPlaceholder]);

  useEffect(() => {
    if (serverSide && onSearchChange && searchContainerId) {
      const container = document.getElementById(searchContainerId);
      const inputElement = container?.querySelector("input");
      if (inputElement) inputElement.value = searchTerm;
    }
  }, [searchTerm, searchContainerId, serverSide, onSearchChange]);

  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const newSorting = typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue;
    if (sorting.length > 0 && newSorting.length > 0) {
      const cur = sorting[0];
      const next = newSorting[0];
      if (cur.id === next.id && cur.desc && !next.desc) {
        setSorting([]);
        if (serverSide && onSortingChange) onSortingChange([]);
        return;
      }
    }
    setSorting(newSorting);
    if (serverSide && onSortingChange) onSortingChange(newSorting);
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updaterOrValue) => {
    const newPagination = typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue;
    setPagination(newPagination);
    if (serverSide && onPaginationChange) onPaginationChange(newPagination);
  };

  const filteredColumns = columns.filter((column) => {
    const accessorKey = "accessorKey" in column ? column.accessorKey : column.id;
    return visibleColumns ? visibleColumns.includes(accessorKey as string) : true;
  });

  const table = useReactTable({
    data,
    columns: filteredColumns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: serverSide,
    manualPagination: serverSide,
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    state: { sorting, pagination },
    pageCount:
      serverSide && serverSideOptions
        ? Math.ceil(serverSideOptions.totalCount / pagination.pageSize)
        : undefined,
  });

  if (tableRef) tableRef.current = table;

  const handleAddClick = () => {
    if (onAddClick) { onAddClick(); return; }
    const path = location.pathname;
    if (path.startsWith("/admins")) navigate("/admins/new");
    else navigate(`${path}/new`);
  };

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
        <span className="font-medium text-gray-700">{serverSideOptions?.totalCount ?? totalItems}</span>
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
            const newPagination = { pageIndex: 0, pageSize: parseInt(val) };
            setPagination(newPagination);
            if (serverSide && onPaginationChange) onPaginationChange(newPagination);
          }}
          className="px-2 py-1 border border-gray-200 rounded-lg bg-white text-gray-700 outline-none focus:border-[#434a52] focus:ring-1 focus:ring-[#434a52]/20 cursor-pointer transition-all text-xs"
        >
          {["10", "20", "30", "50"].map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Search bar */}
      {serverSide && onSearchChange && !searchContainerId && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {showAddButton && (
            <button
              type="button"
              onClick={handleAddClick}
              className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium bg-[#434a52] text-white hover:bg-[#676e6e] transition-colors"
            >
              Add +
            </button>
          )}
          <div className="relative w-full max-w-xs ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-8 py-2 w-full border border-gray-200 bg-white rounded-lg text-sm text-gray-700 outline-none focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/15 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {isMobile ? (
        <div className="space-y-3">
          {serverSideOptions?.isLoading ? (
            <MobileCardSkeletonLoader count={5} />
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Inbox size={36} className="mb-3 opacity-40" />
              <p className="text-sm">No results found</p>
            </div>
          ) : (
            <>
              {mobileCardRenderer ? (
                data.map((row, index) => {
                  const filteredRow: Partial<TData> = {};
                  for (const key of Object.keys(row)) {
                    if (!visibleColumns || visibleColumns.includes(key)) {
                      (filteredRow as any)[key] = row[key as keyof TData];
                    }
                  }
                  return (
                    <React.Fragment key={`mobile-card-${index}`}>
                      {mobileCardRenderer(filteredRow as TData, pagination.pageIndex * pagination.pageSize + index)}
                    </React.Fragment>
                  );
                })
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                      {data.map((row, rowIndex) => (
                        <tr key={`mobile-row-${rowIndex}`} className="hover:bg-gray-50">
                          {filteredColumns.map((col, colIndex) => {
                            const key = "accessorKey" in col ? (col.accessorKey as string) : undefined;
                            const value = key ? row[key as keyof TData] : "";
                            return (
                              <td key={`mobile-col-${colIndex}`} className="p-3 text-gray-700">
                                {col.header && typeof col.header === "string" && (
                                  <div className="text-xs font-semibold text-gray-400 mb-0.5">{col.header}</div>
                                )}
                                <div>{String(value ?? "")}</div>
                              </td>
                            );
                          })}
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
            <div className="overflow-x-auto max-h-[72vh] overflow-y-auto scrollbar-thin">
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
                            {flexRender(header.column.columnDef.header, header.getContext())}
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
                  {serverSideOptions?.isLoading ? (
                    <tr>
                      <td colSpan={filteredColumns.length + (actions ? 1 : 0)}>
                        <DataTableSkeleton columnCount={filteredColumns.length} rowCount={8} />
                      </td>
                    </tr>
                  ) : table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={filteredColumns.length + (actions ? 1 : 0)}>
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <Inbox size={36} className="mb-3 opacity-40" />
                          <p className="text-sm">No results found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-[#f8f9fa] transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-2.5 whitespace-nowrap text-gray-700">
                            {/* @ts-expect-error non fix type */}
                            {cell.column.columnDef.accessorKey === "action" ? (
                              ""
                            ) : cell.getValue() === undefined || cell.getValue() === null || cell.getValue() === "" ? (
                              <span className="text-gray-300 text-xs">—</span>
                            ) : (
                              flexRender(cell.column.columnDef.cell, cell.getContext())
                            )}
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
