// import { Link, useLocation } from "react-router-dom";
// import { SideBarProps } from "../../types/layout.types";
// import logo from "../../assets/newIcons/sidebar/logo.png";
// import arrowI from "../../assets/newIcons/sidebar/arrowInwards.svg";
// import arrowIW from "../../assets/newIcons/sidebar/arrowInwardsWhite.svg";
// import help from "../../assets/newIcons/sidebar/help.svg";
// import home from "../../assets/newIcons/sidebar/home.svg";
// import homeMobile from "../../assets/newIcons/sidebar/homeMobile.svg";
// import list from "../../assets/newIcons/sidebar/list.svg";
// import listW from "../../assets/newIcons/sidebar/listWhite.svg";
// import logout from "../../assets/newIcons/sidebar/logout.svg";
// import profile from "../../assets/newIcons/sidebar/profile.svg";
// import profileW from "../../assets/newIcons/sidebar/profileWhite.svg";
// import settings from "../../assets/newIcons/sidebar/settings.svg";
// import settingsW from "../../assets/newIcons/sidebar/settingsWhite.svg";
// import template from "../../assets/newIcons/sidebar/template.svg";
// import templateWhite from "../../assets/newIcons/sidebar/templateW.svg";
// import { Sheet, SheetContent, SheetClose } from "../ui/sheet";
// import { useState } from "react";
// import { ExpandableNav } from "../sidebar/ExpandableNav";
// import { NavItem } from "../sidebar/NavItem";
// import { useNavigate } from "react-router-dom";
// import ContactDialog from "../admins/ContactDialog";
// import ProfileDialog from "../profile/ProfileDialog";
// import { useAuth } from "../../utils/AuthContext";

// // import { useState } from "react";

// // Custom Menu List Icon Component
// // const MenuListIcon = ({ isActive }: { isActive: boolean }) => {
// //   return (
// //     <div className="w-6 h-6 flex flex-col items-center justify-center gap-[3px]">
// //       <div className="h-[2px] w-5 bg-[#c7a97a]"></div>
// //       <div className="h-[2px] w-5 bg-[#c7a97a]"></div>
// //       <div className="h-[2px] w-5 bg-[#c7a97a]"></div>
// //       <div className="absolute right-1 bottom-1 w-2 h-2 bg-[#c7a97a] rounded-sm flex items-center justify-center">
// //         <div className="h-[1px] w-1 bg-white"></div>
// //       </div>
// //     </div>
// //   );
// // };

// // Custom Snowflake Icon Component

// // Custom Settings Icon Component

// interface ExtendedSideBarProps extends SideBarProps {
//   setActiveSection: (section: string) => void;
//   activeSection: string;
//   className?: string;
// }

// const Sidebar: React.FC<ExtendedSideBarProps> = ({
//   isOpen,
//   onClose,
//   setShowDialog,
//   setActiveSection,
//   activeSection,
// }) => {
//   const [contactDialogOpen, setContactDialogOpen] = useState(false);

//   const [profileDialog, setProfileDialog] = useState(false);
//   const { permissions } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();

//   //remove blur
//   const isNoBlurRoute = ["/template", "/home"].some((path) =>
//     location.pathname.startsWith(path)
//   );


//   const navigateAndClose = (path: string) => {
//     navigate(path);
//     onClose?.();
//   };

//   const isActive = (path: string) => location.pathname === path;
//   const isActiveParent = (path: string) =>
//     location.pathname.startsWith(path) || activeSection === path;

//   const handleSectionClick = (section: string) => {
//     setActiveSection(section);
//     navigate(section);
//   };

//   // Check if a section should be visible based on permissions
//   const hasPermission = (section: string) => {
//     return permissions.includes(section);
//   };

//   // Always show these items regardless of permissions
//   // const alwaysShow = ["help", "profile", "logout"];

//   return (
//     <>
//       {/* Mobile Screen */}
//       <Sheet open={isOpen} onOpenChange={onClose}>
//         <SheetContent
//           side="left"
//           className={`w-[280px] bg-white p-0 flex flex-col ${
//             isNoBlurRoute ? "!backdrop-blur-none !backdrop-filter-none" : ""
//           }`}
//         >
//           <SheetClose asChild></SheetClose>

