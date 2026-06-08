import { useState, useEffect, useCallback } from "react";
import { Loader2, ChevronDown, QrCode, SlidersHorizontal, Save, X } from "lucide-react";
import { toast } from "react-fox-toast";
import {
  getPartsInPrinterConfig,
  updatePartsInPrinterConfig,
  PrinterConfigurationResponse,
} from "../../../../api/settings";
import FieldMappingTable from "../../../../components/partsInConfiguration/FieldMappingTable";
import CApp from "./CanvasEditor/CApp";

type EntityTableRow = {
  slNo: number;
  name: string;
  id: string;
  default?: boolean;
  defaultTableRow?: boolean;
};

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
      checked ? "bg-[#434a52]" : "bg-gray-200"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? "translate-x-4" : "translate-x-0"
      }`}
    />
  </button>
);

const SectionCard = ({
  icon,
  title,
  subtitle,
  collapsed,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div
      className="flex items-center justify-between px-5 py-4 cursor-pointer select-none border-b border-gray-100"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-[#434a52]/8 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <ChevronDown
        size={16}
        className={`text-gray-400 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
      />
    </div>
    <div
      className={`transition-all duration-300 overflow-hidden ${
        collapsed ? "max-h-0 opacity-0" : "max-h-500 opacity-100"
      }`}
    >
      <div className="px-5 py-5">{children}</div>
    </div>
  </div>
);

const PartsInConfigurationPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedUnique, setCollapsedUnique] = useState(false);
  const [collapsedFieldPriority, setCollapsedFieldPriority] = useState(false);

  const [entityTableRows, setEntityTableRows] = useState<EntityTableRow[]>([
    { slNo: 1, name: "Part Number", id: "partNumber" },
    { slNo: 2, name: "Quantity", id: "quantity" },
  ]);

  const [config, setConfig] = useState<PrinterConfigurationResponse | null>(null);
  const [labelData, setLabelData] = useState<PrinterConfigurationResponse["labelData"]>({
    heightMm: 0,
    widthMm: 0,
    items: [],
  });

  const [printType, setPrintType] = useState<"qr" | "dataMatrix">("qr");
  const [originalEntityTableRows, setOriginalEntityTableRows] = useState<EntityTableRow[]>([]);
  const [formData, setFormData] = useState({
    partsInNamingSeries: "",
    namingSeries: "",
    delimiter: "",
    audit: false,
    invoice: false,
    panelBoards: false,
  });

  const [errors, setErrors] = useState({ partsInNamingSeries: "" });
  const [prioritySelections, setPrioritySelections] = useState<string[]>(["", "", "", "", "", ""]);
  const [priorityDropdownOptions, setPriorityDropdownOptions] = useState<EntityTableRow[]>([]);
  const [, setIsFormValid] = useState(false);

  useEffect(() => {
    const isValid =
      formData.partsInNamingSeries.trim() !== "" &&
      formData.delimiter.trim() !== "" &&
      entityTableRows.every((row) => row.name?.trim()) &&
      prioritySelections
        .slice(0, entityTableRows.length)
        .every((p) => p?.trim());
    setIsFormValid(isValid);
  }, [formData, prioritySelections, entityTableRows]);

  const toCamelCase = (str: string): string => {
    const trimmed = str?.trim();
    if (!trimmed?.includes(" ") && /[A-Z]/.test(trimmed) && /[a-z]/.test(trimmed) && !/^[A-Z][a-z]+$/.test(trimmed)) {
      return trimmed;
    }
    const camel = trimmed?.toLowerCase()?.replace(/[^a-zA-Z0-9]+(.)/g, (_m, c) => c?.toUpperCase())?.replace(/^[^a-zA-Z0-9]+/, "");
    return camel?.charAt(0)?.toLowerCase() + camel?.slice(1);
  };

  const fetchPrinterConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPartsInPrinterConfig();
      setConfig(data);

      const allOriginalRows = data.entityTableRows.map((row: any) => ({ ...row, id: toCamelCase(row.id) }));
      setOriginalEntityTableRows(allOriginalRows);

      const entityTable = allOriginalRows.filter((row: any) => row.defaultTableRow === true);
      setEntityTableRows(entityTable);

      const priorityOptionsWithNone = [
        { slNo: 0, name: "None", id: "none", defaultTableRow: false },
        ...allOriginalRows,
      ];
      setPriorityDropdownOptions(priorityOptionsWithNone);
      setLabelData(data.labelData);
      setFormData({
        partsInNamingSeries: data.partsInNamingSeries || "",
        namingSeries: data.namingSeries || "",
        delimiter: data.delimiter || "",
        audit: data.audit || false,
        invoice: data.invoice || false,
        panelBoards: data.panelBoards || false,
      });
      setPrintType(data.printType === "DataMatrix" ? "dataMatrix" : "qr");

      const maxPriority = Math.max(...data.priority.map((item: any) => parseInt(item.priority)));
      const newPrioritySelections = Array(maxPriority).fill("");
      data.priority.forEach((item: any) => {
        const index = parseInt(item.priority) - 1;
        if (index >= 0 && index < newPrioritySelections.length) newPrioritySelections[index] = item.value;
      });
      setPrioritySelections(newPrioritySelections);
    } catch {
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrinterConfig(); }, [fetchPrinterConfig]);

  const validateForm = () => {
    const newErrors = { partsInNamingSeries: "" };
    if (!formData.partsInNamingSeries.trim()) {
      newErrors.partsInNamingSeries = "Parts naming series is required";
      setErrors(newErrors);
      return false;
    }
    setErrors(newErrors);
    return true;
  };

  const handleSave = async () => {
    let finalEntityTableRows = entityTableRows;
    if ((window as any).saveUnsavedFieldsRef) {
      finalEntityTableRows = (window as any).saveUnsavedFieldsRef();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const hiddenRows = originalEntityTableRows.filter((row) => row.defaultTableRow === false);
      const visibleRows = finalEntityTableRows.map((row) => ({ ...row, id: toCamelCase(row.id), defaultTableRow: true }));
      const completeEntityTableRows = [...hiddenRows, ...visibleRows];

      const priorityData = prioritySelections
        .map((value, index) => ({ value, originalIndex: index }))
        .filter((item) => item.value && item.value !== "none")
        .map((item, newIndex) => ({ priority: (newIndex + 1).toString(), value: item.value }));

      const updatePayload = {
        id: config!.id,
        type: config!.type || "partsInPrinterConfig",
        partsInNamingSeries: formData.partsInNamingSeries,
        namingSeries: formData.namingSeries,
        delimiter: formData.delimiter,
        audit: formData.audit,
        invoice: formData.invoice,
        panelBoards: formData.panelBoards,
        printType: printType === "qr" ? "QrCode" : "DataMatrix",
        priority: priorityData,
        printerName: config!.printerName || "",
        entityTableRows: completeEntityTableRows,
        labelData: {
          ...labelData,
          items: labelData.items.map((item) => ({
            ...item,
            value: item.type === "value" && item.value ? toCamelCase(item.value) : item.value,
          })),
        },
      };

      const result = await updatePartsInPrinterConfig(updatePayload);
      setConfig(result);
      fetchPrinterConfig();
      toast.success("Configuration saved successfully");
    } catch {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!config) return;
    setFormData({
      partsInNamingSeries: config.partsInNamingSeries || "",
      namingSeries: config.namingSeries || "",
      delimiter: config.delimiter || "",
      audit: config.audit || false,
      invoice: config.invoice || false,
      panelBoards: config.panelBoards || false,
    });
    setPrintType(config.printType === "DataMatrix" ? "dataMatrix" : "qr");
    const newPrioritySelections = Array(6).fill("");
    config.priority.forEach((item) => {
      const index = parseInt(item.priority) - 1;
      if (index >= 0 && index < 6) newPrioritySelections[index] = item.value;
    });
    setPrioritySelections(newPrioritySelections);
    setErrors({ partsInNamingSeries: "" });
  };

  const handlePriorityChange = (index: number, value: string) => {
    const newSelections = [...prioritySelections];
    newSelections[index] = value;
    setPrioritySelections(newSelections);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin text-[#434a52]" />
      </div>
    );
  }

  const canvaData = (data: any) => setLabelData(data);

  return (
    <div className="px-4 pb-10 space-y-4 max-w-full">
      {/* Sticky action bar */}
      <div className="flex items-center justify-end gap-2 py-1">
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          <X size={14} />
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold bg-[#434a52] text-white hover:bg-[#676e6e] disabled:opacity-40 transition-all"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Global fields extraction */}
      <SectionCard
        icon={<SlidersHorizontal size={15} className="text-[#434a52]" />}
        title="Global Fields for Extraction"
        subtitle="Define which fields are extracted from incoming documents"
        collapsed={collapsed}
        onToggle={() => setCollapsed((p) => !p)}
      >
        <FieldMappingTable
          entityTableRows={entityTableRows}
          setEntityTableRows={setEntityTableRows}
          setPrioritySelections={setPrioritySelections}
        />
      </SectionCard>

      {/* General settings */}
      <SectionCard
        icon={<SlidersHorizontal size={15} className="text-[#434a52]" />}
        title="General Settings"
        subtitle="Naming series, invoice mode and other system options"
        collapsed={collapsedUnique}
        onToggle={() => setCollapsedUnique((p) => !p)}
      >
        <div className="space-y-6">
          {/* Naming fields row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Parts naming series (prefix) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="partsInNamingSeries"
                value={formData.partsInNamingSeries}
                onChange={handleInputChange}
                placeholder="e.g. MMT"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 transition-all bg-white ${
                  errors.partsInNamingSeries
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-gray-200 focus:border-[#434a52] focus:ring-[#434a52]/15"
                }`}
              />
              {errors.partsInNamingSeries && (
                <p className="text-xs text-red-500 mt-1">{errors.partsInNamingSeries}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Part unique ID (starting no.)
              </label>
              <input
                type="text"
                name="namingSeries"
                value={formData.namingSeries}
                onChange={handleInputChange}
                placeholder="e.g. 1000"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/15 transition-all bg-white"
              />
            </div>
          </div>

          {/* Invoice toggle */}
          <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Invoice (Receipt) mode</p>
              <p className="text-xs text-gray-400 mt-0.5">Require an invoice number during parts-in entry</p>
            </div>
            <Toggle checked={formData.invoice} onChange={(v) => setFormData((p) => ({ ...p, invoice: v }))} />
          </div>
        </div>
      </SectionCard>

      {/* QR code field priority */}
      <SectionCard
        icon={<QrCode size={15} className="text-[#434a52]" />}
        title="QR Code Field Priority"
        subtitle="Set the field order encoded in the QR code label"
        collapsed={collapsedFieldPriority}
        onToggle={() => setCollapsedFieldPriority((p) => !p)}
      >
        <div className="space-y-5">
          {/* Print type toggle */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Code type</p>
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1">
              {(["qr", "dataMatrix"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPrintType(t)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    printType === t
                      ? "bg-white text-[#434a52] shadow-sm border border-gray-200"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {t === "qr" ? "QR Code" : "Data Matrix"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Delimiter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Field delimiter</label>
              <input
                type="text"
                name="delimiter"
                value={formData.delimiter}
                onChange={handleInputChange}
                placeholder="|"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/15 transition-all bg-white"
              />
            </div>

            {/* Priority selectors */}
            {priorityDropdownOptions
              .filter((opt) => opt.id !== "none")
              .map((_, index) => (
                <div key={`priority-${index}`}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Priority {index + 1}
                  </label>
                  <select
                    value={prioritySelections[index] || ""}
                    onChange={(e) => handlePriorityChange(index, e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/15 transition-all bg-white appearance-none"
                  >
                    <option value="">Select field</option>
                    {priorityDropdownOptions
                      .filter((opt) => {
                        if (opt.id === "none") return false;
                        if (opt.id === prioritySelections[index]) return true;
                        return !prioritySelections.some((sel, i) => i !== index && sel === opt.id);
                      })
                      .map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
                  </select>
                </div>
              ))}
          </div>
        </div>
      </SectionCard>

      {/* Canvas label editor */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="h-8 w-8 rounded-lg bg-[#434a52]/8 flex items-center justify-center shrink-0">
            <QrCode size={15} className="text-[#434a52]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Label Designer</p>
            <p className="text-xs text-gray-400 mt-0.5">Configure the physical label layout and content</p>
          </div>
        </div>
        <div className="px-5 py-5">
          <CApp
            canvaData={canvaData}
            widthMm={labelData?.widthMm}
            heightMm={labelData?.heightMm}
            items={labelData?.items}
            entityTableRows={priorityDropdownOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default PartsInConfigurationPage;
