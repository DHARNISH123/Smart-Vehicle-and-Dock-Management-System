import { useEffect, useState } from "react";
import api from "../api";
import { Paper, Typography, Grid, Button, TextField, MenuItem, Divider } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AssessmentIcon from "@mui/icons-material/Assessment";

function Reports() {
  const [kpis, setKpis] = useState(null);
  const [reportType, setReportType] = useState("Daily");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    api.get("/reports/kpis").then((res) => setKpis(res.data)).catch(console.error);
  }, []);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const response = await api.get("/reports/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType.toLowerCase()}_vehicle_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export report CSV.");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h5" className="!font-bold !text-slate-800 font-sans">Operational Reports & KPIs</Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-400 font-medium">Export yard performance summaries, supplier delay audits, and turnaround metrics.</Typography>
        </div>
        <span className="signal-pill">KPI Center</span>
      </div>

      {/* KPI stats */}
      <Grid container spacing={3}>
        {[
          { label: "Total Vehicles Logged", value: kpis?.total_vehicles ?? "-" },
          { label: "Completed Shipments", value: kpis?.completed_vehicles ?? "-" },
          { label: "On-Time Completion Rate", value: kpis ? `${kpis.on_time_percentage}%` : "-" },
          { label: "Active Docks Occupied", value: kpis?.dock_utilization ?? "-" },
        ].map((item) => (
          <Grid item xs={12} md={3} key={item.label}>
            <Paper className="surface-panel rounded-xl p-5 border border-slate-100 shadow-sm bg-white">
              <Typography variant="subtitle2" className="text-slate-450 font-bold uppercase tracking-wide">{item.label}</Typography>
              <Typography variant="h4" className="!mt-3 !font-extrabold text-slate-800">{item.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Reports configuration */}
      <Paper className="surface-panel rounded-xl p-6 border border-slate-100 shadow-sm bg-white space-y-6">
        <div>
          <Typography variant="h6" className="!font-bold text-slate-800">Generate Master Reports</Typography>
          <Typography variant="body2" className="text-slate-450 mt-1">Select report type and date ranges to compile historical audit logs.</Typography>
        </div>
        <Divider />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField select label="Report Classification" fullWidth value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <MenuItem value="Daily">Daily Operational Report</MenuItem>
              <MenuItem value="Weekly">Weekly Summary Report</MenuItem>
              <MenuItem value="Monthly">Monthly Analytics Report</MenuItem>
              <MenuItem value="Supplier">Supplier Performance Report</MenuItem>
              <MenuItem value="Transporter">Transporter Delay Report</MenuItem>
              <MenuItem value="Exceptions">Exceptions & Cancellations Report</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2} className="flex items-center">
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />} 
              fullWidth 
              onClick={handleExport}
              disabled={exportLoading}
              className="!h-14 !rounded-lg !bg-sky-500 hover:!bg-sky-600 !font-bold !normal-case shadow-sm"
            >
              {exportLoading ? "Compiling..." : "Export CSV"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Overview summaries */}
      <Paper className="surface-panel rounded-xl p-6 border border-slate-100 shadow-sm bg-white">
        <Typography variant="h6" className="!font-bold text-slate-800 mb-5">VMS Summary Guidelines</Typography>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Throughput KPI", text: "Measures daily vehicle inflow/outflow count, bottleneck logs, and gate registration timings." },
            { title: "Turnaround Time (TAT)", text: "Calculates the total duration elapsed from vehicle reported timestamp until gate out exit." },
            { title: "Exceptions Audits", text: "Logs vehicle cancellations, dock capability mismatches, and operator override actions." }
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-slate-100 bg-slate-50/50 p-5 shadow-inner">
              <div className="flex items-center gap-2 text-sky-600">
                <AssessmentIcon fontSize="small" />
                <Typography variant="subtitle2" className="!font-bold text-slate-800">{item.title}</Typography>
              </div>
              <Typography variant="body2" className="mt-3 text-slate-500 font-medium leading-relaxed">{item.text}</Typography>
            </div>
          ))}
        </div>
      </Paper>
    </div>
  );
}

export default Reports;