//           <div className="flex justify-center items-center mt-10">
//             <img
//               onClick={() => {
//                 navigate("/home");
//                 setActiveSection("/home");
//                 onClose?.(); // Close mobile sidebar
//               }}
//               src={logo}
//               alt="Logo"
//               className="w-[60px] h-[60px] object-contain"
//             />
//           </div>

//           <div className="flex-1 overflow-y-auto px-4">
//             <nav className="space-y-2 text-sm">
//               {hasPermission("home") && (
//                 <NavItem
//                   label="Home"
//                   to="/home"
//                   iconActive={home}
//                   iconInactive={homeMobile}
//                   isActive={isActive}
//                   onClick={navigateAndClose}
//                   isActiveParent={isActiveParent}
//                 />
//               )}

//               {hasPermission("inward-system") && (
//                 <ExpandableNav
//                   isActive={isActive}
//                   label="Inward System"
//                   basePath="/inward-system"
//                   iconActive={arrowIW}
//                   iconInactive={arrowI}
//                   onNavigate={navigateAndClose}
//                   children={[
//                     { label: "Parts In", path: "/inward-system/parts-in" },
//                     { label: "Parts List", path: "/inward-system/parts-list" },
//                   ]}
//                   isActiveParent={isActiveParent}
//                 />
//               )}

//               {hasPermission("reports") && (
//                 <ExpandableNav
//                   isActive={isActive}
//                   label="Reports"
//                   basePath="/reports"
//                   iconActive={listW}
//                   iconInactive={list}
//                   isActiveParent={isActiveParent}
//                   onNavigate={navigateAndClose}
//                   children={[
//                     {
//                       label: "Inwards",
//                       path: "/reports/inwards",
//                       children: [
//                         {
//                           label: "Parts History",
//                           path: "/reports/inwards/parts-history",
//                         },
//                       ],
//                     },
//                   ]}
//                 />
//               )}

//               {hasPermission("settings") && (
//                 <ExpandableNav
//                   label="Settings"
//                   basePath="/settings"
//                   iconActive={settingsW}
//                   iconInactive={settings}
//                   isActiveParent={isActiveParent}
//                   isActive={isActive}
//                   onNavigate={navigateAndClose}
//                   children={[
//                     {
//                       label: "System Configs",
//                       path: "/settings/system-config",
//                     },
//                     {
//                       label: "Incoming System",
//                       path: "/settings/incoming-system",
//                       children: [
//                         {
//                           label: "Parts in configuration",
//                           path: "/settings/incoming-system/parts-in-configuration",
//                         },
//                       ],
//                     },
//                   ]}
//                 />
//               )}

//               {hasPermission("administration") && (
//                 <ExpandableNav
//                   isActive={isActive}
//                   label="Administration"
//                   basePath="/administration"
//                   iconActive={profileW}
//                   iconInactive={profile}
//                   isActiveParent={isActiveParent}
//                   onNavigate={navigateAndClose}
//                   children={[
//                     {
//                       label: "Company Profile",
//                       path: "/administration/company-profile",
//                     },
//                     {
//                       label: "User Management",
//                       path: "/administration/user-management",
//                       children: [
//                         {
//                           label: "User",
//                           path: "/administration/user-management/user",
//                         },
//                         {
//                           label: "Roles",
//                           path: "/administration/user-management/roles",
//                         },
//                         {
//                           label: "Assigned roles",
//                           path: "/administration/user-management/assigned-roles",
//                         },
//                       ],
//                     },
//                     {
//                       label: "Receipt",
//                       path: "/administration/receipt",
//                       children: [
//                         {
//                           label: "Master Data",
//                           path: "/administration/receipt/master-data",
//                         },
//                         {
//                           label: "Receipt Data",
//                           path: "/administration/receipt/receipt-data",
//                         },
//                       ],
//                     },
//                   ]}
//                 />
//               )}
//               <NavItem
//                 label="Template"
//                 to="/template"
//                 iconActive={templateWhite}
//                 iconInactive={template}
//                 isActive={isActive}
//                 onClick={navigateAndClose}
//                 isActiveParent={isActiveParent}
//               />
//             </nav>
//           </div>

