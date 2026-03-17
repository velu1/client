import { MobileCard, CardField } from "./MobileCard";
import deleteIcon from "../../assets/newIcons/delete.svg";
import pen from "../../assets/newIcons/inverdSystem/pen.svg";

interface User {
  organization: string;
  firstName: string;
  lastName: string;
  email: string;
  role: { _id: string; name: string };
  status: string;
  id: string;
  userId?: string;
}

interface UserCardProps {
  data: User;
  onDelete?: () => void;
  onEdit?: () => void;
  index: number;
  onToggleStatus?: () => void;
  isActive?: boolean;
}

/**
 * User specific card implementation for mobile view
 * Customized for the user management data structure
 */
export function UserCard({
  data,
  index,
  onDelete,
  onEdit,
  isActive,
  onToggleStatus,
}: UserCardProps) {
  // Convert data object to fields array based on the UI screenshot
  const fields: CardField[] = [
    {
      label: "#",
      value: index + 1,
    },
    // {
    //   label: "Organization",
    //   value: data.organization || "-",
    // },
    {
      label: "First name",
      value: data.firstName || "",
    },
    {
      label: "Last name",
      value: data.lastName || "",
    },
    {
      label: "Email ID",
      value: data.email || "",
    },
    {
      label: "Role",
      value: data.role.name || "",
    },
    {
      label: "Status",
      value: data.status || "",
    },
  ];

  return (
    <MobileCard
      fields={fields.filter((field) => field.value)} // Filter out empty fields
      onEdit={onEdit}
      deleteImg={true}
      onDelete={onDelete}
      switchActive={true}
      image={pen}
      image2={deleteIcon}
      addUser={true}
      isActive={isActive}
      onToggleStatus={onToggleStatus}
      headerClassName="bg-primary/20 text-primary"
      bodyClassName="text-sm"
    />
  );
}
