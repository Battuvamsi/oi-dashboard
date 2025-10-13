import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface GraphDataPoint {
  dateTime: string;
  oichangeFinalResult: {
    oiChangeTotalValues: {
      totalImbalance: number;
    };
  };
}

interface GraphProps {
  data: {
    key: string;
    values: GraphDataPoint[];
  };
}

export default function Graph({ data }: GraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
    visible: boolean;
  }>({ x: 0, y: 0, content: "", visible: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !data.values.length || !isExpanded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const width = container.clientWidth;
    const height = 320;
    canvas.width = width;
    canvas.height = height;

    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Clear canvas with dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, width, height);

    // Clamp values
    const clampedData = data.values.map((point) => ({
      ...point,
      rawValue: point.oichangeFinalResult.oiChangeTotalValues.totalImbalance,
      clampedValue: Math.max(
        -120,
        Math.min(120, point.oichangeFinalResult.oiChangeTotalValues.totalImbalance)
      ),
    }));

    // Draw grid lines and Y-axis labels
    ctx.lineWidth = 1;
    ctx.font = "13px sans-serif";

    const yValues = [-120, -90, -60, -30, 0, 30, 60, 90, 120];
    yValues.forEach((val) => {
      const y = padding.top + ((120 - val) / 240) * graphHeight;

      // Grid line color - enhanced visibility
      if (val === 30) ctx.strokeStyle = "#22c55e";
      else if (val === -30) ctx.strokeStyle = "#ef4444";
      else if (val === 0) ctx.strokeStyle = "#9ca3af";
      else ctx.strokeStyle = "#4b5563";

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + graphWidth, y);
      ctx.stroke();

      // Y-axis label - brighter for better visibility
      ctx.fillStyle = "#d1d5db";
      ctx.textAlign = "right";
      ctx.fillText(val.toString(), padding.left - 10, y + 4);
    });

    // Draw X-axis labels - brighter for better visibility
    const timeLabels = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const index = Math.floor(ratio * (clampedData.length - 1));
      const point = clampedData[index];
      const date = new Date(point.dateTime);
      return {
        x: padding.left + ratio * graphWidth,
        label: date.toLocaleTimeString("en-US", { hour12: false }),
      };
    });

    ctx.fillStyle = "#d1d5db";
    ctx.textAlign = "center";
    timeLabels.forEach((label) => {
      ctx.fillText(label.label, label.x, height - padding.bottom + 20);
    });

    // Draw line and dots
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 2;
    ctx.beginPath();

    clampedData.forEach((point, index) => {
      const x = padding.left + (index / (clampedData.length - 1)) * graphWidth;
      const y = padding.top + ((120 - point.clampedValue) / 240) * graphHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw dots
    clampedData.forEach((point, index) => {
      const x = padding.left + (index / (clampedData.length - 1)) * graphWidth;
      const y = padding.top + ((120 - point.clampedValue) / 240) * graphHeight;

      ctx.beginPath();
      ctx.arc(x, y, index === clampedData.length - 1 ? 6 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = index === clampedData.length - 1 ? "#ef4444" : "#60a5fa";
      ctx.fill();
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Mouse move handler for tooltip
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let found = false;
      clampedData.forEach((point, index) => {
        const x = padding.left + (index / (clampedData.length - 1)) * graphWidth;
        const y = padding.top + ((120 - point.clampedValue) / 240) * graphHeight;

        const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
        if (distance < 10) {
          const date = new Date(point.dateTime);
          const content = `Time: ${date.toLocaleTimeString()}\nRaw: ${point.rawValue.toFixed(2)}\nClamped: ${point.clampedValue.toFixed(2)}`;
          setTooltip({ x: e.clientX, y: e.clientY, content, visible: true });
          found = true;
        }
      });

      if (!found) {
        setTooltip((prev) => ({ ...prev, visible: false }));
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    return () => canvas.removeEventListener("mousemove", handleMouseMove);
  }, [data, isExpanded]);

  return (
    <Card className="p-3 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold tracking-tight text-foreground">Total Imbalance Over Time</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Expand
            </>
          )}
        </Button>
      </div>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          ref={containerRef}
          className="relative w-full"
        >
          <canvas ref={canvasRef} className="w-full rounded-lg" />
          {tooltip.visible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed bg-card/95 backdrop-blur-sm border-2 border-primary/50 text-foreground text-sm p-3 rounded-lg shadow-2xl pointer-events-none z-50 whitespace-pre-line font-medium"
              style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
            >
              {tooltip.content}
            </motion.div>
          )}
        </motion.div>
      )}
    </Card>
  );
}