//           <div className="relative bottom-3 w-full mt-auto text-sm">
//             <NavItem
//               label="Help"
//               to="#"
//               isActive={() => false}
//               isActiveParent={isActiveParent}
//               onClick={() => {
//                 setContactDialogOpen(true);
//               }}
//               renderCustomIcon={() => (
//                 <img
//                   src={help}
//                   alt="Help"
//                   className="w-5 h-4 md:w-4 md:h-4 xl:w-5 xl:h-5"
//                 />
//               )}
//             />

//             <NavItem
//               label="Profile"
//               to="#"
//               isActive={() => false}
//               isActiveParent={isActiveParent}
//               onClick={() => {
//                 setProfileDialog(true);
//               }}
//               renderCustomIcon={() => (
//                 <div className="w-5 h-5 md:w-8 md:h-8 xl:w-10 xl:h-10 rounded-full bg-[#c7a97a] flex items-center justify-center text-white font-bold text-lg font-BreeSerif">
//                   A
//                 </div>
//               )}
//             />

//             <NavItem
//               label="Logout"
//               to="#"
//               isActive={() => false}
//               isActiveParent={() => false}
//               onClick={() => setShowDialog(true)}
//               renderCustomIcon={() => (
//                 <img
//                   src={logout}
//                   alt="Logout"
//                   className="w-5 h-4 md:w-4 md:h-4 xl:w-5 xl:h-5 text-[#c7a97a]"
//                 />
//               )}
//             />
//           </div>
//         </SheetContent>
//       </Sheet>
//       {/* Desktop screen */}
//       <div className="hidden h-full w-[78px] bg-[#9ebcdb2b] md:flex flex-col justify-between items-center py-4">
//         {/* Logo */}
//         <div className="mb-12">
//           <img
//             onClick={() => {
//               navigate("/home");
//               setActiveSection("/home");
//             }}
//             src={logo}
//             alt="Mysore Minds Logo"
//             className="w-16 h-16 object-contain"
//           />
//         </div>

//         {/* Navigation Icons */}
//         <div className="flex flex-col items-center md:gap-3  flex-1">
//           {hasPermission("home") && (
//             <button
//               onClick={() => handleSectionClick("/home")}
//               className={`md:w-8 md:h-8 xl:w-10 xl:h-10 flex items-center justify-center rounded-full ${
//                 isActiveParent("/home")
//                   ? "bg-[#c7a97a]"
//                   : "hover:bg-[#c7a97a]/50"
//               }`}
//               title="Home"
//             >
//               {isActiveParent("/home") ? (
//                 <img
//                   src={home}
//                   alt="home"
//                   className={`md:w-4 md:h-4 xl:w-6 xl:h-6 ${
//                     isActiveParent("/home") ? "text-white" : "text-[#c7a97a]"
//                   }`}
//                 />
//               ) : (
//                 <img
//                   src={homeMobile}
//                   alt="home"
//                   className={`md:w-4 md:h-4 xl:w-6 xl:h-6 ${
//                     isActiveParent("/home") ? "text-white" : "text-[#c7a97a]"
//                   }`}
//                 />
//               )}
//             </button>
//           )}

//           {hasPermission("inward-system") && (
//             <button
//               onClick={() => handleSectionClick("/inward-system")}
//               className={`w-10 h-10 flex items-center justify-center rounded-full ${
//                 isActiveParent("/inward-system")
//                   ? "bg-[#c7a97a]"
//                   : "hover:bg-[#c7a97a]/50"
//               }`}
//               title="Inward System"
//             >
//               {isActiveParent("/inward-system") ? (
//                 <img src={arrowIW} alt="img" className="w-6 h-6" />
//               ) : (
//                 <img src={arrowI} alt="img" className="w-6 h-6" />
//               )}
//             </button>
//           )}

//           {hasPermission("reports") && (
//             <button
//               onClick={() => handleSectionClick("/reports")}
//               className={`w-10 h-10 flex items-center justify-center rounded-full ${
//                 isActiveParent("/reports")
//                   ? "bg-[#c7a97a]"
//                   : "hover:bg-[#c7a97a]/50"
//               }`}
//               title="Reports"
//             >
//               {isActiveParent("/reports") ? (
//                 <img src={listW} alt="img" className="w-6 h-6" />
//               ) : (
//                 <img src={list} alt="img" className="w-6 h-6" />
//               )}
//             </button>
//           )}

