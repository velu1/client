import { DataTable } from "../../components/datatable-server/DataTable";
import { useCallback, useEffect, useState, useRef } from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { templateColumns } from "./templateColumns";
import TemplateDialog from "../../components/template/TemplateDialog";
import DialogComponent from "../../components/common/DialogComponent";
import { toast } from "react-fox-toast";
import { Part as BasePart } from "../../mock/dummyData";
import EntityTemplate from "../../components/template/EntityTemplate";
import { getManufacturers } from "../../api/administration/template";
import {
  deleteTemplate,
  getAllTemplates,
} from "../../api/administration/template";
import { TemplateCard } from "../../components/mobilecard/TemplateCard";
import { useNavigate } from "react-router-dom";
// Extend the base Part interface with API-specific fields
interface Part extends BasePart {
  incrementId?: string;
  extracted_sticker?: string;
  [key: string]: any; // For additional fields in the API response
}

const Template = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Part[]>([]);
  console.log("Data", data);
  const [allData, setAllData] = useState<Part[]>([]); // raw data
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Part | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [manufacturerData, setManufacturerData] = useState<any[]>([]);
  const isFromTemplateRef = useRef(false);
  const [field, setField] = useState([
    {
      fieldName: "",
      fieldValue: "",
      fieldIdentifier: "",
      position: "",
      identifier: "",
      startPosition: "",
      endPosition: "",
    },
    {
      fieldName: "",
      fieldValue: "",
      fieldIdentifier: "",
      position: "",
      identifier: "",
      startPosition: "",
      endPosition: "",
    },
  ]);
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

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const response = await getManufacturers();
        console.log("Manufacturers", response?.data);

        if (response?.data) {
          setManufacturerData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching manufacturers:", error);
        toast.error("Failed to fetch manufacturers");
      }
    };

    fetchManufacturers();
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = pagination.pageIndex + 1; // Convert zero-based to one-based page index
      const sortColumn = sorting.length > 0 ? sorting[0].id : "updatedAt";
      const sortOrder =
        sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "desc";

      const response = await getAllTemplates({
        pagination: {
          page,
          pageSize: pagination.pageSize,
          searchQuery: searchTerm,
          sortColumn,
          sortOrder,
          download: false,
        },
      });

      console.log("getTemplate", response.data);
      setData(response.data);
      setAllData(response.data);
      setTotalCount(response.count);
    } catch (error) {
      toast.error("Failed to fetch parts");
      console.error("Error fetching parts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, sorting, searchTerm]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [pagination, sorting, searchTerm]);

  const handleDeleteClick = (template: Part) => {
    setSelectedTemplateId(template._id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedTemplateId) return;
    try {
      await deleteTemplate(selectedTemplateId);
      await fetchData();
      toast.success("Template deleted successfully");
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Delete failed");
    } finally {
      setShowDeleteDialog(false);
      setSelectedTemplateId(null);
    }
  };

  const handleEditClick = (template: Part) => {
    // 👇 Add this line before setting selected template
    isFromTemplateRef.current = false; // <-- Expose ref from child via useImperativeHandle or shared ref

    setSelectedTemplate(template);
    navigate(`/template?edit=true`);

    setTimeout(() => {
      window.dispatchEvent(new Event("scrollToTop"));
    }, 100);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!sorting.length || allData.length === 0) {
      setData(allData); // fallback to original order
      return;
    }

    const { id: sortColumn, desc } = sorting[0];

    const sorted = [...allData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return desc
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }

      return desc
        ? aValue > bValue
          ? -1
          : aValue < bValue
          ? 1
          : 0
        : aValue < bValue
        ? -1
        : aValue > bValue
        ? 1
        : 0;
    });

    setData(sorted);
  }, [sorting, allData]);

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

  const handleSearchChange = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, []);

  // Mobile card renderer for the DataTable
  const renderMobileCard = (row: any, index: number) => {
    return (
      <TemplateCard
        data={row}
        index={index}
        handleEditClick={handleEditClick}
        handleDeleteClick={handleDeleteClick}
        onOpenDialog={(template: Part) => {
          setSelectedTemplate(template);
          setIsDialogOpen(true);
        }}
      />
    );
  };

  return (
    <div className="h-full w-full">
      <>
        <TemplateDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            fetchData();
            setSelectedTemplate(null);
          }}
          templateData={selectedTemplate}
        />

        <div className="px-2 py-2">
          {showDeleteDialog && (
            <DialogComponent
              isOpen={showDeleteDialog}
              onClose={() => {
                setShowDeleteDialog(false);
              }}
              title="Confirmation"
              subtitle="Are you sure you want to delete?"
              cancelButtonText="No"
              saveButtonText="Yes"
              onSave={() => {
                selectedTemplateId && confirmDelete();
              }}
            />
          )}
          <div>
            <EntityTemplate
              manufacturerOptions={manufacturerData}
              onTemplateCreated={fetchData}
              templateData={selectedTemplate}
              field={field}
              setField={setField}
              isFromTemplate={isFromTemplateRef}
              setTemplateData={setSelectedTemplate}
            />
            <div className="flex flex-col md:flex-row items-center justify-between md:gap-[35%] mb-4 w-full">
              {/* Left: Unique Id + Fetch */}
              <div className="relative">
                {/* Summary title */}
                {/* <div>
          <p className="text-md font-semibold text-gray-700">Summary</p>
        </div> */}
              </div>

              {/* Right: Search Input */}
              <div
                id="search-container"
                className="w-full max-w-md mt-10 md:mt-0 md:max-w-sm"
              ></div>
            </div>
            <DataTable
              showAddButton={false}
              columns={templateColumns({
                ...pagination,
                onOpenDialog: (template: Part) => {
                  setSelectedTemplate(template);
                  setIsDialogOpen(true);
                },
                handleEditClick: handleEditClick,
                handleDeleteClick: handleDeleteClick,
                refreshData: fetchData,
              })}
              data={data}
              serverSide={true}
              serverSideOptions={{
                totalCount,
                isLoading,
              }}
              onPaginationChange={handlePaginationChange}
              onSortingChange={onTableSortingChange}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search"
              initialSearchTerm={searchTerm}
              mobileCardRenderer={renderMobileCard}
            />
          </div>
        </div>
      </>
    </div>
  );
};

export default Template;
