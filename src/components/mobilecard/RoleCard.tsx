import { MobileCard, CardField } from "./MobileCard";
import { useNavigate } from "react-router-dom";
import { Role } from "../../mock/dummyData";
import deleteIcon from "../../assets/newIcons/delete.svg";
import pen from "../../assets/newIcons/inverdSystem/pen.svg";

interface RoleCardProps {
  data: Role;
  index: number;
}

/**
 * Role specific card implementation for mobile view
 * Customized for the role management data structure
 */
export function RoleCard({ data, index }: RoleCardProps) {
  const navigate = useNavigate();

  // Convert data object to fields array based on the UI screenshot
  const fields: CardField[] = [
    {
      label: "#",
      value: index+1,
    },
    {
      label: "Role name",
      value: data.name || "",
    },
    {
      label: "Description",
      value: data.description || "",
    },
    {
      label: "Time",
      value: data.time || "",
    },
  ];

  const handleEdit = () => {
    // Navigate to role detail page on edit
    navigate(`/administration/user-management/roles/${index}`);
  };

  return (
    <MobileCard
      fields={fields.filter((field) => field.value)} // Filter out empty fields
      onEdit={handleEdit}
      image={pen}
      deleteImg={true}
      image2={deleteIcon}
      addRoles={true}
      headerClassName="bg-primary/20 text-primary"
      bodyClassName="text-sm"
    />
  );
}
