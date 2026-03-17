import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";

// Import your images
import qrCodeBlack from "../../../assets/newIcons/settings/qrCodeBlack.svg";
import qrB from "../../../assets/newIcons/settings/qrButton.svg";
import qrBW from "../../../assets/newIcons/settings/qrButtonWhite.svg";

const qrData = Array(12).fill("geo:12.8700,74.8800");

const QRCodeDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [selected, setSelected] = React.useState<number>(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Barcode/QR code data
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 py-4 border border-primary rounded-md overflow-y-auto md:overflow-y-visible max-h-[400px] md:max-h-none">
          {qrData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 relative"
            >
              <RadioGroup
                value={selected.toString()}
                onValueChange={(val) => setSelected(Number(val))}
              >
                <RadioGroupItem value={index.toString()} className="hidden" />
              </RadioGroup>

              {/* Circle image for selection */}
              <div className="absolute sm:left-20 top-2 left-2 md:top-2 md:left-2 w-4 h-4">
                <img
                  src={selected === index ? qrBW : qrB}
                  alt={`Selection circle for QR ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* QR Code display */}
              <div
                className={`w-15 h-15 md:w-20 md:h-20 flex items-center justify-center rounded bg-white border-none ${
                  selected === index
                    ? "border-primary bg-[#E0A961]"
                    : "border-gray-300"
                }`}
              >
                {/* Correct alt for each QR */}
                <img
                  src={qrCodeBlack}
                  alt={`QR code ${index + 1} with data ${item}`}
                  className="relative z-100 w-full h-full object-cover"
                />
              </div>

              <div className="text-xs text-gray-500 border rounded-sm p-1 border-gray-500 text-center">{item}</div>
            </div>
          ))}
        </div>
        <DialogFooter className="flex justify-end pt-4">
          <Button
            variant="outline"
            className="px-6 bg-primary text-white hover:bg-primary/90"
            onClick={() => {
              console.log("Retry clicked");
            }}
          >
            Retry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
