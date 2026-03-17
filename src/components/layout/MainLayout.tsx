import { useState, useRef, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Dialog from "../common/DialogComponent";
import { clearAuthData } from "../../api/auth";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const MainLayout = () => {
  const navigate = useNavigate();

  const [showDialog, setShowDialog] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // const navigate = useNavigate();
  const location = useLocation();

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // useEffect(() => {
  //   if (activeSection && scrollRef.current) {
  //     scrollRef.current.scrollTo({
  //       top: 0,
  //       behavior: "smooth",
  //     });
  //   }
  // }, [activeSection]);

  useEffect(() => {
    const handleScrollToTop = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    };

    window.addEventListener("scrollToTop", handleScrollToTop);
    return () => window.removeEventListener("scrollToTop", handleScrollToTop);
  }, []);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Skip if no active section
      if (!activeSection) return;

      // Check if the click was outside the menu and sidebar
      const target = event.target as Node;
      const sidebarEl = document.querySelector(".sidebar");
      const isOutsideMenu =
        menuRef.current && !menuRef.current.contains(target);
      const isOutsideSidebar = sidebarEl && !sidebarEl.contains(target);

      if (isOutsideMenu && isOutsideSidebar) {
        setActiveSection("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeSection]);

  const handleMouseEnter = (menuId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredSubmenu(menuId);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setHoveredSubmenu(null);
    }, 800);
  };

  // const handleLogout = async () => {
  //   await clearAuthData();
  //   navigate("/login");
  // };

  const handleConfirm = () => {
    console.log("confirmed");
    clearAuthData();
    navigate("/login");
  };

  // Function to determine the vertical position of the menu based on which icon was clicked
  const getMenuPosition = () => {
    const path = activeSection || location.pathname;

    if (path.startsWith("/home")) return "top-[96px]";
    if (path.startsWith("/inward-system")) return "top-[105px]";
    if (path.startsWith("/reports")) return "top-[160px]";
    if (path.startsWith("/settings")) return "top-[210px]";
    if (path.startsWith("/administration")) return "top-[260px]";

    return "top-[156px]"; // Default position
  };

  const shouldShowMenu = () => {
    // Show menu when activeSection is set or when on specific paths
    return (
      activeSection !== "" ||
      [
        "/inward-system",
        "/inward-system/",
        "/reports",
        "/reports/",
        "/reports/inwards",
        "/reports/inwards/",
        "/settings",
        "/settings/",
        "/settings/incoming-system",
        "/settings/incoming-system/",
        "/administration",
        "/administration/",
        "/administration/user-management",
        "/administration/user-management/",
        "/administration/receipt",
        "/administration/receipt/",
      ].includes(location.pathname)
    );
  };

  const renderMenu = () => {
    // If no section is active and not on a menu path, don't show any menu
    if (!shouldShowMenu()) {
      return null;
    }

    const currentPath = activeSection || location.pathname;

    // Inward System Menu
    if (currentPath === "/inward-system" || currentPath === "/inward-system/") {
      return (
        <div
          ref={menuRef}
          className={`absolute left-[18px] ${getMenuPosition()} z-50`}
        >
          <div className="bg-primary rounded-md p-2 w-64 my-2 ml-1">
            <h3 className="text-white text-lg font-medium">Inward system</h3>
          </div>
          <div className="bg-white rounded-md shadow-sm ml-1">
            <div className="px-3 w-64 border border-primary rounded-md">
              <Link
                to="/inward-system/parts-in"
                className="block py-2 text-gray-600 hover:text-primary"
                onClick={() => setActiveSection("")}
              >
                Parts In
              </Link>
              <Link
                to="/inward-system/parts-list"
                className="block py-2 text-gray-600 hover:text-primary"
                onClick={() => setActiveSection("")}
              >
                Parts list
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Reports Menu
    if (currentPath === "/reports" || currentPath === "/reports/") {
      return (
        <div
          ref={menuRef}
          className={`absolute left-[18px] ${getMenuPosition()} z-50`}
        >
          <div className="bg-primary rounded-md p-2 w-64 my-2 ml-1">
            <h3 className="text-white text-lg font-medium">Reports</h3>
          </div>
          <div className="bg-white rounded-md shadow-sm ml-1">
            <div className="px-3 w-64 border border-primary rounded-md">
              <div
                className="relative py-2 text-gray-600 hover:text-primary flex items-center justify-between cursor-pointer"
                onMouseEnter={() => handleMouseEnter("inwards")}
                onMouseLeave={handleMouseLeave}
              >
                <span>Inwards</span>
                <ChevronRight className="w-5 h-5 ml-2 text-primary bg-[#9ebcdb2b] rounded-full" />

                {hoveredSubmenu === "inwards" && (
                  <div
                    className="absolute left-full top-0 ml-5 bg-white border border-primary rounded-md shadow-md w-64 px-2"
                    onMouseEnter={() => handleMouseEnter("inwards")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      to="/reports/inwards/parts-history"
                      className="block py-2 text-gray-600 hover:text-primary"
                      onClick={() => setActiveSection("")}
                    >
                      Parts History
                    </Link>
                    {/* <Link
                      to="/reports/inwards/parts-stick-history"
                      className="block py-2 text-gray-600 hover:text-primary"
                      onClick={() => setActiveSection("")}
                    >
                      Parts Stick History
                    </Link> */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Reports -> Inwards Submenu - This now uses hover to show in the UI
    if (
      currentPath === "/reports/inwards" ||
      currentPath === "/reports/inwards/"
    ) {
      return (
        <div
          ref={menuRef}
          className={`absolute left-[18px] ${getMenuPosition()} z-50`}
        >
          <div className="bg-primary rounded-md p-2 w-64 my-2 ml-1">
            <h3 className="text-white text-lg font-medium">Reports</h3>
          </div>
          <div className="bg-white rounded-md shadow-sm ml-1">
            <div className="px-3 w-64 border border-primary rounded-md">
              <div
                className="relative py-2 text-primary flex items-center justify-between cursor-pointer"
                onMouseEnter={() => handleMouseEnter("inwards")}
                onMouseLeave={handleMouseLeave}
              >
                <span>Inwards</span>
                <ChevronRight className="w-5 h-5 ml-2 text-primary bg-[#9ebcdb2b] rounded-full" />

                <div
                  className="absolute left-full top-0 ml-5 bg-white border border-primary rounded-md shadow-md w-64 px-2"
                  onMouseEnter={() => handleMouseEnter("inwards")}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to="/reports/inwards/parts-history"
                    className="block py-2 text-gray-600 hover:text-primary"
                    onClick={() => setActiveSection("")}
                  >
                    Parts History
                  </Link>
                  {/* <Link
                    to="/reports/inwards/parts-stick-history"
                    className="block py-2 text-gray-600 hover:text-primary"
                    onClick={() => setActiveSection("")}
                  >
                    Parts Stick History
                  </Link> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Settings Menu
    if (currentPath === "/settings" || currentPath === "/settings/") {
      return (
        <div
          ref={menuRef}
          className={`absolute left-[18px] ${getMenuPosition()} z-50`}
        >
          <div className="bg-primary rounded-md p-2 w-64 my-2 ml-1">
            <h3 className="text-white text-lg font-medium">Settings</h3>
          </div>
          <div className="bg-white rounded-md shadow-sm ml-1">
            <div className="px-3 w-64 border border-primary rounded-md">
              {/* <Link
                to="/settings/system-config"
                className="block py-2 text-gray-600 hover:text-primary"
                onClick={() => setActiveSection("")}
              >
                System configs
              </Link> */}
              <div
                className="relative py-2 text-gray-600 hover:text-primary flex items-center justify-between cursor-pointer"
                onMouseEnter={() => handleMouseEnter("incoming")}
                onMouseLeave={handleMouseLeave}
              >
                <span>Incoming system</span>
                <ChevronRight className="w-5 h-5 ml-2 text-primary bg-[#9ebcdb2b] rounded-full" />

                {hoveredSubmenu === "incoming" && (
                  <div
                    className="absolute left-full top-0 ml-5 bg-white border border-primary rounded-md shadow-md w-64 px-2"
                    onMouseEnter={() => handleMouseEnter("incoming")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      to="/settings/incoming-system/parts-in-configuration"
                      className="block py-2 text-gray-600 hover:text-primary"
                      onClick={() => setActiveSection("")}
                    >
                      Parts in configuration
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Settings -> Incoming System Submenu - This now uses hover to show in the UI
    if (
      currentPath === "/settings/incoming-system" ||
      currentPath === "/settings/incoming-system/"
    ) {
      return (
        <div
          ref={menuRef}
          className={`absolute left-[18px] ${getMenuPosition()} z-50`}
        >
          <div className="bg-primary rounded-md p-2 w-64 my-2 ml-1">
            <h3 className="text-white text-lg font-medium">Settings</h3>
          </div>
          <div className="bg-white rounded-md shadow-sm ml-1">
            <div className="px-3 w-64 border border-primary rounded-md">
              {/* <Link
                to="/settings/system-config"
                className="block py-2 text-gray-600 hover:text-primary"
                onClick={() => setActiveSection("")}
              >
                System configs
              </Link> */}
              <div
                className="relative py-2 text-primary flex items-center justify-between cursor-pointer"
                onMouseEnter={() => handleMouseEnter("incoming")}
                onMouseLeave={handleMouseLeave}
              >
                <span>Incoming system</span>
                <ChevronRight className="w-5 h-5 ml-2 text-primary bg-[#9ebcdb2b] rounded-full" />

                <div
                  className="absolute left-full top-0 ml-5 bg-white border border-primary rounded-md shadow-md w-64 px-2"
                  onMouseEnter={() => handleMouseEnter("incoming")}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to="/settings/incoming-system/parts-in-configuration"
                    className="block py-2 text-gray-600 hover:text-primary"
                    onClick={() => setActiveSection("")}
                  >
                    Parts in configuration
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Administration Menu
    if (
      currentPath === "/administration" ||
      currentPath === "/administration/"
    ) {
      return (
        <div
          ref={menuRef}
          className={`absolute left-[18px] ${getMenuPosition()} z-50`}
        >
          <div className="bg-primary  rounded-md p-2 w-64 my-2 ml-1">
            <h3 className="text-white text-lg font-medium">Administration</h3>
          </div>
          <div className="bg-white rounded-md shadow-sm ml-1">
            <div className="px-3 w-64 border border-primary rounded-md">
              <Link
                to="/administration/company-profile"
                className="block py-2 text-gray-600 hover:text-primary"
                onClick={() => setActiveSection("")}
              >
                Company profile
              </Link>
              <div
                className="relative py-1 text-gray-600 hover:text-primary flex items-center justify-between cursor-pointer"
                onMouseEnter={() => handleMouseEnter("user-management")}
                onMouseLeave={handleMouseLeave}
              >
                <span>User management</span>
                <ChevronRight className="w-5 h-5 ml-2 text-primary bg-[#9ebcdb2b] rounded-full" />

                {hoveredSubmenu === "user-management" && (
                  <div
                    className="absolute left-full top-0 ml-5 bg-white border border-primary rounded-md shadow-md w-64 px-2"
                    onMouseEnter={() => handleMouseEnter("user-management")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      to="/administration/user-management/user"
                      className="block py-2 text-gray-600 hover:text-primary"
                      onClick={() => setActiveSection("")}
                    >
                      User Page
                    </Link>
                    <Link
                      to="/administration/user-management/roles"
                      className="block py-2 text-gray-600 hover:text-primary"
                      onClick={() => setActiveSection("")}
                    >
                      Roles Page
                    </Link>
                    <Link
                      to="/administration/user-management/assigned-roles"
                      className="block py-2 text-gray-600 hover:text-primary"
                      onClick={() => setActiveSection("")}
                    >
                      Assigned Roles
                    </Link>
                  </div>
                )}
              </div>
              <div
                className="relative py-2 text-gray-600 hover:text-primary flex items-center justify-between cursor-pointer"
                onMouseEnter={() => handleMouseEnter("receipt")}
                onMouseLeave={handleMouseLeave}
              >
                <span>Receipt</span>
                <ChevronRight className="w-5 h-5 ml-2 text-primary bg-[#9ebcdb2b] rounded-full" />

                {hoveredSubmenu === "receipt" && (
                  <div
                    className="absolute left-full top-0 ml-5 bg-white border border-primary rounded-md shadow-md w-64 px-2"
                    onMouseEnter={() => handleMouseEnter("receipt")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      to="/administration/receipt/master-data"
                      className="block py-2 text-gray-600 hover:text-primary"
                      onClick={() => setActiveSection("")}
                    >
                      Master Data
                    </Link>
                    <Link
                      to="/administration/receipt/receipt-data"
                      className="block py-2 text-gray-600 hover:text-primary"
                      onClick={() => setActiveSection("")}
                    >
                      Receipt Data
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        setShowDialog={setShowDialog}
        setActiveSection={setActiveSection}
        activeSection={activeSection}
        className="sidebar"
      />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main ref={scrollRef} className="flex-1 overflow-auto relative">
          <div className="p-4">
            <Outlet />
          </div>

          {/* Overlay */}
          {/* {!["/template", "/home"].some((path) =>
            location.pathname.startsWith(path)
          ) &&
            activeSection && (
              <div
                className="absolute inset-0 bg-opacity-10 backdrop-blur-xs z-40"
                onClick={() => setActiveSection("")}
              />
            )} */}

          {/* Menu overlay */}
          {renderMenu()}
        </main>
      </div>
      {/* Dialog component */}
      <Dialog
        isOpen={showDialog}
        onClose={() => {
          setShowDialog(false);
        }}
        title="Logout"
        subtitle="Are you sure you want to logout? You'll be redirected to login page."
        cancelButtonText="Cancel"
        saveButtonText="Confirm"
        onSave={handleConfirm}
      />
    </div>
  );
};

export default MainLayout;
