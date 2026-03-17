// import input1 from "../../assets/newIcons/login/input1.svg";
// import input2 from "../../assets/newIcons/login/input2.svg";
// import input3 from "../../assets/newIcons/login/input3.svg";
// // import Cookies from "js-cookie";
// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Button } from "../../components/ui/button";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { tenantLoginSchema } from "../../utils/schema";
// import { toast } from "react-fox-toast";
// import { login, storeAuthData } from "../../api/auth";
// import { jwtDecode } from "jwt-decode";
// import { useAuth } from "../../utils/AuthContext";
// import { Eye, EyeOff, Loader2 } from "lucide-react";

// type LoginFormValues = z.infer<typeof tenantLoginSchema>;

// // ✅ Define interface to include `code` for TS safety
// interface DecodedToken {
//   code: string;
//   [key: string]: any;
// }

// const LoginForm = () => {
//   const navigate = useNavigate();
//   const { updatePermissions } = useAuth();
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     // formState: { errors },
//   } = useForm<LoginFormValues>({
//     resolver: zodResolver(tenantLoginSchema),
//   });

//   // const onSubmit = async (data: LoginFormValues) => {
//   //   try {
//   //     console.log("Form submitted with data:", data);
//   //     const response: any = await login({
//   //       email: data.email,
//   //       password: data.password,
//   //       code: data.code,
//   //     });

//   //     // // Decode the JWT token
//   //     // // @ts-expect-error not typed fix
//   //     // const decodedToken = jwtDecode(response.token);
//   //     // console.log("Decoded Token Data:", decodedToken);

//   //     // // Store auth data
//   //     // // @ts-expect-error not typed fix

//   //     // storeAuthData({ token: response.token });

//   //     // // Update permissions in context
//   //     // // @ts-expect-error not typed fix

//   //     // updatePermissions(response.token);

//   //     // // navigate("/");
//   //     // toast.success("Login successful");
//   //     const { token } = response;
//   //     const decodedToken = jwtDecode(token);
//   //     console.log("Decoded Token Data:", decodedToken);
//   //     Cookies.set("access_token", token, { secure: true });
//   //     localStorage.setItem("access_token", token);

//   //     // Update context and store tokens
//   //     // updatePermissions(token);
//   //     // storeAuthData(response);

//   //     // Set cookies
//   //     // Cookies.set("refresh_token", refresh_token, { secure: true });

//   //     toast.success("Login successful");
//   //     navigate("/");
//   //   } catch (err) {
//   //     console.error("Login error:", err);
//   //     toast.error("Invalid credentials");
//   //   }
//   // };

//   const onSubmit = async (data: LoginFormValues) => {
//     setLoading(true);
//     try {
//       const response: any = await login({
//         email: data.email,
//         password: data.password,
//         code: data.code,
//       });

//       const { token, access_token } = response;

//       // ✅ Safely decode token with expected shape
//       const decodedToken = jwtDecode<DecodedToken>(token);
//       console.log("Decoded Token Data:", decodedToken);

//       // Update permissions in context
//       updatePermissions(token);

//       // Store auth data
//       storeAuthData({
//         token,
//         code: decodedToken.code,
//         access_token,
//         id: decodedToken.id,
//         name: `${decodedToken.firstName}${decodedToken.lastName}`,
//         phone: decodedToken.phoneNumber,
//         email: decodedToken.emailId,
//         companyName: decodedToken.orgName,
//       });

//       navigate("/");
//       toast.success("Login successful");
//     } catch (err) {
//       console.log("Err", err);
//       // setError("password", { message: "Invalid credentials" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="w-full flex items-center justify-center px-4">
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="w-full text-left max-w-md"
//       >
//         <h1 className="hidden md:block text-sm sm:text-md md:text-xl mb-4 font-BreeSerif text-black text-start">
//           Welcome Back !
//         </h1>