//           {hasPermission("settings") && (
//             <button
//               onClick={() => handleSectionClick("/settings")}
//               className={`w-10 h-10 flex items-center justify-center rounded-full ${
//                 isActiveParent("/settings")
//                   ? "bg-[#c7a97a]"
//                   : "hover:bg-[#c7a97a]/50"
//               }`}
//               title="Settings"
//             >
//               {isActiveParent("/settings") ? (
//                 <img src={settingsW} alt="img" className="w-6 h-6" />
//               ) : (
//                 <img src={settings} alt="img" className="w-6 h-6" />
//               )}
//             </button>
//           )}

//           {hasPermission("administration") && (
//             <button
//               onClick={() => handleSectionClick("/administration")}
//               className={`w-10 h-10 flex items-center justify-center rounded-full ${
//                 isActiveParent("/administration")
//                   ? "bg-[#c7a97a]"
//                   : "hover:bg-[#c7a97a]/50"
//               }`}
//               title="Administration"
//             >
//               {isActiveParent("/administration") ? (
//                 <img src={profileW} alt="img" className="w-6 h-6" />
//               ) : (
//                 <img src={profile} alt="img" className="w-6 h-6" />
//               )}
//             </button>
//           )}

//           <button
//             onClick={() => handleSectionClick("/template")}
//             className={`w-10 h-10 flex items-center justify-center rounded-full ${
//               isActiveParent("/template")
//                 ? "bg-[#c7a97a]"
//                 : "hover:bg-[#c7a97a]/50"
//             }`}
//             title="template"
//           >
//             {isActiveParent("/template") ? (
//               <img src={templateWhite} alt="img" className="w-6 h-6" />
//             ) : (
//               <img src={template} alt="img" className="w-6 h-6" />
//             )}
//           </button>
//         </div>

//         {/* Bottom Icons */}
//         <div className="flex flex-col items-center gap-2 mt-10">
//           <div
//             onClick={() => setContactDialogOpen(true)}
//             className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer`}
//             title="Help"
//           >
//             <img src={help} alt="Help Icon" className="w-5 h-5" />
//           </div>

//               <ContactDialog
//           open={contactDialogOpen}
//           onOpenChange={(open) => setContactDialogOpen(open)}
//         />



//           {profileDialog && (
//             <ProfileDialog
//               open={profileDialog}
//               onClose={() => {
//                 setProfileDialog(false);
//               }}
//             />
//           )}

//           <Link
//             to="#"
//             onClick={() => {
//               setProfileDialog(true);
//             }}
//             className={`w-10 h-10 flex items-center justify-center rounded-full ${
//               isActiveParent("/profile")
//                 ? "bg-[#c7a97a]"
//                 : "hover:bg-[#c7a97a]/50"
//             }`}
//             title="Profile"
//           >
//             <div className="w-10 h-10 rounded-full bg-[#c7a97a] flex items-center justify-center text-white font-bold text-xl">
//               A
//             </div>
//           </Link>

//           <button
//             className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#c7a97a]/50"
//             onClick={() => setShowDialog(true)}
//             title="Logout"
//           >
//             <img src={logout} alt="logout" className="w-6 h-6 text-[#c7a97a]" />
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Sidebar;



import { useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetClose } from "../ui/sheet";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../../utils/AuthContext";

import logo from "../../assets/newIcons/sidebar/logo.png";
import help from "../../assets/newIcons/sidebar/help.svg";
import logout from "../../assets/newIcons/sidebar/logout.svg";

import ContactDialog from "../admins/ContactDialog";
import ProfileDialog from "../profile/ProfileDialog";
import { SideBarProps } from "../../types/layout.types";

interface ExtendedSideBarProps extends SideBarProps {
  setActiveSection: (section: string) => void;
  activeSection: string;
}

