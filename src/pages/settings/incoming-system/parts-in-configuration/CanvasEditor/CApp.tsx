import { useState } from 'react';
import LabelCreator from './LabelCreator';
import CanvasEditor from './CanvasEditor';
import { Box, Paper } from '@mui/material';

interface CAppEditorProps {
  widthMm: number;
  heightMm: number;
  items: any[];
  entityTableRows: any[]; 
  canvaData: (data: { widthMm: number; heightMm: number; items: any[] }) => void;
}

const CApp: React.FC<CAppEditorProps> = ({ widthMm, heightMm, items, entityTableRows, canvaData }) => {

  const [canvasSize] = useState<{ width: number; height: number } | null>(null);
const [, setCanvaDetails] = useState<{
  heightMm: number;
  widthMm: number;
  items: any[];
} | null>(null);

const onSaveData = (data: {
  widthMm: number;
  heightMm: number;
  items: any[];
}) => {
  console.log("✅ Saved from childssss:", data);
  setCanvaDetails({
    heightMm: data.heightMm,
    widthMm: data.widthMm,
    items: data.items,
  });
  canvaData({
    heightMm: data.heightMm,
    widthMm: data.widthMm,
    items: data.items,
  });
};
//  const onSaveData = (data: any) => {
//     console.log("✅ FFFFFFFFFFFF:", data);
   
//   };


  
  

  return (
    <Box
      sx={{
        marginTop: "0px",
        alignItems: "flex-start",
        // gap: 4,
        // border: '1px solid #ccc',
        // borderRadius: 1,
      }}
    >
      {/* Left: LabelCreator Panel */}
      <Paper
        // elevation={3}
        // sx={{
        //   padding: 1,
        //   backgroundColor: "#ffffff",
        //   border: "1px solid #ccc",
        //   borderRadius: 3,
        // }}
      >
        <LabelCreator
          width={widthMm}
          height={heightMm}
          item={items || []}
          entityTableRows={entityTableRows}
          onSaveData={onSaveData}
        />
      </Paper>

      {/* Right: Canvas Editor Panel */}
      {canvasSize && (
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            flexGrow: 1,
            minHeight: "300px",
            backgroundColor: "#ffffff",
            border: "1px solid #ddd",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CanvasEditor
            widthMm={widthMm ? widthMm : canvasSize.width}
            heightMm={heightMm ? heightMm : canvasSize.height}
            onSave={onSaveData}
            itemsData={items || []}
            entityTableRows={entityTableRows}
          />
        </Paper>
      )}
    </Box>
  );
}

export default CApp;