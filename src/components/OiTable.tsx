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
    <Card className="p-4">
      <h3 className="text-lg font-bold tracking-tight mb-4">Options Chain</h3>
      <ScrollArea className="h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">PUT COI</TableHead>
              <TableHead className="text-center">PUT OI</TableHead>
              <TableHead className="text-center">PUT ΔOI</TableHead>
              <TableHead className="text-center">PUT LTP</TableHead>
              <TableHead className="text-center font-bold">STRIKE</TableHead>
              <TableHead className="text-center">CALL LTP</TableHead>
              <TableHead className="text-center">CALL ΔOI</TableHead>
              <TableHead className="text-center">CALL OI</TableHead>
              <TableHead className="text-center">CALL COI</TableHead>
              <TableHead className="text-center">Imbalance</TableHead>
              <TableHead className="text-center">PCR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.strikePrice}>
                <TableCell className="text-center">{formatDecimal(row.putCoi)}</TableCell>
                <TableCell className="text-center">{formatNumber(row.pe?.oi)}</TableCell>
                <TableCell className="text-center">{formatNumber(row.pe?.oiChange)}</TableCell>
                <TableCell className="text-center">{formatDecimal(row.pe?.ltp)}</TableCell>
                <TableCell className="text-center font-bold">{row.strikePrice}</TableCell>
                <TableCell className="text-center">{formatDecimal(row.ce?.ltp)}</TableCell>
                <TableCell className="text-center">{formatNumber(row.ce?.oiChange)}</TableCell>
                <TableCell className="text-center">{formatNumber(row.ce?.oi)}</TableCell>
                <TableCell className="text-center">{formatDecimal(row.callCoi)}</TableCell>
                <TableCell className="text-center">{formatDecimal(row.imbalance)}</TableCell>
                <TableCell className="text-center">{formatDecimal(row.pcr, 4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
