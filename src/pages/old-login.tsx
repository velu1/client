import input2 from "../assets/newIcons/login/input2.svg";
import input3 from "../assets/newIcons/login/input3.svg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "../utils/schema";
import { Button } from "../components/ui/button";
import { oldLogin, storeAuthData } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-fox-toast";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../utils/AuthContext";

// Add types for clarity
interface OldLoginResponse {
  data: {
    token: string;
  };
}

type LoginFormValues = z.infer<typeof loginSchema>;

const OldLoginPage = () => {
  const navigate = useNavigate();
  const { updatePermissions } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Company code is not part of the schema, so we use local state
  //   const [companyCode, setCompanyCode] = React.useState("");

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response: OldLoginResponse = await oldLogin({
        userId: data.email,
        pin: data.password,
        loginDuplicate: true,
      });

      // Decode the JWT token
      // @ts-expect-error not typed fix
      const decodedToken = jwtDecode(response.token);
      console.log("Decoded Token Data:", decodedToken);

      // Update permissions in context
      // @ts-expect-error not typed fix

      updatePermissions(response.token);

      // Store auth data
      // @ts-expect-error not typed fix

      storeAuthData({ token: response.token });
      navigate("/");
      toast.success("Login successful");
    } catch (err) {
      setError("password", { message: "Invalid credentials" });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full text-left max-w-md"
      >
        <h1 className="hidden md:block text-sm sm:text-md md:text-xl mb-4 font-BreeSerif text-black text-start">
          Welcome Back !
        </h1>
        <div className="mb-8 px-10 md:px-0">
          <div className="grid w-full items-center gap-1.5 mb-6">
            <div className="relative">
              <label className="absolute text-xs text-primary font-BreeSerif top-[-10px] left-3 bg-white px-1">
                User Id
              </label>
              <div className="flex items-center border border-border-custom rounded-sm py-1 px-3 md:py-2">
                <img src={input2} alt="img2" className="h-5 w-5" />
                <div className="h-5 w-px bg-gray-400 mx-3" />
                <input
                  type="text"
                  className="ml-2 p-1 flex-1 !outline-none focus:!outline-none focus:!ring-0 hover:outline-none text-sm text-gray-700 placeholder-gray-400"
                  placeholder="User Id"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="grid w-full items-center gap-1.5 mb-6">
            <div className="relative">
              <label className="absolute text-xs text-primary font-BreeSerif top-[-10px] left-3 bg-white px-1">
                Password
              </label>
              <div className="flex items-center border border-border-custom rounded-sm py-1 px-3 md:py-2">
                <img src={input3} alt="img3" className="h-5 w-5" />
                <div className="h-5 w-px bg-gray-400 mx-3" />
                <input
                  type="password"
                  className="ml-2 p-1 flex-1 !outline-none focus:!outline-none focus:!ring-0 hover:outline-none text-sm text-gray-700 placeholder-gray-400"
                  placeholder="Password"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
          <div className="w-full flex justify-center items-center">
            <Button
              type="submit"
              size="sm"
              className="p-3 sm:p-5 !rounded-sm px-[30px] md:px-[60px] xl:px-[80px] font-BreeSerif tracking-widest bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              LOGIN
            </Button>
          </div>
        </div>
        <div className="absolute left-0 bottom-[-10] md:left-10 md:bottom-4  flex flex-col items-start gap-1">
          <div className="h-[2px] md:h-[3px]  w-[100px] md:w-[300px] xl:w-[400px] bg-primary" />
          <div className="h-[2px] md:h-[3px]  w-[250px] md:w-[200px] bg-primary mt-2" />
        </div>
      </form>
    </div>
  );
};

export default OldLoginPage;
