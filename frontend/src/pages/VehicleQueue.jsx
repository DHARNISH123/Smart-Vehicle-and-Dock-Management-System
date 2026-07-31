import { useEffect, useState } from "react";
import api, { API_BASE_URL } from "../api";
import { Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { io } from "socket.io-client";

function VehicleQueue() {
  const [queue, setQueue] = useState([]);

  const fetchQueue = () => {
    api.get("/vehicles/queue").then((res) => setQueue(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchQueue();

    const socket = io(API_BASE_URL);
    
    socket.on("vehicle_update", () => {
      fetchQueue();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Paper className="surface-panel rounded-xl p-6 text-slate-950">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h5" className="!font-semibold !text-slate-950">Vehicle Queue</Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-400">Waiting vehicles ranked for gate-to-dock movement.</Typography>
        </div>
        <span className="signal-pill">{queue.length} active</span>
      </div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="!text-slate-400">Token</TableCell>
              <TableCell className="!text-slate-400">Vehicle</TableCell>
              <TableCell className="!text-slate-400">Driver</TableCell>
              <TableCell className="!text-slate-400">Status</TableCell>
              <TableCell className="!text-slate-400">Waiting Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {queue.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell className="!font-semibold !text-sky-600">{item.token}</TableCell>
                <TableCell className="!text-slate-950">{item.vehicle_number}</TableCell>
                <TableCell className="!text-slate-600">{item.driver_name}</TableCell>
                <TableCell><span className="signal-pill">{item.status}</span></TableCell>
                <TableCell className="!text-slate-600">{item.waiting_minutes} min</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default VehicleQueue;
