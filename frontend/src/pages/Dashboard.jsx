import { useEffect, useMemo, useState } from "react";
import api from "../api";
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

const fallbackDocks = [
  { id: 1, name: "Dock Alpha", code: "Dock 1", is_available: false, current_vehicle: "TN14X4646", token: "#TKN-0038" },
  { id: 2, name: "Dock Beta", code: "Dock 2", is_available: false, current_vehicle: "AP86FG2345", token: "#TKN-0036" },
  { id: 3, name: "Dock Gamma", code: "Dock 3", is_available: false, current_vehicle: "TN07CJ7842", token: "#TKN-0032" },
  { id: 4, name: "Dock Delta", code: "Dock 4", is_available: false, current_vehicle: "TN47AS6666", token: "#TKN-0037" },
  { id: 5, name: "Dock Epsilon", code: "Dock 5", is_available: true, current_vehicle: "", token: "#" },
  { id: 6, name: "Dock Zeta", code: "Dock 6", is_available: false, current_vehicle: "TN01AA1234", token: "#TKN-0035" },
];

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [docks, setDocks] = useState([]);
  const [queue, setQueue] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    api.get("/reports/dashboard").then((res) => setDashboard(res.data)).catch(console.error);
    api.get("/docks").then((res) => setDocks(res.data)).catch(console.error);
    api.get("/vehicles/queue").then((res) => setQueue(res.data)).catch(console.error);
    api.get("/vehicles").then((res) => setVehicles(res.data)).catch(console.error);
  }, []);

  const displayDocks = useMemo(() => {
    const source = docks.length ? docks : fallbackDocks;
    return source.slice(0, 6).map((dock, index) => {
      const queued = queue[index];
      return {
        ...fallbackDocks[index],
        ...dock,
        id: dock.id ?? fallbackDocks[index]?.id ?? index + 1,
        name: dock.name || fallbackDocks[index]?.name || `Dock ${index + 1}`,
        code: dock.code || fallbackDocks[index]?.code || `Dock ${index + 1}`,
        current_vehicle: dock.current_vehicle || queued?.vehicle_number || fallbackDocks[index]?.current_vehicle || "",
        token: queued?.token ? `#${queued.token}` : fallbackDocks[index]?.token || "#",
      };
    });
  }, [docks, queue]);

  const recentActivity = useMemo(() => {
    const source = vehicles.length ? vehicles : queue;
    return source.slice(0, 6).map((vehicle, index) => ({
      id: vehicle.id ?? index,
      token: vehicle.token ? `#${vehicle.token}` : fallbackDocks[index]?.token || "#TKN-0038",
      vehicle_number: vehicle.vehicle_number || fallbackDocks[index]?.current_vehicle || "TN14X4646",
      status: vehicle.status || "Gate In",
      priority: index % 2 === 0 ? "Normal" : "Urgent",
      date: vehicle.report_time ? new Date(vehicle.report_time).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "19 May 2026, 21:25",
    }));
  }, [vehicles, queue]);

  const stats = [
    { label: "Total Vehicles Today", value: dashboard?.total_today ?? 38, icon: ContentPasteOutlinedIcon, color: "text-sky-500" },
    { label: "In Queue", value: dashboard?.active_queue ?? queue.length ?? 5, icon: LocalShippingOutlinedIcon, color: "text-blue-500" },
    { label: "Active Docks", value: displayDocks.filter((dock) => !dock.is_available).length, icon: WarehouseOutlinedIcon, color: "text-amber-500" },
    { label: "Completed Today", value: dashboard?.completed_today ?? 33, icon: CheckCircleOutlineOutlinedIcon, color: "text-green-500" },
  ];

  return (
    <div className="space-y-10">
      <section className="rounded-lg bg-[linear-gradient(100deg,#26499a,#11b3ca)] px-10 py-12 shadow-xl shadow-sky-900/15">
        <h2 className="text-3xl font-bold text-white">Admin</h2>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-slate-950 bg-white px-7 py-7">
              <div className="flex items-start justify-between">
                <p className="text-base text-slate-400">{item.label}</p>
                <Icon className={item.color} />
              </div>
              <p className={`mt-4 text-4xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          );
        })}
      </section>

      <section>
        <h3 className="mb-5 text-lg font-bold uppercase tracking-wide text-slate-400">Dock Status</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {displayDocks.map((dock, index) => (
            <div key={dock.id} className="min-h-60 rounded-xl bg-white p-5 shadow-lg shadow-slate-300/60">
              <div className="flex items-start gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl font-bold ${dock.is_available ? "bg-green-50 text-green-500" : "bg-violet-50 text-violet-400"}`}>
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold leading-5 text-slate-950">{dock.name}</p>
                      <p className="text-sm text-slate-400">{dock.code || `Dock ${index + 1}`}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${dock.is_available ? "border-green-500 bg-green-50 text-green-500" : "border-blue-500 bg-blue-50 text-blue-500"}`}>
                      <span className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full ${dock.is_available ? "bg-green-400" : "bg-blue-400"}`} />
                      {dock.is_available ? "Free" : "Reserved"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-sm font-bold text-sky-600">{dock.token || "#"}</p>
                  {!dock.is_available && <span className="rounded-full border border-orange-400 bg-orange-50 px-3 py-1 text-xs text-orange-500">Urgent</span>}
                </div>
                <p className="text-lg font-bold text-slate-950">{dock.current_vehicle || "."}</p>
                <p className="flex items-center gap-1.5 text-sm text-slate-400">
                  <StorefrontOutlinedIcon fontSize="inherit" />
                  Awaiting dock-in
                </p>
                <p className="text-sm font-medium text-blue-500">• Gate In</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-5 text-lg font-bold uppercase tracking-wide text-slate-400">Recent Activity</h3>
        <div className="overflow-hidden rounded-xl border border-slate-950 bg-white">
          {recentActivity.map((item) => (
            <div key={item.id} className="grid gap-4 border-b border-slate-950 px-5 py-4 last:border-b-0 md:grid-cols-[120px_1fr_auto_auto_auto] md:items-center">
              <span className="font-mono text-sm text-sky-600">{item.token}</span>
              <span className="font-bold text-slate-950">{item.vehicle_number}</span>
              <span className="w-fit rounded-full border border-blue-500 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-500">• {item.status}</span>
              <span className={`w-fit rounded-full border px-4 py-1 text-sm font-medium ${item.priority === "Urgent" ? "border-orange-400 bg-orange-50 text-orange-500" : "border-slate-400 bg-slate-100 text-slate-500"}`}>
                {item.priority}
              </span>
              <span className="text-sm text-slate-400">{item.date}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
