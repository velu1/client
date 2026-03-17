import { MobileCard, CardField } from "./MobileCard";
import { PartsInRow } from "../../pages/inward-system/parts-in/summaryTable.config";
interface PartsInCard {
  data: PartsInRow;
  index: number;
  visibleColumns: string[];
}

/**
 * AssignedRole specific card implementation for mobile view
 * Customized for the assigned roles data structure
 */
export function PartsInCard({ data, index, visibleColumns }: PartsInCard) {
  console.log(data);


  // Convert data object to fields array based on the UI screenshot
  const fields: CardField[] = [
    { label: "#", value: index + 1 }, // Always shown

    visibleColumns.includes("partNumber") && {
      label: "Internal Part Number",
      value: `INT-${data.partNumber}` || "",
    },

    visibleColumns.includes("partNumber") && {
      label: "Part Number",
      value: data.partNumber || "",
    },

    visibleColumns.includes("uniqueId") && {
      label: "Unique ID",
      value: data.uniqueId || "",
    },

    visibleColumns.includes("quantity") && {
      label: "Quantity",
      value: data.quantity.toString(),
    },
  ].filter(Boolean) as CardField[];

  // const handleEdit = () => {
  //   // Navigate to assigned role detail page on edit
  //   navigate(`/administration/user-management/assigned-roles/${index}`);
  // };

  return (
    <MobileCard
      fields={fields.filter((field) => field.value)}
      headerClassName="bg-primary/20 text-primary"
      bodyClassName="text-sm"
    />
  );
}
