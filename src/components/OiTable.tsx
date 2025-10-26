import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FilteredResult {
  strikePrice: number;
  callCoi: number;
  putCoi: number;
  imbalance: number;
  pcr: number;
  pe?: {
    oi: number;
    oiChange: number;
    ltp: number;
  };
  ce?: {
    oi: number;
    oiChange: number;
    ltp: number;
  };
}

interface OiTableProps {
  data: FilteredResult[];
  totals: {
    callOiSum: number;
    putOiSum: number;
  };
}

export default function OiTable({ data }: OiTableProps) {
  const formatNumber = (num: number | undefined) => {
    return num !== undefined ? num.toLocaleString() : "-";
  };

  const formatDecimal = (num: number | undefined, decimals = 2) => {
    return num !== undefined ? num.toFixed(decimals) : "-";
  };

  return (
    <Card className="p-1 sm:p-2 md:p-4 bg-card/80 backdrop-blur-sm w-full overflow-hidden">
      <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold tracking-tight mb-2 sm:mb-3 md:mb-4 text-foreground px-1 sm:px-2">Options Chain</h3>
      <div className="overflow-x-auto overflow-y-auto h-[300px] sm:h-[400px] md:h-[500px] rounded-md w-full">
        <div className="pb-2">
          <Table className="text-xs sm:text-xs md:text-sm w-full">
            <TableHeader>
              <TableRow className="border-border bg-muted/30">
                <TableHead colSpan={4} className="text-center font-bold text-green-400 bg-green-500/20 px-0.5 sm:px-1 py-1.5 text-xs sm:text-sm border-r border-border">
                  CALLS
                </TableHead>
                <TableHead colSpan={1} className="text-center font-bold text-primary bg-primary/30 px-0.5 sm:px-1 py-1.5 text-xs sm:text-sm border-x border-primary/30">
                  STRIKE
                </TableHead>
                <TableHead colSpan={4} className="text-center font-bold text-red-400 bg-red-500/20 px-0.5 sm:px-1 py-1.5 text-xs sm:text-sm border-r border-border">
                  PUTS
                </TableHead>
                <TableHead colSpan={3} className="text-center font-bold text-blue-400 bg-blue-500/20 px-0.5 sm:px-1 py-1.5 text-xs sm:text-sm">
                  FINAL DATA
                </TableHead>
              </TableRow>
              <TableRow className="border-border hover:bg-muted/50 bg-muted/20">
                <TableHead className="text-center font-bold text-green-400 bg-green-500/10 px-0.5 sm:px-1 py-1 text-[10px] sm:text-xs">COI</TableHead>
                <TableHead className="text-center font-bold text-green-400 bg-green-500/10 px-0.5 sm:px-1 py-1 text-[10px] sm:text-xs">OI</TableHead>
                <TableHead className="text-center font-bold text-green-400 bg-green-500/10 px-0.5 sm:px-1 py-1 text-[10px] sm:text-xs">ΔOI</TableHead>
                <TableHead className="text-center font-bold text-green-400 bg-green-500/10 px-0.5 sm:px-1 py-1 text-[10px] sm:text-xs">LTP</TableHead>
                <TableHead className="text-center font-bold text-primary bg-primary/20 border-x border-primary/30 px-0.5 sm:px-1 py-1 text-[10px] sm:text-xs">STRIKE</TableHead>
                <TableHead className="text-center font-bold text-red-400 bg-red-500/10 px-0.5 sm:px-1 py-1 text-[10px] sm:text-xs">LTP</TableHead>
                <TableHead className="text-center font-bold text-red-400 bg-red-500/10 px-0.5 sm:px-1 py-1 text-[10px] sm:text-xs">ΔOI</TableHead>
                <TableHead className="text-center font-bold text-red-400 bg-red-500/10 px-0.5 sm:px-1 py-1 text-[10px] sm:text-xs">OI</TableHead>
                <TableHead className="text-center font-bold text-red-400 bg-red-500/10 px-0.5 sm:px-1 py-1 text-[10px] sm:text-xs">COI</TableHead>
                <TableHead className="text-center font-bold text-blue-400 bg-blue-500/10 px-0.5 sm:px-1 py-1 text-[10px] sm:text-xs">IMB</TableHead>
                <TableHead className="text-center font-bold text-purple-400 bg-purple-500/10 px-0.5 sm:px-1 py-1 text-[10px] sm:text-xs">PCR</TableHead>
                <TableHead className="text-center font-bold text-cyan-400 bg-cyan-500/10 px-0.5 sm:px-1 py-1 text-[10px] sm:text-xs">TREND</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.strikePrice} className="border-border hover:bg-muted/40 transition-colors">
                  <TableCell className="text-center text-green-400 font-semibold px-0.5 sm:px-1 py-1 sm:py-1.5 text-[10px] sm:text-xs">{formatDecimal(row.callCoi)}</TableCell>
                  <TableCell className="text-center text-green-400 font-semibold px-0.5 sm:px-1 py-1 sm:py-1.5 text-[10px] sm:text-xs">{formatNumber(row.ce?.oi)}</TableCell>
                  <TableCell className="text-center text-green-400 font-semibold px-0.5 sm:px-1 py-1 sm:py-1.5 text-[10px] sm:text-xs">{formatNumber(row.ce?.oiChange)}</TableCell>
                  <TableCell className="text-center text-green-400 font-semibold px-0.5 sm:px-1 py-1 sm:py-1.5 text-[10px] sm:text-xs">{formatDecimal(row.ce?.ltp)}</TableCell>
                  <TableCell 
                    className={`text-center font-bold px-0.5 sm:px-1 py-1 sm:py-1.5 text-[10px] sm:text-xs border-x border-primary/30 ${
                      row.imbalance >= 70 
                        ? 'bg-green-500/20 text-green-300' 
                        : row.imbalance <= -70 
                        ? 'bg-red-500/20 text-red-300' 
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {row.strikePrice}
                  </TableCell>
                  <TableCell className="text-center text-red-400 font-semibold px-0.5 sm:px-1 py-1 sm:py-1.5 text-[10px] sm:text-xs">{formatDecimal(row.pe?.ltp)}</TableCell>
                  <TableCell className="text-center text-red-400 font-semibold px-0.5 sm:px-1 py-1 sm:py-1.5 text-[10px] sm:text-xs">{formatNumber(row.pe?.oiChange)}</TableCell>
                  <TableCell className="text-center text-red-400 font-semibold px-0.5 sm:px-1 py-1 sm:py-1.5 text-[10px] sm:text-xs">{formatNumber(row.pe?.oi)}</TableCell>
                  <TableCell className="text-center text-red-400 font-semibold px-0.5 sm:px-1 py-1 sm:py-1.5 text-[10px] sm:text-xs">{formatDecimal(row.putCoi)}</TableCell>
                  <TableCell className="text-center text-blue-400 font-bold px-0.5 sm:px-1.5 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-blue-500/5">{formatDecimal(row.imbalance)}</TableCell>
                  <TableCell className="text-center text-purple-400 font-bold px-0.5 sm:px-1.5 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-purple-500/5">{formatDecimal(row.pcr, 4)}</TableCell>
                  <TableCell className={`text-center font-bold px-0.5 sm:px-1.5 py-1 sm:py-1.5 text-[10px] sm:text-xs ${
                    row.imbalance >= 30 
                      ? 'text-green-400 bg-green-500/10' 
                      : row.imbalance <= -30 
                      ? 'text-red-400 bg-red-500/10' 
                      : 'text-muted-foreground bg-muted/10'
                  }`}>
                    {row.imbalance >= 30 ? 'BULLISH' : row.imbalance <= -30 ? 'BEARISH' : 'NEUTRAL'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}