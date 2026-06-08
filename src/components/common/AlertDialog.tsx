// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "../../components/ui/dialog";
// import { Button } from "../../components/ui/button";
// import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
// import { associateTemplate } from "../../api/partsIn";

// interface MissingTemplateDialogProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onCreateTemplate: () => void;
//   templates?: any[];
//   partNumber?: string;
// }

// interface Toast {
//   id: number;
//   type: "success" | "error";
//   message: string;
// }

// const AlertDialog: React.FC<MissingTemplateDialogProps> = ({
//   isOpen,
//   onClose,
//   onCreateTemplate,
//   templates = [],
//   partNumber,
// }) => {
//   const [selectedTemplate, setSelectedTemplate] = useState<string>("");
//   const [isConfirmMode, setIsConfirmMode] = useState(false);
//   const [toasts, setToasts] = useState<Toast[]>([]);

//   const addToast = (type: "success" | "error", message: string) => {
//     const id = Date.now();
//     setToasts((prev) => [...prev, { id, type, message }]);
//     setTimeout(() => {
//       setToasts((prev) => prev.filter((t) => t.id !== id));
//     }, 3000);
//   };

//   const handleAssociate = async () => {
//     if (!isConfirmMode) {
//       setIsConfirmMode(true);
//       return;
//     }

//     const templateData = templates.find(
//       (t: any) => t.templateName === selectedTemplate
//     );

//     if (templateData) {
//       try {
//         const payload = { partNumber, template: templateData };
//         await associateTemplate(payload);

//         addToast(
//           "success",
//           `Template "${templateData.templateName}" associated successfully.`
//         );

//         setSelectedTemplate("");
//         setIsConfirmMode(false);
//         onClose();
//       } catch (error) {
//         console.error(error);
//         addToast("error", "Failed to associate template. Try again.");
//       }
//     }
//   };

//   const manufacturerName =
//     templates[0]?.manufacturer || "Unknown Manufacturer";
//   const displayPartNumber =
//     partNumber ||
//     templates[0]?.partNumber ||
//     templates[0]?.ocr?.entityDetails?.partNumber ||
//     "N/A";

//   return (
//     <>
//       {/* Simple Toast Notifications */}
// <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
//   {toasts.map((toast) => (
//     <div
//       key={toast.id}
//       className={`text-white px-4 py-2 rounded-md shadow-md text-sm transition-opacity duration-300 animate-fadeIn ${
//         toast.type === "success" ? "bg-green-600" : "bg-red-600"
//       }`}
//     >
//       {toast.message}
//     </div>
//   ))}
// </div>

// <style>
//   {`
//     @keyframes fadeIn {
//       from {
//         opacity: 0;
//         transform: translateY(-5px);
//       }
//       to {
//         opacity: 1;
//         transform: translateY(0);
//       }
//     }
//     .animate-fadeIn {
//       animation: fadeIn 0.3s ease-out;
//     }
//   `}
// </style>

//       {/* Main Dialog */}
//       <Dialog open={isOpen} onOpenChange={onClose}>
//         <DialogContent className="max-w-3xl">
//           <DialogHeader>
//             <DialogTitle className="text-primary text-lg font-semibold">
//               Template Missing
//             </DialogTitle>
//           </DialogHeader>

//           <div className="text-sm text-muted-foreground pb-4">
//             Template not found. Choose an action below.
//           </div>

//           {templates.length > 0 && (
//             <div className="mb-3 text-sm font-semibold text-gray-700">
//               Available Templates for{" "}
//               <span className="text-primary uppercase">
//                 Part Number: {displayPartNumber}
//               </span>{" "}
//               and{" "}
//               <span className="text-primary uppercase">
//                 Manufacturer: {manufacturerName}
//               </span>
//             </div>
//           )}

//           {/* Compact Table */}
//           {templates.length > 0 && (
//             <RadioGroup
//               value={selectedTemplate}
//               onValueChange={(val) => {
//                 setSelectedTemplate(val);
//                 setIsConfirmMode(false);
//               }}
//             >
//               <div className="overflow-x-auto">
//                 <table className="w-full border border-gray-300 text-xs text-gray-700 rounded-md">
//                   <thead className="bg-gray-100 text-gray-800 uppercase">
//                     <tr>
//                       <th className="py-1.5 px-2 text-left">Identifiers:</th>
//                       <th className="py-1.5 px-2 text-left">Part Number</th>
//                       <th className="py-1.5 px-2 text-left">Quantity</th>
//                       <th className="py-1.5 px-2 text-left">Mfg Date</th>
//                       <th className="py-1.5 px-2 text-left">LOT Number</th>
//                     </tr>
//                   </thead>
//                 <tbody>
//   {templates.map((template: any, idx) => {
//     const placeholders = template?.ocr?.placeholders || {};
//     return (
//       <tr
//         key={idx}
//         className="border-t hover:bg-gray-50 transition"
//       >
//         <td className="py-1.5 px-2 flex items-center gap-2">
//           <RadioGroupItem
//             value={template.templateName}
//             id={`radio-${idx}`}
//           />
//           <label
//             htmlFor={`radio-${idx}`}
//             className="cursor-pointer font-medium text-gray-800"
//           >
//             {template.templateName}
//           </label>
//         </td>

//         {/* ✅ Shows Identifiers value (what you wanted) */}
//         <td className="py-1.5 px-2">
//           {placeholders?.identifiers?.value ||
//             placeholders?.partNumber?.value ||
//             template.partNumber ||
//             "-"}
//         </td>

//         <td className="py-1.5 px-2">
//           {placeholders?.quantity?.value || "-"}
//         </td>
//         <td className="py-1.5 px-2">
//           {placeholders?.mfgDate?.value || "-"}
//         </td>
//         <td className="py-1.5 px-2">
//           {placeholders?.lotNumber?.value || "-"}
//         </td>
//       </tr>
//     );
//   })}
// </tbody>

