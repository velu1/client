import { MobileCard, CardField } from "./MobileCard";
import { InvoiceSummaryRow } from "../../pages/inward-system/parts-in/invoiceSummary.config";

interface InvoiceSummaryCardProps {
  data: InvoiceSummaryRow;
  index: number;
}

export function InvoiceSummaryCard({ data, index }: InvoiceSummaryCardProps) {
  // const navigate = useNavigate();

  const fields: CardField[] = [
    { label: "#", value: index + 1 },
    { label: "Receipt number", value: data.invoiceNumber },
    { label: "Part number", value: data.partNumber },
    { label: "Invoice Qty", value: data.invoiceQty },
    { label: "Inward Qty", value: data.inwardQty },
    { label: "ICR", value: data.icr },
  ];

  const handlePrint = () => {
    // TODO: Implement print logic for invoice card
    console.log("Print invoice row:", data);
  };

  return (
    <MobileCard
      fields={fields.filter(
        (field) => field.value !== undefined && field.value !== ""
      )}
      onEdit={handlePrint}
      // @ts-expect-error non fix type error
      image={null}
      headerClassName="bg-primary/20 text-primary"
      bodyClassName="text-sm"
    />
  );
}
