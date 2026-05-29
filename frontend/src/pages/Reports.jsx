import { useEffect, useState } from "react";
import axios from "axios";
import { Paper, Typography, Grid } from "@mui/material";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("auth_token")}` });

function Reports() {
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/reports/kpis", { headers: authHeaders() }).then((res) => setKpis(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h5" className="!font-semibold !text-slate-950">Reports & KPIs</Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-400">Operational performance signals for the yard.</Typography>
        </div>
        <span className="signal-pill">Performance</span>
      </div>
      <Grid container spacing={3}>
        {[
          { label: "Total Vehicles", value: kpis?.total_vehicles ?? "-" },
          { label: "Completed", value: kpis?.completed_vehicles ?? "-" },
          { label: "On-time %", value: kpis?.on_time_percentage ?? "-" },
          { label: "Dock Utilization", value: kpis?.dock_utilization ?? "-" },
        ].map((item) => (
          <Grid item xs={12} md={3} key={item.label}>
            <Paper className="surface-panel rounded-xl p-5 text-slate-950">
              <Typography variant="subtitle2" className="!text-slate-400">{item.label}</Typography>
              <Typography variant="h4" className="!mt-3 !font-semibold !text-slate-950">{item.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper className="surface-panel rounded-xl p-6 text-slate-950">
        <Typography variant="h6" className="!font-semibold !text-slate-950">Signal Summary</Typography>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {["Throughput", "Completion", "Dock load"].map((item) => (
            <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <span className="status-dot bg-sky-500" />
              <p className="mt-3 text-sm font-medium text-slate-950">{item}</p>
              <p className="mt-1 text-xs text-slate-400">Connected to live backend KPI data.</p>
            </div>
          ))}
        </div>
      </Paper>
    </div>
  );
}

export default Reports;
