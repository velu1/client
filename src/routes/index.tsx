import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import ProfilePage from "../pages/profile";
import LoginPage from "../pages/login";
import VersionPage from "../pages/version";
import { isAuthenticated } from "../api/auth";
import Cookies from "js-cookie";
import RouteErrorPage from "../components/common/RouteErrorPage";

// Home pages
import HomePage from "../pages/home";

// Inward System pages
import InwardSystemPage from "../pages/inward-system";
import PartsInPage from "../pages/inward-system/parts-in";
import PartsInDetailPage from "../pages/inward-system/parts-in/[id]";
import PartsListPage from "../pages/inward-system/parts-list";
import PartsListDetailPage from "../pages/inward-system/parts-list/[id]";
import NotFoundPage from "../pages/notFound";

// Reports pages
import ReportsPage from "../pages/reports";
import ReportsInwardsPage from "../pages/reports/inwards";
import PartsHistoryPage from "../pages/reports/inwards/parts-history";
import PartsHistoryDetailPage from "../pages/reports/inwards/parts-history/[id]";
import PartsStickHistoryPage from "../pages/reports/inwards/parts-stick-history";
import PartsStickHistoryDetailPage from "../pages/reports/inwards/parts-stick-history/[id]";

// Settings pages
import SettingsPage from "../pages/settings";
import SystemConfigPage from "../pages/settings/system-config";
import SystemConfigDetailPage from "../pages/settings/system-config/[id]";
import IncomingSystemPage from "../pages/settings/incoming-system";
import PartsInConfigurationPage from "../pages/settings/incoming-system/parts-in-configuration";
import PartsInConfigurationDetailPage from "../pages/settings/incoming-system/parts-in-configuration/[id]";

// Administration pages
import AdministrationPage from "../pages/administration";
import CompanyProfilePage from "../pages/administration/company-profile";
import CompanyProfileDetailPage from "../pages/administration/company-profile/[id]";
import UserManagementPage from "../pages/administration/user-management";
import UserPage from "../pages/administration/user-management/user";
import UserDetailPage from "../pages/administration/user-management/user/[id]";
import RolesPage from "../pages/administration/user-management/roles";
import RolesDetailPage from "../pages/administration/user-management/roles/[id]";
import AssignedRolesPage from "../pages/administration/user-management/assigned-roles";
import AssignedRolesDetailPage from "../pages/administration/user-management/assigned-roles/[id]";
import ReceiptPage from "../pages/administration/receipt";
import MasterDataPage from "../pages/administration/receipt/master-data";
import MasterDataDetailPage from "../pages/administration/receipt/master-data/[id]";
import OldLoginPage from "../pages/old-login";
import { jwtDecode } from "jwt-decode";

//Template page
import Template from "../pages/template";
import ReceiptDataDetailPage from "../pages/administration/receipt/receipt-data/[id]";
import ReceiptData from "../pages/administration/receipt/receipt-data";

import ForgotPassword from "../pages/forgotPassword";
import ResetPassword from "../pages/resetPassword";


const SmartRedirect = () => {
  const token = Cookies.get("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken: any = jwtDecode(token);
    const permissions = decodedToken?.rolePermission || [];

    // Define the order of sections to check with their specific landing routes
    const availableSections = [
      {
        permission: "home",
        route: "/home",
      },
      {
        permission: "inward-system",
        route: "/inward-system/parts-in",
      },
      {
        permission: "reports",
        route: "/reports/inwards/parts-history",
      },
      {
        permission: "settings",
        route: "/settings/system-config",
      },
      {
        permission: "administration",
        route: "/administration/company-profile",
      },
      {
        permission: "template",
        route: "/template",
      },
    ];

    // Find the first section the user has permission for
    const firstAvailableSection = availableSections.find((section) =>
      permissions.includes(section.permission)
    );
console.log("firstAvailableSectionfirstAvailableSection", firstAvailableSection);

    if (firstAvailableSection) {
      return <Navigate to={firstAvailableSection.route} replace />;
    }

    // If no permissions found, redirect to 404
    // return <Navigate to="/404" replace />;
  } catch (error) {
    // If token is invalid, redirect to login
    // return <Navigate to="/login" replace />;
  }
};

