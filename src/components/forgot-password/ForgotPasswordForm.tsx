import { useState } from "react";
import { useForm } from "react-hook-form";
import input1 from "../../assets/newIcons/login/input1.svg";
import input2 from "../../assets/newIcons/login/input2.svg";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-fox-toast";
import { forgotPassword } from "../../api/auth";
import { Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  code: z.string().min(1, "Company code is required"),
});

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
      const response = await forgotPassword({
        emailId: data.email,
        code: data.code,
      });

      if (response) {
        const userId = response?.data?.id;
        const code = data.code;
        toast.success("Success");
        navigate("/reset-password", {
          state: { userId, code },
        });
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
        {/* Email Input */}
        <div className="grid w-full items-center gap-1.5 mb-6">
          <div className="relative mt-6">
            <label className="absolute text-xs text-primary font-BreeSerif top-[-10px] left-3 bg-white px-1">
              Company Code
            </label>
            <div className="flex items-center border border-border-custom rounded-sm py-1 px-3 md:py-2">
              <img src={input1} alt="img1" className="h-5 w-5" />
              <div className="h-5 w-px bg-gray-400 mx-3" />
              <input
                type="text"
                id="input-field"
                {...register("code", {
                  required: "Company code is required",
                })}
                className="ml-2 p-1 flex-1 !outline-none focus:!outline-none focus:!ring-0 hover:outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
            {errors.code && (
              <p className="text-xs text-red-500 mt-1 ml-1 font-medium">
                {errors.code.message}
              </p>
            )}
          </div>
        </div>

        {/* Company Code Input (before codeSent) */}

        <div className="grid w-full items-center gap-1.5 mb-6">
          <div className="relative">
            <label className="absolute text-xs text-primary font-BreeSerif top-[-10px] left-3 bg-white px-1">
              Email Id
            </label>
            <div className="flex items-center border border-border-custom rounded-sm py-1 px-3 md:py-2">
              <img src={input2} alt="img1" className="h-5 w-5" />
              <div className="h-5 w-px bg-gray-400 mx-3" />
              <input
                type="text"
                id="input-field"
                {...register("email", {
                  required: "User ID is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,4}$/,
                    message: "Enter a valid email",
                  },
                })}
                className="ml-2 p-1 flex-1 !outline-none focus:!outline-none focus:!ring-0 hover:outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1 ml-1 font-medium">
                {errors.email.message}
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
              "RESET PASSWORD"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
