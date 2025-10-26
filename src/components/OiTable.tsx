import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <ScrollArea className="h-[300px] sm:h-[400px] md:h-[500px] rounded-md">
        <div className="overflow-x-auto">
          <Table className="text-xs sm:text-xs md:text-sm min-w-[1200px]">
            <TableHeader>
              <TableRow className="border-border bg-muted/30">
                <TableHead colSpan={4} className="text-center font-bold text-green-400 bg-green-500/20 px-1 sm:px-2 py-2 text-sm border-r border-border">
                  CALLS
                </TableHead>
                <TableHead colSpan={1} className="text-center font-bold text-primary bg-primary/30 px-1 sm:px-2 py-2 text-sm border-x border-primary/30">
                  STRIKE PRICE
                </TableHead>
                <TableHead colSpan={4} className="text-center font-bold text-red-400 bg-red-500/20 px-1 sm:px-2 py-2 text-sm border-r border-border">
                  PUTS
                </TableHead>
                <TableHead colSpan={3} className="text-center font-bold text-blue-400 bg-blue-500/20 px-1 sm:px-2 py-2 text-sm">
                  FINAL DATA
                </TableHead>
              </TableRow>
              <TableRow className="border-border hover:bg-muted/50 bg-muted/20">
                <TableHead className="text-center font-bold text-green-400 bg-green-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm">CALL COI</TableHead>
                <TableHead className="text-center font-bold text-green-400 bg-green-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm">CALL OI</TableHead>
                <TableHead className="text-center font-bold text-green-400 bg-green-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm">CALL ΔOI</TableHead>
                <TableHead className="text-center font-bold text-green-400 bg-green-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm">CALL LTP</TableHead>
                <TableHead className="text-center font-bold text-primary bg-primary/20 border-x border-primary/30 px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm">STRIKE</TableHead>
                <TableHead className="text-center font-bold text-red-400 bg-red-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm">PUT LTP</TableHead>
                <TableHead className="text-center font-bold text-red-400 bg-red-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm">PUT ΔOI</TableHead>
                <TableHead className="text-center font-bold text-red-400 bg-red-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm">PUT OI</TableHead>
                <TableHead className="text-center font-bold text-red-400 bg-red-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm">PUT COI</TableHead>
                <TableHead className="text-center font-bold text-blue-400 bg-blue-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm">Imbalance</TableHead>
                <TableHead className="text-center font-bold text-purple-400 bg-purple-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm">PCR</TableHead>
                <TableHead className="text-center font-bold text-cyan-400 bg-cyan-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm">TREND</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.strikePrice} className="border-border hover:bg-muted/40 transition-colors">
                  <TableCell className="text-center text-green-400 font-semibold px-1 sm:px-2 py-1.5 sm:py-2.5 text-xs sm:text-sm">{formatDecimal(row.callCoi)}</TableCell>
                  <TableCell className="text-center text-green-400 font-semibold px-1 sm:px-2 py-1.5 sm:py-2.5 text-xs sm:text-sm">{formatNumber(row.ce?.oi)}</TableCell>
                  <TableCell className="text-center text-green-400 font-semibold px-1 sm:px-2 py-1.5 sm:py-2.5 text-xs sm:text-sm">{formatNumber(row.ce?.oiChange)}</TableCell>
                  <TableCell className="text-center text-green-400 font-semibold px-1 sm:px-2 py-1.5 sm:py-2.5 text-xs sm:text-sm">{formatDecimal(row.ce?.ltp)}</TableCell>
                  <TableCell 
                    className={`text-center font-bold px-1 sm:px-2 py-1.5 sm:py-2.5 text-xs sm:text-sm border-x border-primary/30 ${
                      row.imbalance >= 70 
                        ? 'bg-green-500/20 text-green-300' 
                        : row.imbalance <= -70 
                        ? 'bg-red-500/20 text-red-300' 
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {row.strikePrice}
                  </TableCell>
                  <TableCell className="text-center text-red-400 font-semibold px-1 sm:px-2 py-1.5 sm:py-2.5 text-xs sm:text-sm">{formatDecimal(row.pe?.ltp)}</TableCell>
                  <TableCell className="text-center text-red-400 font-semibold px-1 sm:px-2 py-1.5 sm:py-2.5 text-xs sm:text-sm">{formatNumber(row.pe?.oiChange)}</TableCell>
                  <TableCell className="text-center text-red-400 font-semibold px-1 sm:px-2 py-1.5 sm:py-2.5 text-xs sm:text-sm">{formatNumber(row.pe?.oi)}</TableCell>
                  <TableCell className="text-center text-red-400 font-semibold px-1 sm:px-2 py-1.5 sm:py-2.5 text-xs sm:text-sm">{formatDecimal(row.putCoi)}</TableCell>
                  <TableCell className="text-center text-blue-400 font-semibold px-1 sm:px-2 py-1.5 sm:py-2.5 text-xs sm:text-sm bg-blue-500/5">{formatDecimal(row.imbalance)}</TableCell>
                  <TableCell className="text-center text-purple-400 font-semibold px-1 sm:px-2 py-1.5 sm:py-2.5 text-xs sm:text-sm bg-purple-500/5 border-r border-border">{formatDecimal(row.pcr, 4)}</TableCell>
                  <TableCell className={`text-center font-bold px-1 sm:px-2 py-1.5 sm:py-2.5 text-xs sm:text-sm ${
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
      </ScrollArea>
    </Card>
  );
}