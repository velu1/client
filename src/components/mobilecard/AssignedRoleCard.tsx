import { MobileCard, CardField } from "./MobileCard";
import pen from "../../assets/newIcons/inverdSystem/pen.svg";
import { AssignRolesDisplay } from "../../pages/administration/user-management/assigned-roles";

interface AssignedRoleCardProps {
  data: AssignRolesDisplay;
  index: number;
  selectedRole: AssignRolesDisplay | null;
  onEdit: (role: AssignRolesDisplay) => void;
}

/**
 * AssignedRole specific card implementation for mobile view
 * Customized for the assigned roles data structure
 */
export function AssignedRoleCard({
  data,
  index,
  selectedRole,
  onEdit,
}: AssignedRoleCardProps) {
  // Convert data object to fields array based on the UI screenshot
  const fields: CardField[] = [
    { label: "#", value: index + 1 },
    {
      label: "Role name",
      value: data.name || "",
    },
    {
      label: "Inward",
      value: data.inward || "",
    },
  ];

  // const handleEdit = () => {
  //   // Navigate to assigned role detail page on edit
  //   navigate(`/administration/user-management/assigned-roles/${index}`);
  // };

  return (
    <MobileCard
      selectedRole={selectedRole}
      onEdit={() => {
        onEdit(data);
      }}
      fields={fields.filter((field) => field.value)} // Filter out empty fields
      image={pen}
      headerClassName="bg-primary/20 text-primary"
      bodyClassName="text-sm"
    />
  );
}