//         <div className="mb-8">
//           <div className="grid w-full items-center gap-1.5 mb-6">
//             <div className="relative mt-6">
//               <label className="absolute text-xs text-primary font-BreeSerif top-[-10px] left-3 bg-white px-1">
//                 Company Code
//               </label>
//               <div className="flex items-center border border-border-custom rounded-sm py-1 px-3 md:py-2">
//                 <img src={input1} alt="img1" className="h-5 w-5" />
//                 <div className="h-5 w-px bg-gray-400 mx-3" />
//                 <input
//                   type="text"
//                   id="input-field"
//                   {...register("code", {
//                     required: "Company code is required",
//                   })}
//                   className="ml-2 p-1 flex-1 !outline-none focus:!outline-none focus:!ring-0 hover:outline-none text-sm text-gray-700 placeholder-gray-400"
//                 />
//               </div>
//               {errors.code && (
//                 <p className="text-xs text-red-500 mt-1 ml-1 font-medium">
//                   {errors.code.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="grid w-full items-center gap-1.5 mb-6">
//             <div className="relative">
//               <label className="absolute text-xs text-primary font-BreeSerif top-[-10px] left-3 bg-white px-1">
//                 Email Id
//               </label>
//               <div className="flex items-center border border-border-custom rounded-sm py-1 px-3 md:py-2">
//                 <img src={input2} alt="img1" className="h-5 w-5" />
//                 <div className="h-5 w-px bg-gray-400 mx-3" />
//                 <input
//                   type="text"
//                   id="input-field"
//                   {...register("email", {
//                     required: "User ID is required",
//                     pattern: {
//                       value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,4}$/,
//                       message: "Enter a valid email",
//                     },
//                   })}
//                   className="ml-2 p-1 flex-1 !outline-none focus:!outline-none focus:!ring-0 hover:outline-none text-sm text-gray-700 placeholder-gray-400"
//                 />
//               </div>
//               {errors.email && (
//                 <p className="text-xs text-red-500 mt-1 ml-1 font-medium">
//                   {errors.email.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="grid w-full items-center gap-1.5 mb-6">
//             <div className="relative">
//               <label className="absolute text-xs text-primary font-BreeSerif top-[-10px] left-3 bg-white px-1">
//                 Password
//               </label>

//               <div
//                 className={`flex items-center border rounded-sm px-2 md:px-3 py-1 md:py-2 ${
//                   errors.password ? "border-red-500" : "border-border-custom"
//                 }`}
//               >
//                 <img src={input3} alt="img1" className="h-5 w-5" />
//                 <div className="h-5 w-px bg-gray-400 mx-3" />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   {...register("password", {
//                     required: "Password is required",
//                   })}
//                   className="flex-1 min-w-0 p-1 !outline-none text-sm text-gray-700 placeholder-gray-400"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="ml-2 text-gray-600 hover:text-primary focus:outline-none"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="w-5 h-5 shrink-0" />
//                   ) : (
//                     <Eye className="w-5 h-5 shrink-0" />
//                   )}
//                 </button>
//               </div>

//               {errors.password && (
//                 <p className="text-xs text-red-500 mt-1 ml-1 font-medium">
//                   {errors.password.message}
//                 </p>
//               )}
//             </div>

//             <Link
//               to="/forgot-password"
//               className="font-BreeSerif text-end text-xs text-border-custom mr-3"
//             >
//               Forgot password
//             </Link>
//           </div>

//           <div className="w-full flex justify-center items-center">
//             <Button
//               type="submit"
//               size="sm"
//               className="p-3 sm:p-5 !rounded-sm px-[30px] md:px-[60px] xl:px-[80px] font-BreeSerif tracking-widest bg-primary hover:bg-primary/90"
//             >
//               {loading ? (
//                 <span className="flex items-center gap-2">
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                 </span>
//               ) : (
//                 "LOGIN"
//               )}
//             </Button>
//           </div>

//           {/* <div className="w-full flex justify-center items-center mt-4">
//           <Button
//             variant="outline"
//             size="sm"
//             className="p-3 sm:p-5 !rounded-sm px-[30px] md:px-[60px] xl:px-[80px] font-BreeSerif tracking-widest border-none cursor-pointer"
//             onClick={() => navigate("/old-login")}
//           >
//             Old Login
//           </Button>
//         </div> */}
//         </div>

//         {/* <div className="absolute left-0 bottom-[-10] md:left-10 md:bottom-4 flex flex-col items-start gap-1">
//         <div className="h-[2px] md:h-[3px] w-[100px] md:w-[300px] xl:w-[400px] bg-primary" />
//         <div className="h-[2px] md:h-[3px] w-[250px] md:w-[200px] bg-primary mt-2" />
//       </div> */}
//       </form>
//     </div>
//   );
// };

// export default LoginForm;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { login, storeAuthData } from "../../api/auth";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../utils/AuthContext";
import { toast } from "react-fox-toast";

import loginImage from "../../assets/pcbHomePage.jpg";

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const response: any = await login({ email, password });
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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#F7FFE5]">

      {/* ================= LEFT IMAGE ================= */}
      <div
        className="hidden md:block relative h-screen"
        style={{
          backgroundImage: `url(${loginImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Fade overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-[#F7FFE5]" />
      </div>

      {/* ================= RIGHT LOGIN ================= */}
      <div className="flex items-center justify-center md:justify-end px-6 md:px-12">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 relative z-10"
        >
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Login to continue
          </p>

          {/* Email */}
          <div className="mb-4">
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#9CD323]"
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="text-sm text-gray-600">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#9CD323]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="text-right mb-6">
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
            className="w-full py-2 rounded-lg bg-[#676e6e] text-white font-semibold hover:bg-[#676e6e] transition"
          >
            {loading ? (
              <span className="flex justify-center items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging in...
              </span>
            ) : (
              "LOGIN"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

