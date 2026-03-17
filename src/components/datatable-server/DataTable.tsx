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
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { DataTableSkeleton } from "./DatatableSkeleton";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
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
  const end = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    totalItems
  );

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  useEffect(() => {
    if (!serverSideOptions?.isLoading && data.length > 0) {
      setFetchedOnce(true);
    }
  }, [serverSideOptions?.isLoading, data]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (serverSide && onSearchChange) {
        onSearchChange(searchTerm);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, serverSide, onSearchChange]);

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
          "pl-3 pr-10 py-1 w-full border bg-white border-black rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent";

        const iconContainer = document.createElement("div");
        iconContainer.className =
          "absolute inset-y-0 right-2 flex items-center pl-3 pointer-events-none";
        iconContainer.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-gray-400">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        `;

        inputElement.addEventListener("input", (e) => {
          const target = e.target as HTMLInputElement;
          setSearchTerm(target.value);
        });

        inputElement.addEventListener("keypress", (e) => {
          if (e.key === "Enter" && onSearchChange) {
            onSearchChange((e.target as HTMLInputElement).value);
          }
        });

        searchInput.appendChild(inputElement);
        searchInput.appendChild(iconContainer);
        container.appendChild(searchInput);
      }
    }

    return () => {
      if (searchContainerId) {
        const container = document.getElementById(searchContainerId);
        if (container) {
          container.innerHTML = "";
        }
      }
    };
  }, [serverSide, onSearchChange, searchContainerId, searchPlaceholder]);

  useEffect(() => {
    if (serverSide && onSearchChange && searchContainerId) {
      const container = document.getElementById(searchContainerId);
      if (container) {
        const inputElement = container.querySelector("input");
        if (inputElement) {
          inputElement.value = searchTerm;
        }
      }
    }
  }, [searchTerm, searchContainerId, serverSide, onSearchChange]);

  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const newSorting =
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting)
        : updaterOrValue;

    // If clicking the same column that's already sorted
    if (sorting.length > 0 && newSorting.length > 0) {
      const currentSort = sorting[0];
      const nextSort = newSorting[0];

      // If clicking the same column and it's already in desc order
      if (
        currentSort.id === nextSort.id &&
        currentSort.desc &&
        !nextSort.desc
      ) {
        // Clear sorting which will trigger the default updatedAt desc
        setSorting([]);
        if (serverSide && onSortingChange) {
          onSortingChange([]);
        }
        return;
      }
    }

    setSorting(newSorting);
    if (serverSide && onSortingChange) {
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
    if (serverSide && onPaginationChange) {
      onPaginationChange(newPagination);
    }
  };

  const filteredColumns = columns.filter((column) => {
    const accessorKey =
      "accessorKey" in column ? column.accessorKey : column.id;
    return visibleColumns
      ? visibleColumns.includes(accessorKey as string)
      : true;
  });

  const table = useReactTable({
    data,
    columns: filteredColumns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: serverSide,
    manualPagination: serverSide,
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    state: {
      sorting,
      pagination,
    },
    pageCount:
      serverSide && serverSideOptions
        ? Math.ceil(serverSideOptions.totalCount / pagination.pageSize)
        : undefined,
  });

  // Expose table instance through the ref
  if (tableRef) {
    tableRef.current = table;
  }

  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
      return;
    }

    const path = location.pathname;

    if (path.startsWith("/admins")) {
      navigate("/admins/new");
    } else if (path.startsWith("/provider/queue")) {
      navigate("/provider/queue/new");
    } else if (path.startsWith("/provider/verified")) {
      navigate("/provider/verified/new");
    } else if (path.startsWith("/provider/blocked")) {
      navigate("/provider/blocked/new");
    } else if (path.startsWith("/provider")) {
      navigate("/provider/new");
    } else if (path.startsWith("/blog")) {
      navigate("/blog/add");
    } else if (path.startsWith("/resource")) {
      navigate("/resource/add");
    } else {
      navigate(`${path}/new`);
    }
  };

  const getAccessorKey = (column: ColumnDef<TData, unknown>) => {
    return "accessorKey" in column ? (column.accessorKey as string) : undefined;
  };

  return (
    <div className="relative">
      {serverSide && onSearchChange && !searchContainerId && (
        <div className="mb-4 flex items-center justify-between">
          {showAddButton && (
            <Button
              className="bg-primary rounded-2xl w-20 text-white cursor-pointer hover:bg-primary/80"
              size="default"
              variant="outline"
              onClick={handleAddClick}
            >
              Add +
            </Button>
          )}
          <div className="relative w-full max-w-md ml-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-3 pr-8 py-1 w-full border bg-white border-black rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent"
            />

            {/* Conditionally show cancel button or search icon */}
            <div className="absolute inset-y-0 right-2 flex items-center pl-3">
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-gray-400 hover:text-black focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              ) : (
                <Search className="h-4 w-4 text-gray-400 pointer-events-none" />
              )}
            </div>
          </div>
        </div>
      )}

      {isMobile ? (
        <div className="space-y-4">
          {serverSideOptions?.isLoading ? (
            <MobileCardSkeletonLoader count={5} />
          ) : data.length === 0 ? (
            <div className="text-center p-8">
              <p>No results found</p>
            </div>
          ) : (
            <>
              {mobileCardRenderer ? (
                data.map((row, index) => {
                  const filteredRow: Partial<TData> = {};

                  for (const key of Object.keys(row)) {
                    let shouldInclude = true;
                    if (visibleColumns) {
                      shouldInclude = visibleColumns.includes(key);
                    }

                    if (shouldInclude) {
                      (filteredRow as any)[key] = row[key as keyof TData];
                    }
                  }

                  return (
                    <React.Fragment key={`mobile-card-${index}`}>
                      {mobileCardRenderer(
                        filteredRow as TData,
                        pagination.pageIndex * pagination.pageSize + index
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {data.map((row, rowIndex) => (
                        <tr
                          key={`mobile-row-${rowIndex}`}
                          className="border-b last:border-b-0"
                        >
                          {filteredColumns.map((col, colIndex) => {
                            const key = getAccessorKey(col);
                            const value = key ? row[key as keyof TData] : "";

                            return (
                              <td
                                key={`mobile-col-${colIndex}`}
                                className="p-3"
                              >
                                {col.header &&
                                  typeof col.header === "string" && (
                                    <div className="font-semibold text-gray-600">
                                      {col.header}
                                    </div>
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

          <div className="py-4 px-0 flex flex-col items-center justify-between border-t mt-4">
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

              <span className="relative text-[10px] w-[80%]">
                Page {pagination.pageIndex + 1} of {table.getPageCount() || 1}
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
              <div>{`Showing ${start}-${end} of ${
                serverSideOptions?.totalCount || totalItems
              }`}</div>
              <Select
                defaultValue={itemsPerPage}
                onValueChange={(value) => {
                  setItemsPerPage(value);
                  const newPagination = {
                    ...pagination,
                    pageIndex: 0,
                    pageSize: parseInt(value),
                  };
                  setPagination(newPagination);
                  if (serverSide && onPaginationChange) {
                    onPaginationChange(newPagination);
                  }
                }}
              >
                <SelectTrigger className="w-[100px] h-8 bg-white rounded-sm text-black border border-primary text-xs">
                  <SelectValue placeholder="Show 10" />
                </SelectTrigger>
                <SelectContent className="text-primary">
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
          <div className="max-h-[80vh] overflow-auto scrollbar-thin shadow-sm border-gray-200 rounded-md bg-white">
            <table className="w-full text-sm text-gray-400 align-top">
              <thead className="sticky top-0 border-b border-gray-200 bg-[#9ebcdb2b]  text-primary font-medium z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-2 text-left font-medium text-black-700  cursor-pointer select-none whitespace-nowrap"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1 ">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                      <th className="px-4 py-3 text-left font-medium text-gray-700 ">
                        Actions
                      </th>
                    )}
                  </tr>
                ))}
              </thead>
              <tbody>
                {serverSideOptions?.isLoading ? (
                  <tr>
                    <td colSpan={columns.length + (actions ? 1 : 0)}>
                      <DataTableSkeleton columnCount={3} rowCount={10} />
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
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
                          {/* @ts-expect-error  non fix type*/}
                          {cell.column.columnDef.accessorKey === "action" ? (
                            // Return empty string for action column
                            ""
                          ) : cell.getValue() === undefined ||
                            cell.getValue() === null ||
                            cell.getValue() === "" ? (
                            <span className="text-primary">N/A</span>
                          ) : (
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
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

                {Array.from({ length: table.getPageCount() || 1 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => table.setPageIndex(i)}
                    className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer ${
                      pagination.pageIndex === i
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))
                  .slice(0, 1)
                  .concat(
                    pagination.pageIndex > 2 ? (
                      <span key="ellipsis1">...</span>
                    ) : (
                      []
                    )
                  )
                  .concat(
                    Array.from(
                      { length: table.getPageCount() || 1 },
                      (_, i) => i
                    )
                      .slice(
                        Math.max(1, pagination.pageIndex - 1),
                        Math.min(
                          table.getPageCount() - 1 || 0,
                          pagination.pageIndex + 2
                        )
                      )
                      .map((i) => (
                        <button
                          key={i}
                          onClick={() => table.setPageIndex(i)}
                          className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer ${
                            pagination.pageIndex === i
                              ? "bg-primary text-white"
                              : "text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))
                  )
                  .concat(
                    pagination.pageIndex < (table.getPageCount() - 3 || 0) ? (
                      <span key="ellipsis2">....</span>
                    ) : (
                      []
                    )
                  )
                  .concat(
                    table.getPageCount() > 1 ? (
                      <button
                        key={table.getPageCount() - 1}
                        onClick={() =>
                          table.setPageIndex(table.getPageCount() - 1)
                        }
                        className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer ${
                          pagination.pageIndex === table.getPageCount() - 1
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {table.getPageCount()}
                      </button>
                    ) : (
                      []
                    )
                  )}
                <button
                  type="button"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="flex items-center px-2 py-1 text-black-400 hover:text-gray-600 disabled:text-gray-300 cursor-pointer"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-black text-sm">
              <div>{`Showing ${start}-${end} of ${
                serverSideOptions?.totalCount || totalItems
              }`}</div>
              <Select
                defaultValue={itemsPerPage}
                onValueChange={(value) => {
                  setItemsPerPage(value);
                  const newPagination = {
                    ...pagination,
                    pageIndex: 0,
                    pageSize: parseInt(value),
                  };
                  setPagination(newPagination);
                  if (serverSide && onPaginationChange) {
                    onPaginationChange(newPagination);
                  }
                }}
              >
                <SelectTrigger className="w-[100px] bg-white rounded-sm text-black border border-primary text-xs">
                  <SelectValue placeholder="Show 10" />
                </SelectTrigger>
                <SelectContent className="text-primary">
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
