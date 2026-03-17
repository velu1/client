import { DataTable } from "../../../../components/datatable-server/DataTable.tsx";
import { useCallback, useState } from "react";
import { roleTableColumns } from "./role.config";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { Button } from "../../../../components/ui/button";
import { ButtonWithIcon } from "../../../../components/ui/button-with-icon";
import { RoleCard } from "../../../../components/mobilecard/RoleCard";
// import excelIcon from "/icons/excel.svg";
// import pdfIcon from "/icons/pdf.svg";
import RoleDialog from "../../../../components/roles/RoleDialog";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getAllRoles, updateRoles } from "../../../../api/administration/roles";
import DialogComponent from "../../../../components/common/DialogComponent";
import { toast } from "react-fox-toast";
import { generateServerSideReport } from "../../../../utils/reportGenerator.tsx";
import { createRoles, deleteRoles } from "../../../../api/administration/roles";
import EditRoleDialog from "../../../../components/roles/EditRoleDialog.tsx";

interface ApiRoles {
  name: string;
  description: string;
  defaultRole: boolean;
  phoneNumber: string;
  pin: string;
  userId: number;
  rolePermission: string[];
  role: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface RolesForDisplay {
  id: string;
  name: string;
  description: string;
  permissionCount: number;
  defaultRole: boolean;
  createdAt: string;
  time: string;
}

interface RoleData {
  name: string;
  description: string;
}

const RolesPage = () => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState<RolesForDisplay[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [allRoles, setAllRoles] = useState<RolesForDisplay[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "updatedAt",
      desc: true,
    },
  ]);

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RolesForDisplay | null>(
    null
  );
  //fetching roles
  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = pagination.pageIndex + 1;
      const sortColumn = sorting.length > 0 ? sorting[0].id : "name";
      const sortOrder = sorting.length > 0 && sorting[0].desc ? "desc" : "asc";

      const response = await getAllRoles({
        pagination: {
          page,
          pageSize: pagination.pageSize,
          searchQuery: searchTerm,
          sortColumn,
          sortOrder,
          download: false,
        },
      });

      console.log("Response", response);

      if (response && response.data) {
        const transformed: RolesForDisplay[] = response.data.data.map(
          (role: ApiRoles) => ({
            id: role.id,
            organization: "-",
            name: role.name,
            description: role.description,
            permissionCount: role.rolePermission,
            defaultRole: role.defaultRole,
            createdAt: role.createdAt,
            time: new Date(role.createdAt).toLocaleString(),
          })
        );

        setRoles(transformed);
        setAllRoles(transformed);
        setTotalCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, sorting, searchTerm]);

  useEffect(() => {
    fetchRoles();
  }, []);

  // Filter data based on search term
  useEffect(() => {
    fetchRoles();
  }, [pagination, sorting, searchTerm]);

  // Apply sorting to the data
  useEffect(() => {
    if (sorting.length > 0) {
      const sortedUsers = [...roles].sort((a, b) => {
        const sortField = sorting[0].id;
        const aValue = a[sortField as keyof RolesForDisplay] || "";
        const bValue = b[sortField as keyof RolesForDisplay] || "";

        const direction = sorting[0].desc ? -1 : 1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return direction * aValue.localeCompare(bValue);
        }

        return direction * (aValue > bValue ? 1 : -1);
      });

      setRoles(sortedUsers);
    }
  }, [sorting, allRoles]);

  const handleRoleSave = async (data: RoleData) => {
    try {
      if (selectedRoleId) {
        await updateRoles(selectedRoleId, data);
      } else {
        await createRoles(data);
      }
      toast.success("Role saved successfully");
      await fetchRoles();
      setShowDialog(false);
      setShowEditDialog(false);
      setSelectedRole(null);
      setSelectedRoleId(null);
    } catch (error) {
      console.error("Error saving role", error);
      toast.error("Role name already exists.");
    }
  };

  //edit roles
  const handleEditClick = (role: RolesForDisplay) => {
    setSelectedRole(role);
    setSelectedRoleId(role.id);
    setShowEditDialog(true);
  };

  // const confirmEdit = async (id: string) => {
  //   try {
  //     await updateRoles(id);
  //     await fetchUsers();
  //   } catch (error) {
  //     console.error("Failed to edit", error);
  //     alert("edit failed");
  //   } finally {
  //     setShowEditDialog(false);
  //     setSelectedRoleId(null);
  //   }
  // };

  //delete roles
  const handleDeleteClick = (role: RolesForDisplay) => {
    setSelectedRoleId(role.id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async (id: string) => {
    try {
      await deleteRoles(id);
      await fetchRoles();
      toast.success("Role deleted successfully");
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Delete failed");
    } finally {
      setShowDeleteDialog(false);
      setSelectedRoleId(null);
    }
  };

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

  // Mobile card renderer for the DataTable
  const renderMobileCard = (row: RolesForDisplay, index: number) => {
    return <RoleCard data={row} index={index} />;
  };
  const getFilteredColumns = useCallback(() => {
    return roleTableColumns()
      .filter((col) => {
        const accessorKey = (col as any).accessorKey;
        return (
          accessorKey &&
          !accessorKey.toString().toLowerCase().includes("action") &&
          !accessorKey.toString().toLowerCase().includes("id")
        );
      })
      .map((col) => ({
        header: col.header as string,
        accessorKey: (col as any).accessorKey as string,
      }));
  }, []);

  const fetchAllRoles = useCallback(async (options: any) => {
    const sanitizedSortOrder = options.sortOrder === "desc" ? "desc" : "asc";

    const response = await getAllRoles({
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
      console.error("Failed to fetch roles or no data returned");
      return {
        tableData: [],
        totalCount: 0,
      };
    }

    return {
      tableData: response.data.data.map((role: ApiRoles) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissionCount: role.rolePermission,
        defaultRole: role.defaultRole,
        createdAt: role.createdAt,
        time: new Date(role.createdAt).toLocaleString(),
      })),
      totalCount: response.data.totalCount,
    };
  }, []);

  const handleExport = useCallback(
    async (format: "excel" | "pdf") => {
      try {
        setIsLoading(true);
        const columns = getFilteredColumns();
        await generateServerSideReport(
          {
            fetchDataFn: fetchAllRoles,
            columns,
            reportName: "Roles Report",
            primaryColor: "#000000",
            secondaryColor: "#f0f0f0",
            initialParams: {
              sortColumn: sorting.length > 0 ? sorting[0].id : "name",
              sortOrder: sorting.length > 0 && sorting[0].desc ? "desc" : "asc",
              searchQuery: searchTerm,
            },
          },
          format
        );
        toast.success(`${format.toUpperCase()} report generated successfully`);
      } catch (error) {
        toast.error(`Failed to export to ${format.toUpperCase()}`);
        console.error(`Export error:`, error);
      } finally {
        setIsLoading(false);
      }
    },
    [sorting, searchTerm, fetchAllRoles, getFilteredColumns]
  );

  return (
    <div className="px-6 py-2">
      {showDialog && (
        <RoleDialog
          open={showDialog}
          onClose={() => {
            setShowDialog(false);
          }}
          onSave={handleRoleSave}
        />
      )}
      {showEditDialog && selectedRole && (
        <EditRoleDialog
          open={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedRole(null);
          }}
          onSave={handleRoleSave}
          initialData={selectedRole}
        />
      )}

      {showDeleteDialog && (
        <DialogComponent
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
          }}
          title="Confirmation"
          subtitle="Are you sure you want to delete the role"
          cancelButtonText="No"
          saveButtonText="Yes"
          onSave={() => {
            selectedRoleId && confirmDelete(selectedRoleId);
          }}
        />
      )}
      <div>
        <div className="flex flex-col md:flex-row items-start justify-between md:gap-[35%] mb-4 w-full">
          <div className="flex gap-2">
            <Button
              className="bg-primary text-white hover:bg-primary cursor-pointer px-4 md:px-8"
              variant="outline"
              size="default"
              onClick={() => {
                if (window.innerWidth < 768) {
                  navigate("/administration/user-management/roles/1");
                } else {
                  setShowDialog(true);
                }
              }}
            >
              Add
            </Button>
            <ButtonWithIcon
              variant="outline"
              size="default"
              iconSrc={"/icons/excel.svg"}
              label="Excel"
              iconPosition="right"
              className="bg-primary text-white hover:bg-primary cursor-pointer px-2 md:px-5"
              onClick={() => handleExport("excel")}
            />
            <ButtonWithIcon
              variant="outline"
              size="default"
              className="bg-primary text-white hover:bg-primary cursor-pointer px-2 md:px-5"
              iconSrc={"/icons/pdf.svg"}
              label="PDF"
              iconPosition="right"
              onClick={() => handleExport("pdf")}
            />
          </div>
          <div className="w-full max-w-md mt-10 md:mt-0 md:max-w-sm">
            <div
              id="search-container"
              className="w-full md:max-w-sm xl:max-w-md mt-5 md:mt-0"
            ></div>
          </div>
        </div>
        <DataTable
          showAddButton={false}
          // @ts-expect-error - TODO: fix this
          columns={roleTableColumns(
            handleEditClick,
            handleDeleteClick,
            pagination
          )}
          data={roles}
          serverSide={true}
          serverSideOptions={{
            totalCount,
            isLoading,
          }}
          onPaginationChange={handlePaginationChange}
          onSortingChange={onTableSortingChange}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search by Role Name, Description, etc."
          initialSearchTerm={searchTerm}
          mobileCardRenderer={renderMobileCard}
        />
      </div>
    </div>
  );
};

export default RolesPage;
