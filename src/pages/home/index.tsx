import mainI from "../../assets/newIcons/home/mainImage.svg";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCompanyProfile } from "../../api/profile";
import Cookies from "js-cookie";
import { ArrowRight, PackageCheck, BarChart3, SlidersHorizontal } from "lucide-react";

const FEATURES = [
  {
    icon: PackageCheck,
    title: "Inward System",
    description: "Capture and log incoming parts with AI or manual entry.",
    path: "/inward-system/parts-in",
  },
  {
    icon: BarChart3,
    title: "Reports",
    description: "Analyse parts history, track quantities and trace movements.",
    path: "/reports/inwards/parts-history",
  },
  {
    icon: SlidersHorizontal,
    title: "Settings",
    description: "Configure extraction fields, label priorities and system rules.",
    path: "/settings/system-config",
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [username] = useState(Cookies.get("name"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#434a52] border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 space-y-8">

      {/* Hero row */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="text-sm text-gray-400 mb-1 font-medium tracking-wide uppercase">
            {companyName}
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
            Welcome back,{" "}
            <span className="text-[#434a52]">{username}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-md">
            Your manufacturing intelligence platform — track every part, every
            stage, in real time.
          </p>
        </div>

        <button
          onClick={() => navigate("/inward-system/parts-in")}
          className="inline-flex items-center gap-2 bg-[#434a52] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#676e6e] transition-colors self-start md:self-auto shrink-0"
        >
          Get started
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, title, description, path }) => (
          <button
            key={title}
            onClick={() => navigate(path)}
            className="group bg-white border border-gray-100 rounded-xl p-5 text-left hover:border-[#434a52]/30 hover:shadow-md transition-all"
          >
            <div className="h-9 w-9 rounded-lg bg-[#f0f1f2] flex items-center justify-center mb-4 group-hover:bg-[#434a52]/10 transition-colors">
              <Icon size={17} className="text-[#434a52]" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
          </button>
        ))}
      </div>

      {/* Bottom split — tagline + image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="bg-[#434a52] rounded-xl p-7 text-white space-y-4">
          <h2 className="text-lg font-semibold leading-snug">
            Manufacturing doesn't wait. Neither should your data.
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">
            Connect every stage of production into one clear picture — inward,
            assembly, QC, and beyond.
          </p>
          <div className="flex gap-2 pt-1">
            <div className="h-1 w-12 bg-white/20 rounded-full" />
            <div className="h-1 w-7 bg-white/45 rounded-full" />
            <div className="h-1 w-4 bg-white/80 rounded-full" />
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <img
            src={mainI}
            alt="Manufacturing preview"
            className="w-full max-w-sm rounded-xl shadow-sm object-contain"
          />
        </div>
      </div>

    </div>
  );
};

export default HomePage;
