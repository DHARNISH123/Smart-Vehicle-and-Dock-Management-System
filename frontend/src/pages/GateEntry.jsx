import { useEffect, useState } from "react";
import axios from "axios";
import { TextField, Button, MenuItem, Typography, Paper, Box, Grid } from "@mui/material";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("auth_token")}` });

function GateEntry() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverMobile, setDriverMobile] = useState("");
  const [materialType, setMaterialType] = useState("Perishable");
  const [supplierId, setSupplierId] = useState("");
  const [transporterId, setTransporterId] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [transporters, setTransporters] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/vehicles/suppliers", { headers: authHeaders() }).then((res) => setSuppliers(res.data));
    axios.get("http://localhost:5000/api/vehicles/transporters", { headers: authHeaders() }).then((res) => setTransporters(res.data));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/vehicles/entry",
        { vehicle_number: vehicleNumber, driver_name: driverName, driver_mobile: driverMobile, material_type: materialType, supplier_id: supplierId, transporter_id: transporterId },
        { headers: authHeaders() }
      );
      setMessage(`Vehicle registered. Token ${response.data.vehicle.token}`);
    } catch (err) {
      setMessage(err.response?.data?.error || "Could not register vehicle.");
    }
  };

  return (
    <Paper className="surface-panel rounded-xl p-6 text-slate-950">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h5" className="!font-semibold !text-slate-950">Gate Entry</Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-400">Create a vehicle token and feed the live queue.</Typography>
        </div>
        <span className="signal-pill">Intake</span>
      </div>
      <Box component="form" onSubmit={handleSubmit} className="space-y-5">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><TextField label="Vehicle Number" fullWidth value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} /></Grid>
          <Grid item xs={12} md={6}><TextField label="Driver Name" fullWidth value={driverName} onChange={(e) => setDriverName(e.target.value)} /></Grid>
          <Grid item xs={12} md={6}><TextField label="Driver Mobile" fullWidth value={driverMobile} onChange={(e) => setDriverMobile(e.target.value)} /></Grid>
          <Grid item xs={12} md={6}><TextField select label="Material Type" fullWidth value={materialType} onChange={(e) => setMaterialType(e.target.value)}>{["Perishable","Hazardous","High Value","Default"].map((type) => (<MenuItem key={type} value={type}>{type}</MenuItem>))}</TextField></Grid>
          <Grid item xs={12} md={6}><TextField select label="Supplier" fullWidth value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>{suppliers.map((supplier) => (<MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>))}</TextField></Grid>
          <Grid item xs={12} md={6}><TextField select label="Transporter" fullWidth value={transporterId} onChange={(e) => setTransporterId(e.target.value)}>{transporters.map((transporter) => (<MenuItem key={transporter.id} value={transporter.id}>{transporter.name}</MenuItem>))}</TextField></Grid>
        </Grid>
        <Button type="submit" variant="contained" className="!rounded !bg-sky-500 !px-6 !py-2.5 !font-semibold !normal-case hover:!bg-sky-600">Submit Entry</Button>
      </Box>
      {message && <Typography className="!mt-5 !rounded-lg !border !border-slate-200 !bg-sky-50 !p-4 !text-slate-700">{message}</Typography>}
    </Paper>
  );
}

export default GateEntry;
