import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

interface AuthContextType {
  permissions: string[];
  updatePermissions: (token: string) => void;
}

interface DecodedToken {
  rolePermission: string[];
  [key: string]: any;
}

const AuthContext = createContext<AuthContextType>({
  permissions: [],
  updatePermissions: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    // On mount, check for existing token in cookies
    const token = Cookies.get("access_token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);

        setPermissions(decoded.rolePermission || []);
      } catch (error) {
        console.error("Error decoding token:", error);
        setPermissions([]);
      }
    }
  }, []);

  const updatePermissions = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      setPermissions(decoded.rolePermission || []);
    } catch (error) {
      console.error("Error decoding token:", error);
      setPermissions([]);
    }
  };

  return (
    <AuthContext.Provider value={{ permissions, updatePermissions }}>
      {children}
    </AuthContext.Provider>
  );
};
