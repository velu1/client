import ResetPasswordDesktop from "../components/reset-password/ResetPasswordDesktop";
import ResetPasswordMobile from "../components/reset-password/ResetPasswordMobile";

const ResetPassword = () => {
  return (
    <div className="min-h-screen h-screen w-full">
      <ResetPasswordDesktop />
      <ResetPasswordMobile />
    </div>
  );
};

export default ResetPassword;
