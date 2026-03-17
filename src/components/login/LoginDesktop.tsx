// import logo from "../../assets/newIcons/login/logo.png";
// import rightI from "../../assets/newIcons/login/logoHeader.png";
// import LoginForm from "../../components/login/LoginForm";
// const LoginDesktop = () => {
//   console.log("test logs 123");
//   return (
//     <div className="hidden min-h-screen h-screen md:flex flex-col md:flex-row overflow-auto font-BreeSerif">
//       <div className="relative w-full md:w-[50%] bg-background flex flex-col gap-[40px] items-end p-4 sm:p-6 md:py-[10px] md:px-[100px] xl:py-[50px] xl:px-[190px] order-2 md:order-1 md:min-h-screen">
//         <div className="relative h-[80px] sm:h-[100px] w-full flex justify-center items-center">
//           <img
//             src={logo}
//             alt="logo"
//             className="h-[60px] w-[60px] sm:h-[90px] sm:w-[90px] xl:h-[130px] xl:w-[130px]"
//           />
//         </div>

//         <LoginForm />
//       </div>

//    <div className="relative border border-l-primary w-full md:w-[50%] flex justify-center items-center order-1 md:order-2 md:h-full mt-16 md:mt-0">
//         <div className=" flex flex-col items-center justify-center text-center p-6">
//           {/* Title */}
//           <div className="absolute top-[20px] md:p-3 flex flex-col items-center">
//             <h2 className="text-[#C1996B] font-semibold font-BreeSerif md:text-xl xl:text-2xl tracking-wide uppercase mb-2">
//               Welcome Back !
//             </h2>
//             <div className="h-[2px] bg-borer-custom w-full max-w-fit">
//               <div className="mx-auto h-[2px] bg-border-custom w-[200px]"></div>
//             </div>

//             {/* Description */}
//             <p className="text-gray-600 md:text-md  max-w-lg font-BreeSerif mt-2 text-justify">
//              <p> Driving Digital Excellence in Manufacturing.</p><br /> DigiTrail is
//               your digital command center, purpose-built to meet the fast-paced
//               demands of high-mix, high-volume production. From material inward
//               to SMT lines and final assembly, DigiTrail enables intelligent
//               automation, real-time traceability, and actionable insights at
//               every stage. Empower your operations with greater precision,
//               efficiency, and compliance—and take a confident step toward a
//               smarter, more sustainable factory.
//             </p>
//           </div>

//           {/* Logo Text */}
//           <div className="relative mt-30">
//             <img src={rightI} alt="logo" className="h-[150px] w-[350px]" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginDesktop;


import logo from "../../assets/newIcons/login/logo.png";
import rightI from "../../assets/newIcons/login/logoHeader.png";
import LoginForm from "../../components/login/LoginForm";

const LoginDesktop = () => {
  return (
    <div>

      {/* LEFT SIDE : IMAGE */}
      {/* <div className="w-1/2 flex items-center justify-center bg-white">
        <img
          src={rightI}
          alt="Login illustration"
          className="max-w-[75%] h-auto object-contain"
        />
      </div> */}

      {/* RIGHT SIDE : LOGIN */}
      <div>

        {/* Logo */}
        {/* <div className="absolute top-10">
          <img
            src={logo}
            alt="logo"
            className="h-[90px] w-[90px]"
          />
        </div> */}

        {/* Login Card */}
        <div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginDesktop;
