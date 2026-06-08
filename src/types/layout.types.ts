export interface HeaderProps {
  onToggleSidebar?: () => void;
}

export interface SideBarProps {
  isOpen?: boolean;
  setShowDialog: (value: boolean) => void;
  onClose?: () => void;
}

export interface NavItemProps {
  label: string;
  to: string;
  iconActive?: string;
  iconInactive?: string;
  isActive: (path: string) => boolean;
  isActiveParent: (path: string) => boolean;
  onClick?: (to: string) => void;
  iconOnly?: boolean;
  renderCustomIcon?: () => React.ReactNode;
}

export interface ExpandableNavProps {
  label: string;
  basePath: string;
  iconActive: string;
  iconInactive: string;
  children: Array<{
    label: string;
    path: string;
    children?: ExpandableNavProps["children"];
  }>;
  isActiveParent: (path: string) => boolean;
  onNavigate?: (path: string) => void;
  isActive?: (path: string) => boolean;
}

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttons: React.ReactNode; //can pass a react elements
}

export interface BlockedTableRow {
  id: string;
  mode: string;
  status: string;
  createdAt: string;
  amount: number;
  totalAmount: number;
  paidAmount: number;
  taxAmount: number;
  isEnabled: boolean;
}

export interface FormatDate {
  formatDate: (value: string) => void;
}
export interface BlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  placeholder: string;
}

export interface InvoiceDataItem {
  id: string;
  receiptNumber: string;
  dateOfReceipt: string;
  partNumber: string;
  internalPartNo: string;
  partLocation?: string;
  receiptQuantity: string;
  inwardQty: number;
  status: string;
}

export interface InvoicePayload {
  receiptNumber: string;
  dateOfReceipt: string;
  partNumber: string;
  receiptQuantity: string;
}

