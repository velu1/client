import LoginDesktop from "../components/login/LoginDesktop";
import LoginMobile from "../components/login/LoginMobile";

const AdminLoginPage = () => {
  return (
    <div className="min-h-screen h-screen w-full">
      <LoginDesktop />
      <LoginMobile />
    </div>
  );
};

export default AdminLoginPage;
