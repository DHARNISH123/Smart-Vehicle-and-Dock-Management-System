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
    { title: "Admin", code: "ADMIN001", icon: ShieldOutlinedIcon, color: "border-violet-500/50 text-violet-300" },
    { title: "Gate Operator", code: "GATE001", icon: LocalShippingOutlinedIcon, color: "border-blue-500/50 text-blue-300" },
    { title: "Dock Supervisor", code: "DOCK001", icon: Inventory2OutlinedIcon, color: "border-amber-500/50 text-amber-300" },
    { title: "Management", code: "MGMT001", icon: BarChartOutlinedIcon, color: "border-emerald-500/50 text-emerald-300" },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/auth/login", { username, password });
      localStorage.setItem("auth_token", response.data.access_token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to login");
    }
  };

  return (
    <div className="grid min-h-screen bg-[#0f1118] text-white lg:grid-cols-2">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#1f5f9d,#10a6b6)] px-8 py-12 md:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.14),transparent_26rem)]" />
        <div className="relative flex min-h-[calc(100vh-6rem)] flex-col">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10">
              <LocalShippingOutlinedIcon />
            </div>
            <p className="text-2xl font-bold">Gate2Dock</p>
          </div>

          <div className="mt-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold shadow-lg">
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              Enterprise Vehicle Tracking
            </div>
            <h1 className="mt-10 max-w-xl text-6xl font-black leading-none tracking-tight md:text-7xl">
              Innovation and <span className="text-cyan-200">You.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-9 text-white/78">
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

      <section className="relative flex items-center justify-center overflow-hidden bg-[#101218] px-6 py-12">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="relative w-full max-w-xl">
          <div className="mb-12">
            <h2 className="text-4xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-4 text-lg text-slate-400">Enter your credentials to access the workspace.</p>
          </div>

          <div className="rounded-2xl border border-slate-700/70 bg-[#1b1e28] p-10 shadow-2xl shadow-black/25">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-400">Quick Access — Dev</p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {quickAccess.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      setUsername("admin");
                      setPassword("admin123");
                    }}
                    className={`rounded-xl border bg-[#141720] px-3 py-5 text-center ${item.color}`}
                  >
                    <Icon />
                    <p className="mt-3 text-xs font-bold text-slate-200">{item.title}</p>
                    <p className="mt-3 text-[10px] font-medium text-slate-500">{item.code}</p>
                  </button>
                );
              })}
            </div>

            <div className="my-9 flex items-center gap-5 text-sm font-bold uppercase tracking-wide text-slate-500">
              <span className="h-px flex-1 bg-slate-700/70" />
              Or Sign In Manually
              <span className="h-px flex-1 bg-slate-700/70" />
            </div>

            {error && <Typography className="!mb-4 !rounded-lg !border !border-red-400/30 !bg-red-400/10 !p-3 !text-red-200">{error}</Typography>}
            <Box component="form" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-bold text-slate-300">Employee ID</label>
                <TextField
                  placeholder="e.g. GATE001"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#e5e7eb",
                      backgroundColor: "#13161d",
                      borderRadius: "8px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#303642" },
                  }}
                />
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between text-sm">
                  <label className="font-bold text-slate-300">Password</label>
                  <span className="font-semibold text-cyan-400">Forgot password?</span>
                </div>
                <TextField
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" className="!text-slate-500">
                          <VisibilityOutlinedIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#e5e7eb",
                      backgroundColor: "#13161d",
                      borderRadius: "8px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#303642" },
                  }}
                />
              </div>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={<LoginOutlinedIcon />}
                className="!rounded-lg !bg-[linear-gradient(90deg,#2477b5,#14b8d3)] !py-4 !text-base !font-bold !normal-case hover:!opacity-95"
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
