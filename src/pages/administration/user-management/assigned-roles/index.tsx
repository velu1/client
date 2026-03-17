import { DataTable } from "../../../../components/datatable-server/DataTable.tsx";
import { useCallback, useState } from "react";
import { assignedRoleTableColumns } from "./assigned-role.config";
import { Button } from "../../../../components/ui/button";
import DialogComponent from "../../../../components/common/DialogComponent";
import { AssignedRoleCard } from "../../../../components/mobilecard/AssignedRoleCard";
import { useEffect } from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { assignRoles } from "../../../../api/administration/assignRoles";
import AddColumnsDialog from "../../../../components/common/AddColumnsDialog";

interface ApiAssignRoles {
  id: string;
  name: string;
  description: string;
  rolePermission: string[];
  defaultRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignRolesDisplay {
  id: string;
  name: string;
  inward: string;
  defaultRole: boolean;
  permissionCount: string[];
}

const AssignedRolesPage = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [assignRole, setAssignRole] = useState<AssignRolesDisplay[]>([]);
  const [allAssignRole, setAllAssignRole] = useState<AssignRolesDisplay[]>([]);
  const [selectedRole, setSelectedRole] = useState<AssignRolesDisplay | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "updatedAt",
      desc: true,
    },
  ]);

  console.log(allAssignRole);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchUsers = useCallback(async () => {
    console.log("fetching users", isLoading);
    console.log("pagination", pagination);
    setIsLoading(true);
    try {
      const page = pagination.pageIndex + 1;
      const sortColumn = sorting.length > 0 ? sorting[0].id : "name";
      const sortOrder = sorting.length > 0 && sorting[0].desc ? "desc" : "asc";

      const response = await assignRoles({
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
        const transformedUsers: AssignRolesDisplay[] = response.data.data.map(
          (apiRoles: ApiAssignRoles) => ({
            id: apiRoles.id,
            organization: "-", // Default value or get from API if available
            name: apiRoles.name,
            inward: apiRoles.description,
            permissionCount: apiRoles.rolePermission ?? [],
            defaultRole: apiRoles.defaultRole,
            createdAt: apiRoles.createdAt,
            time: new Date(apiRoles.createdAt).toLocaleString(),
          })
        );

        setAllAssignRole(transformedUsers);
        setAssignRole(transformedUsers);
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

  const handleDialogConfirm = () => {
    setShowDialog(false);
  };

  useEffect(() => {
    if (sorting.length > 0) {
      const sorted = [...allAssignRole].sort((a, b) => {
        const field = sorting[0].id as keyof AssignRolesDisplay;
        const aValue = a[field] ?? "";
        const bValue = b[field] ?? "";

        const direction = sorting[0].desc ? -1 : 1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return direction * aValue.localeCompare(bValue);
        }

        return direction * (aValue > bValue ? 1 : -1);
      });

      setAssignRole(sorted);
    }
  }, [sorting, allAssignRole]);

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPagination(newPagination);
    },
    []
  );

  const handleSortingChange = useCallback((newSorting: SortingState) => {
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

  const handleEditClick = (role: AssignRolesDisplay) => {
    setSelectedRole(role);
    setShowColumnsDialog(true);
  };

  // Mobile card renderer for the DataTable
  const renderMobileCard = (row: AssignRolesDisplay, index: number) => {
    return (
      <AssignedRoleCard
        key={row.id}
        data={row}
        index={index}
        selectedRole={selectedRole?.id === row.id ? selectedRole : null}
        onEdit={(role) => {
          setSelectedRole(role);
          setShowColumnsDialog(true);
        }}
      />
    );
  };

  return (
    <div className="px-6 py-2">
      {showDialog && (
        <DialogComponent
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          title="Edit Assigned Role"
          // @ts-expect-error non fix type
          message="Do you want to save changes to this assigned role?"
          buttons={
            <>
              <Button
                variant="outline"
                size="default"
                onClick={() => setShowDialog(false)}
              >
                No
              </Button>
              <Button
                size="default"
                className="bg-primary text-white"
                onClick={handleDialogConfirm}
              >
                Yes
              </Button>
            </>
          }
        />
      )}
      {showColumnsDialog && selectedRole && (
        <AddColumnsDialog
          isOpen={showColumnsDialog}
          onClose={() => setShowColumnsDialog(false)}
          rolePermissionArr={selectedRole.permissionCount ?? []}
          roleId={selectedRole.id}
          onPermissionsUpdated={fetchUsers}
          assignedRoles={true}
        />
      )}

      <div>
        <DataTable
          showAddButton={false}
          // @ts-expect-error - TODO: fix this
          columns={assignedRoleTableColumns(handleEditClick, pagination)}
          data={assignRole}
          serverSide={true}
          serverSideOptions={{
            totalCount,
            isLoading,
          }}
          onPaginationChange={handlePaginationChange}
          onSortingChange={onTableSortingChange}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search by Role Name, Inward, etc."
          initialSearchTerm={searchTerm}
          sorting={sorting}
          mobileCardRenderer={renderMobileCard}
        />
      </div>
    </div>
  );
};

export default AssignedRolesPage;
