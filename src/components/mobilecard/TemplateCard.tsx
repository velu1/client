import { MobileCard, CardField } from "./MobileCard";
import { useNavigate } from "react-router-dom";
import pen from "../../assets/newIcons/inverdSystem/pen.svg";
import deleteImg from "../../assets/newIcons/delete.svg";
interface TemplateCardProps {
  data: any;
  index: number;
  isSelected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  handleEditClick?: (data: any) => void;
  handleDeleteClick?: (data: any) => void;
  onOpenDialog?: (data: any) => void;
}

export function TemplateCard({
  data,
  isSelected,
  onSelectChange,
  handleEditClick,
  handleDeleteClick,
}: TemplateCardProps) {
  const navigate = useNavigate();

  const fields: CardField[] = [
    {
      label: "Manufacturer",
      value: data.manufacturer || "",
    },
    {
      label: "Template Name",
      value: (
        <div className="flex flex-wrap gap-1">
          <div className="flex items-center gap-2 bg-sidebar text-[9px] md:text-xs text-black px-2 text-tertiary py-1 rounded-full">
            {data.templateName || "Template"}
          </div>
        </div>
      ),
    },
    {
      label: "Part Number",
      value: (
        <div className="flex flex-wrap gap-1">
          {(data.partNumber || []).map((val: string, idx: number) => (
            <div
              key={idx}
              className="flex items-center gap-1 bg-sidebar text-[9px] md:text-xs text-black px-2 py-1 rounded-full"
            >
              {val}
            </div>
          ))}
        </div>
      ),
    },
  ];

  const handleEdit = () => {
    if (handleEditClick) return handleEditClick(data);
    navigate(`/reports/inwards/parts-history/${data._id}`);
  };

  return (
    <MobileCard
      fields={fields.filter((field) => field.value)}
      onEdit={handleEdit}
      onDelete={handleDeleteClick ? () => handleDeleteClick(data) : undefined}
      showDeleteDialogExternally={true}
      image2={deleteImg}
      deleteImg={true}
      squareImg={false}
      image={pen}
      headerClassName="bg-primary/20 text-primary"
      bodyClassName="text-sm"
      isSelected={isSelected}
      onSelectChange={onSelectChange}
    />
  );
}
