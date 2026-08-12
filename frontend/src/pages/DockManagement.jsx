import { useEffect, useState } from "react";
import api, { API_BASE_URL } from "../api";
import { Paper, Typography, Grid, MenuItem, TextField, Button, Box, CircularProgress } from "@mui/material";
import { io } from "socket.io-client";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import DirectionsTransitIcon from "@mui/icons-material/DirectionsTransit";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";

function DockManagement() {
  const [docks, setDocks] = useState([]);
  const [queue, setQueue] = useState([]);
  const [selectedDock, setSelectedDock] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [docksRes, queueRes] = await Promise.all([
        api.get("/docks"),
        api.get("/vehicles/queue")
      ]);
      setDocks(docksRes.data);
      setQueue(queueRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = io(API_BASE_URL);
    socket.on("vehicle_update", () => fetchData());
    socket.on("dock_update", () => fetchData());

    return () => socket.disconnect();
  }, []);

  const allocate = async () => {
    try {
      setMessage("");
      const response = await api.post(
        "/docks/allocate",
        { dock_id: selectedDock, vehicle_id: selectedVehicle }
      );
      setMessage(response.data.message);
      setSelectedDock("");
      setSelectedVehicle("");
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || "Allocation failed");
    }
  };

  const updateVehicleStatus = async (vehicleId, status, notes) => {
    try {
      await api.patch(`/vehicles/${vehicleId}/status`, { status, notes });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update vehicle status");
    }
  };

  const triggerAutoAllocation = async () => {
    try {
      setMessage("");
      // Find a vehicle in queue that is waiting and call auto-allocation endpoint or trigger auto simulation
      if (queue.length === 0) {
        setMessage("Queue is empty. No vehicles to allocate.");
        return;
      }
      
      // Post vehicle details to re-run allocation check
      const nextVehicle = queue.find(v => v.status === "Reported" || v.status === "Gate In" || v.status === "Waiting");
      if (!nextVehicle) {
        setMessage("No vehicles in yard waiting for dock.");
        return;
      }
      
      // Rerun gate entry evaluation to trigger auto-allocation on backend
      const response = await api.post(`/docks/allocate`, {
        vehicle_id: nextVehicle.id,
        dock_id: docks.find(d => d.is_available && (d.capabilities === "All" || d.capabilities === nextVehicle.material_type))?.id
      });
      setMessage("Auto-allocating vehicle: " + response.data.message);
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || "Auto-allocation failed");
    }
  };

  if (loading) {
    return (
      <Box className="flex h-96 items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h5" className="!font-semibold !text-slate-950 font-sans">Factory Loading Docks</Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-400">Manage real-time loading bays, capability matchings, and elapsed process timers.</Typography>
        </div>
        <span className="signal-pill">Allocation Control</span>
      </div>
      {/* Real-Time Facility Layout Map (Phase 4 UX) */}
      <Paper className="surface-panel rounded-xl p-6 border border-slate-100 shadow-sm bg-white overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <WarehouseIcon className="text-sky-600" />
          <Typography variant="h6" className="!font-bold text-slate-800">Visual Dock Bay Occupancy Layout Map</Typography>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 border-2 border-dashed border-slate-200/60 p-6 rounded-2xl bg-slate-50/50 relative">
          {docks.map((dock, index) => {
            const hasVehicle = dock.current_vehicle;
            const isAvailable = dock.is_available;
            
            return (
              <div 
                key={dock.id} 
                className={`relative flex flex-col items-center justify-between p-4 rounded-xl border h-36 transition-all duration-300 ${
                  isAvailable 
                    ? "border-slate-200 bg-white" 
                    : "border-indigo-200 bg-indigo-50/20 shadow-md shadow-indigo-500/5"
                }`}
              >
                {/* Bay Number */}
                <span className="absolute top-2 left-2 text-[10px] font-black text-slate-400">BAY 0{index + 1}</span>
                
                {/* Truck Slot */}
                <div className="flex-1 flex items-center justify-center w-full mt-4">
                  {hasVehicle ? (
                    <div className="truck-parking-anim flex flex-col items-center gap-1.5 w-full">
                      {/* Visual Truck Cab block */}
                      <div className="flex flex-col items-center bg-indigo-600 text-white px-2 py-1.5 rounded-md shadow w-4/5 text-center relative">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 absolute top-1 right-1 animate-pulse" />
                        <Typography className="font-mono text-[9px] font-extrabold tracking-wider">{hasVehicle.vehicle_number}</Typography>
                      </div>
                      {/* Wheels */}
                      <div className="flex justify-between w-2/3 px-1">
                        <span className="w-2.5 h-1.5 bg-slate-800 rounded-full" />
                        <span className="w-2.5 h-1.5 bg-slate-800 rounded-full" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg w-4/5 py-4 text-slate-300">
                      <Typography className="text-[10px] font-extrabold tracking-wide uppercase">Vacant</Typography>
                    </div>
                  )}
                </div>

                {/* Status Dot Pill */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`h-2 w-2 rounded-full ${isAvailable ? "bg-slate-300" : "bg-indigo-500 animate-pulse"}`} />
                  <span className="text-[9px] font-black uppercase text-slate-500">
                    {isAvailable ? "Ready" : hasVehicle?.status.split(" ")[0] || "Parked"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Paper>

      {/* Dock Grid */}
      <Grid container spacing={3}>
        {docks.map((dock) => {
          const hasVehicle = dock.current_vehicle;
          const isAvailable = dock.is_available;
          
          return (
            <Grid item xs={12} md={4} key={dock.id}>
              <Paper className={`rounded-xl p-6 border shadow-sm transition-all duration-300 ${isAvailable ? "border-slate-100 bg-white" : "border-indigo-100 bg-indigo-50/15"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WarehouseIcon className={isAvailable ? "text-slate-400" : "text-sky-600"} />
                    <Typography variant="h6" className="!font-bold text-slate-800">{dock.name}</Typography>
                  </div>
                  <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${isAvailable ? "border-emerald-300 bg-emerald-50 text-emerald-600" : "border-indigo-300 bg-indigo-50 text-indigo-600"}`}>
                    {isAvailable ? "Available" : hasVehicle ? hasVehicle.status : "Reserved"}
                  </span>
                </div>
                
                <div className="mt-3">
                  <Typography variant="caption" className="text-slate-400 font-bold block">BAY CAPABILITY: {dock.capabilities}</Typography>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  {hasVehicle ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Typography variant="caption" className="text-slate-400 font-medium">VEHICLE</Typography>
                          <Typography variant="body2" className="font-bold text-slate-800">{hasVehicle.vehicle_number}</Typography>
                        </div>
                        <div>
                          <Typography variant="caption" className="text-slate-400 font-medium">SUPPLIER</Typography>
                          <Typography variant="body2" className="font-bold text-slate-800 truncate">{hasVehicle.supplier}</Typography>
                        </div>
                        <div>
                          <Typography variant="caption" className="text-slate-400 font-medium">ELAPSED TIME</Typography>
                          <Typography variant="body2" className="font-bold text-sky-600 font-mono flex items-center gap-1">
                            <QueryBuilderIcon fontSize="inherit" />
                            {hasVehicle.elapsed_minutes}m
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="caption" className="text-slate-400 font-medium">EST. COMPLETE</Typography>
                          <Typography variant="body2" className="font-bold text-slate-800 font-mono">
                            {hasVehicle.expected_completion ? new Date(hasVehicle.expected_completion).toLocaleTimeString("en-IN", {hour: '2-digit', minute:'2-digit'}) : "N/A"}
                          </Typography>
                        </div>
                      </div>

                      {/* Direct status transitions from the dock card */}
                      <div className="pt-2 flex gap-2">
                        {hasVehicle.status === "Dock In" && (
                          <Button variant="contained" size="small" fullWidth className="!bg-indigo-600 hover:!bg-indigo-700 !text-xs !font-bold" onClick={() => updateVehicleStatus(hasVehicle.id, "Processing", "Loading/unloading began at bay")}>
                            Start Processing
                          </Button>
                        )}
                        {hasVehicle.status === "Processing" && (
                          <Button variant="contained" size="small" color="success" fullWidth className="!bg-emerald-600 hover:!bg-emerald-700 !text-xs !font-bold" onClick={() => updateVehicleStatus(hasVehicle.id, "Completed", "Operations completed at bay")}>
                            Complete Loading
                          </Button>
                        )}
                        {hasVehicle.status === "Completed" && (
                          <Button variant="contained" size="small" color="warning" fullWidth className="!text-xs !font-bold" onClick={() => updateVehicleStatus(hasVehicle.id, "Gate Out", "Cleared dock and exited gate")}>
                            Release Bay
                          </Button>
                        )}
                        <Button variant="outlined" size="small" color="error" className="!text-xs" onClick={() => updateVehicleStatus(hasVehicle.id, "Cancelled", "Allocation cancelled by supervisor")}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Typography variant="body2" className="text-slate-400 italic text-center py-4 font-medium">
                      No active vehicle parked in this bay
                    </Typography>
                  )}
                </div>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Allocation Actions */}
      <Grid container spacing={3}>
        {/* Manual Allocation Panel */}
        <Grid item xs={12} md={8}>
          <Paper className="surface-panel rounded-xl p-6 text-slate-950 shadow-md border border-slate-100 bg-white">
            <Typography variant="h6" className="!mb-4 !font-bold text-slate-800">Manual Bay Allocation</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <TextField select label="Select Free Bay" fullWidth value={selectedDock} onChange={(e) => setSelectedDock(e.target.value)}>
                  {docks.filter((dock) => dock.is_available).map((dock) => (
                    <MenuItem key={dock.id} value={dock.id}>{dock.name} ({dock.capabilities})</MenuItem>
                  ))}
                  {docks.filter((dock) => dock.is_available).length === 0 && (
                    <MenuItem disabled>No docks available</MenuItem>
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField select label="Select Waiting Vehicle" fullWidth value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}>
                  {queue.filter(item => ["Reported", "Gate In", "Waiting"].includes(item.status)).map((item) => (
                    <MenuItem key={item.id} value={item.id}>{item.token} - {item.vehicle_number} ({item.material_type})</MenuItem>
                  ))}
                  {queue.filter(item => ["Reported", "Gate In", "Waiting"].includes(item.status)).length === 0 && (
                    <MenuItem disabled>No vehicles in waiting queue</MenuItem>
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button variant="contained" fullWidth onClick={allocate} disabled={!selectedDock || !selectedVehicle} className="!h-full !min-h-14 !rounded-lg !bg-sky-500 !font-semibold !normal-case hover:!bg-sky-600 shadow-md">
                  Allocate
                </Button>
              </Grid>
            </Grid>
            {message && <Typography className="!mt-5 !rounded-lg !border !border-slate-200 !bg-sky-50 !p-4 !text-slate-700 font-semibold">{message}</Typography>}
          </Paper>
        </Grid>

        {/* Auto Allocation Simulator Panel */}
        <Grid item xs={12} md={4}>
          <Paper className="surface-panel rounded-xl p-6 text-slate-950 shadow-md border border-slate-100 bg-white flex flex-col justify-between h-full min-h-[175px]">
            <div>
              <Typography variant="h6" className="!font-bold text-slate-800">Auto Allocation Engine</Typography>
              <Typography variant="body2" className="text-slate-400 mt-2">Triggers the backend capability matching and priority queue allocation logic for waiting vehicles.</Typography>
            </div>
            <Button variant="outlined" startIcon={<DirectionsTransitIcon />} fullWidth onClick={triggerAutoAllocation} className="!rounded-lg !py-3 !mt-4 !font-semibold !normal-case">
              Simulate Auto Allocation Run
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default DockManagement;
