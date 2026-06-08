import pcbImage from "../../assets/pcbHomePage.jpg";
import LoginForm from "./LoginForm";

const LoginDesktop = () => {
  return (
    <div className="hidden md:flex min-h-screen">
      {/* Left brand panel */}
      <div
        className="relative w-[44%] flex flex-col justify-between p-12"
        style={{
          backgroundImage: `url(${pcbImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#434a52]/88" />

        {/* Brand mark */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-tight">TF</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-wide">
            TraceFlow
          </span>
        </div>

        {/* Tagline block */}
        <div className="relative z-10 space-y-4">
          <h2 className="text-white text-2xl font-semibold leading-snug max-w-xs">
            Manufacturing doesn't wait. Neither should your data.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-70">
            Connect every stage of production into one clear picture — inward,
            assembly, QC, and beyond.
          </p>
          <div className="flex gap-2 pt-1">
            <div className="h-1 w-14 bg-white/20 rounded-full" />
            <div className="h-1 w-8 bg-white/45 rounded-full" />
            <div className="h-1 w-4 bg-white/80 rounded-full" />
          </div>
        </div>

        <div className="relative z-10 text-white/25 text-xs">
          © {new Date().getFullYear()} TraceFlow. All rights reserved.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-[#f8f9fa] px-10 xl:px-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-10 py-9">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              Sign in to your account to continue
            </p>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDesktop;
