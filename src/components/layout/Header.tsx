import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { HeaderProps } from "../../types/layout.types";
import { motion } from "framer-motion";
import PrinterStatus from "../common/PrinterStatus";

const getPageTitle = (pathname: string): string => {
  if (pathname === "/" || pathname === "/home") return "Home";

  if (pathname.startsWith("/inward-system/parts-in")) return "Parts In";
  if (pathname.startsWith("/inward-system/parts-list")) return "Parts List";
  if (pathname.startsWith("/inward-system")) return "Inward System";

  if (pathname.startsWith("/reports/inwards/parts-history"))
    return "Parts History";
  if (pathname.startsWith("/reports/inwards/parts-stick-history"))
    return "Parts Stick History";
  if (pathname.startsWith("/reports/inwards")) return "Inwards";
  if (pathname.startsWith("/reports")) return "Reports";

  if (pathname.startsWith("/settings/system-config")) return "System Config";
  if (pathname.startsWith("/settings/incoming-system/parts-in-configuration"))
    return "Parts In Configuration";
  if (pathname.startsWith("/settings/incoming-system")) return "Incoming System";
  if (pathname.startsWith("/settings")) return "Settings";

  if (pathname.startsWith("/administration/company-profile"))
    return "Company Profile";
  if (pathname.startsWith("/administration/user-management/user"))
    return "Users";
  if (pathname.startsWith("/administration/user-management/roles"))
    return "Roles";
  if (pathname.startsWith("/administration/user-management/assigned-roles"))
    return "Assigned Roles";
  if (pathname.startsWith("/administration/user-management"))
    return "User Management";
  if (pathname.startsWith("/administration/receipt/master-data"))
    return "Master Data";
  if (pathname.startsWith("/administration/receipt/receipt-data"))
    return "Receipt Data";
  if (pathname.startsWith("/administration/receipt")) return "Receipt";
  if (pathname.startsWith("/administration")) return "Administration";

  if (pathname === "/profile") return "Profile";
  if (pathname === "/template") return "Template";

  return "";
};

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const [logoUrl, setLogoUrl] = useState<string>("");

  useEffect(() => {
    const loadLogo = () => {
      const stored = localStorage.getItem("companyLogo");
      setLogoUrl(
        stored?.startsWith("data:image")
          ? stored
          : stored
          ? `data:image/png;base64,${stored}`
          : ""
      );
    };

    loadLogo();
    window.addEventListener("companyLogoUpdated", loadLogo);
    return () => window.removeEventListener("companyLogoUpdated", loadLogo);
  }, []);

  const title = getPageTitle(location.pathname);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white border-b border-gray-100 h-14 flex items-center px-4 md:px-6 gap-4 shrink-0"
    >
      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-1"
        onClick={onToggleSidebar}
      >
        <span className="block w-5 h-0.5 bg-[#434a52] rounded" />
        <span className="block w-5 h-0.5 bg-[#434a52] rounded" />
        <span className="block w-5 h-0.5 bg-[#434a52] rounded" />
      </button>

      {/* Page title */}
      <div className="flex-1">
        {title && (
          <h1 className="text-sm md:text-base font-semibold text-gray-800">
            {title}
          </h1>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <PrinterStatus />
        </div>

        {logoUrl && (
          <img
            src={logoUrl}
            alt="Company"
            className="h-9 w-9 rounded-full object-cover border border-gray-200"
          />
        )}
      </div>
    </motion.header>
  );
};

export default Header;
