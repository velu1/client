import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "./DataTable";
import { ColumnDef } from "@tanstack/react-table";

// Sample data
type Person = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const data: Person[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
  { id: "3", name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: "4", name: "Jane Smith", email: "jane@example.com", role: "User" },
  { id: "5", name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: "6", name: "Jane Smith", email: "jane@example.com", role: "User" },
  { id: "7", name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: "8", name: "Jane Smith", email: "jane@example.com", role: "User" },
];

const columns: ColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
];

const meta: Meta<typeof DataTable<Person>> = {
  title: "Components/DataTable",
  component: DataTable<Person>,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable<Person>>;

export const Default: Story = {
  args: {
    columns,
    data,
  },
};

export const WithActions: Story = {
  args: {
    columns,
    data,
    actions: [
      {
        label: "Edit",
        onClick: (row) => console.log("Edit", row),
      },
      {
        label: "Delete",
        onClick: (row) => console.log("Delete", row),
      },
    ],
  },
};

export const ServerSide: Story = {
  args: {
    columns,
    data,
    serverSide: true,
    serverSideOptions: {
      totalCount: 100,
      isLoading: false,
    },
    onPaginationChange: (pagination) =>
      console.log("Pagination changed", pagination),
    onSortingChange: (sorting) => console.log("Sorting changed", sorting),
    onSearchChange: (searchTerm) =>
      console.log("Search term changed", searchTerm),
  },
};
