import ResetPasswordForm from "./ResetPasswordForm";
import logo from "../../assets/newIcons/login/logo.png";
import rightI from "../../assets/newIcons/login/mobile/logoHeader.png";

export default function ResetPasswordMobile() {
  return (
    <div className="md:hidden min-h-screen flex items-center justify-center bg-white only-xs:px-60 sm:px-40">
      <div className="w-full ">
        <div className="py-8 px-6">
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="Mysore Minds Logo"
              className="h-[100px] w-[100px]"
            />
          </div>
          <div className="p-5">
            <img src={rightI} alt="image" />
          </div>
          <p className="text-border-custom font-semibold text-xs font-BreeSerif mt-2">
            Driving Digital Excellence in Manufacturing DigiTrail is your digital
            command center, purpose-built to meet the fast-paced demands of
            high-mix, high-volume production. From material inward to SMT lines
            and final assembly, DigiTrail enables intelligent automation,
            real-time traceability, and actionable insights at every stage.
            Empower your operations with greater precision, efficiency, and
            compliance—and take a confident step toward a smarter, more
            sustainable factory.
          </p>

          <h2 className="text-md font-semibold text-primary font-BreeSerif tracking-wide mb-2 mt-4">
            WELCOME BACK !
          </h2>
          <div className="h-[2px] bg-borer-custom w-full max-w-fit">
            <div className="mx-auto h-[2px] bg-border-custom w-[200px]"></div>
          </div>

          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
