import React, { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { DataTable } from "../datatable-new/DataTable";
import { uploadMasterData } from "../../pages/administration/receipt/master-data/upload-master-data.config";
import {
  deleteTemplate,
  getAllTemplate,
} from "../../api/administration/master";
import DialogComponent from "../common/DialogComponent";
// import { generateServerSideReport } from "../../utils/reportGenerator";
import { toast } from "react-fox-toast";
import { SortingState } from "@tanstack/react-table";
import * as XLSX from "xlsx";

interface MasterDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: string;
}

interface TemplateMapping {
  label: string;
  path: string;
  _id: string;
}

interface Template {
  id: string;
  templateName: string;
  templateMapping: TemplateMapping[];
  isDeleted: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
}

const MasterDataDialog: React.FC<MasterDataDialogProps> = ({
  isOpen,
  onClose,
  title,
  type,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTemplates = async (): Promise<{
    tableData: any[];
    totalCount: number;
  }> => {
    try {
      setLoading(true);
      const response = await getAllTemplate(type);
      const templatesData = response?.data?.data || [];
      console.log("templatesData", sorting, searchTerm);
      setTemplates(templatesData);

      // Return in the expected format
      return {
        tableData: templatesData,
        totalCount: templatesData.length, // Count the number of items in the templates data
      };
    } catch (error) {
      console.error("Failed to fetch templates", error);
      return { tableData: [], totalCount: 0 }; // Return empty data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const handleDelete = (item: any) => {
    console.log("Delete", item);
    setSelectedId(item.id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      await fetchTemplates(); // Re-fetch templates after deleting one
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Delete failed");
    } finally {
      setShowDeleteDialog(false);
      setSelectedId(null);
    }
  };

  const handleSortingChange = useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
  }, []);

  const handleSearchChange = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  }, []);

  const handleDownloadTemplate = async (item: any) => {
    try {
      setLoading(true);

      // Find the template in templates array
      const template = templates.find((t) => t.id === item.id);
      if (!template) {
        toast.error("Template not found");
        return;
      }

      // Create headers from templateMapping
      const headers = template.templateMapping.map(
        (mapping: TemplateMapping) => mapping.label
      );

      // Create a worksheet with headers only
      const worksheet = XLSX.utils.aoa_to_sheet([headers]);

      // Create a workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

      // Generate XLSX file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${template.templateName}.xlsx`);

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Template downloaded successfully");
    } catch (error) {
      toast.error("Failed to download template");
      console.error("Download error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white rounded-lg p-4 sm:p-6 shadow-lg w-[95%] max-w-2xl md:max-w-4xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 border-[1.5px] border-[#e5c8a6] rounded-lg overflow-hidden">
          {showDeleteDialog && (
            <DialogComponent
              isOpen={showDeleteDialog}
              onClose={() => {
                setShowDeleteDialog(false);
              }}
              title="Confirmation"
              subtitle="Are you sure you want to delete the role?"
              cancelButtonText="No"
              saveButtonText="Yes"
              onSave={() => {
                selectedId && confirmDelete(selectedId);
              }}
            />
          )}
          {loading ? (
            <div className="py-10 text-center">Loading templates...</div>
          ) : (
            <DataTable
              showAddButton={false}
              columns={uploadMasterData(handleDelete, handleDownloadTemplate)}
              // @ts-expect-error non fix type
              data={templates}
              onSortingChange={handleSortingChange}
              onSearchChange={handleSearchChange}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MasterDataDialog;
