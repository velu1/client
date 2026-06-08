import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Stage,
  Layer,
  Rect,
  Text as KonvaText,
  Image as KonvaImage,
  Transformer,
} from "react-konva";

import QRCode from "qrcode";
import bwipjs from "bwip-js/browser";
import Tooltip from "@mui/material/Tooltip";

import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";

import QrCodeIcon from "@mui/icons-material/QrCode";
import GridOnIcon from "@mui/icons-material/GridOn";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import LabelIcon from "@mui/icons-material/Label";
import DeleteIcon from "@mui/icons-material/Delete";
import UndoIcon from "@mui/icons-material/Undo";
import Konva from "konva";
import InfoIcon from "@mui/icons-material/Info";

const MM_TO_PX = 3.78;
// const VALUE_OPTIONS = ['LOT Number', 'Quantity', 'Part Number','Date'];

type CanvasItem = {
  id: string;
  type: "qr" | "dataMatrix" | "input" | "value";
  x: number;
  y: number;
  width: number;
  height: number;
  value?: string;
  imageDataUrl?: string;
  fontSize?: number;
};

interface CanvasEditorProps {
  widthMm: number;
  heightMm: number;
  itemsData: any[];
  entityTableRows: any;
  onSave: (data: { widthMm: number; heightMm: number; items: any[] }) => void;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({
  widthMm,
  heightMm,
  itemsData,
  entityTableRows,
  onSave,
}) => {
  // Change this line to create options with both id and name
  const [VALUE_OPTIONS] = useState<Array<{ id: string; name: string }>>(
    entityTableRows.map((record: any) => ({ id: record.id, name: record.name }))
  );
  const widthPx = Math.round(widthMm * MM_TO_PX);
  const heightPx = Math.round(heightMm * MM_TO_PX);

  const [items, setItems] = useState<CanvasItem[]>(itemsData || []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [history, setHistory] = useState<CanvasItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input whenever editingId changes (i.e. we start editing)
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const generateDataMatrix = (text: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      try {
        bwipjs.toCanvas(canvas, {
          bcid: "datamatrix",
          text,
          scale: 5,
          includetext: false,
        });
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error);
      }
    });
  };

  const addItem = async (
    type: CanvasItem["type"],
    customValue?: string,
    position?: { x: number; y: number }
  ) => {
    saveToHistory(items);

    const baseWidth = type === "input" || type === "value" ? 120 : 100;
    const baseHeight = type === "input" || type === "value" ? 30 : 100;

    let imageDataUrl;
    if (type === "qr") {
      imageDataUrl = await QRCode.toDataURL("Sample QR");
    } else if (type === "dataMatrix") {
      try {
        imageDataUrl = await generateDataMatrix("Sample DataMatrix");
      } catch (error) {
        console.error("Error generating DataMatrix:", error);
      }
    }

    const x = position
      ? position.x - baseWidth / 2
      : widthPx / 2 - baseWidth / 2;
    const y = position
      ? position.y - baseHeight / 2
      : heightPx / 2 - baseHeight / 2;

    const newItem: CanvasItem = {
      id: Date.now().toString(),
      type,
      x,
      y,
      width: baseWidth,
      height: baseHeight,
      value:
        type === "input" || type === "value"
          ? customValue || "Edit me"
          : undefined,
      imageDataUrl,
      fontSize: type === "input" || type === "value" ? 11 : undefined,
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    setSelectedId(newItem.id);

    // ✅ Auto-save after adding
    onSave({ widthMm, heightMm, items: newItems });

    if (type === "input") {
      setEditingId(newItem.id);
      setInputValue(newItem.value || "");
    }
  };

  const onTransformEnd = (id: string, node: any) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    saveToHistory(items);

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const newItems = items.map((item) =>
      item.id === id
        ? {
            ...item,
            width: Math.max(30, node.width() * scaleX),
            height: Math.max(20, node.height() * scaleY),
          }
        : item
    );

    setItems(newItems);

    // ✅ Auto-save after transform
    onSave({ widthMm, heightMm, items: newItems });
  };

  const onDragEnd = (id: string, e: any) => {
    saveToHistory(items);

    const pos = e.target.position();
    const newItems = items.map((item) =>
      item.id === id
        ? {
            ...item,
            x: pos.x,
            y: pos.y,
          }
        : item
    );

    setItems(newItems);

    // ✅ Auto-save after drag
    onSave({ widthMm, heightMm, items: newItems });
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedId) {
        saveToHistory(items);

        const newItems = items.filter((item) => item.id !== selectedId);
        setItems(newItems);
        setSelectedId(null);
        setEditingId(null);

        // ✅ Auto-save after keyboard delete
        onSave({ widthMm, heightMm, items: newItems });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, items, widthMm, heightMm, onSave]);

  const deleteSelected = () => {
    if (selectedId) {
      saveToHistory(items);

      const newItems = items.filter((item) => item.id !== selectedId);
      setItems(newItems);
      setSelectedId(null);
      setEditingId(null);

      // ✅ Auto-save after delete
      onSave({ widthMm, heightMm, items: newItems });
    }
  };

  const saveToHistory = (newItems: CanvasItem[]) => {
    setHistory((prev) => {
      // Remove any future history if we're not at the end
      const currentHistory = prev.slice(0, historyIndex + 1);
      // Add new state and limit to last 10 states
      const newHistory = [...currentHistory, newItems].slice(-10);
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 9));
  };

  const undo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setItems(previousState);
      setHistoryIndex((prev) => prev - 1);
      setSelectedId(null);
      setEditingId(null);
    }
  };

  const updateInputValue = (val: string) => {
    setInputValue(val);
    if (!editingId) return;

    const newItems = items.map((item) =>
      item.id === editingId ? { ...item, value: val } : item
    );
    setItems(newItems);

    // ✅ Auto-save when input changes
    onSave({ widthMm, heightMm, items: newItems });
  };

  useEffect(() => {
    const readableItems = (itemsData || []).map((item) => {
      if (item.type === "value" && item.value) {
        const match = VALUE_OPTIONS.find(
          (label) => toCamelCase(label.name) === item.value
        );
        return {
          ...item,
          value: match ? match.id : item.value,
        };
      }
      return item;
    });
    setItems(readableItems);

    // ✅ Initialize history with empty state first, then current items
    if (readableItems.length > 0) {
      setHistory([[], readableItems]); // Empty state first, then loaded items
      setHistoryIndex(1); // Point to the loaded items
    } else {
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, [itemsData, VALUE_OPTIONS]);

  const toCamelCase = (str: string): string => {
    const trimmed = str.trim();

    // Skip if it's a single word and contains both lowercase and uppercase (likely camelCase or PascalCase)
    if (
      !trimmed.includes(" ") &&
      /[A-Z]/.test(trimmed) &&
      /[a-z]/.test(trimmed) &&
      !/^[A-Z][a-z]+$/.test(trimmed)
    ) {
      console.log(
        `🔒 Skipped toCamelCase: already in camelCase or PascalCase → "${trimmed}"`
      );
      return trimmed;
    }

    // Generate camelCase string
    const camel = trimmed
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_match, chr) => chr.toUpperCase())
      .replace(/^[^a-zA-Z0-9]+/, "");

    // Ensure first character is always lowercase
    const result = camel.charAt(0).toLowerCase() + camel.slice(1);

    console.log(`📝 Converted toCamelCase: "${str}" → "${result}"`);
    return result;
  };
  // const clearCanvas = () => {
  //   saveToHistory(items);
  //   setItems([]);
  //   setSelectedId(null);
  //   setEditingId(null);
  //   setInputValue("");

  //   // ✅ Auto-save after clear
  //   onSave({ widthMm, heightMm, items: [] });
  // };

  // Position the HTML input exactly over the selected item being edited
  useEffect(() => {
    if (!editingId || !containerRef.current) return;
    const item = items.find((i) => i.id === editingId);
    if (!item) return;
    const inputEl = inputRef.current;
    if (!inputEl) return;

    // Calculate container offset to position input absolutely inside container
    inputEl.style.position = "absolute";
    inputEl.style.top = `${item.y}px`;
    inputEl.style.left = `${item.x}px`;
    inputEl.style.width = `${item.width}px`;
    inputEl.style.height = `${item.height}px`;
    inputEl.style.fontSize = `${item.fontSize || 11}px`;
    inputEl.style.border = "1px solid #3f51b5";
    inputEl.style.padding = "2px 4px";
    inputEl.style.borderRadius = "4px";
    inputEl.style.zIndex = "1000";
    inputEl.style.backgroundColor = "white";
    inputEl.style.outline = "none";
  }, [editingId, items]);

  const selectedValueItem = selectedId
    ? items.find((i) => i.id === selectedId && i.type === "value")
    : null;

  const dropdownStyle = useMemo(() => {
    if (!selectedValueItem) return {};

    return {
      position: "absolute",
      top: `${selectedValueItem.y}px`,
      left: `${selectedValueItem.x}px`,
      width: `${selectedValueItem.width}px`,
      height: `${selectedValueItem.height}px`,
      zIndex: 1500,
      fontSize: `${selectedValueItem.fontSize || 11}px`,
      backgroundColor: "white",
    } as React.CSSProperties;
  }, [selectedValueItem]);

  // Add a helper function to get display name from id
  const getDisplayName = (id: string): string => {
    const option = VALUE_OPTIONS.find((opt) => opt.id === id);
    return option ? option.name : id;
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
             variant="subtitle1" sx={{ color: "text.secondary" }}>
            Label Editor
            <Tooltip
              title="Keep adequate space around QR codes as their size may increase based on data content, which could cause overlap issues with other elements."
              arrow
              placement="top"
            >
              <InfoIcon
                sx={{
                  color: "text.secondary",
                  fontSize: 14,
                  marginLeft: 0.5,
                  marginBottom: 0.5,
                  cursor: "help",
                  "&:hover": { color: "primary.main" },
                }}
              />
            </Tooltip>
          </Typography>

          {/* <div className="flex gap-2">
            <Button
              onClick={clearCanvas}
              variant="contained"
              sx={{
                bgcolor: "var(--primary)",
                color: "white",
                px: { xs: "8px", sm: "30px" },
                fontSize: { xs: "0.75rem", sm: "1rem" },
                minWidth: { xs: "40px", sm: "auto" },
              }}
            >
              Clear
            </Button>
          </div> */}
        </Box>

        <Stack
          direction={{ xs: "row", sm: "row" }}
          flexWrap="wrap"
          gap={{ xs: 1, sm: 2 }}
          rowGap={1}
          mb={2}
          justifyContent={{ xs: "center", sm: "flex-start" }}
          width="100%"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="QR Code" arrow>
              <Button
                onClick={() => addItem("qr")}
                variant="contained"
                sx={{
                  bgcolor: "var(--primary)",
                  color: "white",
                  minWidth: { xs: 40, sm: 48 },
                }}
              >
                <QrCodeIcon />
              </Button>
            </Tooltip>
          </Stack>
          <Tooltip title="Data Matrix" arrow>
            <Button
              onClick={() => addItem("dataMatrix")}
              variant="contained"
              sx={{ bgcolor: "var(--primary)", color: "white", minWidth: 48 }}
            >
              <GridOnIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Input Text" arrow>
            <Button
              onClick={() => addItem("input")}
              variant="contained"
              sx={{ bgcolor: "var(--primary)", color: "white", minWidth: 48 }}
            >
              <TextFieldsIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Value Dropdown" arrow>
            <Button
              onClick={() => addItem("value")}
              variant="contained"
              sx={{ bgcolor: "var(--primary)", color: "white", minWidth: 48 }}
            >
              <LabelIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Delete Selected" arrow>
            <Button
              onClick={deleteSelected}
              variant="contained"
              disabled={!selectedId}
              sx={{
                bgcolor: selectedId ? "#d32f2f" : "gray",
                color: "white",
                minWidth: 48,
                "&:hover": {
                  bgcolor: selectedId ? "#b71c1c" : "gray",
                },
                "&:disabled": {
                  bgcolor: "gray",
                  color: "white",
                },
              }}
            >
              <DeleteIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Undo" arrow>
            <Button
              onClick={undo}
              variant="contained"
              disabled={historyIndex <= 0}
              sx={{
                bgcolor: historyIndex > 0 ? "#2e7d32" : "gray",
                color: "white",
                minWidth: 48,
                "&:hover": {
                  bgcolor: historyIndex > 0 ? "#1b5e20" : "gray",
                },
                "&:disabled": {
                  bgcolor: "gray",
                  color: "white",
                },
              }}
            >
              <UndoIcon />
            </Button>
          </Tooltip>
        </Stack>

        <Box
          ref={containerRef}
          sx={{
            position: "relative",
            width: widthPx + 5,
            height: heightPx,
            border: "1px solid #333",
            borderRadius: 2,
            backgroundColor: "white",
            overflow: "hidden",
            userSelect: "none",
          }}
        >
          <Stage width={widthPx} height={heightPx}>
            <Layer>
              <Rect width={widthPx} height={heightPx} fill="#ffffff" />
              {items.map((item) => (
                <CanvasDraggableItem
                  key={item.id}
                  item={item}
                  isSelected={selectedId === item.id}
                  onSelect={() => setSelectedId(item.id)}
                  onDragEnd={onDragEnd}
                  onTransformEnd={onTransformEnd}
                  setEditingId={setEditingId}
                  setInputValue={setInputValue}
                  getDisplayName={getDisplayName}
                />
              ))}
            </Layer>
          </Stage>

          {editingId && (
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => updateInputValue(e.target.value)}
              onBlur={() => setEditingId(null)}
              // autoFocus
            />
          )}

          {selectedValueItem && (
            <Select
              size="small"
              value={selectedValueItem.value || ""}
              onChange={(e) => {
                const val = e.target.value;
                const newItems = items.map((item) =>
                  item.id === selectedValueItem.id
                    ? { ...item, value: val }
                    : item
                );
                setItems(newItems);

                // ✅ Auto-save when dropdown value changes
                onSave({ widthMm, heightMm, items: newItems });
              }}
              onBlur={() => setSelectedId(null)}
              displayEmpty
              sx={{ ...dropdownStyle, p: 0 }}
            >
              {VALUE_OPTIONS.map((opt) => (
                <MenuItem key={opt.id} value={opt.id}>
                  {opt.name}
                </MenuItem>
              ))}
            </Select>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

interface CanvasDraggableItemProps {
  item: CanvasItem;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (id: string, e: any) => void;
  onTransformEnd: (id: string, node: any) => void;
  setEditingId: (id: string | null) => void;
  setInputValue: (val: string) => void;
  getDisplayName: (id: string) => string;
}

const CanvasDraggableItem: React.FC<CanvasDraggableItemProps> = ({
  item,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  setEditingId,
  setInputValue,
  getDisplayName,
}) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const commonProps = {
    x: item.x,
    y: item.y,
    width: item.width,
    height: item.height,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDblClick: () => {
      if (item.type === "input") {
        setEditingId(item.id);

        setInputValue(item.value || "");
      }
    },

    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => onDragEnd(item.id, e),
    onTransformEnd: () => {
      if (!shapeRef.current) return;
      onTransformEnd(item.id, shapeRef.current);
    },
    ref: shapeRef as any,
  };
  if (item.type === "qr" || item.type === "dataMatrix") {
    return (
      <>
        <KonvaImage
          {...commonProps}
          image={(() => {
            if (!item.imageDataUrl) return undefined;
            const img = new window.Image();
            img.src = item.imageDataUrl;
            return img;
          })()}
          perfectDrawEnabled={false}
          preventDefault={false}
          ref={shapeRef as React.Ref<Konva.Image>}
        />
        {isSelected && (
          <Transformer ref={trRef} rotateEnabled={false} keepRatio />
        )}
      </>
    );
  }

  return (
    <>
      <KonvaText
        {...commonProps}
        text={
          item.type === "value"
            ? getDisplayName(item.value || "")
            : item.value || ""
        }
        align="left"
        verticalAlign="middle"
        padding={8}
        wrap="none"
        perfectDrawEnabled={false}
        preventDefault={false}
        ref={shapeRef as React.Ref<Konva.Text>}
      />
      {isSelected && item.type !== "value" && item.type !== "input" && (
        <Transformer ref={trRef} rotateEnabled={false} keepRatio />
      )}
    </>
  );
};

export default CanvasEditor;
