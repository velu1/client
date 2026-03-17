export interface User {
  organization: string;
  firstName: string;
  lastName: string;
  emailId: string;
  role: string;
  status: string;
}

export interface Role {
  name: string;
  description: string;
  time: string;
}

export interface AssignedRole {
  name: string;
  inward: string;
}

export interface partsIn {
  partNumber: string;
  uniqueId: string;
  quantity: string;
}

export interface Part {
  uniqueId: string;
  manufacturer: string;
  quantity: number;
  manufactureDate: string;
  lotNumber: string[];
  partLocation: string;
  isScraped: boolean;
  iqcStatus: string;
  auditStatus: string;
  partNumber: string;
  receiptNumber: string;
  description: string;
  internalPartNo: string;
  idCode: string;
  extractedImage: string;
  expireDate: string | null;
  dateOfReceipt: string;
  isDeleted: boolean;
  isReturn: boolean;
  iqcRevalidationStatus: boolean;
  multipleSticker: string;
  MOQ: number;
  mfgDate: string;
  auditRun: boolean;
  auditUUID: string | null;
  template_id: string;
  templateName: string;
  allFieldsExtracted: boolean;
  partNumberExtracted: boolean;
  quantityExtracted: boolean;
  lotNumberExtracted: boolean;
  manufdateExtracted: boolean;
  uniqIdData: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export const assignedRoles: AssignedRole[] = [
  {
    name: "Role 1",
    inward:
      "AI Incoming, Receipts, Inward reports, Manual incoming, Parts list, Inward settings",
  },
  {
    name: "Role 2",
    inward: "AI Incoming, Manual incoming, Parts list, Inward settings",
  },
  {
    name: "Role 3",
    inward: "Parts list, Inward settings",
  },
  {
    name: "Role 1",
    inward: "AI Incoming, Manual incoming, Parts list",
  },
  {
    name: "Role 2",
    inward:
      "AI Incoming, Receipts, Inward reports, Manual incoming, Parts list, Inward settings",
  },
  {
    name: "Role 3",
    inward: "AI Incoming, Manual incoming, Parts list, Inward settings",
  },
  {
    name: "Role 1",
    inward: "Parts list, Inward settings",
  },
  {
    name: "Role 2",
    inward: "AI Incoming, Manual incoming, Parts list",
  },
  {
    name: "Role 3",
    inward:
      "AI Incoming, Receipts, Inward reports, Manual incoming, Parts list, Inward settings",
  },
  {
    name: "Role 1",
    inward: "AI Incoming, Manual incoming, Parts list, Inward settings",
  },
  {
    name: "Role 2",
    inward: "Parts list, Inward settings",
  },
  {
    name: "Role 3",
    inward: "AI Incoming, Manual incoming, Parts list",
  },
  {
    name: "Role 1",
    inward:
      "AI Incoming, Receipts, Inward reports, Manual incoming, Parts list, Inward settings",
  },
  {
    name: "Role 2",
    inward: "AI Incoming, Manual incoming, Parts list, Inward settings",
  },
  {
    name: "Role 3",
    inward: "Parts list, Inward settings",
  },
  {
    name: "Role 1",
    inward: "AI Incoming, Manual incoming, Parts list",
  },
  {
    name: "Role 2",
    inward: "AI Incoming, Manual incoming, Parts list",
  },
  {
    name: "Role 2",
    inward: "AI Incoming, Manual incoming, Parts list",
  },
];

export const roles: Role[] = [
  {
    name: "Role 1",
    description: "Admin",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 2",
    description: "Role 1",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 3",
    description: "Role 2",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 1",
    description: "Role 1",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 2",
    description: "Role 2",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 3",
    description: "Role 1",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 1",
    description: "Role 2",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 2",
    description: "Role 1",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 3",
    description: "Role 2",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 1",
    description: "Role 1",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 2",
    description: "Role 2",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 3",
    description: "Role 1",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 1",
    description: "Role 2",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 2",
    description: "Role 1",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 3",
    description: "Role 2",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 1",
    description: "Role 1",
    time: "12 Apr 2025, 02:00 pm",
  },
  {
    name: "Role 2",
    description: "Role 2",
    time: "12 Apr 2025, 02:00 pm",
  },
];

export const users: User[] = [
  {
    organization: "-",
    firstName: "Mysore",
    lastName: "Mindset",
    emailId: "example@gmail.com",
    role: "Admin",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Jane",
    lastName: "Cooper",
    emailId: "example@gmail.com",
    role: "Role 1",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Jane",
    lastName: "Cooper",
    emailId: "example@gmail.com",
    role: "Role 2",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Jane",
    lastName: "Cooper",
    emailId: "example@gmail.com",
    role: "Role 1",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Mysore",
    lastName: "Mindset",
    emailId: "example@gmail.com",
    role: "Role 2",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Jane",
    lastName: "Cooper",
    emailId: "example@gmail.com",
    role: "Role 1",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Mysore",
    lastName: "Mindset",
    emailId: "example@gmail.com",
    role: "Role 2",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Jane",
    lastName: "Cooper",
    emailId: "example@gmail.com",
    role: "Role 1",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Mysore",
    lastName: "Mindset",
    emailId: "example@gmail.com",
    role: "Role 2",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Jane",
    lastName: "Cooper",
    emailId: "example@gmail.com",
    role: "Role 1",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Mysore",
    lastName: "Mindset",
    emailId: "example@gmail.com",
    role: "Role 2",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Jane",
    lastName: "Cooper",
    emailId: "example@gmail.com",
    role: "Role 1",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Mysore",
    lastName: "Mindset",
    emailId: "example@gmail.com",
    role: "Role 2",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Jane",
    lastName: "Cooper",
    emailId: "example@gmail.com",
    role: "Role 1",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Mysore",
    lastName: "Mindset",
    emailId: "example@gmail.com",
    role: "Role 2",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Jane",
    lastName: "Cooper",
    emailId: "example@gmail.com",
    role: "Role 1",
    status: "Active",
  },
  {
    organization: "-",
    firstName: "Mysore",
    lastName: "Mindset",
    emailId: "example@gmail.com",
    role: "Role 2",
    status: "Active",
  },
];

export const partsData: Part[] = [
 
];
