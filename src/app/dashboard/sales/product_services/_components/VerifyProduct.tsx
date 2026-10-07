"use client";
import Button from "@/components/ui/RawButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useEffect, useState } from "react";

const VerifyProduct = ({
  Data,
  setSteps,
  Upload,
  isPending,
}: {
  Data: any[];
  setSteps: any;
  Upload: any;
  isPending: boolean;
}) => {
  const [Titles, setTitles] = useState<any[]>([]);

  useEffect(() => {
    if (Data.length) {
      const Titles = Object.keys(Data[0]);
      setTitles(Titles);
    }
  }, [Data]);

  return (
    <div
      style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
      className="mb-4 rounded-xl border-2 bg-white p-4"
    >
      <div className="overflow-x-auto">
        <div className="w-full overflow-x-auto">
          <Table className="font-lexend">
            <TableHeader>
              <TableRow>
                {Titles.map((title) => (
                  <TableHead className="min-w-40 uppercase" key={title}>
                    {title.split("_").join(" ")}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {Data.length !== 0 &&
                Titles.length !== 0 &&
                Data?.map((product, idx) => (
                  <TableRow key={idx}>
                    {Titles?.map((title, idx) => (
                      <TableCell key={idx}>{product[title]}</TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-24 flex justify-center gap-12">
        <Button
          onClick={() => setSteps(1)}
          type="button"
          className="w-40 border border-accent_soft_black bg-white text-sm font-semibold text-accent_soft_black transition-all hover:bg-accent_soft_black hover:text-white"
        >
          Back
        </Button>
        <Button
          onClick={() => Upload()}
          type="button"
          isLoading={isPending}
          className="flex w-40 min-w-40 max-w-40 items-center justify-center gap-1 bg-accent_soft_black text-sm font-semibold text-white"
        >
          {isPending ? "Importing..." : "Import"}
        </Button>
      </div>
    </div>
  );
};

export default VerifyProduct;
