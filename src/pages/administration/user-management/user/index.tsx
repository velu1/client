import { DataTable } from "../../../../components/datatable-server/DataTable.tsx";
import { useCallback, useState, useEffect } from "react";
import { userTableColumns } from "./user.config";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { FileSpreadsheet, FileText, Plus } from "lucide-react";
import { UserCard } from "../../../../components/mobilecard/UserCard";
// import excelIcon from "/icons/excel.svg";
// import pdfIcon from "/icons/pdf.svg";
import AddUserDialog from "../../../../components/user/AddUserDialog";
import { getAllUsers } from "../../../../api/administration/users";
import { toast } from "react-fox-toast";
import DialogComponent from "../../../../components/common/DialogComponent.tsx";
import EditUserDialog from "../../../../components/user/EditUserDialog.tsx";
import { generateServerSideReport } from "../../../../utils/reportGenerator.tsx";
import {
  createUsers,
  updateUsers,
  deleteUsers,
} from "../../../../api/administration/users";
import { ColumnDef } from "@tanstack/react-table";

// Define the API user interface to match the API response
interface ApiUser {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  // pin: string;
  // userId: number;
  role: { _id: string; name: string };
  isActive: boolean;
  isDeleted: boolean;
  defaultUser: boolean;
  createdAt: string;
  updatedAt: string;
  id: string;
  _id?: string;
}

// Define the transformed user interface for UI display
export interface UserForDisplay {
  organization: string;
  firstName: string;
  lastName: string;
  email: string;
  role: { _id: string; name: string };
  phoneNumber?: string;
  // pin: string;
  status: string;
  id: string;
  _id?: string;
  // userId: "";
  isActive: boolean;
  // Add any other fields needed for detailed view or actions
}

