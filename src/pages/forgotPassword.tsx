import ForgotPasswordDesktop from "../components/forgot-password/ForgotPasswordDesktop";
import ForgotPasswordMobile from "../components/forgot-password/ForgotPasswordMobile";

const ForgotPassword = () => {
 return (
   <div className="min-h-screen h-screen w-full">
     <ForgotPasswordDesktop />
     <ForgotPasswordMobile />
   </div>
 );
}

export default ForgotPassword;