import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { api } from "../lib/api";

interface StudentRow {
  national_id: string;
  full_name_ar: string;
  gender: string | null;
  birth_date: string | null;
  birth_place: string | null;
  nationality: string | null;
  religion: string | null;
  father_name: string | null;
  father_job: string | null;
  father_phone: string | null;
  mother_name: string | null;
  mother_job: string | null;
  mother_phone: string | null;
  address: string | null;
  academic_year?: string;
  stage_ar?: string;
  grade_ar?: string;
  class_label?: string;
}

export default function StudentsPage() {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // simple debounce for search input
  useEffect(() => {
    setLoading(true);
    const id = setTimeout(() => {
      api
        .studentsList({
          search: search.trim() || undefined,
          page: 1,
          pageSize: 1000,
        })
        .then((res) => setRows(res.data as StudentRow[]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(id);
  }, [search]);

  // initial load (no search)
  useEffect(() => {
    api
      .studentsList({ page: 1, pageSize: 1000 })
      .then((res) => setRows(res.data as StudentRow[]))
      .finally(() => setLoading(false));
  }, []);

  const columns = useMemo<ColumnDef<StudentRow>[]>(
    () => [
      { header: "الرقم القومي", accessorKey: "national_id" },
      { header: "اسم الطالب", accessorKey: "full_name_ar" },
      { header: "النوع", accessorKey: "gender" },
      { header: "تاريخ الميلاد", accessorKey: "birth_date" },
      { header: "مكان الميلاد", accessorKey: "birth_place" },
      { header: "الجنسية", accessorKey: "nationality" },
      { header: "الديانة", accessorKey: "religion" },
      { header: "اسم الأب", accessorKey: "father_name" },
      { header: "وظيفة الأب", accessorKey: "father_job" },
      { header: "المرحلة", accessorKey: "stage_ar" },
      { header: "الصف", accessorKey: "grade_ar" },
      { header: "الفصل", accessorKey: "class_label" },
      { header: "الهاتف (الأب)", accessorKey: "father_phone" },
      { header: "اسم الأم", accessorKey: "mother_name" },
      { header: "وظيفة الأم", accessorKey: "mother_job" },
      { header: "الهاتف (الأم)", accessorKey: "mother_phone" },
      { header: "العنوان", accessorKey: "address" }
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h2 className="text-sm font-semibold">الطلاب</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، الرقم القومي، الهاتف، العنوان..."
            className="w-64 max-w-full rounded border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
          <span className="text-xs text-slate-500">
            {loading ? "جاري التحميل..." : `عدد السجلات: ${rows.length}`}
          </span>
        </div>
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