const UserPage = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserForDisplay[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [allUsers, setAllUsers] = useState<UserForDisplay[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserForDisplay | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [toggleTargetUser, setToggleTargetUser] =
    useState<UserForDisplay | null>(null);
  const [roleId, setRoleId] = useState("");
  const [showToggleDialog, setShowToggleDialog] = useState(false);

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

  // Fetch users from API

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = pagination.pageIndex + 1;
      const sortColumn = sorting.length > 0 ? sorting[0].id : "firstName";
      const sortOrder = sorting.length > 0 && sorting[0].desc ? "desc" : "asc";

      const response = await getAllUsers({
        pagination: {
          page,
          pageSize: pagination.pageSize,
          searchQuery: searchTerm,
          sortColumn,
          sortOrder,
          download: false,
        },
      });

      if (response && response.data) {
        const transformedUsers: UserForDisplay[] = response.data.data.map(
          (apiUser: ApiUser) => ({
            organization: "-",
            firstName: apiUser?.firstName,
            lastName: apiUser?.lastName,
            email: apiUser?.email,
            phoneNumber: apiUser?.phoneNumber,
            // pin: apiUser?.pin,
            role: { _id: apiUser.role?._id, name: apiUser.role?.name },
            status: apiUser?.isActive ? "Active" : "Inactive",
            isActive: apiUser?.isActive,
            id: apiUser?.id,
            // userId: apiUser?.userId,
          })
        );

        setUsers(transformedUsers);
        setAllUsers(transformedUsers);
        setTotalCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, sorting, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter data based on search term
  useEffect(() => {
    fetchUsers();
  }, [pagination, sorting, searchTerm]);

  // Apply sorting to the data
  useEffect(() => {
    if (sorting.length > 0) {
      const sortedUsers = [...users].sort((a, b) => {
        const sortField = sorting[0].id;
        const aValue = a[sortField as keyof UserForDisplay] || "";
        const bValue = b[sortField as keyof UserForDisplay] || "";

        const direction = sorting[0].desc ? -1 : 1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return direction * aValue.localeCompare(bValue);
        }

        return direction * (aValue > bValue ? 1 : -1);
      });

      setUsers(sortedUsers);
    }
  }, [sorting, allUsers]);

  // Calculate pagination

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

  // Handle search change
  const handleSearchChange = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    // Reset to first page when searching
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, []);

  const handleUserSave = async (data: UserForDisplay) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber ?? "",
        // pin: data.pin ?? "0000",
        // userId: Number(data.userId),
        role: roleId,
        id: data.id,
        ipConfig: {
          ip: [""],
          type: 1,
        },
        isActive: true,
      };

      const response = selectedUserId
        ? await updateUsers(selectedUserId, payload)
        : await createUsers(payload);

      toast.success(response.message);
      await fetchUsers();
      setShowDialog(false);
      setShowEditDialog(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      console.error("Save error:", error);
    }
  };

  //edit roles
  const handleEditClick = (user: UserForDisplay) => {
    setSelectedUser(user);
    setSelectedUserId(user.id);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (role: UserForDisplay) => {
    setSelectedUserId(role.id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async (id: string) => {
    try {
      await deleteUsers(id);
      toast.success("User deleted successfully");
      await fetchUsers();
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Delete failed");
    } finally {
      setShowDeleteDialog(false);
      setSelectedUserId(null);
    }
  };

  const handleSwitchClick = (user: UserForDisplay) => {
    setToggleTargetUser(user);
    setShowToggleDialog(true);
  };

  const confirmToggleStatus = async () => {
    if (!toggleTargetUser) return;

    const isNowActive = !(toggleTargetUser.status === "Active");

    const payload = {
      firstName: toggleTargetUser.firstName,
      lastName: toggleTargetUser.lastName,
      email: toggleTargetUser.email,
      phoneNumber: toggleTargetUser.phoneNumber ?? "",
      // pin: toggleTargetUser.pin ?? "0000",
      // userId: Number(toggleTargetUser.userId) || 0,
      role: toggleTargetUser.role._id,
      id: toggleTargetUser._id ?? "",
      ipConfig: {
        ip: [""],
        type: 1,
      },
      isActive: isNowActive,
      status: isNowActive ? "Active" : "Inactive",
    };

    try {
      const response = await updateUsers(toggleTargetUser.id, payload);

      toast.success(response.message);
      await fetchUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      console.error("Toggle status error:", error);
    } finally {
      setShowToggleDialog(false);
      setToggleTargetUser(null);
    }
  };

  const renderMobileCard = useCallback((row: UserForDisplay, index: number) => {
    return (
      <UserCard
        data={row}
        index={index}
        onDelete={() => confirmDelete(row.id)}
        onEdit={() => handleEditClick(row)}
        onToggleStatus={() => handleSwitchClick(row)}
        isActive={row.isActive}
      />
    );
  }, []);

  const getFilteredColumns = useCallback(() => {
    console.log("=== START: getFilteredColumns ===");
    const allColumns = userTableColumns();
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
          // Modified condition to only filter standalone 'id' and not 'email'
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

  const fetchAllUsers = useCallback(async (options: any) => {
    console.log("=== START: fetchAllUsers ===");
    console.log("Fetch options:", options);

    const sanitizedSortOrder = options.sortOrder === "desc" ? "desc" : "asc";

    const response = await getAllUsers({
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
      console.error("Failed to fetch users or no data returned");
      console.log("=== END: fetchAllUsers (error) ===");
      return { tableData: [], totalCount: 0 };
    }

    console.log("Raw API response data:", response.data.data);

    const transformedData = response.data.data.map((user: ApiUser) => {
      console.log("Processing user:", user);
      // Create the base object with all fields
      const transformed = {
        organization: "-",
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        "role.name": user.role.name,
        phoneNumber: user.phoneNumber,
        status: user.isActive ? "Active" : "Inactive",
        id: user.id,
        // userId: user.userId,
      };

      console.log("Transformed user data:", transformed);
      return transformed;
    });

    console.log("Final transformed data:", transformedData);
    console.log("=== END: fetchAllUsers ===");
    return {
      tableData: transformedData,
      totalCount: response.data.totalCount,
    };
  }, []);

  const handleExport = useCallback(
    async (format: "excel" | "pdf") => {
      console.log("=== START: handleExport ===");
      try {
        setIsLoading(true);
        const columns = getFilteredColumns();
        console.log("Export columns:", columns);

        await generateServerSideReport(
          {
            fetchDataFn: fetchAllUsers,
            columns,
            reportName: "User Management Report",
            primaryColor: "#000000",
            secondaryColor: "#f0f0f0",
            initialParams: {
              sortColumn: sorting.length > 0 ? sorting[0].id : "firstName",
              sortOrder: sorting.length > 0 && sorting[0].desc ? "desc" : "asc",
              searchQuery: searchTerm,
            },
          },
          format
        );
        console.log("=== END: handleExport (success) ===");
        toast.success(`${format.toUpperCase()} report generated successfully`);
      } catch (error) {
        console.error("=== END: handleExport (error) ===", error);
        toast.error(`Failed to export to ${format.toUpperCase()}`);
        console.error(`Export error:`, error);
      } finally {
        setIsLoading(false);
      }
    },
    [sorting, searchTerm, fetchAllUsers, getFilteredColumns]
  );

  return (
    <div className="px-6 py-2">
      {showDialog && (
        <AddUserDialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          onSave={handleUserSave}
          users={users}
          setRoleId={setRoleId}
        />
      )}
      {showEditDialog && selectedUser && (
        <EditUserDialog
          open={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedUser(null);
          }}
          onSave={handleUserSave}
          initialData={selectedUser}
          users={users}
          setRoleId={setRoleId}
        />
      )}
      {showDeleteDialog && (
        <DialogComponent
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
          }}
          title="Confirmation"
          subtitle="Are you sure, you wish to delete the user"
          cancelButtonText="No"
          saveButtonText="Yes"
          onSave={() => {
            selectedUserId && confirmDelete(selectedUserId);
          }}
        />
      )}
      {showToggleDialog && (
        <DialogComponent
          isOpen={showToggleDialog}
          onClose={() => {
            setShowToggleDialog(false);
          }}
          title="Confirmation"
          subtitle={`Are you sure you want to ${
            toggleTargetUser?.status === "Active" ? "disable" : "enable"
          } the user?`}
          cancelButtonText="No"
          saveButtonText="Yes"
          onSave={confirmToggleStatus}
        />
      )}
      <div>
        <div className="flex flex-col md:flex-row items-start justify-between md:gap-[35%] mb-4 w-full">
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 bg-[#434a52] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#676e6e] transition-colors cursor-pointer"
              onClick={() => {
                setSelectedUserId(null);
                setSelectedUser(null);
                setShowDialog(true);
              }}
            >
              <Plus size={14} />
              Add
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
          {/* Right: Search Input */}
          <div className="w-full max-w-md mt-10 md:mt-0 md:max-w-sm">
            <div
              id="search-container"
              className="w-full md:max-w-sm xl:max-w-md mt-5 md:mt-0"
            ></div>
          </div>
        </div>
        <DataTable
          showAddButton={false}
          columns={
            userTableColumns(
              handleEditClick,
              handleDeleteClick,
              handleSwitchClick,
              pagination
            ) as ColumnDef<UserForDisplay>[]
          }
          data={users}
          serverSide={true}
          serverSideOptions={{
            totalCount,
            isLoading,
          }}
          onPaginationChange={handlePaginationChange}
          onSortingChange={onTableSortingChange}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search by First Name, Last Name, etc."
          initialSearchTerm={searchTerm}
          mobileCardRenderer={renderMobileCard}
        />
      </div>
    </div>
  );
};

export default UserPage;
