import { useEffect, useState } from "react";
import api, { API_BASE_URL } from "../api";
import { Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, TextField, MenuItem } from "@mui/material";
import { io } from "socket.io-client";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

function VehicleQueue() {
  const [queue, setQueue] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchQueue = () => {
    api.get("/vehicles/queue").then((res) => setQueue(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchQueue();

    const socket = io(API_BASE_URL);
    socket.on("vehicle_update", () => fetchQueue());
    socket.on("dock_update", () => fetchQueue());

    return () => socket.disconnect();
  }, []);

  const updateStatus = (vehicleId, status, notes = "") => {
    api.patch(`/vehicles/${vehicleId}/status`, { status, notes })
      .then(() => fetchQueue())
      .catch((err) => {
        alert(err.response?.data?.error || "Failed to update status");
      });
  };

  const getEstWaitTime = (item, index) => {
    // Phase 3 estimated wait time algorithm based on queue position
    const baseMinutes = 15;
    return (index + 1) * baseMinutes;
  };

  const getThresholdPillColor = (minutes) => {
    // Phase 3 Warning thresholds color indicators
    if (minutes >= 60) {
      return "border-rose-300 bg-rose-50 text-rose-600 font-bold";
    } else if (minutes >= 30) {
      return "border-amber-300 bg-amber-50 text-amber-600 font-bold";
    } else {
      return "border-sky-300 bg-sky-50 text-sky-600";
    }
  };

  const renderActions = (item) => {
    const status = item.status;
    const actions = [];

    if (status === "Reported") {
      actions.push(
        <Button key="gate-in" size="small" variant="contained" color="primary" className="!text-xs !py-1 !font-bold" onClick={() => updateStatus(item.id, "Gate In", "Arrived at gate")}>
          Gate In
        </Button>
      );
    } else if (status === "Gate In") {
      actions.push(
        <Button key="waiting" size="small" variant="contained" color="secondary" className="!text-xs !py-1 !font-bold" onClick={() => updateStatus(item.id, "Waiting", "Moved to holding yard")}>
          Waiting
        </Button>
      );
    } else if (status === "Reserved") {
      actions.push(
        <Button key="dock-in" size="small" variant="contained" color="success" className="!text-xs !py-1 !font-bold !bg-emerald-600 hover:!bg-emerald-700" onClick={() => updateStatus(item.id, "Dock In", "Arrived at dock")}>
          Dock In
        </Button>
      );
    } else if (status === "Dock In") {
      actions.push(
        <Button key="processing" size="small" variant="contained" color="info" className="!text-xs !py-1 !font-bold" onClick={() => updateStatus(item.id, "Processing", "Loading/unloading started")}>
          Start Processing
        </Button>
      );
    } else if (status === "Processing") {
      actions.push(
        <Button key="complete" size="small" variant="contained" color="success" className="!text-xs !py-1 !font-bold !bg-emerald-600 hover:!bg-emerald-700" onClick={() => updateStatus(item.id, "Completed", "Operations finished")}>
          Complete
        </Button>
      );
    } else if (status === "Completed") {
      actions.push(
        <Button key="gate-out" size="small" variant="contained" color="warning" className="!text-xs !py-1 !font-bold" onClick={() => updateStatus(item.id, "Gate Out", "Left facility")}>
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

  const filteredQueue = queue.filter(item => {
    const matchesSearch = 
      item.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.driver_name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = statusFilter === "All" || item.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <Paper className="surface-panel rounded-xl p-6 text-slate-950 shadow-md border border-slate-100 bg-white">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h5" className="!font-bold !text-slate-800 font-sans">Live Yard Queue Control</Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-400">Track prioritised waiting lists, queue timers, and estimated loading times.</Typography>
        </div>
        <span className="signal-pill">{filteredQueue.length} active</span>
      </div>

      {/* Filters (Phase 3) */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <TextField 
          label="Search Queue" 
          placeholder="Search Token, Plate, Driver..." 
          fullWidth 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          InputProps={{
            startAdornment: <SearchIcon className="text-slate-400 mr-2" fontSize="small" />
          }}
        />
        <TextField 
          select 
          label="Status Filter" 
          fullWidth 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          InputProps={{
            startAdornment: <FilterListIcon className="text-slate-400 mr-2" fontSize="small" />
          }}
        >
          <MenuItem value="All">All Active Statuses</MenuItem>
          <MenuItem value="Reported">Reported</MenuItem>
          <MenuItem value="Gate In">Gate In</MenuItem>
          <MenuItem value="Waiting">Waiting</MenuItem>
          <MenuItem value="Reserved">Reserved</MenuItem>
          <MenuItem value="Dock In">Dock In</MenuItem>
          <MenuItem value="Processing">Processing</MenuItem>
        </TextField>
      </div>

      {/* Queue Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="!text-slate-400">Token</TableCell>
              <TableCell className="!text-slate-400">Vehicle Number</TableCell>
              <TableCell className="!text-slate-400">Priority Level</TableCell>
              <TableCell className="!text-slate-400">Cargo Type</TableCell>
              <TableCell className="!text-slate-400">Status</TableCell>
              <TableCell className="!text-slate-400">Waiting Duration</TableCell>
              <TableCell className="!text-slate-400">Est. Wait Time</TableCell>
              <TableCell className="!text-slate-400">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQueue.map((item, index) => (
              <TableRow key={item.id} hover>
                <TableCell className="!font-semibold !text-sky-600 font-mono">{item.token}</TableCell>
                <TableCell className="!text-slate-800 font-bold font-sans">{item.vehicle_number}</TableCell>
                <TableCell>
                  <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                    item.priority_level === "Critical" ? "bg-rose-100 text-rose-700" :
                    item.priority_level === "Urgent" ? "bg-amber-100 text-amber-700" :
                    "bg-slate-100 text-slate-700"
                  }`}>
                    {item.priority_level} (Score: {item.priority_score})
                  </span>
                </TableCell>
                <TableCell className="!text-slate-550 font-medium">{item.material_type}</TableCell>
                <TableCell><span className="signal-pill">{item.status}</span></TableCell>
                <TableCell>
                  <span className={`rounded-full border px-3 py-0.5 text-xs ${getThresholdPillColor(item.waiting_minutes)}`}>
                    {item.waiting_minutes} mins
                  </span>
                </TableCell>
                <TableCell className="!text-slate-550 font-bold font-mono">
                  {item.status === "Processing" ? "Docked" : `${getEstWaitTime(item, index)} mins`}
                </TableCell>
                <TableCell>{renderActions(item)}</TableCell>
              </TableRow>
            ))}
            {filteredQueue.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center !py-8 text-slate-400 font-medium">
                  No matching vehicles currently waiting in the yard queue.
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
