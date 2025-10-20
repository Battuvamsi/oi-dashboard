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
        <div className="min-w-full">
          <Table className="text-xs sm:text-xs md:text-sm">
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50 bg-muted/20">
                <TableHead className="text-center font-bold text-red-400 bg-red-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs">PUT COI</TableHead>
                <TableHead className="text-center font-bold text-red-400 bg-red-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs">PUT OI</TableHead>
                <TableHead className="text-center font-bold text-red-400 bg-red-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs">PUT ΔOI</TableHead>
                <TableHead className="text-center font-bold text-red-400 bg-red-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs">PUT LTP</TableHead>
                <TableHead className="text-center font-bold text-primary bg-primary/20 border-x border-primary/30 px-1 sm:px-2 py-1 sm:py-2 text-xs">STRIKE</TableHead>
                <TableHead className="text-center font-bold text-green-400 bg-green-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs">CALL LTP</TableHead>
                <TableHead className="text-center font-bold text-green-400 bg-green-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs">CALL ΔOI</TableHead>
                <TableHead className="text-center font-bold text-green-400 bg-green-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs">CALL OI</TableHead>
                <TableHead className="text-center font-bold text-green-400 bg-green-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs">CALL COI</TableHead>
                <TableHead className="text-center font-bold text-blue-400 bg-blue-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs">Imbalance</TableHead>
                <TableHead className="text-center font-bold text-purple-400 bg-purple-500/10 px-1 sm:px-2 py-1 sm:py-2 text-xs">PCR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.strikePrice} className="border-border hover:bg-muted/40 transition-colors">
                  <TableCell className="text-center text-red-300 font-medium px-1 sm:px-2 py-1 sm:py-2 text-xs">{formatDecimal(row.putCoi)}</TableCell>
                  <TableCell className="text-center text-red-300 font-medium px-1 sm:px-2 py-1 sm:py-2 text-xs">{formatNumber(row.pe?.oi)}</TableCell>
                  <TableCell className="text-center text-red-300 font-medium px-1 sm:px-2 py-1 sm:py-2 text-xs">{formatNumber(row.pe?.oiChange)}</TableCell>
                  <TableCell className="text-center text-red-300 font-medium px-1 sm:px-2 py-1 sm:py-2 text-xs">{formatDecimal(row.pe?.ltp)}</TableCell>
                  <TableCell className="text-center font-bold text-primary bg-primary/10 border-x border-primary/20 px-1 sm:px-2 py-1 sm:py-2 text-xs">{row.strikePrice}</TableCell>
                  <TableCell className="text-center text-green-300 font-medium px-1 sm:px-2 py-1 sm:py-2 text-xs">{formatDecimal(row.ce?.ltp)}</TableCell>
                  <TableCell className="text-center text-green-300 font-medium px-1 sm:px-2 py-1 sm:py-2 text-xs">{formatNumber(row.ce?.oiChange)}</TableCell>
                  <TableCell className="text-center text-green-300 font-medium px-1 sm:px-2 py-1 sm:py-2 text-xs">{formatNumber(row.ce?.oi)}</TableCell>
                  <TableCell className="text-center text-green-300 font-medium px-1 sm:px-2 py-1 sm:py-2 text-xs">{formatDecimal(row.callCoi)}</TableCell>
                  <TableCell className="text-center text-blue-300 font-medium px-1 sm:px-2 py-1 sm:py-2 text-xs">{formatDecimal(row.imbalance)}</TableCell>
                  <TableCell className="text-center text-purple-300 font-medium px-1 sm:px-2 py-1 sm:py-2 text-xs">{formatDecimal(row.pcr, 4)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </Card>
  );
}