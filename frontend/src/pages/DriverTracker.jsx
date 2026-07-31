import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { API_BASE_URL } from "../api";
import { Box, Paper, Typography, CircularProgress, Container } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { io } from "socket.io-client";

function DriverTracker() {
  const { token } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStatus = () => {
    api.get(`/vehicles/public/track/${token}`)
      .then((res) => {
        setVehicle(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Token not found.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStatus();

    const socket = io(API_BASE_URL);
    
    socket.on("vehicle_update", (updatedVehicle) => {
      if (updatedVehicle.token === token) {
        setVehicle(updatedVehicle);
        fetchStatus();
      }
    });

    socket.on("dock_update", () => {
      fetchStatus();
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  if (loading) {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-[#0d0f14] text-white">
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-[#0d0f14] p-5 text-white">
        <Paper className="max-w-md border border-red-500/20 bg-[#161a23] p-8 text-center rounded-2xl shadow-xl shadow-red-500/10">
          <Typography variant="h5" className="!font-bold text-red-400">Error</Typography>
          <Typography className="mt-4 text-slate-300">{error}</Typography>
        </Paper>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Dock In":
        return "border-green-500 bg-green-500/10 text-green-400";
      case "Waiting":
        return "border-amber-500 bg-amber-500/10 text-amber-400";
      case "Completed":
        return "border-sky-500 bg-sky-500/10 text-sky-400";
      default:
        return "border-violet-500 bg-violet-500/10 text-violet-400";
    }
  };

  return (
    <Box className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] font-sans pb-10">
      <Box className="relative overflow-hidden bg-[linear-gradient(135deg,#1e3c72,#2a5298)] px-6 py-12 text-center rounded-b-[2.5rem] shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_70%)]" />
        <Container maxWidth="xs" className="relative flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg text-white text-3xl">
            <LocalShippingOutlinedIcon fontSize="large" />
          </div>
          <Typography variant="h4" className="mt-4 !font-black tracking-tight text-white font-sans">Gate-2-Dock</Typography>
          <Typography variant="body2" className="mt-1 text-white/70 font-sans">Live Vehicle Tracker</Typography>
        </Container>
      </Box>

      <Container maxWidth="xs" className="mt-[-2rem] relative z-10 px-5">
        <Paper className="border border-[#262f3f] bg-[#121620] p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#222938] pb-5">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-sans">Token Number</p>
              <Typography variant="h5" className="!font-black !text-sky-400 mt-0.5 font-sans">{vehicle.token}</Typography>
            </div>
            <span className={`rounded-full border px-4 py-1.5 text-xs font-semibold font-sans ${getStatusColor(vehicle.status)}`}>
              {vehicle.status}
            </span>
          </div>

          <div className="mt-6 flex gap-4 items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1c2333] text-sky-400">
              <LocalShippingOutlinedIcon />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-sans">Vehicle Plate</p>
              <p className="text-xl font-bold text-slate-200 font-sans">{vehicle.vehicle_number}</p>
            </div>
          </div>

          {vehicle.status === "Dock In" && vehicle.dock_name ? (
            <div className="mt-8 rounded-2xl border border-green-500/20 bg-green-500/5 p-5 text-center">
              <WarehouseOutlinedIcon className="text-green-400" sx={{ fontSize: 40 }} />
              <Typography variant="h6" className="!font-black text-green-400 mt-2 font-sans">DOCK ALLOCATED</Typography>
              <Typography variant="h4" className="!font-black text-white mt-1 font-sans">{vehicle.dock_name}</Typography>
              <Typography variant="body2" className="mt-2 text-slate-400 font-sans">Please drive your truck immediately to the dock above.</Typography>
            </div>
          ) : vehicle.status === "Completed" ? (
            <div className="mt-8 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 text-center">
              <CheckCircleOutlineOutlinedIcon className="text-sky-400" sx={{ fontSize: 40 }} />
              <Typography variant="h6" className="!font-black text-sky-400 mt-2 font-sans">OPERATIONS COMPLETE</Typography>
              <Typography variant="body2" className="mt-2 text-slate-400 font-sans">You are cleared to exit via Gate Out. Thank you!</Typography>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-[#2c374d] bg-[#181f2d] p-5 text-center">
              <ScheduleOutlinedIcon className="text-amber-400" sx={{ fontSize: 40 }} />
              <Typography variant="h6" className="!font-black text-amber-400 mt-2 font-sans">WAITING IN QUEUE</Typography>
              {vehicle.queue_position > 0 ? (
                <div>
                  <Typography variant="h3" className="!font-black text-white mt-1 font-sans">#{vehicle.queue_position}</Typography>
                  <Typography variant="body2" className="mt-2 text-slate-400 font-sans">vehicles ahead of you in line.</Typography>
                </div>
              ) : (
                <Typography variant="body2" className="mt-2 text-slate-450 font-sans">Waiting for queue assignment...</Typography>
              )}
            </div>
          )}

          <div className="mt-8 border-t border-[#222938] pt-6 space-y-4 text-sm font-sans">
            <div className="flex justify-between">
              <span className="text-slate-550">Driver Name</span>
              <span className="font-semibold text-slate-300">{vehicle.driver_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-550">Material Type</span>
              <span className="font-semibold text-slate-300">{vehicle.material_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-550">Supplier</span>
              <span className="font-semibold text-slate-300">{vehicle.supplier || "Default"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-550">Waiting Time</span>
              <span className="font-semibold text-slate-300">{vehicle.waiting_minutes} mins</span>
            </div>
          </div>
        </Paper>

        <div className="mt-6 flex gap-4 items-start rounded-2xl border border-[#2b354a] bg-[#11151f] p-4 text-xs text-slate-400 font-sans">
          <InfoOutlinedIcon className="text-sky-400 shrink-0" fontSize="small" />
          <div className="space-y-1">
            <p className="font-bold text-slate-300">Safety Information</p>
            <p>Please remain inside your vehicle cabin while waiting. Turn off your engine once docked.</p>
          </div>
        </div>
      </Container>
    </Box>
  );
}

export default DriverTracker;
