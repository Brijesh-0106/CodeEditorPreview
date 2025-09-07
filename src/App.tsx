import { useRef, useState } from "react";
import "./App.css";
import CodeBlockEditor from "./Components/CodeBlockEditor";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [block, setBlock] = useState({
    title: "Example Request",
    code: "console.log('Hello World!');",
    language: "javascript",
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [previewRect, setPreviewRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [finalRect, setFinalRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const MIN_WIDTH = 500; // 👈 big enough for full editor
  const MIN_HEIGHT = 300;
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    startPoint.current = { x: e.clientX, y: e.clientY };
    setPreviewRect(null); // reset preview
    setFinalRect(null); // reset old editor
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint.current) return;
    const newW = e.clientX - startPoint.current.x;
    const newH = e.clientY - startPoint.current.y;
    setPreviewRect({
      x: startPoint.current.x,
      y: startPoint.current.y,
      w: newW,
      h: newH,
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !previewRect) return;
    setIsDrawing(false);
    startPoint.current = null;

    // finalize editor rectangle with min size
    setFinalRect({
      x: previewRect.x,
      y: previewRect.y,
      w: Math.max(Math.abs(previewRect.w), MIN_WIDTH),
      h: Math.max(Math.abs(previewRect.h), MIN_HEIGHT),
    });

    setPreviewRect(null); // remove preview
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
        cursor: isDrawing ? "crosshair" : "default", // 👈 change cursor
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <button onClick={toggleTheme}>ToggleTheme</button>{" "}
      <button onClick={() => setIsDrawing(true)}>Draw Shape</button>
      {previewRect && (
        <div
          style={{
            position: "absolute",
            top: previewRect.y,
            left: previewRect.x,
            width: Math.abs(previewRect.w),
            height: Math.abs(previewRect.h),
            border: "2px dashed #6965db",
            pointerEvents: "none", // let mouse events pass through
          }}
        />
      )}
      {finalRect && (
        <div
          style={{
            position: "absolute",
            top: finalRect.y,
            left: finalRect.x,
            width: finalRect.w,
            height: finalRect.h,
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <CodeBlockEditor
            className={`code-block-editor ${isDarkMode ? "dark" : "light"}`}
            value={block}
            onChange={setBlock}
            bgTheme={isDarkMode ? "dark" : "light"}
          />
        </div>
      )}
    </div>
  );
}

export default App;
