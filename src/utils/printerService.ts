// Printer service to handle all printer-related operations
import { create } from "zustand";
import { resolveQRContent } from "./fieldMapper";

// Type definitions for Web Serial API
declare global {
  interface Navigator {
    serial: {
      requestPort: () => Promise<any>;
      getPorts: () => Promise<any[]>;
    };
  }
}

// Printer configuration interface - matching API response
interface PrinterConfig {
  type?: string;
  audit?: boolean;
  auditType?: string;
  createdAt?: string;
  delimiter: string;
  invoice?: boolean;
  namingSeries?: string;
  panelBoards?: boolean;
  partsInNamingSeries?: string;
  printType: string;
  printerName?: string;
  updatedAt?: string;
  priority: {
    priority: string;
    value: string;
    _id?: string;
  }[];
  entityTableRows?: {
    slNo: number;
    name: string;
    id: string;
  }[];
  labelData: LabelData;
  id?: string;
}

interface LabelItem {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageDataUrl: string;
  fontSize?: string;
  value?: string;
}

interface LabelData {
  heightMm: number;
  widthMm: number;
  items: LabelItem[];
}

// Printer state interface
interface PrinterState {
  port: any;
  writer: any;
  isConnected: boolean;
  status: string;
  qrPreviewData: string | null;
  connectPrinter: () => Promise<boolean>;
  disconnectPrinter: () => Promise<void>;
  printTest: (params?: any) => Promise<boolean>;
  printLabel: (
    params?: any,
    printerConfig?: PrinterConfig,
    isTest?: boolean
  ) => Promise<boolean>;
  updateStatus: (message: string) => void;
  autoConnectPrinter: () => Promise<boolean>;
  testPrinterDevice: () => Promise<boolean>;
  printDebugGrid: () => Promise<boolean>;
  setQrPreviewData: (data: string | null) => void;
}

