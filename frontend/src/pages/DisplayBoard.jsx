import { useEffect, useState } from "react";
import api, { API_BASE_URL } from "../api";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { io } from "socket.io-client";

function DisplayBoard() {
  const [queue, setQueue] = useState([]);
  const [docks, setDocks] = useState([]);

  const fetchData = () => {
    api.get("/vehicles/queue").then((res) => setQueue(res.data)).catch(console.error);
    api.get("/docks").then((res) => setDocks(res.data)).catch(console.error);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h4" className="!font-semibold !text-slate-950">Display Board</Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-400">Large-format gate and dock visibility.</Typography>
        </div>
        <span className="signal-pill">Live screen</span>
      </div>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper className="surface-panel rounded-xl p-6 text-slate-950">
            <Typography variant="h6" className="!mb-4 !font-semibold !text-slate-950">Gate Display</Typography>
            {queue.slice(0, 5).map((item) => (
              <Box key={item.id} className="flex justify-between gap-3 border-b border-slate-200 py-3">
                <span className="font-semibold text-sky-600">{item.token}</span>
                <span>{item.vehicle_number}</span>
                <span className="text-slate-400">{item.waiting_minutes} min</span>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className="surface-panel rounded-xl p-6 text-slate-950">
            <Typography variant="h6" className="!mb-4 !font-semibold !text-slate-950">Dock Status</Typography>
            {docks.map((dock) => (
              <Box key={dock.id} className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <Typography variant="subtitle1" className="!font-semibold !text-slate-950">{dock.name}</Typography>
                  <span className={`status-dot ${dock.is_available ? "bg-green-400" : "bg-amber-400"}`} />
                </div>
                <Typography className="!mt-2 !text-slate-500">Status: {dock.is_available ? "Free" : "Occupied"}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default DisplayBoard;
