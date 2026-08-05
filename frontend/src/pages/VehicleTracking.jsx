import { useEffect, useState } from "react";
import api from "../api";
import { Paper, Typography, TextField, Grid, Box, List, ListItem, ListItemText, Divider, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TimelineIcon from "@mui/icons-material/Timeline";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

function VehicleTracking() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/vehicles")
      .then((res) => {
        setVehicles(res.data);
        if (res.data.length > 0) {
          setSelectedVehicle(res.data[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      setLogsLoading(true);
      api.get(`/vehicles/${selectedVehicle.id}/logs`)
        .then((res) => {
          setLogs(res.data);
          setLogsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLogsLoading(false);
        });
    }
  }, [selectedVehicle]);

  const filteredVehicles = vehicles.filter(v => 
    v.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.driver_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box className="flex h-96 items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h5" className="!font-bold !text-slate-800 font-sans">Vehicle Tracking timeline</Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-400 font-medium">Chronological vehicle audit logs, timelines, and operators history.</Typography>
        </div>
        <span className="signal-pill">Real-time tracking</span>
      </div>

      <Grid container spacing={3}>
        {/* Left Side: Vehicle List */}
        <Grid item xs={12} md={4}>
          <Paper className="surface-panel rounded-xl p-5 border border-slate-100 shadow-sm bg-white min-h-[500px]">
            <TextField 
              placeholder="Search Plate, Token..." 
              fullWidth 
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon className="text-slate-400 mr-2" fontSize="small" />
              }}
              className="mb-4"
            />
            <Typography variant="subtitle2" className="text-slate-450 font-bold mb-3 uppercase tracking-wide">Vehicles in System</Typography>
            <Divider className="mb-2" />
            <List className="max-h-[400px] overflow-y-auto pr-1">
              {filteredVehicles.map((v) => (
                <ListItem 
                  button 
                  key={v.id} 
                  selected={selectedVehicle?.id === v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className={`!rounded-lg !mb-2 border transition-all ${
                    selectedVehicle?.id === v.id ? "!bg-sky-50/50 !border-sky-300" : "border-slate-100 hover:!bg-slate-50/70"
                  }`}
                >
                  <ListItemText 
                    primary={<Typography className="!font-bold text-slate-850">{v.vehicle_number}</Typography>} 
                    secondary={
                      <span className="text-xs text-slate-500 font-medium mt-1 block">
                        Token: {v.token} | <span className="text-sky-600 font-bold">{v.status}</span>
                      </span>
                    } 
                  />
                  <ArrowForwardIosIcon fontSize="inherit" className="text-slate-400" />
                </ListItem>
              ))}
              {filteredVehicles.length === 0 && (
                <Typography className="text-center text-slate-400 py-6 text-sm italic font-medium">No matching vehicles found</Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Right Side: Timeline Details */}
        <Grid item xs={12} md={8}>
          {selectedVehicle ? (
            <Paper className="surface-panel rounded-xl p-6 border border-slate-100 shadow-sm bg-white min-h-[500px] space-y-6">
              {/* Vehicle Header Details */}
              <div className="flex flex-wrap justify-between items-start border-b border-slate-100 pb-5 gap-3">
                <div>
                  <Typography variant="h5" className="!font-black text-slate-800">{selectedVehicle.vehicle_number}</Typography>
                  <Typography variant="body2" className="text-slate-450 font-bold mt-1">
                    Token Gate Pass: <span className="font-mono text-sky-600">{selectedVehicle.token}</span>
                  </Typography>
                </div>
                <div className="text-right">
                  <span className="rounded-full border border-sky-300 bg-sky-50 px-3.5 py-1 text-xs font-bold text-sky-600">
                    {selectedVehicle.status}
                  </span>
                  <Typography variant="caption" className="text-slate-400 block mt-2 font-medium">
                    Operator: {selectedVehicle.gate_operator || "System"}
                  </Typography>
                </div>
              </div>

              {/* Metadata Cards */}
              <Grid container spacing={2}>
                {[
                  { label: "Driver Name", val: selectedVehicle.driver_name },
                  { label: "Driver Mobile", val: selectedVehicle.driver_mobile },
                  { label: "Material Type", val: selectedVehicle.material_type },
                  { label: "Direction", val: selectedVehicle.direction || "Inbound" },
                  { label: "Priority", val: selectedVehicle.priority_level || "Normal" },
                  { label: "RFID tag", val: selectedVehicle.rfid_tag || "Not scanned" },
                  { label: "Supplier", val: selectedVehicle.supplier || "N/A" },
                  { label: "Transporter", val: selectedVehicle.transporter || "N/A" },
                ].map((meta) => (
                  <Grid item xs={12} sm={6} md={3} key={meta.label}>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100/50">
                      <Typography variant="caption" className="text-slate-400 font-bold block uppercase tracking-wide">{meta.label}</Typography>
                      <Typography variant="body2" className="font-bold text-slate-700 mt-1 truncate">{meta.val}</Typography>
                    </div>
                  </Grid>
                ))}
              </Grid>

              {/* Timeline (Phase 6) */}
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-6">
                  <TimelineIcon className="text-sky-600" />
                  <Typography variant="h6" className="!font-bold text-slate-800">Movement History Timeline</Typography>
                </div>

                {logsLoading ? (
                  <div className="flex justify-center py-10"><CircularProgress size={30} /></div>
                ) : (
                  <div className="relative border-l border-slate-200 ml-3 space-y-8 pb-4">
                    {logs.map((log, index) => (
                      <div key={log.id} className="relative pl-7">
                        {/* Timeline Circle Node */}
                        <div className="absolute -left-2.5 top-1.5 h-5 w-5 rounded-full border-4 border-white bg-sky-500 shadow-sm" />
                        
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Typography variant="body2" className="!font-extrabold text-slate-850">{log.status}</Typography>
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              {new Date(log.timestamp).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "short" })}
                            </span>
                          </div>
                          <Typography variant="body2" className="text-slate-500 mt-1 italic font-medium">
                            {log.notes || "Transition recorded"}
                          </Typography>
                        </div>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <Typography className="text-slate-400 italic font-medium pl-4 py-2">No historical logs registered for this vehicle.</Typography>
                    )}
                  </div>
                )}
              </div>
            </Paper>
          ) : (
            <Paper className="surface-panel rounded-xl p-6 border border-slate-100 shadow-sm bg-white flex flex-col items-center justify-center min-h-[500px] text-slate-400">
              <TimelineIcon fontSize="large" className="mb-2" />
              <Typography className="font-semibold">Select a vehicle from the list to view its tracking timeline</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </div>
  );
}

export default VehicleTracking;
