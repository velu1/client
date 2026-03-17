import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { HeaderProps } from "../../types/layout.types";
import logo from "../../assets/newIcons/header/logoHeader.png";
import { motion } from "framer-motion";
import PrinterStatus from "../common/PrinterStatus";

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const [logoUrl, setLogoUrl] = useState<string>("");

  useEffect(() => {
    const loadLogo = () => {
      const storedLogo = localStorage.getItem("companyLogo");
      setLogoUrl(
        storedLogo?.startsWith("data:image")
          ? storedLogo
          : storedLogo
          ? `data:image/png;base64,${storedLogo}`
          : ""
      );
    };

    loadLogo();
    // Listen for update
    window.addEventListener("companyLogoUpdated", loadLogo);
    // Cleanup
    return () => {
      window.removeEventListener("companyLogoUpdated", loadLogo);
    };
  }, []);

  // const navigate = useNavigate();
  // Function to get the page title based on the current route
  const getPageTitle = () => {
    const path = location.pathname;

    // Home
    if (path === "/" || path === "/home") return "Home";

    // Inward System
    if (path === "/inward-system" || path === "/inward-system/")
      return "Inward System";
    if (path.startsWith("/inward-system/parts-in")) return "Parts In";
    if (path.startsWith("/inward-system/parts-list")) return "Parts List";

    // Reports
    if (path === "/reports" || path === "/reports/") return "Reports";
    if (path === "/reports/inwards" || path === "/reports/inwards/")
      return "Inwards";
    if (path.startsWith("/reports/inwards/parts-history"))
      return "Parts History";
    if (path.startsWith("/reports/inwards/parts-stick-history"))
      return "Parts Stick History";

    // Settings
    if (path === "/settings" || path === "/settings/") return "Settings";
    if (path.startsWith("/settings/system-config")) return "System Config";
    if (
      path === "/settings/incoming-system" ||
      path === "/settings/incoming-system/"
    )
      return "Incoming System";
    if (path.startsWith("/settings/incoming-system/parts-in-configuration"))
      return "Parts In Configuration";

    // Administration
    if (path === "/administration" || path === "/administration/")
      return "Administration";
    if (path.startsWith("/administration/company-profile"))
      return "Company Profile";
    if (
      path === "/administration/user-management" ||
      path === "/administration/user-management/"
    )
      return "User Management";
    if (path.startsWith("/administration/user-management/user"))
      return "User Page";
    if (path.startsWith("/administration/user-management/roles"))
      return "Roles Page";
    if (path.startsWith("/administration/user-management/assigned-roles"))
      return "Assigned Roles";
    if (
      path === "/administration/receipt" ||
      path === "/administration/receipt/"
    )
      return "Receipt";
    if (path.startsWith("/administration/receipt/master-data"))
      return "Master Data";
    if (path.startsWith("/administration/receipt/receipt-data"))
      return "Receipt Data";

    // Others
    if (path === "/profile") return "Profile";
    if (path === "/help") return "Help";
    if (path === "/template") return "Template";

    return "Page Not Found";
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-white border-b border-[#e5e5e5] h-16 flex justify-between items-center shadow-sm"
    >
      <button className="block md:hidden p-2" onClick={onToggleSidebar}>
        <div className="w-6 h-0.5 bg-primary mb-1 transition-all duration-300" />
        <div className="w-6 h-0.5 bg-primary mb-1 transition-all duration-300" />
        <div className="w-6 h-0.5 bg-primary transition-all duration-300" />
      </button>
      <div className="pl-2 flex-1 flex justify-between items-center mr-5 md:mr-0">
        <img src={logo} alt="logo" className="h-7 w-20 md:h-11 md:w-32" />

        <h3 className="text-sm md:text-lg font-medium text-gray-700 mr-10 md:mr-20">
          {getPageTitle()}
        </h3>

        <div className=" flex items-center gap-2 md:gap-4">
          <div className="border border-gray-200 rounded-md md:mr-2 ">
            <PrinterStatus />
          </div>
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Company Logo"
              className="h-10 w-10 md:h-12 md:w-12 object-cover rounded-full md:mr-5"
            />
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
