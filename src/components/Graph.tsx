import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  isSticky?: boolean;
  onToggleSticky?: (checked: boolean) => void;
}

export default function Graph({ data, isSticky = false, onToggleSticky }: GraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showPCR, setShowPCR] = useState(true);
  const [showImbalance, setShowImbalance] = useState(true);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
    visible: boolean;
    dataIndex: number;
  }>({ x: 0, y: 0, content: "", visible: false, dataIndex: -1 });

  // Detect current theme
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Animation refs
  const previousKeyRef = useRef<string>(data.key);
  const imbalanceProgressRef = useRef(0);
  const pcrProgressRef = useRef(0);
  const animationRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

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

    // Filter data to show market hours
    // Widened range to accommodate both UTC (03:45 start) and IST-as-UTC (09:15 start) formats
    const filteredData = data.values.filter((point) => {
      if (!point.dateTime) return false;
      const date = new Date(point.dateTime);
      const hours = date.getUTCHours();
      
      // Accept data from 3 AM to 4 PM UTC
      // This covers:
      // - Real UTC: 03:45 (9:15 IST) to 10:00 (15:30 IST)
      // - IST as UTC: 09:15 to 15:30
      return hours >= 3 && hours <= 16;
    });

    // If no data in the time range, show empty graph
    if (filteredData.length === 0) {
      ctx.fillStyle = isDarkMode ? "#d1d5db" : "#6b7280";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No data available for market hours", width / 2, height / 2);
      return;
    }

    // Clamp imbalance values
    const clampedData = filteredData.map((point) => {
      const totalImbalance = point.oichangeFinalResult?.oiChangeTotalValues?.totalImbalance ?? 0;
      const pcr = point.oichangeFinalResult?.oiChangeTotalValues?.pcr;
      
      return {
        ...point,
        rawImbalance: totalImbalance,
        clampedImbalance: Math.max(
          -120,
          Math.min(120, totalImbalance)
        ),
        pcr: pcr,
      };
    });

    // Check if PCR data exists
    const hasPCR = clampedData.some(point => point.pcr !== undefined && point.pcr !== null);

    // Draw function to handle animation frames
    const draw = (imbalanceProg: number, pcrProg: number) => {
      // Clear canvas with theme-aware background
      ctx.fillStyle = isDarkMode ? "#0a0a0a" : "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Draw gradient shaded regions first (so they appear behind grid lines)
      // Green gradient above 30 - fades from opaque at 30 line to semi-transparent at top
      const y30 = padding.top + ((120 - 30) / 240) * graphHeight;
      const yTop = padding.top;
      const greenGradient = ctx.createLinearGradient(0, y30, 0, yTop);
      greenGradient.addColorStop(0, "rgba(34, 197, 94, 0.3)");
      greenGradient.addColorStop(0.5, "rgba(34, 197, 94, 0.15)");
      greenGradient.addColorStop(1, "rgba(34, 197, 94, 0.05)");
      ctx.fillStyle = greenGradient;
      ctx.fillRect(padding.left, yTop, graphWidth, y30 - yTop);

      // Red gradient below -30 - fades from opaque at -30 line to semi-transparent at bottom
      const yMinus30 = padding.top + ((120 - (-30)) / 240) * graphHeight;
      const yBottom = padding.top + graphHeight;
      const redGradient = ctx.createLinearGradient(0, yMinus30, 0, yBottom);
      redGradient.addColorStop(0, "rgba(239, 68, 68, 0.3)");
      redGradient.addColorStop(0.5, "rgba(239, 68, 68, 0.15)");
      redGradient.addColorStop(1, "rgba(239, 68, 68, 0.05)");
      ctx.fillStyle = redGradient;
      ctx.fillRect(padding.left, yMinus30, graphWidth, yBottom - yMinus30);

      // Draw grid lines and Y-axis labels for Imbalance (left axis)
      ctx.lineWidth = 1;
      ctx.font = isMobile ? "11px sans-serif" : "13px sans-serif";

      const yValues = [-120, -90, -60, -30, 0, 30, 60, 90, 120];
      yValues.forEach((val) => {
        const y = padding.top + ((120 - val) / 240) * graphHeight;

        // Grid line color and thickness - maximum visibility
        if (val === 30) {
          ctx.strokeStyle = "#34d399";
          ctx.lineWidth = 3;
        } else if (val === -30) {
          ctx.strokeStyle = "#f87171";
          ctx.lineWidth = 3;
        } else if (val === 0) {
          ctx.strokeStyle = "#d1d5db";
          ctx.lineWidth = 1;
        } else {
          ctx.strokeStyle = "#6b7280";
          ctx.lineWidth = 1;
        }

        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + graphWidth, y);
        ctx.stroke();

        // Y-axis label - theme-aware
        if (showImbalance) {
          ctx.fillStyle = isDarkMode ? "#d1d5db" : "#374151";
          ctx.textAlign = "right";
          ctx.fillText(val.toString(), padding.left - 10, y + 4);
        }
      });

      // Draw right Y-axis labels for PCR if available
      if (hasPCR && showPCR) {
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

      // Draw Imbalance Line
      if (imbalanceProg > 0) {
        const maxIndex = Math.floor((clampedData.length - 1) * imbalanceProg);
        const visibleData = clampedData.slice(0, maxIndex + 1);

        if (visibleData.length > 0) {
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 4;
          ctx.beginPath();

          visibleData.forEach((point, index) => {
            const x = padding.left + (index / (clampedData.length - 1)) * graphWidth;
            const y = padding.top + ((120 - point.clampedImbalance) / 240) * graphHeight;

            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });

          ctx.stroke();

          // Draw dots on the imbalance line - trend-aware
          visibleData.forEach((point, index) => {
            const x = padding.left + (index / (clampedData.length - 1)) * graphWidth;
            const y = padding.top + ((120 - point.clampedImbalance) / 240) * graphHeight;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);

            // Determine color based on trend
            let dotColor = "#eab308"; // Default yellow (neutral)

            if (index > 0) {
              const prevPoint = visibleData[index - 1];
              if (point.clampedImbalance > prevPoint.clampedImbalance) {
                dotColor = "#22c55e"; // Green (Up)
              } else if (point.clampedImbalance < prevPoint.clampedImbalance) {
                dotColor = "#ef4444"; // Red (Down)
              }
            }

            ctx.fillStyle = dotColor;
            ctx.fill();
          });

          // Draw dots for Imbalance only on hover or last point
          visibleData.forEach((point, index) => {
            const x = padding.left + (index / (clampedData.length - 1)) * graphWidth;
            const y = padding.top + ((120 - point.clampedImbalance) / 240) * graphHeight;

            const isLast = index === visibleData.length - 1;
            const isHovered = tooltip.visible && tooltip.dataIndex === index;
            
            // Only draw dot if hovered or last point
            if (isHovered || isLast) {
              ctx.beginPath();
              ctx.arc(x, y, isHovered ? 8 : 6, 0, 2 * Math.PI);
              ctx.fillStyle = isHovered ? "#3b82f6" : "#f87171";
              ctx.fill();
              ctx.strokeStyle = isHovered ? "#ffffff" : "#0a0a0a";
              ctx.lineWidth = isHovered ? 3 : 2;
              ctx.stroke();
            }

            // Display value at 30-minute intervals
            const date = new Date(point.dateTime);
            const minutes = date.getMinutes();
            const shouldShowValue = minutes === 0 || minutes === 30 || isLast;
            
            if (shouldShowValue) {
              ctx.fillStyle = "#3b82f6";
              ctx.font = "11px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText(point.clampedImbalance.toFixed(1), x, y - 10);
            }
          });
        }
      }

      // Draw PCR Line
      if (hasPCR && pcrProg > 0) {
        const maxIndex = Math.floor((clampedData.length - 1) * pcrProg);
        const visibleData = clampedData.slice(0, maxIndex + 1);
        
        if (visibleData.length > 0) {
          const pcrValues = clampedData.map(d => d.pcr).filter(p => p !== undefined) as number[];
          const minPCR = Math.min(...pcrValues);
          const maxPCR = Math.max(...pcrValues);
          const pcrRange = maxPCR - minPCR || 1;

          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 2;
          ctx.beginPath();

          visibleData.forEach((point, index) => {
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

          // Draw dots for PCR only on hover or last point
          visibleData.forEach((point, index) => {
            if (point.pcr !== undefined && point.pcr !== null) {
              const x = padding.left + (index / (clampedData.length - 1)) * graphWidth;
              const normalizedPCR = (point.pcr - minPCR) / pcrRange;
              const y = padding.top + (1 - normalizedPCR) * graphHeight;

              const isLast = index === visibleData.length - 1;
              const isHovered = tooltip.visible && tooltip.dataIndex === index;
              
              // Only draw dot if hovered or last point
              if (isHovered || isLast) {
                ctx.beginPath();
                ctx.arc(x, y, isHovered ? 8 : 6, 0, 2 * Math.PI);
                ctx.fillStyle = isHovered ? "#fcd34d" : "#f87171";
                ctx.fill();
                ctx.strokeStyle = isHovered ? "#ffffff" : "#0a0a0a";
                ctx.lineWidth = isHovered ? 3 : 2;
                ctx.stroke();
              }

              // Display PCR value at 30-minute intervals
              const date = new Date(point.dateTime);
              const minutes = date.getMinutes();
              const shouldShowValue = minutes === 0 || minutes === 30 || isLast;
              
              if (shouldShowValue) {
                ctx.fillStyle = "#f59e0b";
                ctx.font = "11px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(point.pcr.toFixed(3), x, y + 15);
              }
            }
          });
        }
      }

      // Draw X-axis labels dynamically - using UTC (drawn last for visibility)
      ctx.fillStyle = isDarkMode ? "#d1d5db" : "#374151";
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
            const date = new Date(point.dateTime);
            const x = padding.left + (index / (clampedData.length - 1)) * graphWidth;
            const label = date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
            const yPosition = height - padding.bottom + 20;
            ctx.fillText(label, x, yPosition);
          }
        });
      } else if (clampedData.length === 1) {
        const date = new Date(clampedData[0].dateTime);
        const label = date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
        const x = padding.left + graphWidth / 2;
        const yPosition = height - padding.bottom + 20;
        ctx.fillText(label, x, yPosition);
      }
    };

    // Animation Logic
    // Check if key changed to reset animation
    if (previousKeyRef.current !== data.key) {
      imbalanceProgressRef.current = 0;
      pcrProgressRef.current = 0;
      previousKeyRef.current = data.key;
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Calculate targets
      const targetImbalance = showImbalance ? 1 : 0;
      const targetPCR = showPCR ? 1 : 0;

      // Animation speed (adjust divisor to change speed)
      const step = delta / 1500; 

      let changed = false;

      // Update Imbalance Progress
      if (Math.abs(imbalanceProgressRef.current - targetImbalance) > 0.001) {
        if (imbalanceProgressRef.current < targetImbalance) {
          imbalanceProgressRef.current = Math.min(imbalanceProgressRef.current + step, targetImbalance);
        } else {
          imbalanceProgressRef.current = Math.max(imbalanceProgressRef.current - step, targetImbalance);
        }
        changed = true;
      } else {
        imbalanceProgressRef.current = targetImbalance;
      }

      // Update PCR Progress
      if (Math.abs(pcrProgressRef.current - targetPCR) > 0.001) {
        if (pcrProgressRef.current < targetPCR) {
          pcrProgressRef.current = Math.min(pcrProgressRef.current + step, targetPCR);
        } else {
          pcrProgressRef.current = Math.max(pcrProgressRef.current - step, targetPCR);
        }
        changed = true;
      } else {
        pcrProgressRef.current = targetPCR;
      }

      draw(imbalanceProgressRef.current, pcrProgressRef.current);

      if (changed) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        lastTimeRef.current = 0;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };

  }, [data, isExpanded, tooltip.visible, tooltip.dataIndex, isDarkMode, showPCR, showImbalance]);

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

    // Filter data to show market hours (matching the main render logic)
    const filteredData = data.values.filter((point) => {
      if (!point.dateTime) return false;
      const date = new Date(point.dateTime);
      const hours = date.getUTCHours();
      
      // Accept data from 3 AM to 4 PM UTC
      return hours >= 3 && hours <= 16;
    });

    if (filteredData.length === 0) {
      setTooltip({ x: 0, y: 0, content: "", visible: false, dataIndex: -1 });
      return;
    }

    // Find closest data point
    const clampedData = filteredData.map((point) => {
      const totalImbalance = point.oichangeFinalResult?.oiChangeTotalValues?.totalImbalance ?? 0;
      const pcr = point.oichangeFinalResult?.oiChangeTotalValues?.pcr;
      
      return {
        ...point,
        clampedImbalance: Math.max(
          -120,
          Math.min(120, totalImbalance)
        ),
        pcr: pcr,
      };
    });

    const relativeX = mouseX - padding.left;
    const dataIndex = Math.round((relativeX / graphWidth) * (clampedData.length - 1));
    
    if (dataIndex >= 0 && dataIndex < clampedData.length) {
      const point = clampedData[dataIndex];
      const date = new Date(filteredData[dataIndex].dateTime);
      const timeStr = date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
      
      let tooltipContent = `Time: ${timeStr}`;
      if (showImbalance) {
        tooltipContent += `\nImbalance: ${point.clampedImbalance.toFixed(2)}`;
      }
      if (point.pcr !== undefined && point.pcr !== null && showPCR) {
        tooltipContent += `\nPCR: ${point.pcr.toFixed(4)}`;
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
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <h3 className="text-lg font-bold tracking-tight text-foreground">Total Imbalance & PCR Over Time</h3>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <Switch 
                checked={showImbalance} 
                onCheckedChange={setShowImbalance} 
                className="scale-75 data-[state=checked]:bg-[#3b82f6]" 
              />
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowImbalance(!showImbalance)}>
                <div className="w-4 h-0.5 bg-[#3b82f6]"></div>
                <span className="text-muted-foreground">Imbalance</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={showPCR} 
                onCheckedChange={setShowPCR} 
                className="scale-75 data-[state=checked]:bg-[#f59e0b]" 
              />
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowPCR(!showPCR)}>
                <div className="w-4 h-0.5 bg-[#f59e0b]"></div>
                <span className="text-muted-foreground">PCR</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-green-500/20 border border-green-500/40 rounded"></div>
              <span className="text-muted-foreground text-xs">Bullish (+30)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-red-500/20 border border-red-500/40 rounded"></div>
              <span className="text-muted-foreground text-xs">Bearish (-30)</span>
            </div>
            
            {/* Sticky Toggle */}
            {onToggleSticky && (
              <div className="flex items-center gap-2 border-l border-border/50 pl-2 ml-1">
                <Checkbox 
                  id="sticky-mode" 
                  checked={isSticky} 
                  onCheckedChange={(checked) => onToggleSticky(checked as boolean)}
                  className="h-3.5 w-3.5"
                />
                <Label htmlFor="sticky-mode" className="text-xs cursor-pointer text-muted-foreground hover:text-foreground transition-colors">Sticky</Label>
              </div>
            )}
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