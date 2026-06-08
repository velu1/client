import { DataTable } from "../../components/datatable-new/DataTable";
import { useCallback, useEffect, useState } from "react";
import { adminTableColumns } from "../admins/admin.config";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { getAllAdmins, updateAdminStatus } from "../../api/admins";
import { Button } from "../../components/ui/button";
import DialogComponent from "../../components/common/DialogComponent";

const AdminsPage = () => {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSwitch, setSelectedSwitch] = useState<"enable" | "disable">(
    "enable"
  );
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

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

  const fetchData = useCallback(async () => {
    setSelectedRow(null);
    setSelectedSwitch("enable");
    setIsLoading(true);
    try {
      // Convert from zero-based to one-based pagination for the API
      const page = pagination.pageIndex + 1;

      // Extract sorting information from the sorting state
      const sortBy = sorting.length > 0 ? [sorting[0].id] : ["updatedAt"];
      const sortDesc = sorting.length > 0 ? [sorting[0].desc] : [true];

      const response = await getAllAdmins(searchTerm, {
        page,
        itemsPerPage: pagination.pageSize,
        sortBy,
        sortDesc,
      });

      if (response.status === 200) {
        setData(response.data.tableData);
        setTotalCount(response.data.totalCount);
        setIsLoading(false);
      }
    } catch (error) {
      if (error instanceof Error && error.message === "canceled") {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }
    }
  }, [pagination.pageIndex, pagination.pageSize, searchTerm, sorting]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDialogConfirm = async () => {
    if (selectedRow) {
      try {
        // Call the API to update the status
        await updateAdminStatus(selectedRow._id, selectedSwitch === "enable");
        // Refresh the data
        fetchData();
      } catch (error) {
        console.error("Error updating admin status:", error);
      }
    }
    setShowDialog(false);
  };

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPagination(newPagination);
    },
    []
  );

  const handleSortingChange = useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
  }, []);

  const handleSearchChange = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    // Reset to first page when searching
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, []);

  return (
    <div className="px-6 py-2">
      {showDialog && (
        <DialogComponent
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          title={
            selectedSwitch === "enable"
              ? "Enable Confirmation"
              : "Disable Confirmation"
          }
          // @ts-expect-error non fix type
          message={
            selectedSwitch === "enable"
              ? "Do you want to enable?"
              : "Do you want to disable?"
          }
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
      <div>
        <DataTable
          showAddButton={true}
          columns={adminTableColumns()}
          data={data}
          // @ts-expect-error - We're using the transformed data which matches the columns
          serverSide={true}
          serverSideOptions={{
            totalCount,
            isLoading,
          }}
          onPaginationChange={handlePaginationChange}
          onSortingChange={handleSortingChange}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search "
          title="Event data table"
          initialSearchTerm={searchTerm}
          headerButtons={
            <>
              <Button className="bg-secondary rounded-2xl hover:bg-secondary/80 w-28 py-4">
                Workshop
              </Button>
              <Button className="bg-secondary rounded-2xl hover:bg-secondary/80 w-28 py-4">
                Training
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
};

export default AdminsPage;