type MenuNode = {
  label: string;
  path?: string;
  permission?: string;
  children?: MenuNode[];
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

  const hasPermission = (key?: string) =>
    !key || permissions.includes(key);

  /* ================= MENU CONFIG ================= */
  const MENU: MenuNode[] = [
    {
      label: "Home",
      path: "/home",
      permission: "home",
    },
    {
      label: "Inward System",
      permission: "inward-system",
      children: [
        {
          label: "Parts In",
          path: "/inward-system/parts-in",
        },
        {
          label: "Parts List",
          path: "/inward-system/parts-list",
        },
      ],
    },
    {
      label: "Reports",
      permission: "reports",
      children: [
        {
          label: "Inwards",
          children: [
            {
              label: "Parts History",
              path: "/reports/inwards/parts-history",
            },
          ],
        },
      ],
    },
    {
      label: "Administration",
      permission: "administration",
      children: [
        {
          label: "Company Profile",
          path: "/administration/company-profile",
        },
        {
          label: "User Management",
          children: [
            {
              label: "User",
              path: "/administration/user-management/user",
            },
            {
              label: "Roles",
              path: "/administration/user-management/roles",
            },
            {
              label: "Assigned Roles",
              path: "/administration/user-management/assigned-roles",
            },
          ],
        },
        {
          label: "Receipt",
          children: [
            {
              label: "Master Data",
              path: "/administration/receipt/master-data",
            },
            {
              label: "Receipt Data",
              path: "/administration/receipt/receipt-data",
            },
          ],
        },
      ],
    },
    {
      label: "Settings",
      permission: "settings",
      children: [
        {
          label: "System Configs",
          path: "/settings/system-config",
        },
        {
          label: "Incoming System",
          children: [
            {
              label: "Parts In Configuration",
              path: "/settings/incoming-system/parts-in-configuration",
            },
          ],
        },
      ],
    },
    {
      label: "Template",
      path: "/template",
      permission: "template",
    },
  ];

  /* ================= RECURSIVE MENU ================= */
  const VerticalMenu = ({
    item,
    level = 0,
  }: {
    item: MenuNode;
    level?: number;
  }) => {
    const isActive =
      item.path && location.pathname.startsWith(item.path);

    const isChildActive =
      item.children?.some(child =>
        location.pathname.startsWith(child.path || "")
      ) ?? false;

    const [open, setOpen] = useState(isActive || isChildActive);

    if (!hasPermission(item.permission)) return null;

    return (
      <div>
        <div
          onClick={() => {
            if (item.children) {
              setOpen(!open);
            } else if (item.path) {
              navigate(item.path);
              setActiveSection(item.path);
            }
          }}
          className={`flex items-center justify-between px-4 py-2 rounded-md cursor-pointer text-sm
            ${
              open
                ? "bg-[#676e6e] text-white"
                : "hover:bg-[#9ebcdb2b]"
            }
          `}
          style={{ marginLeft: level * 12 }}
        >
          <span>{item.label}</span>
          {item.children && (
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </div>

        {item.children && open && (
          <div className="mt-1 space-y-1">
            {item.children.map(child => (
              <VerticalMenu
                key={child.label}
                item={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ================= SIDEBAR CONTENT ================= */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* LOGO */}
      <div className="flex justify-center py-6">
        <img
          src={logo}
          className="w-16 cursor-pointer"
          onClick={() => navigate("/home")}
        />
      </div>

      {/* MENU */}
      <div className="flex-1 px-2 space-y-2 text-[#5b4636] overflow-y-auto">
        {MENU.map(item => (
          <VerticalMenu key={item.label} item={item} />
        ))}
      </div>

      {/* FOOTER */}
      <div className="px-2 py-4 border-t space-y-1">
        <button
          onClick={() => setContactDialogOpen(true)}
          className="w-full px-4 py-2 rounded-md hover:bg-[#9ebcdb2b] text-left"
        >
          Help
        </button>

        <button
          onClick={() => setProfileDialog(true)}
          className="w-full px-4 py-2 rounded-md hover:bg-[#9ebcdb2b] text-left"
        >
          Profile
        </button>

        <button
          onClick={() => setShowDialog(true)}
          className="w-full px-4 py-2 rounded-md hover:bg-[#9ebcdb2b] text-left"
        >
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-[280px] bg-[#9ebcdb2b] p-0">
          <SheetClose />
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* DESKTOP */}
      <div className="hidden md:flex w-[260px] h-full bg-[#9ebcdb2b]">
        <SidebarContent />
      </div>

      {/* DIALOGS */}
      <ContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
      />
      {profileDialog && (
        <ProfileDialog
          open={profileDialog}
          onClose={() => setProfileDialog(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
