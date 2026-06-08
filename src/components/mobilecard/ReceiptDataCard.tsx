import { MobileCard, CardField } from "./MobileCard";
import pen from "../../assets/newIcons/inverdSystem/pen.svg";
import deleteIcon from "../../assets/newIcons/delete.svg";
import { formatIndianNumber } from "../../utils/formatCurrency";

interface ReceiptDataItem {
  id: string;
  receiptNumber: string;
  dateOfReceipt: string;
  partNumber: string;
  receiptQuantity: number;
  status: string;
  internalPartNo?: string;
  partLocation?: string;
  quantity?: number;
  manufacturer?: string;
  description?: string;
  onDeleteClick?: () => void;
  onDeleteConfirm?: () => void;
  handleEdit?: (item: ReceiptDataItem) => void;
}

interface AssignedRoleCardProps {
  data: ReceiptDataItem;
  index: number;
  onDeleteClick?: () => void;
  onDeleteConfirm?: () => void;
  handleEdit?: (item: ReceiptDataItem) => void;
}

export function ReceiptDataCard({
  data,
  index,
  onDeleteClick,
  onDeleteConfirm,
  handleEdit,
}: AssignedRoleCardProps) {
  const fields: CardField[] = [
    { label: "#", value: (index + 1).toString() },
    { label: "Receipt Number", value: data.receiptNumber || "-" },
    {
      label: "Receipt Date",
      value: data.dateOfReceipt
        ? new Date(data.dateOfReceipt).toLocaleDateString("en-IN")
        : "-",
    },
    { label: "Part Number", value: data.partNumber || "-" },
    {
      label: "Receipt Quantity",
      value: data.receiptQuantity
        ? formatIndianNumber(data.receiptQuantity)
        : "-",
    },
    { label: "Status", value: data.status || "-" },
  ];

  return (
    <MobileCard
      fields={fields.filter((field) => field.value)} // Filters out empty or falsy values
      onEdit={() => handleEdit?.(data)}
      image={pen}
      image2={deleteIcon}
      deleteImg={true}
      onDeleteClose={onDeleteClick}
      onDelete={onDeleteConfirm}
      headerClassName="bg-primary/20 text-primary"
      bodyClassName="text-sm"
    />
  );
}
