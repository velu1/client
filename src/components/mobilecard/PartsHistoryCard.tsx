import { MobileCard, CardField } from "./MobileCard";
import pen from "../../assets/newIcons/inverdSystem/pen.svg";

interface PartsHistoryCardProps {
  data: any;
  index?: number;
  showColumnsDialog: boolean;
  setShowColumnsDialog: (value: boolean) => void;
  selectedRow: any;
  setSelectedRow: (row: any) => void;
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
  allColumns: any[]; // Adjust type if you have a specific one
}

export function PartsHistoryCard({
  data,
  index,
  showColumnsDialog,
  setShowColumnsDialog,
  selectedRow,
  setSelectedRow,
  visibleColumns,
  setVisibleColumns,
  allColumns,
}: PartsHistoryCardProps) {
  const fields: CardField[] = [
    { label: "Internal part number", value: data.internalPartNo || "" },
    { label: "Part number", value: data.partNumber || "" },
    { label: "Unique Id", value: data.uniqueId || "" },
    { label: "Quantity", value: data.quantity?.toLocaleString() || "" },
    {
      label: "Lot number",
      value: Array.isArray(data.lotNumber)
        ? data.lotNumber.join(", ")
        : data.lotNumber || "",
    },
    { label: "Receipt Number", value: data.invoiceNumber || "" },
    { label: "Manufacturer", value: data.manufacturer || "" },
    {
      label: "Return quantity",
      value: data.isReturn && data.returnQuantity ? data.returnQuantity : "N/A",
    },
  ];

  const handleEdit = () => {
    setSelectedRow(data);
    setShowColumnsDialog(true);
  };

  return (
    <>
      <MobileCard
        showColumnsDialog={showColumnsDialog}
        selectedRow={selectedRow}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        allColumns={allColumns}
        fields={fields.filter((field) => field.value)}
        index={index}
        onEdit={handleEdit}
        squareImg={false}
        image={pen}
        headerClassName="bg-primary/20 text-primary"
        bodyClassName="text-sm"
      />
    </>
  );
}
