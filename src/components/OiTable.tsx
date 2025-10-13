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
    <Card className="p-4 bg-card/80 backdrop-blur-sm">
      <h3 className="text-lg font-bold tracking-tight mb-4 text-foreground">Options Chain</h3>
      <ScrollArea className="h-[500px]">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="text-center font-semibold text-foreground">PUT COI</TableHead>
              <TableHead className="text-center font-semibold text-foreground">PUT OI</TableHead>
              <TableHead className="text-center font-semibold text-foreground">PUT ΔOI</TableHead>
              <TableHead className="text-center font-semibold text-foreground">PUT LTP</TableHead>
              <TableHead className="text-center font-bold text-primary">STRIKE</TableHead>
              <TableHead className="text-center font-semibold text-foreground">CALL LTP</TableHead>
              <TableHead className="text-center font-semibold text-foreground">CALL ΔOI</TableHead>
              <TableHead className="text-center font-semibold text-foreground">CALL OI</TableHead>
              <TableHead className="text-center font-semibold text-foreground">CALL COI</TableHead>
              <TableHead className="text-center font-semibold text-foreground">Imbalance</TableHead>
              <TableHead className="text-center font-semibold text-foreground">PCR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.strikePrice} className="border-border hover:bg-muted/30">
                <TableCell className="text-center text-foreground">{formatDecimal(row.putCoi)}</TableCell>
                <TableCell className="text-center text-foreground">{formatNumber(row.pe?.oi)}</TableCell>
                <TableCell className="text-center text-foreground">{formatNumber(row.pe?.oiChange)}</TableCell>
                <TableCell className="text-center text-foreground">{formatDecimal(row.pe?.ltp)}</TableCell>
                <TableCell className="text-center font-bold text-primary">{row.strikePrice}</TableCell>
                <TableCell className="text-center text-foreground">{formatDecimal(row.ce?.ltp)}</TableCell>
                <TableCell className="text-center text-foreground">{formatNumber(row.ce?.oiChange)}</TableCell>
                <TableCell className="text-center text-foreground">{formatNumber(row.ce?.oi)}</TableCell>
                <TableCell className="text-center text-foreground">{formatDecimal(row.callCoi)}</TableCell>
                <TableCell className="text-center text-foreground">{formatDecimal(row.imbalance)}</TableCell>
                <TableCell className="text-center text-foreground">{formatDecimal(row.pcr, 4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}