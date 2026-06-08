import { MobileCard, CardField } from "./MobileCard";
import { useNavigate } from "react-router-dom";

interface PartsListCardProps {
  data: any;
  index: number;
  isSelected?: boolean;
  onSelectChange?: (checked: boolean) => void;
}

/**
 * Parts History specific card implementation
 * Customized for the parts history data structure
 */
export function PartsListCard({
  data,
  isSelected,
  onSelectChange,
}: PartsListCardProps) {
  const navigate = useNavigate();
  console.log(data);

  // Convert data object to fields array based on the screenshot
  const fields: CardField[] = [
    {
      label: "Internal part number",
      value: data.internalPartNo|| `INT-${data._id?.substring(0, 11)}`,
    },
    {
      label: "Part number",
      value: data.partNumber || `BCH${data._id?.substring(0, 8)}`,
    },
    {
      label: "Unique Id",
      value: data.uniqueId || "12 Apr 2025",
    },
    {
      label: "Quantity",
      value: data.quantity || "56788",
    },
    {
      label: "Lot number",
      value: data.lotNumber || "JYEJHE73HDUSGK",
    },
    {
      label: "Receipt Number",
      value: data.receiptNumber || "NDKE3DS",
    },
    {
      label: "Manufacturer",
      value: data.manufacturer || "HDGJEUE7D",
    },
    {
      label: "Return quantity",
      value: data.returnQuantity || "",
    },
    {
      label: "Date of Receipt",
      value: data.invoiceData || "",
    },
    {
      label: "Date of Manufacturer",
      value: data.manufactureDate || "",
    },
    {
      label: "Part Location",
      value: data.partLocation || "",
    },
    {
      label: "Part Description",
      value: data.description || "",
    },
  ];

  const handleEdit = () => {
    // Navigate to detail page on edit
    navigate(`/reports/inwards/parts-history/${data._id}`);
  };

  return (
    <MobileCard
      fields={fields.filter((field) => field.value)}
      onEdit={handleEdit}
      squareImg={true}
      headerClassName="bg-primary/20 text-primary"
      bodyClassName="text-sm"
      isSelected={isSelected}
      onSelectChange={onSelectChange}
    />
  );
}
