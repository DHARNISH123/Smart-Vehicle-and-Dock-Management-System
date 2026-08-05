import { useEffect, useState } from "react";
import api, { API_BASE_URL } from "../api";
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import { io } from "socket.io-client";
import { Paper, Typography, Grid, Box, CircularProgress, Card, CardContent } from "@mui/material";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#0284c7", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6366f1"];

function Dashboard() {
  const [data, setData] = useState(null);
  const [docks, setDocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [dbRes, docksRes] = await Promise.all([
        api.get("/reports/dashboard"),
        api.get("/docks")
      ]);
      setData(dbRes.data);
      setDocks(docksRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Establish WebSocket listener for live updates (Phase 5)
    const socket = io(API_BASE_URL);
    socket.on("vehicle_update", () => fetchDashboardData());
    socket.on("dock_update", () => fetchDashboardData());

    return () => socket.disconnect();
  }, []);

  if (loading || !data) {
    return (
      <Box className="flex h-96 items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  const kpiStats = [
    { label: "Total Vehicles Today", value: data.total_today, icon: ContentPasteOutlinedIcon, color: "text-sky-600 bg-sky-50" },
    { label: "In Waiting Queue", value: data.active_queue, icon: LocalShippingOutlinedIcon, color: "text-amber-600 bg-amber-50" },
    { label: "Dock Utilization", value: `${data.dock_utilization}%`, icon: WarehouseOutlinedIcon, color: "text-violet-600 bg-violet-50" },
    { label: "Standby / Delayed", value: data.delayed_count, icon: HourglassEmptyIcon, color: "text-rose-600 bg-rose-50" },
  ];

  const averageStats = [
    { label: "Avg Yard Waiting Time", value: `${data.avg_waiting_time} mins`, icon: QueryBuilderIcon, desc: "From report time to dock allocation" },
    { label: "Avg Dock Loading Time", value: `${data.avg_processing_time} mins`, icon: PendingActionsIcon, desc: "Actual loading/unloading time" },
    { label: "Avg Cycle Turnaround Time (TAT)", value: `${data.avg_turnaround_time} mins`, icon: SettingsSuggestIcon, desc: "Gate In to Gate Out cycle duration" },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <section className="rounded-xl bg-gradient-to-r from-sky-700 via-indigo-700 to-indigo-800 p-8 text-white shadow-md">
        <Typography variant="h4" className="!font-bold">Enterprise Analytics Dashboard</Typography>
        <Typography variant="body1" className="text-sky-200 mt-1">Real-time factory logistics metrics, dock occupancy, and hourly throughput.</Typography>
      </section>

      {/* KPI Cards */}
      <Grid container spacing={3}>
        {kpiStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Paper className="rounded-xl p-6 border border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <Typography variant="body2" className="text-slate-400 font-medium">{stat.label}</Typography>
                  <div className={`p-3 rounded-lg ${stat.color.split(" ")[1]}`}>
                    <Icon className={stat.color.split(" ")[0]} />
                  </div>
                </div>
                <Typography variant="h4" className="!font-extrabold text-slate-800 mt-2">{stat.value}</Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Time Averages Grid */}
      <Grid container spacing={3}>
        {averageStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} md={4} key={stat.label}>
              <Paper className="rounded-xl p-6 border border-slate-100 shadow-sm bg-white flex gap-4 items-center">
                <div className="p-4 rounded-full bg-slate-50 text-slate-500">
                  <Icon fontSize="large" />
                </div>
                <div>
                  <Typography variant="h5" className="!font-black text-slate-800">{stat.value}</Typography>
                  <Typography variant="subtitle2" className="text-slate-500 font-semibold mt-0.5">{stat.label}</Typography>
                  <Typography variant="caption" className="text-slate-400 block">{stat.desc}</Typography>
                </div>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Interactive Charts Section (Phase 5) */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper className="rounded-xl p-6 border border-slate-100 shadow-sm bg-white">
            <Typography variant="h6" className="!font-bold text-slate-800 mb-6">Hourly Vehicle Traffic Trend</Typography>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.hourly_trend}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper className="rounded-xl p-6 border border-slate-100 shadow-sm bg-white">
            <Typography variant="h6" className="!font-bold text-slate-800 mb-6">Supplier Distribution (Today)</Typography>
            <div className="h-80 flex flex-col justify-between">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.supplier_trend} dataKey="count" nameKey="supplier" cx="50%" cy="50%" outerRadius={70} fill="#8884d8" label>
                      {data.supplier_trend.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-500">
                {data.supplier_trend.map((entry, index) => (
                  <span key={entry.supplier} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.supplier} ({entry.count})
                  </span>
                ))}
              </div>
            </div>
          </Paper>
        </Grid>
      </Grid>

      {/* Dock Status Grid */}
      <section>
        <Typography variant="h6" className="!font-bold text-slate-800 mb-5">Loading Dock Overview</Typography>
        <Grid container spacing={3}>
          {docks.slice(0, 6).map((dock, index) => {
            const isAvailable = dock.is_available;
            const hasVehicle = dock.current_vehicle;
            const statusLabel = isAvailable ? "Free" : hasVehicle ? hasVehicle.status : "Reserved";
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={2} key={dock.id}>
                <Paper className="rounded-xl p-5 border border-slate-100 shadow-sm bg-white flex flex-col justify-between min-h-[220px]">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`h-10 w-10 flex items-center justify-center rounded-lg font-bold ${isAvailable ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}>
                        D{index + 1}
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${isAvailable ? "border-emerald-300 bg-emerald-50 text-emerald-600" : "border-indigo-300 bg-indigo-50 text-indigo-600"}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="mt-4">
                      <Typography variant="subtitle1" className="!font-bold text-slate-800">{dock.name}</Typography>
                      <Typography variant="caption" className="text-slate-400 font-medium">Supports: {dock.capabilities}</Typography>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-50">
                    {hasVehicle ? (
                      <div>
                        <Typography variant="body2" className="font-bold text-slate-700">{hasVehicle.vehicle_number}</Typography>
                        <Typography variant="caption" className="text-slate-400 block mt-0.5">{hasVehicle.supplier}</Typography>
                        <Typography variant="caption" className="text-sky-600 font-mono font-bold block">{hasVehicle.elapsed_minutes}m elapsed</Typography>
                      </div>
                    ) : (
                      <Typography variant="body2" className="text-slate-350 font-medium italic">Awaiting allocation</Typography>
                    )}
                  </div>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </section>

      {/* Status Bar Distribution */}
      <Paper className="rounded-xl p-6 border border-slate-100 shadow-sm bg-white">
        <Typography variant="h6" className="!font-bold text-slate-800 mb-6">Active Status Distribution</Typography>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.status_distribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40}>
                {data.status_distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Paper>

      {/* Recent Activities Section */}
      <section>
        <Typography variant="h6" className="!font-bold text-slate-800 mb-4">Recent System Logs</Typography>
        <Paper className="rounded-xl border border-slate-100 shadow-sm bg-white overflow-hidden">
          {data.recent_activity.map((activity, index) => (
            <div key={index} className="flex flex-wrap items-center justify-between border-b border-slate-100 p-4 last:border-b-0 gap-3 hover:bg-slate-50 transition-colors">
              <div className="flex gap-3 items-center">
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  {new Date(activity.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                <Typography variant="body2" className="!font-bold text-slate-800">{activity.title}</Typography>
              </div>
              <Typography variant="body2" className="text-slate-450 italic">{activity.description}</Typography>
            </div>
          ))}
          {data.recent_activity.length === 0 && (
            <div className="text-center p-8 text-slate-400 font-medium">No recent logs recorded.</div>
          )}
        </Paper>
      </section>
    </div>
  );
}

export default Dashboard;
