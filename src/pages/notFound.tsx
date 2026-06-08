import { useNavigate } from "react-router-dom";
import logo from "../assets/newIcons/sidebar/logo.png";
import { Button } from "../components/ui/button"; // Update the import path based on your project structure

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center max-w-md text-center mt-10 md:mt-20">
        <img src={logo} alt="Logo" className="h-20 w-20 mb-6" />

        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-6 font-BreeSerif">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Button
          onClick={() => navigate("/")}
          className="bg-primary font-BreeSerif text-white px-6 py-2 text-sm rounded-sm hover:bg-primary/90 transition"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