// Create printer store
export const usePrinterStore = create<PrinterState>((set, get) => ({
  port: null,
  writer: null,
  isConnected: false,
  status: "Printer disconnected",
  qrPreviewData: null,

  // Set QR preview data
  setQrPreviewData: (data) => {
    set({ qrPreviewData: data });
  },

  // Connect to printer
  connectPrinter: async () => {
    try {
      const { port, isConnected } = get();

      // If already connected, return true
      if (port && isConnected) {
        get().updateStatus("Printer already connected");
        return true;
      }

      // Request port
      const newPort = await navigator.serial.requestPort();
      await newPort.open({ baudRate: 9600 });
      const newWriter = newPort.writable.getWriter();

      // Update state new data
      set({ port: newPort, writer: newWriter });

      // Test printer connection
      if (true) {
        set({ isConnected: true });
        get().updateStatus("Printer connected and ready");

        // Save the port info for auto-connect
        try {
          localStorage.setItem(
            "lastConnectedPrinter",
            JSON.stringify({
              usbVendorId: newPort.getInfo().usbVendorId,
              usbProductId: newPort.getInfo().usbProductId,
            })
          );
        } catch (err) {
          const error = err as Error;
          console.error("Error saving printer info to localStorage:", error);
        }

        return true;
      } else {
        throw new Error("Printer not responding");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error connecting:", error);
      get().updateStatus(`Connection failed: ${error.message}`);
      await get().disconnectPrinter();
      return false;
    }
  },

  // Disconnect printer
  disconnectPrinter: async () => {
    try {
      const { port, writer } = get();

      if (writer) {
        writer.releaseLock();
      }

      if (port) {
        await port.close();
      }

      set({ port: null, writer: null, isConnected: false });
      get().updateStatus("Printer disconnected");
    } catch (err) {
      const error = err as Error;
      console.error("Error disconnecting:", error);
      get().updateStatus(`Disconnection failed: ${error.message}`);
    }
  },

  // Test if printer is connected and responding (ZPL version)
  testPrinterDevice: async () => {
    try {
      const { writer } = get();

      if (!writer) {
        return false;
      }

      const encoder = new TextEncoder();
      // ZPL status request command
      const testCmd = "~JC\r\n"; // ZPL cancel all command to test printer
      await writer.write(encoder.encode(testCmd));
      return true;
    } catch (err) {
      const error = err as Error;
      console.error("Printer test failed:", error);
      return false;
    }
  },

  // Print label with dynamic QR code based on printer configuration (ZPL version)
  printLabel: async (
    params = {},
    printerConfig?: PrinterConfig,
    isTest = false
  ) => {
    try {
      console.log("[PrinterService] printLabel called with:", {
        params,
        printerConfig: printerConfig ? "Valid config" : "NULL config", // Don't log the full object
        isTest,
      });

      // Validate printer config before proceeding
      if (!printerConfig) {
        console.error(
          "[PrinterService] No valid printer configuration provided!"
        );
        return false;
      }

      const { port, writer, isConnected } = get();

      if (!isTest && (!port || !writer || !isConnected)) {
        get().updateStatus("Please connect to printer first");
        return false;
      }

      let qrContent = "";

      console.log(printerConfig, "123 206 420");

      const labelData = printerConfig.labelData;

      console.log(labelData, "LABEL DATA");

      // Map label to keys
      const labelToKeyMap: Record<string, string> = {};

      if (printerConfig?.entityTableRows?.length) {
        for (const row of printerConfig.entityTableRows) {
          labelToKeyMap[row.name] = row.id;
        }
      }
      // Generate QR code content based on printer configuration using dynamic field mapper
      if (
        printerConfig &&
        printerConfig.priority &&
        printerConfig.priority.length > 0
      ) {
        console.log(
          "[PrinterService] Using printer config with priority:",
          printerConfig.priority
        );

        console.log("[PrinterService] Prepared label data:", labelData);

        // Use dynamic field mapper to resolve QR content
        const { content, debug } = resolveQRContent(
          printerConfig.priority,
          params,
          printerConfig.delimiter || "|",
          printerConfig.entityTableRows,
          true // Enable debug mode for detailed logging
        );
        console.log(content, "11122");
        qrContent = content;

        // Enhanced logging with field resolution details
        console.log("[PrinterService] Dynamic field resolution results:");
        debug.forEach(({ priority, fieldName, value, source }) => {
          console.log(
            `  Priority ${priority}: "${fieldName}" = "${value}" (source: ${source})`
          );
        });

        console.log(
          `[PrinterService] Final QR content: "${qrContent}" (length: ${qrContent.length})`
        );
      } else {
        // Fallback to original QR content format
        // qrContent = `UID:${uid}\nGRN:${grn}\nBatch:${batch}\nI-PN:${ipin}`;
        console.log(
          "[PrinterService] Using fallback QR content format - printerConfig missing or invalid:",
          {
            hasConfig: !!printerConfig,
            hasPriority: !!printerConfig?.priority,
            priorityLength: printerConfig?.priority?.length || 0,
          }
        );
      }

      console.log("[PrinterService] Final QR content:", qrContent);
      console.log("[PrinterService] Print parameters:", {
        uniqueId: params.uniqueId,
        uid: params.uid,
        copies: (params as any).copies,
        partNumber: params.partNumber,
        quantity: params.quantity,
      });

      // If this is a test, just set preview data and return
      if (isTest) {
        console.log("[PrinterService] Test mode - setting QR preview data");
        get().setQrPreviewData(qrContent);
        get().updateStatus(
          `QR code preview generated: ${qrContent.substring(0, 50)}${
            qrContent.length > 50 ? "..." : ""
          }`
        );
        return true;
      }

      // Trim content if it's too long to prevent QR code from becoming too large
      if (qrContent.length > 100) {
        console.warn(
          `[PrinterService] QR content exceeds 100 characters (${qrContent.length}). Trimming to improve scanning reliability.`
        );
        qrContent = qrContent.substring(0, 100);
      }
      console.log(qrContent, "CONTENT");

      // Convert mm to dots (203 dpi → 8 dots per mm)
      const mmToDots = (mm: number) => Math.round(mm * 8);
      const MM_TO_PX = 3.78;

      // Add Y-axis offset to move all content down
      const Y_OFFSET = 27; // Adjust this value to move content down (in dots)
      const X_OFFSET = 25;
      // Build ZPL commands from labelData.items
      const dynamicZplCommands: string[] = [];

      if (labelData.items.length) {
        for (const item of labelData.items) {
          const mmX = item.x / MM_TO_PX;
          const mmY = item.y / MM_TO_PX;
          const x = mmToDots(mmX) + X_OFFSET;
          const y = mmToDots(mmY) + Y_OFFSET; // Add Y offset to move content down

          const fontDots = Math.round(Number(item.fontSize || 11) * 2); // Convert px to dots

          switch (item.type) {
            case "qr":
              dynamicZplCommands.push(
                `^FO${x},${y}`,
                "^BQN,2,3",
                `^FDLA,${qrContent}^FS`
              );
              break;

            case "dataMatrix":
              dynamicZplCommands.push(
                `^FO${x},${y}`,
                "^BXN,5,10",
                `^FD${qrContent}^FS`
              );

              break;
            case "input":
              dynamicZplCommands.push(
                `^FO${x},${y}`,
                `^A0N${fontDots},${fontDots} `,
                `^FD${item.value}^FS`
              );
              break;

            case "value": {
              const label = item.value ?? "";
              const key = labelToKeyMap[label] || label;
              const dynamicValue = params?.[key] ?? "";
              console.log(`[Test] Label: "${label}" Value: "${dynamicValue}"`);

              dynamicZplCommands.push(
                `^FO${x - 10},${y}`,
                "^A0N,22,22",
                `^FD${dynamicValue}^FS`
              );
              break;
            }
          }
        }
      }

      // ZPL Commands for 50mm x 25mm label with optimized QR code
      const cmds = [
        "^XA",
        "^PW400",
        "^LL200",
        "^PR2",
        "^LH0,0",
        ...dynamicZplCommands,
        `^PQ${Math.max(Number((params as any).copies) || 1, 1)}`, // Print Quantity (default 1)
        "^XZ",
      ];

      console.log("[PrinterService] ZPL Commands:", cmds);
      console.log(
        "[PrinterService] Final ZPL command string:",
        cmds.join("\r\n")
      );

      const encoder = new TextEncoder();
      const data = encoder.encode(cmds.join("\r\n"));
      console.log("[PrinterService] Sending data to printer...");
      await writer.write(data);
      console.log("[PrinterService] Data sent successfully");
      get().updateStatus(
        "ZPL Label printed with dynamic QR code based on printer configuration"
      );
      return true;
    } catch (err) {
      const error = err as Error;
      console.error("Error printing ZPL label:", error);
      get().updateStatus(`ZPL Print failed: ${error.message}`);
      return false;
    }
  },

  // Print test page with ZPL commands
  printTest: async (params = {}) => {
    try {
      const { port, writer, isConnected } = get();

      if (!port || !writer || !isConnected) {
        get().updateStatus("Please connect to printer first");
        return false;
      }

      const {
        title = "Exelon Circuits",
        subtitle = "Web Print Test",
        barcode = "exeloncircuits.com",
        copies = 1,
      } = params;

      // ZPL Commands for test label
      const cmds = [
        "^XA", // Start of label
        "^PW384", // Set label width (384 dots for 48mm at 203dpi)
        "^LL200", // Set label length (200 dots for 25mm at 203dpi)

        "^FO50,20", // Field Origin
        "^A0N,30,30", // Font A, Normal, height 30, width 30
        `^FD${title}^FS`, // Title text

        "^FO50,60", // Field Origin
        "^A0N,25,25", // Font A, Normal, height 25, width 25
        `^FD${subtitle}^FS`, // Subtitle text

        "^FO50,100", // Field Origin for barcode
        "^BCN,30,Y,N,N", // Code 128 barcode, height 70, print interpretation
        `^FD${barcode}^FS`, // Barcode data

        `^PQ${copies}`, // Print Quantity
        "^XZ", // End of label
      ];

      const encoder = new TextEncoder();
      const data = encoder.encode(cmds.join("\r\n"));
      await writer.write(data);
      get().updateStatus("ZPL Print command sent successfully");
      return true;
    } catch (err) {
      const error = err as Error;
      console.error("Error printing ZPL test:", error);
      get().updateStatus(`ZPL Print failed: ${error.message}`);
      return false;
    }
  },

  // Update printer status
  updateStatus: (message) => {
    set({ status: message });
    console.log("Printer status:", message);
  },

  // Auto-connect to the last used printer
  autoConnectPrinter: async () => {
    try {
      const lastPrinterInfo = localStorage.getItem("lastConnectedPrinter");

      if (!lastPrinterInfo) {
        get().updateStatus("No previous printer found");
        return false;
      }

      const { usbVendorId, usbProductId } = JSON.parse(lastPrinterInfo);

      // Get all available ports
      const ports = await navigator.serial.getPorts();
      const lastPort = ports.find((p: any) => {
        const info = p.getInfo();
        return (
          info.usbVendorId === usbVendorId && info.usbProductId === usbProductId
        );
      });

      if (!lastPort) {
        get().updateStatus("Previous printer not found");
        return false;
      }

      // Connect to the found port
      try {
        await lastPort.open({ baudRate: 9600 });
        const newWriter = lastPort.writable.getWriter();

        set({ port: lastPort, writer: newWriter });

        // Test printer connection
        if (true) {
          set({ isConnected: true });
          get().updateStatus("Auto-connected to printer");
          return true;
        } else {
          throw new Error("Printer not responding");
        }
      } catch (err) {
        const error = err as Error;
        console.error("Error auto-connecting:", error);
        get().updateStatus(`Auto-connection failed: ${error.message}`);
        await get().disconnectPrinter();
        return false;
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error in auto-connect:", error);
      get().updateStatus(`Auto-connect error: ${error.message}`);
      return false;
    }
  },

  // Debug print function with ZPL coordinate testing
  printDebugGrid: async () => {
    try {
      const { port, writer, isConnected } = get();

      if (!port || !writer || !isConnected) {
        get().updateStatus("Please connect to printer first");
        return false;
      }

      // ZPL Debug grid with coordinate mapping
      const cmds = [
        "^XA", // Start of label
        "^PW400", // Set label width (400 dots for 50mm)
        "^LL200", // Set label length (200 dots for 25mm)

        // Test X coordinates (horizontal positions)
        "^FO50,20^A0N,15,15^FDX50^FS",
        "^FO100,20^A0N,15,15^FDX100^FS",
        "^FO150,20^A0N,15,15^FDX150^FS",
        "^FO200,20^A0N,15,15^FDX200^FS",
        "^FO250,20^A0N,15,15^FDX250^FS",
        "^FO300,20^A0N,15,15^FDX300^FS",
        "^FO350,20^A0N,15,15^FDX350^FS",

        // Test Y coordinates (vertical positions)
        "^FO10,40^A0N,15,15^FDY40^FS",
        "^FO10,60^A0N,15,15^FDY60^FS",
        "^FO10,80^A0N,15,15^FDY80^FS",
        "^FO10,100^A0N,15,15^FDY100^FS",
        "^FO10,120^A0N,15,15^FDY120^FS",
        "^FO10,140^A0N,15,15^FDY140^FS",
        "^FO10,160^A0N,15,15^FDY160^FS",
        "^FO10,180^A0N,15,15^FDY180^FS",
        // Corner reference
        "^FO5,5^A0N,12,12^FDSTART^FS",
        "^PQ1", // Print 1 copy
        "^XZ", // End of label
      ];

      const encoder = new TextEncoder();
      const data = encoder.encode(cmds.join("\r\n"));
      await writer.write(data);
      get().updateStatus(
        "ZPL coordinate debug grid printed - optimized for ZPL positioning"
      );
      return true;
    } catch (err) {
      const error = err as Error;
      console.error("Error printing ZPL debug grid:", error);
      get().updateStatus(`ZPL Debug print failed: ${error.message}`);
      return false;
    }
  },
}));
