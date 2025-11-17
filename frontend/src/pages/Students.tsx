import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { api } from "../lib/api";

interface StudentRow {
  national_id: string;
  full_name_ar: string;
  gender: string | null;
  father_phone: string | null;
  mother_phone: string | null;
  academic_year?: string;
  stage_ar?: string;
  grade_ar?: string;
  class_label?: string;
}

export default function StudentsPage() {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .studentsList()
      .then((res) => setRows(res.data as StudentRow[]))
      .finally(() => setLoading(false));
  }, []);

  const columns = useMemo<ColumnDef<StudentRow>[]>(
    () => [
      { header: "الرقم القومي", accessorKey: "national_id" },
      { header: "اسم الطالب", accessorKey: "full_name_ar" },
      { header: "المرحلة", accessorKey: "stage_ar" },
      { header: "الصف", accessorKey: "grade_ar" },
      { header: "الفصل", accessorKey: "class_label" },
      { header: "الهاتف (الأب)", accessorKey: "father_phone" },
      { header: "الهاتف (الأم)", accessorKey: "mother_phone" }
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">الطلاب</h2>
        <span className="text-xs text-slate-500">
          {loading ? "جاري التحميل..." : `عدد السجلات: ${rows.length}`}
        </span>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-50 text-slate-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-3 py-2 text-right font-medium border-b">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b last:border-b-0">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 text-right">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-slate-500" colSpan={columns.length}>
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