// Auth guard component
const ProtectedRoute = () => {
  const token = Cookies.get("access_token");
  let decodedToken: any;
  if (token) {
    decodedToken = jwtDecode(token);
  }

  const pathname = useLocation().pathname;
  const topLevelPath = pathname.split("/")[1]; // Extract the first part of the path

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const TEMP_BYPASS = ["template"];

  if (
    decodedToken?.rolePermission &&
    topLevelPath &&
    !decodedToken.rolePermission.includes(topLevelPath) &&
    !TEMP_BYPASS.includes(topLevelPath)
  ) {
    return <Navigate to="/404" replace />;
  }

  return <Outlet />;
};

// Route to redirect authenticated users away from login
const AuthRoute = () => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <MainLayout />,
        errorElement: <RouteErrorPage />,
        children: [
          {
            index: true,
            element: <SmartRedirect />,
          },
          // Home routes
          {
            path: "home",
            element: <HomePage />,
          },

          //Template page
          {
            path: "template",
            element: <Template />,
          },

          // Inward System routes
          {
            path: "inward-system",
            element: <InwardSystemPage />,
          },
          {
            path: "inward-system/parts-in",
            element: <PartsInPage />,
          },
          {
            path: "inward-system/parts-in/:id",
            element: <PartsInDetailPage />,
          },
          {
            path: "inward-system/parts-list",
            element: <PartsListPage />,
          },
          {
            path: "inward-system/parts-list/:id",
            element: <PartsListDetailPage />,
          },

          // Reports routes
          {
            path: "reports",
            element: <ReportsPage />,
          },
          {
            path: "reports/inwards",
            element: <ReportsInwardsPage />,
          },
          {
            path: "reports/inwards/parts-history",
            element: <PartsHistoryPage />,
          },
          {
            path: "reports/inwards/parts-history/:id",
            element: <PartsHistoryDetailPage />,
          },
          {
            path: "reports/inwards/parts-stick-history",
            element: <PartsStickHistoryPage />,
          },
          {
            path: "reports/inwards/parts-stick-history/:id",
            element: <PartsStickHistoryDetailPage />,
          },

          // Settings routes
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "settings/system-config",
            element: <SystemConfigPage />,
          },
          {
            path: "settings/system-config/:id",
            element: <SystemConfigDetailPage />,
          },
          {
            path: "settings/incoming-system",
            element: <IncomingSystemPage />,
          },
          {
            path: "settings/incoming-system/parts-in-configuration",
            element: <PartsInConfigurationPage />,
          },
          {
            path: "settings/incoming-system/parts-in-configuration/:id",
            element: <PartsInConfigurationDetailPage />,
          },

          // Administration routes
          {
            path: "administration",
            element: <AdministrationPage />,
          },
          {
            path: "administration/company-profile",
            element: <CompanyProfilePage />,
          },
          {
            path: "administration/company-profile/:id",
            element: <CompanyProfileDetailPage />,
          },
          {
            path: "administration/user-management",
            element: <UserManagementPage />,
          },
          {
            path: "administration/user-management/user",
            element: <UserPage />,
          },

          {
            path: "administration/user-management/user/:id",
            element: <UserDetailPage />,
          },
          {
            path: "administration/user-management/roles",
            element: <RolesPage />,
          },
          {
            path: "administration/user-management/roles/:id",
            element: <RolesDetailPage />,
          },
          {
            path: "administration/user-management/assigned-roles",
            element: <AssignedRolesPage />,
          },
          {
            path: "administration/user-management/assigned-roles/:id",
            element: <AssignedRolesDetailPage />,
          },
          {
            path: "administration/receipt",
            element: <ReceiptPage />,
          },
          {
            path: "administration/receipt/master-data",
            element: <MasterDataPage />,
          },

          {
            path: "administration/receipt/master-data/:id",
            element: <MasterDataDetailPage />,
          },
          {
            path: "administration/receipt/receipt-data",
            element: <ReceiptData />,
          },

          {
            path: "administration/receipt/receipt-data/:id",
            element: <ReceiptDataDetailPage />,
          },

          // Profile page
          {
            path: "profile",
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
  // Public routes
  {
    path: "/login",
    element: <AuthRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "/version",
    element: <VersionPage />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/old-login",
    element: <OldLoginPage />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
