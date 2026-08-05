import { useEffect, useState } from "react";
import api, { API_BASE_URL } from "../api";
import { Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";
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

  const updateStatus = (vehicleId, status, notes = "") => {
    api.patch(`/vehicles/${vehicleId}/status`, { status, notes })
      .then(() => fetchQueue())
      .catch((err) => {
        alert(err.response?.data?.error || "Failed to update status");
      });
  };

  const renderActions = (item) => {
    const status = item.status;
    const actions = [];

    if (status === "Reported") {
      actions.push(
        <Button key="gate-in" size="small" variant="contained" color="primary" className="!text-xs !py-1" onClick={() => updateStatus(item.id, "Gate In", "Arrived at gate")}>
          Gate In
        </Button>
      );
    } else if (status === "Gate In") {
      actions.push(
        <Button key="waiting" size="small" variant="contained" color="secondary" className="!text-xs !py-1" onClick={() => updateStatus(item.id, "Waiting", "Moved to holding yard")}>
          Waiting
        </Button>
      );
    } else if (status === "Reserved") {
      actions.push(
        <Button key="dock-in" size="small" variant="contained" color="success" className="!text-xs !py-1 !bg-emerald-600 hover:!bg-emerald-700" onClick={() => updateStatus(item.id, "Dock In", "Arrived at dock")}>
          Dock In
        </Button>
      );
    } else if (status === "Dock In") {
      actions.push(
        <Button key="processing" size="small" variant="contained" color="info" className="!text-xs !py-1" onClick={() => updateStatus(item.id, "Processing", "Loading/unloading started")}>
          Start Processing
        </Button>
      );
    } else if (status === "Processing") {
      actions.push(
        <Button key="complete" size="small" variant="contained" color="success" className="!text-xs !py-1 !bg-emerald-600 hover:!bg-emerald-700" onClick={() => updateStatus(item.id, "Completed", "Operations finished")}>
          Complete
        </Button>
      );
    } else if (status === "Completed") {
      actions.push(
        <Button key="gate-out" size="small" variant="contained" color="warning" className="!text-xs !py-1" onClick={() => updateStatus(item.id, "Gate Out", "Left facility")}>
          Gate Out
        </Button>
      );
    }

    if (!["Completed", "Gate Out", "Cancelled"].includes(status)) {
      actions.push(
        <Button key="cancel" size="small" variant="outlined" color="error" className="!text-xs !py-1" onClick={() => updateStatus(item.id, "Cancelled", "Cancelled by operator")}>
          Cancel
        </Button>
      );
    }

    return <div className="flex gap-2 flex-wrap">{actions}</div>;
  };

  return (
    <Paper className="surface-panel rounded-xl p-6 text-slate-950">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h5" className="!font-semibold !text-slate-950">Vehicle Queue Management</Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-400">Manage active queue flows and transition vehicle statuses in real-time.</Typography>
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
              <TableCell className="!text-slate-400">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {queue.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell className="!font-semibold !text-sky-600">{item.token}</TableCell>
                <TableCell className="!text-slate-950 font-bold">{item.vehicle_number}</TableCell>
                <TableCell className="!text-slate-650">{item.driver_name}</TableCell>
                <TableCell><span className="signal-pill">{item.status}</span></TableCell>
                <TableCell className="!text-slate-605">{item.waiting_minutes} min</TableCell>
                <TableCell>{renderActions(item)}</TableCell>
              </TableRow>
            ))}
            {queue.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center !py-8 text-slate-400">
                  No vehicles currently waiting or processing in the yard.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default VehicleQueue;
