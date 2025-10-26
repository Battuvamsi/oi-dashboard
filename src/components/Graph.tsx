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
      pcr?: number;
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
    dataIndex: number;
  }>({ x: 0, y: 0, content: "", visible: false, dataIndex: -1 });

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

    const isMobile = width < 640;
    const isTablet = width < 1024;
    const padding = isMobile 
      ? { top: 20, right: 25, bottom: 30, left: 30 }
      : isTablet
      ? { top: 30, right: 40, bottom: 40, left: 40 }
      : { top: 40, right: 60, bottom: 60, left: 60 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Clear canvas with darker background for better contrast
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    // Filter data to only show 8:59 AM to 4:00 PM IST
    const filteredData = data.values.filter((point) => {
      const utcDate = new Date(point.dateTime);
      const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      
      if (hours === 8 && minutes >= 59) return true;
      if (hours > 8 && hours < 16) return true;
      if (hours === 16 && minutes === 0) return true;
      return false;
    });

    // If no data in the time range, show empty graph
    if (filteredData.length === 0) {
      ctx.fillStyle = "#d1d5db";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No data available for 8:59 AM - 4:00 PM IST", width / 2, height / 2);
      return;
    }

    // Clamp imbalance values
    const clampedData = filteredData.map((point) => ({
      ...point,
      rawImbalance: point.oichangeFinalResult.oiChangeTotalValues.totalImbalance,
      clampedImbalance: Math.max(
        -120,
        Math.min(120, point.oichangeFinalResult.oiChangeTotalValues.totalImbalance)
      ),
      pcr: point.oichangeFinalResult.oiChangeTotalValues.pcr,
    }));

    // Check if PCR data exists
    const hasPCR = clampedData.some(point => point.pcr !== undefined && point.pcr !== null);

    // Draw gradient shaded regions first (so they appear behind grid lines)
    // Green gradient above 30 - fades from opaque at 30 line to transparent at top
    const y30 = padding.top + ((120 - 30) / 240) * graphHeight;
    const yTop = padding.top;
    const greenGradient = ctx.createLinearGradient(0, y30, 0, yTop);
    greenGradient.addColorStop(0, "rgba(52, 211, 153, 0.2)");
    greenGradient.addColorStop(1, "rgba(52, 211, 153, 0)");
    ctx.fillStyle = greenGradient;
    ctx.fillRect(padding.left, yTop, graphWidth, y30 - yTop);

    // Red gradient below -30 - fades from opaque at -30 line to transparent at bottom
    const yMinus30 = padding.top + ((120 - (-30)) / 240) * graphHeight;
    const yBottom = padding.top + graphHeight;
    const redGradient = ctx.createLinearGradient(0, yMinus30, 0, yBottom);
    redGradient.addColorStop(0, "rgba(248, 113, 113, 0.2)");
    redGradient.addColorStop(1, "rgba(248, 113, 113, 0)");
    ctx.fillStyle = redGradient;
    ctx.fillRect(padding.left, yMinus30, graphWidth, yBottom - yMinus30);

    // Draw grid lines and Y-axis labels for Imbalance (left axis)
    ctx.lineWidth = 1;
    ctx.font = isMobile ? "11px sans-serif" : "13px sans-serif";

    const yValues = [-120, -90, -60, -30, 0, 30, 60, 90, 120];
    yValues.forEach((val) => {
      const y = padding.top + ((120 - val) / 240) * graphHeight;

      // Grid line color - maximum visibility
      if (val === 30) ctx.strokeStyle = "#34d399";
      else if (val === -30) ctx.strokeStyle = "#f87171";
      else if (val === 0) ctx.strokeStyle = "#d1d5db";
      else ctx.strokeStyle = "#6b7280";

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + graphWidth, y);
      ctx.stroke();

      // Y-axis label - brighter for better visibility
      ctx.fillStyle = "#d1d5db";
      ctx.textAlign = "right";
      ctx.fillText(val.toString(), padding.left - 10, y + 4);
    });

    // Draw right Y-axis labels for PCR if available
    if (hasPCR) {
      const pcrValues = clampedData.map(d => d.pcr).filter(p => p !== undefined) as number[];
      const minPCR = Math.min(...pcrValues);
      const maxPCR = Math.max(...pcrValues);
      const pcrRange = maxPCR - minPCR;
      
      // Draw PCR axis labels
      const pcrSteps = [0, 0.25, 0.5, 0.75, 1];
      ctx.fillStyle = "#fbbf24";
      ctx.textAlign = "left";
      pcrSteps.forEach((ratio) => {
        const pcrValue = minPCR + ratio * pcrRange;
        const y = padding.top + (1 - ratio) * graphHeight;
        ctx.fillText(pcrValue.toFixed(2), padding.left + graphWidth + 10, y + 4);
      });
    }

    // Draw Imbalance line
    ctx.strokeStyle = "#93c5fd";
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    clampedData.forEach((point, index) => {
      const x = padding.left + (index / (clampedData.length - 1)) * graphWidth;
      const y = padding.top + ((120 - point.clampedImbalance) / 240) * graphHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw PCR line if available
    if (hasPCR) {
      const pcrValues = clampedData.map(d => d.pcr).filter(p => p !== undefined) as number[];
      const minPCR = Math.min(...pcrValues);
      const maxPCR = Math.max(...pcrValues);
      const pcrRange = maxPCR - minPCR || 1;

      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      clampedData.forEach((point, index) => {
        if (point.pcr !== undefined && point.pcr !== null) {
          const x = padding.left + (index / (clampedData.length - 1)) * graphWidth;
          const normalizedPCR = (point.pcr - minPCR) / pcrRange;
          const y = padding.top + (1 - normalizedPCR) * graphHeight;

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });

      ctx.stroke();
    }

    // Draw dots for Imbalance with values
    clampedData.forEach((point, index) => {
      const x = padding.left + (index / (clampedData.length - 1)) * graphWidth;
      const y = padding.top + ((120 - point.clampedImbalance) / 240) * graphHeight;

      const isLast = index === clampedData.length - 1;
      const isHovered = tooltip.visible && tooltip.dataIndex === index;
      
      ctx.beginPath();
      ctx.arc(x, y, isHovered ? 8 : (isLast ? 6 : 4), 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? "#60a5fa" : (isLast ? "#f87171" : "#93c5fd");
      ctx.fill();
      ctx.strokeStyle = isHovered ? "#ffffff" : "#0a0a0a";
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.stroke();

      // Display value at 30-minute intervals - using IST
      const utcDate = new Date(point.dateTime);
      const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
      const minutes = istDate.getMinutes();
      const shouldShowValue = minutes === 0 || minutes === 30 || isLast;
      
      if (shouldShowValue) {
        ctx.fillStyle = "#93c5fd";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(point.clampedImbalance.toFixed(1), x, y - 10);
      }
    });

    // Draw dots for PCR with values if available
    if (hasPCR) {
      const pcrValues = clampedData.map(d => d.pcr).filter(p => p !== undefined) as number[];
      const minPCR = Math.min(...pcrValues);
      const maxPCR = Math.max(...pcrValues);
      const pcrRange = maxPCR - minPCR || 1;

      clampedData.forEach((point, index) => {
        if (point.pcr !== undefined && point.pcr !== null) {
          const x = padding.left + (index / (clampedData.length - 1)) * graphWidth;
          const normalizedPCR = (point.pcr - minPCR) / pcrRange;
          const y = padding.top + (1 - normalizedPCR) * graphHeight;

          const isLast = index === clampedData.length - 1;
          const isHovered = tooltip.visible && tooltip.dataIndex === index;
          
          ctx.beginPath();
          ctx.arc(x, y, isHovered ? 8 : (isLast ? 6 : 4), 0, 2 * Math.PI);
          ctx.fillStyle = isHovered ? "#fcd34d" : (isLast ? "#f87171" : "#fbbf24");
          ctx.fill();
          ctx.strokeStyle = isHovered ? "#ffffff" : "#0a0a0a";
          ctx.lineWidth = isHovered ? 3 : 2;
          ctx.stroke();

          // Display PCR value at 30-minute intervals - using IST
          const utcDate = new Date(point.dateTime);
          const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
          const minutes = istDate.getMinutes();
          const shouldShowValue = minutes === 0 || minutes === 30 || isLast;
          
          if (shouldShowValue) {
            ctx.fillStyle = "#fbbf24";
            ctx.font = "11px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(point.pcr.toFixed(3), x, y + 15);
          }
        }
      });
    }

    // Draw X-axis labels dynamically - converted to IST (drawn last for visibility)
    ctx.fillStyle = "#d1d5db";
    ctx.textAlign = "center";
    ctx.font = isMobile ? "10px sans-serif" : "12px sans-serif";
    
    // Guard against divide-by-zero
    if (clampedData.length > 1) {
      // Calculate optimal number of labels based on screen width
      const maxLabels = isMobile ? 4 : isTablet ? 6 : 8;
      const labelInterval = Math.max(1, Math.floor(clampedData.length / maxLabels));
      
      clampedData.forEach((point, index) => {
        // Show first, last, and evenly spaced labels
        const shouldLabel = index === 0 || 
                           index === clampedData.length - 1 || 
                           index % labelInterval === 0;
        
        if (shouldLabel) {
          const utcDate = new Date(point.dateTime);
          const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
          const x = padding.left + (index / (clampedData.length - 1)) * graphWidth;
          const label = istDate.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false });
          const yPosition = height - padding.bottom + 20;
          ctx.fillText(label, x, yPosition);
        }
      });
    } else if (clampedData.length === 1) {
      const utcDate = new Date(clampedData[0].dateTime);
      const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
      const label = istDate.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false });
      const x = padding.left + graphWidth / 2;
      const yPosition = height - padding.bottom + 20;
      ctx.fillText(label, x, yPosition);
    }

  }, [data, isExpanded, tooltip.visible, tooltip.dataIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !data.values.length) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const padding = { top: 40, right: 60, bottom: 60, left: 60 };
    const graphWidth = canvas.width - padding.left - padding.right;
    const graphHeight = canvas.height - padding.top - padding.bottom;

    // Check if mouse is within graph area
    if (mouseX < padding.left || mouseX > canvas.width - padding.right) {
      setTooltip({ x: 0, y: 0, content: "", visible: false, dataIndex: -1 });
      return;
    }

    // Filter data to only show 8:59 AM to 4:00 PM IST
    const filteredData = data.values.filter((point) => {
      const utcDate = new Date(point.dateTime);
      const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      
      if (hours === 8 && minutes >= 59) return true;
      if (hours > 8 && hours < 16) return true;
      if (hours === 16 && minutes === 0) return true;
      return false;
    });

    if (filteredData.length === 0) {
      setTooltip({ x: 0, y: 0, content: "", visible: false, dataIndex: -1 });
      return;
    }

    // Find closest data point
    const clampedData = filteredData.map((point) => ({
      ...point,
      clampedImbalance: Math.max(
        -120,
        Math.min(120, point.oichangeFinalResult.oiChangeTotalValues.totalImbalance)
      ),
      pcr: point.oichangeFinalResult.oiChangeTotalValues.pcr,
    }));

    const relativeX = mouseX - padding.left;
    const dataIndex = Math.round((relativeX / graphWidth) * (clampedData.length - 1));
    
    if (dataIndex >= 0 && dataIndex < clampedData.length) {
      const point = clampedData[dataIndex];
      const utcDate = new Date(filteredData[dataIndex].dateTime);
      // Convert UTC to IST for tooltip display
      const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
      const timeStr = istDate.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false });
      
      let tooltipContent = `Time: ${timeStr}\\nImbalance: ${point.clampedImbalance.toFixed(2)}`;
      if (point.pcr !== undefined && point.pcr !== null) {
        tooltipContent += `\\nPCR: ${point.pcr.toFixed(4)}`;
      }

      // Calculate the exact position of the data point on the canvas
      const pointX = padding.left + (dataIndex / (clampedData.length - 1)) * graphWidth;
      const pointY = padding.top + ((120 - point.clampedImbalance) / 240) * graphHeight;

      // Position tooltip relative to container, not screen
      // Use offset positioning to keep it within bounds
      setTooltip({
        x: pointX,
        y: pointY - 10, // Position above the point
        content: tooltipContent,
        visible: true,
        dataIndex: dataIndex,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ x: 0, y: 0, content: "", visible: false, dataIndex: -1 });
  };

  return (
    <Card className="p-3 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold tracking-tight text-foreground">Total Imbalance & PCR Over Time</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[#93c5fd]"></div>
              <span className="text-muted-foreground">Imbalance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[#fbbf24]"></div>
              <span className="text-muted-foreground">PCR</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-green-500/20 border border-green-500/40 rounded"></div>
              <span className="text-muted-foreground text-xs">Bullish (+30)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-red-500/20 border border-red-500/40 rounded"></div>
              <span className="text-muted-foreground text-xs">Bearish (-30)</span>
            </div>
          </div>
        </div>
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
          <canvas 
            ref={canvasRef} 
            className="w-full rounded-lg cursor-crosshair" 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
          {tooltip.visible && (
            <div
              className="absolute z-50 px-3 py-2 text-sm bg-card border border-border rounded-lg shadow-lg pointer-events-none"
              style={{
                left: `${tooltip.x + 10}px`,
                top: `${tooltip.y}px`,
                transform: 'translateY(-100%)',
              }}
            >
              {tooltip.content.split('\\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </Card>
  );
}