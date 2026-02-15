"use client";

import { useMemo, useState } from "react";
import {
  createUnitAction,
  updateUnitAction,
  deleteUnitAction,
} from "@/app/actions/products";
import { RefreshAfterSubmit } from "./refresh-after-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Unit = { id: string; name: string };

export function UnitsTable({ units }: { units: Unit[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return units;
    return units.filter((u) => u.name.toLowerCase().includes(needle));
  }, [units, q]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <form action={createUnitAction} className="flex flex-wrap items-center gap-2">
          <RefreshAfterSubmit />
          <Input
            name="name"
            placeholder="Tên đơn vị (vd: gói, hộp, cái)"
            className="min-w-48"
            required
          />
          <Button type="submit">Thêm đơn vị</Button>
        </form>
        <div className="flex w-full gap-2 sm:w-auto">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên..."
            className="max-w-56"
          />
          {q.trim() ? (
            <Button type="button" variant="outline" onClick={() => setQ("")}>
              Xóa
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {units.length === 0
              ? "Chưa có đơn vị nào. Thêm đơn vị ở trên."
              : "Không tìm thấy."}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => {
                const formId = `unit-${u.id}`;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <form id={formId} action={updateUnitAction} className="flex gap-2">
                        <RefreshAfterSubmit />
                        <input type="hidden" name="id" value={u.id} />
                        <Input
                          name="name"
                          defaultValue={u.name}
                          className="min-w-48"
                          required
                        />
                        <Button type="submit" variant="secondary" size="sm">
                          Lưu
                        </Button>
                      </form>
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={deleteUnitAction} className="inline">
                        <RefreshAfterSubmit />
                        <input type="hidden" name="id" value={u.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          Xóa
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