//                 </table>
//               </div>
//             </RadioGroup>
//           )}

//           <DialogFooter className="flex justify-between items-center pt-3">
//             <div>
//               <Button variant="outline" onClick={onClose} size="sm">
//                 Cancel
//               </Button>
//               <Button
//                 onClick={onCreateTemplate}
//                 className="ml-2 bg-primary text-white"
//                 size="sm"
//               >
//                 Create Template
//               </Button>
//             </div>

//             {templates.length > 0 && (
//               <Button
//                 onClick={handleAssociate}
//                 disabled={!selectedTemplate}
//                 className={`text-white text-sm ${
//                   selectedTemplate
//                     ? isConfirmMode
//                       ? "bg-green-600 hover:bg-green-700"
//                       : "bg-primary hover:bg-primary/90"
//                     : "bg-gray-300 cursor-not-allowed"
//                 }`}
//                 size="sm"
//               >
//                 {isConfirmMode ? "Confirm" : "Associate"}
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default AlertDialog;
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { associateTemplate } from "../../api/partsIn";
import { toast } from "react-fox-toast"; // ✅ Import react-fox-toast

interface MissingTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTemplate: () => void;
  templates?: any[];
  partNumber?: string;
}

const AlertDialog: React.FC<MissingTemplateDialogProps> = ({
  isOpen,
  onClose,
  onCreateTemplate,
  templates = [],
  partNumber,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isConfirmMode, setIsConfirmMode] = useState(false);

  const handleAssociate = async () => {
    if (!isConfirmMode) {
      setIsConfirmMode(true);
      return;
    }

    const templateData = templates.find(
      (t: any) => t.templateName === selectedTemplate
    );

    if (templateData) {
      try {
        const payload = { partNumber, template: templateData };
        await associateTemplate(payload);

        // ✅ Success toast
        toast.success(
          `Template "${templateData.templateName}" associated successfully.`,
          { position: "top-right" }
        );

        setSelectedTemplate("");
        setIsConfirmMode(false);
        onClose();
      } catch (error) {
        console.error(error);

        // ❌ Error toast
        toast.error("Failed to associate template. Try again.", {
          position: "top-right",
        });
      }
    }
  };

  const manufacturerName =
    templates[0]?.manufacturer || "Unknown Manufacturer";
  const displayPartNumber =
    partNumber ||
    templates[0]?.partNumber ||
    templates[0]?.ocr?.entityDetails?.partNumber ||
    "N/A";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-primary text-lg font-semibold">
              Template Missing
            </DialogTitle>
          </DialogHeader>

          <div className="text-sm text-muted-foreground pb-4">
            Template not found. Choose an action below.
          </div>

          {templates.length > 0 && (
            <div className="mb-3 text-sm font-semibold text-gray-700">
              Available Templates for{" "}
              <span className="text-primary uppercase">
                Part Number: {displayPartNumber}
              </span>{" "}
              and{" "}
              <span className="text-primary uppercase">
                Manufacturer: {manufacturerName}
              </span>
            </div>
          )}

          {/* Compact Table */}
          {templates.length > 0 && (
            <RadioGroup
              value={selectedTemplate}
              onValueChange={(val) => {
                setSelectedTemplate(val);
                setIsConfirmMode(false);
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 text-xs text-gray-700 rounded-md">
                  <thead className="bg-gray-100 text-gray-800 uppercase">
                    <tr>
                      <th className="py-1.5 px-2 text-left">Identifiers</th>
                      <th className="py-1.5 px-2 text-left">Part Number</th>
                      <th className="py-1.5 px-2 text-left">Quantity</th>
                      <th className="py-1.5 px-2 text-left">Mfg Date</th>
                      <th className="py-1.5 px-2 text-left">LOT Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((template: any, idx) => {
                      const placeholders = template?.ocr?.placeholders || {};
                      return (
                        <tr
                          key={idx}
                          className="border-t hover:bg-gray-50 transition"
                        >
                          <td className="py-1.5 px-2 flex items-center gap-2">
                            <RadioGroupItem
                              value={template.templateName}
                              id={`radio-${idx}`}
                            />
                            <label
                              htmlFor={`radio-${idx}`}
                              className="cursor-pointer font-medium text-gray-800"
                            >
                              {template.templateName}
                            </label>
                          </td>

                          {/* ✅ Identifier (priority to identifiers.value) */}
                          <td className="py-1.5 px-2">
                            {placeholders?.identifiers?.value ||
                              placeholders?.partNumber?.value ||
                              template.partNumber ||
                              "-"}
                          </td>

                          <td className="py-1.5 px-2">
                            {placeholders?.quantity?.value || "-"}
                          </td>
                          <td className="py-1.5 px-2">
                            {placeholders?.mfgDate?.value || "-"}
                          </td>
                          <td className="py-1.5 px-2">
                            {placeholders?.lotNumber?.value || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </RadioGroup>
          )}

          <DialogFooter className="flex justify-between items-center pt-3">
            <div>
              <Button variant="outline" onClick={onClose} size="sm">
                Cancel
              </Button>
              <Button
                onClick={onCreateTemplate}
                className="ml-2 bg-primary text-white"
                size="sm"
              >
                Create Template
              </Button>
            </div>

            {templates.length > 0 && (
              <Button
                onClick={handleAssociate}
                disabled={!selectedTemplate}
                className={`text-white text-sm ${
                  selectedTemplate
                    ? isConfirmMode
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-primary hover:bg-primary/90"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                size="sm"
              >
                {isConfirmMode ? "Confirm" : "Associate"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertDialog;
