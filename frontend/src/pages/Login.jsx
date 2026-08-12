import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Box, Button, TextField, Typography, InputAdornment, IconButton } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const quickAccess = [
    { title: "Admin", username: "admin", password: "admin123", icon: ShieldOutlinedIcon, color: "border-violet-500/50 text-violet-300" },
    { title: "Gate Operator", username: "gate", password: "operator123", icon: LocalShippingOutlinedIcon, color: "border-blue-500/50 text-blue-300" },
    { title: "Dock Supervisor", username: "dock", password: "supervisor123", icon: Inventory2OutlinedIcon, color: "border-amber-500/50 text-amber-300" },
    { title: "Management", username: "management", password: "management123", icon: BarChartOutlinedIcon, color: "border-emerald-500/50 text-emerald-300" },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/auth/login", { username, password });
      localStorage.setItem("auth_token", response.data.access_token);
      localStorage.setItem("user_role", response.data.user.role);
      localStorage.setItem("user_name", response.data.user.full_name || response.data.user.username);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to login");
    }
  };

  return (
    <div className="grid min-h-screen bg-[#0a0c10] text-white lg:grid-cols-2">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0d1326,#14244d)] px-8 py-12 md:px-20 border-r border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent_35rem)]" />
        <div className="relative flex min-h-[calc(100vh-6rem)] flex-col">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/25 bg-indigo-500/10 text-indigo-400 shadow-md shadow-indigo-500/5">
              <LocalShippingOutlinedIcon />
            </div>
            <p className="text-xl font-bold tracking-wide font-sans bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">Gate2Dock</p>
          </div>
 
          <div className="mt-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-xs font-bold text-sky-400 tracking-wider uppercase shadow-inner">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Enterprise Vehicle Tracking
            </div>
            <h1 className="mt-8 max-w-xl text-5xl font-black leading-[1.1] tracking-tight md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-sky-200">
              Yard Operations <span className="text-sky-400 font-extrabold">Redefined.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 font-medium">
              Seamlessly coordinate your facility's operations. Gate2Dock connects gate operators and dock supervisors, providing real-time visibility into vehicle arrivals, waiting queues, and dock allocations to eliminate bottlenecks.
            </p>
          </div>

          <div className="mt-16 space-y-9">
            {[
              { title: "Gate Registration", text: "Log inbound vehicles and assign digital tokens instantly.", icon: LocalShippingOutlinedIcon },
              { title: "Smart Dock Allocation", text: "Route vehicles to available docks to maximize throughput.", icon: WarehouseOutlinedIcon },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10 text-cyan-200">
                    <Icon />
                  </div>
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="mt-2 text-white/68">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto flex flex-wrap justify-between gap-4 pt-12 text-white/55">
            <span>© 2026 Gate2Dock Enterprise</span>
            <div className="flex gap-8">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative flex items-center justify-center overflow-hidden bg-[#0d0f14] px-6 py-12">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="relative w-full max-w-xl">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-350">Welcome Back</h2>
            <p className="mt-3 text-sm text-slate-450 font-medium">Enter your VMS employee credentials to access the console.</p>
          </div>
 
          <div className="rounded-2xl border border-slate-800 bg-[#121620]/90 backdrop-blur-xl p-8 shadow-2xl shadow-black/40">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Quick Access Roles</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickAccess.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      setUsername(item.username);
                      setPassword(item.password);
                    }}
                    className={`rounded-xl border bg-[#0b0e14] p-3 text-center transition-all duration-200 hover:scale-[1.03] ${item.color} hover:bg-[#121622] hover:border-slate-700/60 shadow-md`}
                  >
                    <Icon fontSize="small" />
                    <p className="mt-2 text-[10px] font-extrabold text-slate-300 tracking-wide uppercase">{item.title.split(" ")[0]}</p>
                  </button>
                );
              })}
            </div>
            <div className="my-7 flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span className="h-px flex-1 bg-slate-800" />
              Or Sign In Manually
              <span className="h-px flex-1 bg-slate-800" />
            </div>
 
            {error && <Typography className="!mb-4 !rounded-lg !border !border-red-500/20 !bg-red-500/5 !p-3 !text-red-400 !text-sm font-semibold">{error}</Typography>}
            <Box component="form" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-400 uppercase tracking-wider">Employee ID</label>
                <TextField
                  placeholder="e.g. gate"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#f3f4f6",
                      backgroundColor: "#0a0c10",
                      borderRadius: "10px",
                      fontSize: "14px",
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4b5563" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                    },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1f2937" },
                  }}
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  <span className="font-semibold text-indigo-400 hover:underline cursor-pointer">Forgot password?</span>
                </div>
                <TextField
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#f3f4f6",
                      backgroundColor: "#0a0c10",
                      borderRadius: "10px",
                      fontSize: "14px",
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4b5563" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                    },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1f2937" },
                  }}
                />
              </div>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={<LoginOutlinedIcon />}
                className="!rounded-xl !bg-gradient-to-r from-sky-500 to-indigo-650 !py-3.5 !text-sm !font-bold !normal-case hover:!brightness-110 shadow-lg shadow-sky-500/10"
              >
                Sign In to Workspace
              </Button>
            </Box>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
