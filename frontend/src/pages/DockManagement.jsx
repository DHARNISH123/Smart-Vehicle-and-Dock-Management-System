import { useEffect, useState } from "react";
import api, { API_BASE_URL } from "../api";
import { Paper, Typography, Grid, MenuItem, TextField, Button } from "@mui/material";
import { io } from "socket.io-client";

function DockManagement() {
  const [docks, setDocks] = useState([]);
  const [queue, setQueue] = useState([]);
  const [selectedDock, setSelectedDock] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = () => {
    api.get("/docks").then((res) => setDocks(res.data)).catch(console.error);
    api.get("/vehicles/queue").then((res) => setQueue(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchData();

    const socket = io(API_BASE_URL);
    
    socket.on("vehicle_update", () => {
      fetchData();
    });
    
    socket.on("dock_update", () => {
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const allocate = async () => {
    try {
      const response = await api.post(
        "/docks/allocate",
        { dock_id: selectedDock, vehicle_id: selectedVehicle }
      );
      setMessage(response.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || "Allocation failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h5" className="!font-semibold !text-slate-950">Dock Management</Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-400">Match available docks with the strongest queue candidates.</Typography>
        </div>
        <span className="signal-pill">Allocation center</span>
      </div>
      <Grid container spacing={3}>
        {docks.map((dock) => (
          <Grid item xs={12} md={3} key={dock.id}>
            <div className="surface-panel rounded-xl p-5">
              <div className="flex items-center justify-between">
                <Typography variant="subtitle1" className="!font-semibold !text-slate-950">{dock.name}</Typography>
                <span className={`status-dot ${dock.is_available ? "bg-green-400" : "bg-amber-400"}`} />
              </div>
              <Typography variant="body2" className="!mt-4 !text-slate-500">Status: {dock.is_available ? "Free" : "Occupied"}</Typography>
              <Typography variant="body2" className="!mt-1 !text-slate-400">Current Vehicle: {dock.current_vehicle || "None"}</Typography>
            </div>
          </Grid>
        ))}
      </Grid>
      <Paper className="surface-panel rounded-xl p-6 text-slate-950">
        <Typography variant="h6" className="!mb-4 !font-semibold !text-slate-950">Manual Allocation</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField select label="Select Dock" fullWidth value={selectedDock} onChange={(e) => setSelectedDock(e.target.value)}>
              {docks.filter((dock) => dock.is_available).map((dock) => (<MenuItem key={dock.id} value={dock.id}>{dock.name}</MenuItem>))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField select label="Select Vehicle" fullWidth value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}>
              {queue.map((item) => (<MenuItem key={item.id} value={item.id}>{item.token} - {item.vehicle_number}</MenuItem>))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button variant="contained" fullWidth onClick={allocate} className="!h-full !min-h-14 !rounded !bg-sky-500 !font-semibold !normal-case hover:!bg-sky-600">Allocate</Button>
          </Grid>
        </Grid>
        {message && <Typography className="!mt-5 !rounded-lg !border !border-slate-200 !bg-sky-50 !p-4 !text-slate-700">{message}</Typography>}
      </Paper>
    </div>
  );
}

export default DockManagement;
