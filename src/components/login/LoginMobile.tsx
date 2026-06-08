import LoginForm from "./LoginForm";

export default function LoginMobile() {
  return (
    <div className="md:hidden min-h-screen flex flex-col bg-[#f8f9fa]">
      {/* Header band */}
      <div className="bg-[#434a52] px-6 pt-10 pb-16 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm tracking-tight">TF</span>
        </div>
        <span className="text-white font-semibold text-lg tracking-wide">
          TraceFlow
        </span>
      </div>

      {/* Form card overlapping the header */}
      <div className="px-5 -mt-8 flex-1 pb-8">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-7">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to continue</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
