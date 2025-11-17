import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../lib/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface OverviewData {
  totalByStage: { stage_ar: string; count: number }[];
  genderDistribution: { gender: string; count: number }[];
  pendingSubmissions: number;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .overview()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">
            {t("dashboard.pendingSubmissions")}
          </div>
          <div className="text-2xl font-semibold">
            {loading ? "…" : data?.pendingSubmissions ?? 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">
            {t("dashboard.studentsByStage")}
          </div>
          <div className="text-sm text-slate-600">
            {loading
              ? "…"
              : data?.totalByStage
                  .map((s) => `${s.stage_ar}: ${s.count}`)
                  .join(" • ") || "—"}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">
            {t("dashboard.genderDistribution")}
          </div>
          <div className="text-sm text-slate-600">
            {loading
              ? "…"
              : data?.genderDistribution
                  .map((g) => `${g.gender || "غير محدد"}: ${g.count}`)
                  .join(" • ") || "—"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 h-64">
          <div className="text-xs text-slate-500 mb-2">
            {t("dashboard.studentsByStage")}
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.totalByStage || []}>
              <XAxis dataKey="stage_ar" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0f172a" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 h-64">
          <div className="text-xs text-slate-500 mb-2">
            {t("dashboard.genderDistribution")}
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.genderDistribution || []}>
              <XAxis dataKey="gender" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0369a1" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


