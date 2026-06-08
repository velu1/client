import { useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetClose } from "../ui/sheet";
import { useState } from "react";
import {
  ChevronDown,
  Home,
  PackageCheck,
  BarChart3,
  ShieldCheck,
  SlidersHorizontal,
  LayoutTemplate,
  HelpCircle,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import ContactDialog from "../admins/ContactDialog";
import ProfileDialog from "../profile/ProfileDialog";
import { SideBarProps } from "../../types/layout.types";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface ExtendedSideBarProps extends SideBarProps {
  setActiveSection: (section: string) => void;
  activeSection: string;
}

type MenuNode = {
  label: string;
  path?: string;
  permission?: string;
  icon?: React.ReactNode;
  children?: MenuNode[];
};

const isPathActive = (node: MenuNode, pathname: string): boolean => {
  if (node.path) return pathname.startsWith(node.path);
  return node.children?.some((c) => isPathActive(c, pathname)) ?? false;
};

const Sidebar: React.FC<ExtendedSideBarProps> = ({
  isOpen,
  onClose,
  setShowDialog,
  setActiveSection,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions } = useAuth();

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);

  const hasPermission = (key?: string) => !key || permissions.includes(key);

  // Pull user initials from JWT
  const getUserInfo = () => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return { initials: "U", name: "User" };
      const decoded: any = jwtDecode(token);
      const name = decoded.name || decoded.email || decoded.username || "User";
      const initials = name
        .split(/[\s@.]+/)
        .slice(0, 2)
        .map((p: string) => p[0]?.toUpperCase() ?? "")
        .join("");
      return { initials: initials || "U", name };
    } catch {
      return { initials: "U", name: "User" };
    }
  };

  const userInfo = getUserInfo();

  const MENU: MenuNode[] = [
    { label: "Home", path: "/home", permission: "home", icon: <Home size={15} /> },
    {
      label: "Inward System",
      permission: "inward-system",
      icon: <PackageCheck size={15} />,
      children: [
        { label: "Parts In", path: "/inward-system/parts-in" },
        { label: "Parts List", path: "/inward-system/parts-list" },
      ],
    },
    {
      label: "Reports",
      permission: "reports",
      icon: <BarChart3 size={15} />,
      children: [
        {
          label: "Inwards",
          children: [
            { label: "Parts History", path: "/reports/inwards/parts-history" },
          ],
        },
      ],
    },
    {
      label: "Administration",
      permission: "administration",
      icon: <ShieldCheck size={15} />,
      children: [
        { label: "Company Profile", path: "/administration/company-profile" },
        {
          label: "User Management",
          children: [
            { label: "User", path: "/administration/user-management/user" },
            { label: "Roles", path: "/administration/user-management/roles" },
            { label: "Assigned Roles", path: "/administration/user-management/assigned-roles" },
          ],
        },
        {
          label: "Receipt",
          children: [
            { label: "Master Data", path: "/administration/receipt/master-data" },
            { label: "Receipt Data", path: "/administration/receipt/receipt-data" },
          ],
        },
      ],
    },
    {
      label: "Settings",
      permission: "settings",
      icon: <SlidersHorizontal size={15} />,
      children: [
        { label: "System Configs", path: "/settings/system-config" },
        {
          label: "Incoming System",
          children: [
            { label: "Parts In Config", path: "/settings/incoming-system/parts-in-configuration" },
          ],
        },
      ],
    },
    { label: "Template", path: "/template", permission: "template", icon: <LayoutTemplate size={15} /> },
  ];

  const VerticalMenu = ({ item, level = 0 }: { item: MenuNode; level?: number }) => {
    const active = isPathActive(item, location.pathname);
    const isLeaf = !item.children;
    const [open, setOpen] = useState(active);

    if (!hasPermission(item.permission)) return null;

    const handleClick = () => {
      if (item.children) {
        setOpen((p) => !p);
      } else if (item.path) {
        navigate(item.path);
        setActiveSection(item.path);
        onClose?.();
      }
    };

    const indent = level === 0 ? 12 : 10 + level * 16;

    return (
      <div>
        <div
          onClick={handleClick}
          style={{ paddingLeft: `${indent}px` }}
          className={`relative flex items-center justify-between pr-3 py-2 rounded-lg cursor-pointer text-sm transition-all duration-150 select-none group
            ${isLeaf && active
              ? "bg-white/[0.12] text-white font-medium"
              : !isLeaf && active
              ? "text-white"
              : "text-white/50 hover:text-white/85 hover:bg-white/[0.06]"
            }
          `}
        >
          {/* Left accent bar for active leaves */}
          {isLeaf && active && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white/80 rounded-r-full" />
          )}

          <div className="flex items-center gap-2.5">
            {/* Top-level icon */}
            {level === 0 && item.icon && (
              <span className={`shrink-0 transition-opacity ${active ? "opacity-90" : "opacity-55 group-hover:opacity-75"}`}>
                {item.icon}
              </span>
            )}
            {/* Child dot for non-top-level leaves */}
            {level > 0 && isLeaf && (
              <span className={`shrink-0 h-1 w-1 rounded-full transition-colors ${active ? "bg-white" : "bg-white/30"}`} />
            )}
            {/* Child chevron placeholder for non-leaf groups */}
            {level > 0 && !isLeaf && (
              <span className="shrink-0 h-1 w-1 rounded-full bg-white/20" />
            )}

            <span className={level === 0 ? "text-[13px]" : "text-[12.5px]"}>
              {item.label}
            </span>
          </div>

          {item.children && (
            <ChevronDown
              size={12}
              className={`shrink-0 opacity-40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          )}
        </div>

        {/* Children with vertical connector line */}
        {item.children && (
          <div
            className={`overflow-hidden transition-all duration-200 ${
              open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="relative ml-[20px] mt-0.5 mb-1">
              {/* Vertical connector line */}
              <span className="absolute left-[5px] top-1 bottom-1 w-px bg-white/10" />
              <div className="space-y-0.5">
                {item.children.map((child) => (
                  <VerticalMenu key={child.label} item={child} level={level + 1} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#434a52]">

      {/* Brand */}
      <div
        className="flex items-center gap-3 px-4 pt-5 pb-4 cursor-pointer shrink-0"
        onClick={() => navigate("/home")}
      >
        <div className="h-8 w-8 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-[11px] tracking-widest">TF</span>
        </div>
        <div>
          <p className="text-white font-semibold text-[14px] leading-tight tracking-wide">TraceFlow</p>
          <p className="text-white/35 text-[10px] tracking-wider uppercase">Traceability</p>
        </div>
      </div>

      <div className="h-px bg-white/[0.08] mx-4 shrink-0" />

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-3 pb-2 space-y-0.5 overflow-y-auto scrollbar-none">
        {MENU.map((item) => (
          <VerticalMenu key={item.label} item={item} />
        ))}
      </nav>

      <div className="h-px bg-white/[0.08] mx-4 shrink-0" />

      {/* Footer actions */}
      <div className="px-3 pt-2 pb-3 space-y-0.5 shrink-0">
        <button
          onClick={() => setContactDialogOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] text-white/50 hover:text-white/85 hover:bg-white/[0.06] transition-all text-left"
        >
          <HelpCircle size={14} className="shrink-0 opacity-70" />
          Help & Support
        </button>
        <button
          onClick={() => setProfileDialog(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] text-white/50 hover:text-white/85 hover:bg-white/[0.06] transition-all text-left"
        >
          <User size={14} className="shrink-0 opacity-70" />
          Profile
        </button>
        <button
          onClick={() => setShowDialog(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] text-white/50 hover:text-red-300 hover:bg-red-500/10 transition-all text-left"
        >
          <LogOut size={14} className="shrink-0 opacity-70" />
          Sign out
        </button>
      </div>

      {/* User strip */}
      <div className="px-3 pb-4 shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.07] border border-white/[0.08]">
          <div className="h-7 w-7 rounded-lg bg-white/15 ring-1 ring-white/20 flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-bold">{userInfo.initials}</span>
          </div>
          <p className="text-white/70 text-[11.5px] font-medium truncate">{userInfo.name}</p>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-[260px] bg-[#434a52] p-0 border-0">
          <SheetClose />
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop */}
      <div className="hidden md:flex w-[240px] h-full shrink-0">
        <SidebarContent />
      </div>

      <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
      {profileDialog && (
        <ProfileDialog open={profileDialog} onClose={() => setProfileDialog(false)} />
      )}
    </>
  );
};

export default Sidebar;
