import mainI from "../../assets/newIcons/home/mainImage.svg";
import { Button } from "../../components/ui/button";
import rightC from "../../assets/newIcons/home/rightClick.svg";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCompanyProfile } from "../../api/profile";
import Cookies from "js-cookie";

const HomePage = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [username] = useState(Cookies.get("name"));
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await getCompanyProfile();
      setCompanyName(response.name ?? "");

      const image = response?.image?.replace("data:image/png;base64,", "");

      if (image) {
        localStorage.setItem("companyLogo", image);
        window.dispatchEvent(new Event("companyLogoUpdated"));
      }
    } catch (error) {
      console.log("Error while fetching the data", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchData()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className=" flex items-center justify-center bg-white">
        <p className="text-lg font-semibold text-primary">Loading...</p>
      </div>
    );
  }

  return (
    <div className=" flex items-center justify-center bg-white p-4">
      <div className=" w-full grid grid-cols-1 md:grid-cols-2 items-center gap-10 mt-8">
        {/* Left Side - Text Content */}
        <div className="flex flex-col items-center">
          <div className="space-y-6 flex flex-col md:justify-center md:items-center p-3 ">
            <div className="">
              <h1 className="hidden md:block md:text-2xl xl:text-4xl font-BreeSerif font-semibold text-border-custom">
                Welcome
                <span className=" ml-2 text-border-custom font-BreeSerif">
                  {username}!
                </span>
              </h1>

              <h1 className="md:hidden text-2xl text-primary font-BreeSerif font-semibold ">
                Welcome, <br />{" "}
                <span className="text-2xl text-border-custom font-BreeSerif font-semibold">
                  {username} !
                </span>
              </h1>
            </div>
            <p className="text-sm md:text-md xl:text-xl text-primary font-BreeSerif font-semibold mt-0 md:mt-3">
              You are on the Home page of Mysore Minds!
            </p>
            <ul className="list-disc space-y-2 text-sm md:text-md xl:text-lg font-semibold text-gray-700 md:text-primary ml-0 md:ml-10 mt-0 md:mt-3">
              <li className="flex items-start gap-2 font-BreeSerif">
                <img
                  src={rightC}
                  alt="img1"
                  className="h-3 w-3 mt-2 md:hidden block"
                />{" "}
                This is your central hub for monitoring and managing your
                manufacturing processes with ease.
              </li>
              <li className="flex items-start gap-2 font-BreeSerif">
                <img
                  src={rightC}
                  alt="img1"
                  className="h-3 w-3 mt-2 md:hidden block"
                />{" "}
                Use the sidebar to navigate through various features, including
                tracking material flow, analyzing production stages, and
                reviewing outcomes in real-time.
              </li>{" "}
            </ul>
            <div className="flex items-center justify-center">
              <Button
                className="w-[50%] md:w-full bg-primary font-BreeSerif text-white font-semibold px-6 py-4 rounded shadow-md hover:bg-primary text-sm md:text-lg xl:text-xl transition"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/inward-system/parts-in");
                }}
              >
                Get started
              </Button>
            </div>
            <div className="flex justify-center items-center">
              <div className=" space-y-1 mt-10 bg-sidebar bg-white border border-primary rounded-md md:hidden flex p-3 flex-col justify-center items-center">
                <p className="  rounded text-sm md:text-md xl:text-xl font-BreeSerif text-primary">
                  <span className="text-gray-700 font-semibold font-BreeSerif">
                    Company name:
                  </span>{" "}
                  {companyName}
                </p>
                <p className="  rounded text-sm md:text-md xl:text-xl font-BreeSerif text-primary">
                  <span className="text-gray-700 font-semibold font-BreeSerif">
                    Username:
                  </span>{" "}
                  {username}
                </p>
              </div>
            </div>
          </div>
          <div className="hidden space-y-1 mt-10 bg-sidebar w-[60%] rounded-md md:flex p-3 flex-col justify-center items-center">
            <p className="  rounded md:text-md xl:text-xl font-BreeSerif text-primary">
              <span className="text-gray-700 font-semibold font-BreeSerif">
                Company name:
              </span>{" "}
              {companyName}
            </p>
            <p className="  rounded md:text-md xl:text-xl font-BreeSerif text-primary">
              <span className="text-gray-700 font-semibold font-BreeSerif">
                Username:
              </span>{" "}
              {username}
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block relative w-[500px] md:w-[500px] xl:w-[700px] h-[300px] md:h-auto overflow-hidden">
          <div className="relative h-full w-full">
            <div className="flex justify-end h-full">
              <div className="relative w-[70%] h-[250px] md:w-[90%] md:h-[400px] xl:w-[90%] xl:h-[550px] bg-sidebar z-0 rounded" />
              <img
                src={mainI}
                alt="Machine preview"
                className="absolute bottom-0 md:-bottom-[-30px] xl:-bottom-[-40px] -left-3 z-10 w-full rounded shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Right image mobile */}
        <div className="block md:hidden flex justify-center items-center relative w-full h-[300px] overflow-hidden">
          <div className="relative h-full w-full flex justify-center items-center">
            <div className="flex justify-end h-full relative w-full">
              {/* First Background Box */}
              <div
                className="absolute w-[90%] h-[100px] bottom-43 right-0 bg-sidebar rounded z-0 
        min-[479px]:max-[767px]:bg-white"
              />

              {/* Second Background Box */}
              <div
                className="absolute w-[90%] h-[100px] bottom-8 left-0 bg-sidebar rounded z-0 
        min-[479px]:max-[767px]:bg-white"
              />

              {/* Image */}
              <img
                src={mainI}
                alt="Machine preview"
                className="relative z-10 w-full rounded shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
