import { useState } from "react";
import { useForm } from "react-hook-form";
import input3 from "../../assets/newIcons/login/input3.svg";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-fox-toast";
import { resetPassword } from "../../api/auth";
import { Button } from "../../components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const schema = z
  .object({
    oldPassword: z.string().min(1, "Password is required"),
    newPassword: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // show error under confirmPassword
  });

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState(false);
  const [newPassword, setNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { code, userId } = location.state || {};

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await resetPassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
        code,
        userId,
      });
      if (response) {
        toast.success("Success");
        navigate("/");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail?.error ||
        err?.response?.data?.detail ||
        "Something went wrong";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full text-left max-w-md"
      >
        {/* Old Password Input */}
        <div className="grid w-full items-center gap-1.5 mb-6">
          <div className="relative mt-6">
            <label className="absolute text-xs text-primary font-BreeSerif top-[-10px] left-3 bg-white px-1">
              Old Password
            </label>

            <div
              className={`flex items-center border rounded-sm px-2 md:px-3 py-1 md:py-2 ${
                errors.oldPassword ? "border-red-500" : "border-border-custom"
              }`}
            >
              <img src={input3} alt="img1" className="h-5 w-5" />
              <div className="h-5 w-px bg-gray-400 mx-3" />
              <input
                type={oldPassword ? "text" : "password"}
                {...register("oldPassword", {
                  required: "Password is required",
                })}
                className="flex-1 min-w-0 p-1 !outline-none text-sm text-gray-700 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setOldPassword(!oldPassword)}
                className="ml-2 text-gray-600 hover:text-primary focus:outline-none"
              >
                {oldPassword ? (
                  <EyeOff className="w-5 h-5 shrink-0" />
                ) : (
                  <Eye className="w-5 h-5 shrink-0" />
                )}
              </button>
            </div>

            {errors.oldPassword && (
              <p className="text-xs text-red-500 mt-1 ml-1 font-medium">
                {errors.oldPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Company Code Input (before codeSent) */}
        <div className="grid w-full items-center gap-1.5 mb-6">
          <div className="relative">
            <label className="absolute text-xs text-primary font-BreeSerif top-[-10px] left-3 bg-white px-1">
              New Password
            </label>

            <div
              className={`flex items-center border rounded-sm px-2 md:px-3 py-1 md:py-2 ${
                errors.newPassword ? "border-red-500" : "border-border-custom"
              }`}
            >
              <img src={input3} alt="img1" className="h-5 w-5" />
              <div className="h-5 w-px bg-gray-400 mx-3" />
              <input
                type={newPassword ? "text" : "password"}
                {...register("newPassword", {
                  required: "Password is required",
                })}
                className="flex-1 min-w-0 p-1 !outline-none text-sm text-gray-700 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setNewPassword(!newPassword)}
                className="ml-2 text-gray-600 hover:text-primary focus:outline-none"
              >
                {newPassword ? (
                  <EyeOff className="w-5 h-5 shrink-0" />
                ) : (
                  <Eye className="w-5 h-5 shrink-0" />
                )}
              </button>
            </div>

            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1 ml-1 font-medium">
                {errors.newPassword.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid w-full items-center gap-1.5 mb-6">
          <div className="relative">
            <label className="absolute text-xs text-primary font-BreeSerif top-[-10px] left-3 bg-white px-1">
              Confirm Password
            </label>

            <div
              className={`flex items-center border rounded-sm px-2 md:px-3 py-1 md:py-2 ${
                errors.confirmPassword
                  ? "border-red-500"
                  : "border-border-custom"
              }`}
            >
              <img src={input3} alt="img1" className="h-5 w-5" />
              <div className="h-5 w-px bg-gray-400 mx-3" />
              <input
                type={confirmPassword ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "Password is required",
                })}
                className="flex-1 min-w-0 p-1 !outline-none text-sm text-gray-700 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setConfirmPassword(!confirmPassword)}
                className="ml-2 text-gray-600 hover:text-primary focus:outline-none"
              >
                {confirmPassword ? (
                  <EyeOff className="w-5 h-5 shrink-0" />
                ) : (
                  <Eye className="w-5 h-5 shrink-0" />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1 ml-1 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="w-full flex justify-center items-center">
          <Button
            type="submit"
            size="sm"
            disabled={!isValid}
            className="p-3 sm:p-5 !rounded-sm px-[30px] md:px-[60px] xl:px-[80px] font-BreeSerif tracking-widest bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </span>
            ) : (
              "SUBMIT"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
