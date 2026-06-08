import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { login, storeAuthData } from "../../api/auth";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../utils/AuthContext";
import { toast } from "react-fox-toast";

interface DecodedToken {
  code: string;
  id: string;
  firstName: string;
  lastName: string;
  emailId: string;
  phoneNumber: string;
  orgName: string;
}

const LoginForm = () => {
  const navigate = useNavigate();
  const { updatePermissions } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const response: any = await login({ email, password, code: "" });
      const { token, access_token } = response;

      const decoded = jwtDecode<DecodedToken>(token);
      updatePermissions(token);

      storeAuthData({
        token,
        access_token,
        code: decoded.code,
        id: decoded.id,
        name: `${decoded.firstName} ${decoded.lastName}`,
        phone: decoded.phoneNumber,
        email: decoded.emailId,
        companyName: decoded.orgName,
      });

      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#676e6e] focus:ring-2 focus:ring-[#676e6e]/20 transition-all"
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#676e6e] focus:ring-2 focus:ring-[#676e6e]/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="flex justify-end mb-7">
        <Link
          to="/forgot-password"
          className="text-xs text-[#676e6e] hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-[#434a52] text-white text-sm font-semibold hover:bg-[#676e6e] active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
      >
        {loading ? (
          <span className="flex justify-center items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in...
          </span>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
};

export default LoginForm;
