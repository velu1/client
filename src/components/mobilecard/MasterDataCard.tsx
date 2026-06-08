import { MobileCard, CardField } from "./MobileCard";
import pen from "../../assets/newIcons/inverdSystem/pen.svg";
import deleteIcon from "../../assets/newIcons/delete.svg";

interface MasterDataItem {
  id: string;
  partNumber: string;
  internalPartNo: string;
  partLocation?: string;
  quantity: number;
  manufacturer: string;
  description?: string;
  onDeleteClick?: () => void;
  onDeleteConfirm?: () => void;
  handleEdit?: (item: MasterDataItem) => void;
}

interface AssignedRoleCardProps {
  data: MasterDataItem;
  index: number;
  onDeleteClick?: () => void;
  onDeleteConfirm?: () => void;
  handleEdit?: (item: MasterDataItem) => void;
}

/**
 * AssignedRole specific card implementation for mobile view
 * Customized for the assigned roles data structure
 *
 *
 */
export function MasterDataCard({
  data,
  index,
  onDeleteClick,
  onDeleteConfirm,
  handleEdit,
}: AssignedRoleCardProps) {
  // Convert data object to fields array based on the UI screenshot
  const fields: CardField[] = [
    { label: "#", value: index + 1 },
    {
      label: "Part Number",
      value: data.partNumber || "",
    },
    {
      label: "InternalPN",
      value: data.internalPartNo || "",
    },
    {
      label: "Quantity",
      value: data.quantity?.toString() || "",
    },
    {
      label: "Manufacturer",
      value: data.manufacturer || "",
    },
    {
      label: "Description",
      value: data.description || "",
    },
  ];

  return (
    <MobileCard
      fields={fields.filter((field) => field.value)} // Filter out empty fields
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
