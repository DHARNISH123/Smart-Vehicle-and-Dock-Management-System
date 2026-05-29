import { useEffect, useState } from "react";
import axios from "axios";
import { Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("auth_token")}` });

function VehicleTracking() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/vehicles", { headers: authHeaders() }).then((res) => setVehicles(res.data));
  }, []);

  return (
    <Paper className="surface-panel rounded-xl p-6 text-slate-950">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h5" className="!font-semibold !text-slate-950">Vehicle Tracking</Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-400">End-to-end vehicle status history.</Typography>
        </div>
        <span className="signal-pill">{vehicles.length} records</span>
      </div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="!text-slate-400">Token</TableCell>
              <TableCell className="!text-slate-400">Vehicle</TableCell>
              <TableCell className="!text-slate-400">Status</TableCell>
              <TableCell className="!text-slate-400">Reported At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="!font-semibold !text-sky-600">{vehicle.token}</TableCell>
                <TableCell className="!text-slate-950">{vehicle.vehicle_number}</TableCell>
                <TableCell><span className="signal-pill">{vehicle.status}</span></TableCell>
                <TableCell className="!text-slate-600">{new Date(vehicle.report_time).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default VehicleTracking;
