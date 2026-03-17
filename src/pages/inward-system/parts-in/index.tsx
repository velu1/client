import { useState, useEffect, useRef } from "react";
import PartsInCapture from "../../../components/inward-system/parts-in/PartsInCapture";
import PartsInManual from "../../../components/inward-system/parts-in/PartsInManual";
import ModeSwitcher from "../../../components/inward-system/parts-in/ModeSwitcher";
import { SummaryTableWithRef } from "../../../components/inward-system/parts-in/SummaryTable";
import ContentWrapper from "../../../components/inward-system/parts-in/ContentWrapper";
import QrCodePreview from "../../../components/inward-system/parts-in/QRCodePreview";
import {
  getPartsInPrinterConfig,
  PrinterConfigurationResponse,
} from "../../../api/settings";
import { toast } from "react-fox-toast";
import InvoiceSummaryTable from "../../../components/inward-system/parts-in/InvoiceSummaryTable";
import { fetchInvoiceNumbers, fetchPalletDetails } from "../../../api/partsIn";
import { usePrinterStore } from "../../../utils/printerService";

const PartsInPage = () => {
  // Get saved mode from localStorage or default to "ai"
  const [mode, setMode] = useState<"ai" | "manual">(() => {
    const savedMode = localStorage.getItem("partsInMode") as
      | "ai"
      | "manual"
      | null;
    return savedMode || "ai";
  });

  const [printerConfig, setPrinterConfig] =
    useState<PrinterConfigurationResponse | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [invoiceOptions, setInvoiceOptions] = useState<any[]>([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [showQrPreview, setShowQrPreview] = useState(false);

  // Get QR preview data from printer store
  const { qrPreviewData } = usePrinterStore();

  // Reference to the summary table component
  const summaryTableRef = useRef<{ refresh: () => void }>(null);

  // Invoice summary table state
  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState<string>("");
  const [invoiceTablePage, setInvoiceTablePage] = useState(1);
  const [invoiceTablePageSize, setInvoiceTablePageSize] = useState(10);
  const [invoiceTableSearch, setInvoiceTableSearch] = useState("");
  const [invoiceTableSortColumn, setInvoiceTableSortColumn] =
    useState("invoiceNumber");
  const [invoiceTableSortOrder, setInvoiceTableSortOrder] = useState<
    "asc" | "desc"
  >("asc");
  const [invoiceTableData, setInvoiceTableData] = useState<any[]>([]);
  const [invoiceTableLoading, setInvoiceTableLoading] = useState(false);

  useEffect(() => {
    console.log("[PartsInPage] Loading printer configuration...");

    const timeoutId = setTimeout(() => {
      console.warn(
        "[PartsInPage] Printer config API call taking longer than expected (5s)"
      );
    }, 5000);

    getPartsInPrinterConfig()
      .then((config) => {
        clearTimeout(timeoutId);

        let hasError = false;

        if (!config) {
          console.error("[PartsInPage] Received null config from API");
          toast.error("Failed to load printer configuration (null response)");
          hasError = true;
        }

        if (!config?.priority || !Array.isArray(config.priority)) {
          console.error(
            "[PartsInPage] Invalid printer config format - missing priority array:",
            config
          );
          toast.error("Invalid printer configuration format");
          hasError = true;
        }

        if (hasError) return;

        console.log(
          "[PartsInPage] Printer config loaded successfully with",
          config.priority.length,
          "priority items"
        );
        setPrinterConfig(config);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error("[PartsInPage] Failed to fetch printer config:", error);
        toast.error("Failed to fetch printer config");
      })
      .finally(() => setLoadingConfig(false));
  }, []);

  // Show QR preview when data is available
  useEffect(() => {
    if (qrPreviewData) {
      setShowQrPreview(true);
    }
  }, [qrPreviewData]);

  useEffect(() => {
    if (printerConfig?.invoice) {
      console.log(loadingConfig);
      setInvoiceLoading(true);
      fetchInvoiceNumbers()
        .then(setInvoiceOptions)
        .catch(() => toast.error("Failed to fetch invoice numbers"))
        .finally(() => setInvoiceLoading(false));
    }
  }, [printerConfig?.invoice]);

  // Fetch invoice summary table data when any relevant state changes
  useEffect(() => {
    if (!selectedInvoiceNo) return;
    setInvoiceTableLoading(true);
    fetchPalletDetails({
      invoiceNo: selectedInvoiceNo,
      page: invoiceTablePage,
      pageSize: invoiceTablePageSize,
      searchQuery: invoiceTableSearch,
      sortColumn: invoiceTableSortColumn,
      sortOrder: invoiceTableSortOrder,
    })
      .then((res) => setInvoiceTableData(res.data || []))
      .catch(() => {
        toast.error("Failed to fetch pallet details");
        setInvoiceTableData([]);
      })
      .finally(() => setInvoiceTableLoading(false));
  }, [
    selectedInvoiceNo,
    invoiceTablePage,
    invoiceTablePageSize,
    invoiceTableSearch,
    invoiceTableSortColumn,
    invoiceTableSortOrder,
  ]);

  // Handler for selecting an invoice (sets selectedInvoiceNo and resets table state)
  const handleInvoiceSelect = (invoiceNo: string) => {
    setSelectedInvoiceNo(invoiceNo);
    setInvoiceTablePage(1);
    setInvoiceTableSearch("");
    setInvoiceTableSortColumn("invoiceNumber");
    setInvoiceTableSortOrder("asc");
  };

  // Function to refresh the summary table
  const refreshSummaryTable = () => {
    if (summaryTableRef.current) {
      summaryTableRef.current.refresh();
    }
  };

  const refreshInvoiceTable = () => {
    if (selectedInvoiceNo) {
      setInvoiceTableLoading(true);
      fetchPalletDetails({
        invoiceNo: selectedInvoiceNo,
        page: invoiceTablePage,
        pageSize: invoiceTablePageSize,
        searchQuery: invoiceTableSearch,
        sortColumn: invoiceTableSortColumn,
        sortOrder: invoiceTableSortOrder,
      })
        .then((res) => setInvoiceTableData(res.data || []))
        .catch(() => {
          toast.error("Failed to fetch pallet details");
          setInvoiceTableData([]);
        })
        .finally(() => setInvoiceTableLoading(false));
        fetchInvoiceNumbers()
        .then(setInvoiceOptions)
        .catch(() => toast.error("Failed to fetch invoice numbers"))
        .finally(() => setInvoiceLoading(false));
    }
  };

  return (
    <div className="px-4 w-full">
      <ModeSwitcher currentMode={mode} onModeChange={setMode} />

      <div className="my-5">
        <ContentWrapper
          mode={mode}
          aiContent={
            <PartsInCapture
              invoiceMode={!!printerConfig?.invoice}
              invoiceOptions={invoiceOptions}
              invoiceLoading={invoiceLoading}
              onInvoiceSelect={handleInvoiceSelect}
              refreshSummaryTable={refreshSummaryTable}
              refreshInvoiceTable={refreshInvoiceTable}
              printerConfig={printerConfig}
            />
          }
          manualContent={
            <PartsInManual
              invoiceMode={!!printerConfig?.invoice}
              invoiceOptions={invoiceOptions}
              invoiceLoading={invoiceLoading}
              onInvoiceSelect={handleInvoiceSelect}
              refreshSummaryTable={refreshSummaryTable}
              refreshInvoiceTable={refreshInvoiceTable}
              printerConfig={printerConfig}
            />
          }
        />
      </div>

      <div
        className={`mt-8 mb-10 ${
          printerConfig?.invoice ? "flex flex-col md:flex-row gap-6" : ""
        }`}
      >
        <div className={printerConfig?.invoice ? "md:w-1/2 w-full" : "w-full"}>
          {/* Conditionally render SummaryTable only when config is loaded */}
          {loadingConfig ? (
            <div className="flex items-center justify-center h-40 border rounded-md">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-gray-500">
                  Loading printer configuration...
                </p>
              </div>
            </div>
          ) : (
            <SummaryTableWithRef
              ref={summaryTableRef}
              printerConfig={printerConfig}
            />
          )}
        </div>
        {printerConfig?.invoice && (
          <div className="md:w-1/2 w-full">
            <InvoiceSummaryTable
              data={invoiceTableData}
              loading={invoiceTableLoading}
              page={invoiceTablePage}
              pageSize={invoiceTablePageSize}
              search={invoiceTableSearch}
              sortColumn={invoiceTableSortColumn}
              sortOrder={invoiceTableSortOrder}
              onPageChange={setInvoiceTablePage}
              onPageSizeChange={setInvoiceTablePageSize}
              onSearchChange={setInvoiceTableSearch}
              onSortChange={(col, order) => {
                setInvoiceTableSortColumn(col);
                setInvoiceTableSortOrder(order);
              }}
            />
          </div>
        )}
      </div>

      {/* QR Code Preview Modal */}
      <QrCodePreview
        isOpen={showQrPreview}
        onClose={() => setShowQrPreview(false)}
      />
    </div>
  );
};

export default PartsInPage;
