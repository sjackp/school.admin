import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/authStore";
import { setLanguage } from "../../i18n";

const navItems = [
  { path: "/", key: "dashboard" },
  { path: "/students", key: "students" },
  { path: "/enrollments", key: "enrollments" },
  { path: "/reports", key: "reports" },
  { path: "/settings", key: "settings" },
];

export default function AppLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const currentLang = i18n.language === "en" ? "en" : "ar";

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const toggleLang = () => {
    const next = currentLang === "ar" ? "en" : "ar";
    setLanguage(next);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-slate-50 flex flex-col">
        <div className="px-4 py-5 border-b border-slate-800">
          <div className="text-sm font-semibold opacity-80">
            مدرسة أم المؤمنين الخاصة
          </div>
          <div className="text-xs opacity-60">Umm Al-Mu&apos;mineen Private School</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {navItems.map((item) => {
            const active =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block rounded-md px-3 py-2 ${
                  active
                    ? "bg-slate-700 text-white"
                    : "text-slate-200 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {t(`navigation.${item.key}`)}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={toggleLang}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
          >
            {currentLang === "ar" ? "English" : "العربية"}
          </button>
          <button
            onClick={handleLogout}
            className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
          >
            {t("navigation.logout")}
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 justify-between">
          <h1 className="text-base font-semibold">{t("dashboard.title")}</h1>
          <span className="text-xs text-slate-500">{t("appName")}</span>
        </header>
        <section className="flex-1 p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}


