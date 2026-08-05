import { useEffect, useState } from "react";
import api from "../api";
import { TextField, Button, MenuItem, Typography, Paper, Box, Grid, CircularProgress, Card, CardContent } from "@mui/material";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import NfcIcon from "@mui/icons-material/Nfc";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

function GateEntry() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverMobile, setDriverMobile] = useState("");
  const [materialType, setMaterialType] = useState("Perishable");
  const [supplierId, setSupplierId] = useState("");
  const [transporterId, setTransporterId] = useState("");
  const [direction, setDirection] = useState("Inbound");
  const [priorityLevel, setPriorityLevel] = useState("Normal");
  const [expectedLoadingTime, setExpectedLoadingTime] = useState("");
  const [remarks, setRemarks] = useState("");
  
  // Smart Integration Placeholders (Simulation)
  const [rfidTag, setRfidTag] = useState("");
  const [anprLicensePlate, setAnprLicensePlate] = useState("");
  const [qrCode, setQrCode] = useState("");
  
  // Scanner state
  const [anprScanning, setAnprScanning] = useState(false);
  const [rfidScanning, setRfidScanning] = useState(false);
  
  const [suppliers, setSuppliers] = useState([]);
  const [transporters, setTransporters] = useState([]);
  const [message, setMessage] = useState("");
  const [tokenGenerated, setTokenGenerated] = useState("");

  useEffect(() => {
    api.get("/vehicles/suppliers").then((res) => setSuppliers(res.data)).catch(console.error);
    api.get("/vehicles/transporters").then((res) => setTransporters(res.data)).catch(console.error);
  }, []);

  const simulateANPR = () => {
    setAnprScanning(true);
    setTimeout(() => {
      const plates = ["TN55CB7077", "MH12PQ4567", "DL03XY8901", "KA05AB9999", "HR26ZT1234"];
      const selected = plates[Math.floor(Math.random() * plates.length)];
      setAnprLicensePlate(selected);
      setVehicleNumber(selected);
      setAnprScanning(false);
    }, 1200);
  };

  const simulateRFID = () => {
    setRfidScanning(true);
    setTimeout(() => {
      const hex = "RFID-" + Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
      setRfidTag(hex);
      setRfidScanning(false);
    }, 1000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post(
        "/vehicles/entry",
        { 
          vehicle_number: vehicleNumber, 
          driver_name: driverName, 
          driver_mobile: driverMobile, 
          material_type: materialType, 
          supplier_id: supplierId, 
          transporter_id: transporterId,
          direction,
          priority_level: priorityLevel,
          expected_loading_time: expectedLoadingTime,
          remarks,
          rfid_tag: rfidTag,
          qr_code: qrCode || `QR-${vehicleNumber}-${Date.now().toString().slice(-4)}`,
          anpr_license_plate: anprLicensePlate
        }
      );
      const tkn = response.data.vehicle.token;
      setTokenGenerated(tkn);
      setQrCode(`QR-${tkn}`);
      setMessage(`Vehicle registered. Token ${tkn}`);
      // Clear form except placeholders
      setVehicleNumber("");
      setDriverName("");
      setDriverMobile("");
      setExpectedLoadingTime("");
      setRemarks("");
    } catch (err) {
      setMessage(err.response?.data?.error || "Could not register vehicle.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h5" className="!font-semibold !text-slate-950">Gate Entry Control</Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-400">Digitize inbound/outbound vehicle metadata and assign tokens.</Typography>
        </div>
        <span className="signal-pill">Intake</span>
      </div>

      <Grid container spacing={4}>
        {/* Left Column: Form */}
        <Grid item xs={12} md={8}>
          <Paper className="surface-panel rounded-xl p-6 text-slate-950 shadow-lg border border-slate-100 bg-white">
            <Typography variant="h6" className="!mb-6 !font-bold text-slate-800">Vehicle Registration Form</Typography>
            <Box component="form" onSubmit={handleSubmit} className="space-y-5">
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField label="Vehicle Number" fullWidth required value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Driver Name" fullWidth required value={driverName} onChange={(e) => setDriverName(e.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Driver Mobile" fullWidth required value={driverMobile} onChange={(e) => setDriverMobile(e.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField select label="Material Type" fullWidth value={materialType} onChange={(e) => setMaterialType(e.target.value)}>
                    {["Perishable", "Hazardous", "High Value", "Default"].map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField select label="Supplier" fullWidth required value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                    {suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField select label="Transporter" fullWidth required value={transporterId} onChange={(e) => setTransporterId(e.target.value)}>
                    {transporters.map((transporter) => (
                      <MenuItem key={transporter.id} value={transporter.id}>{transporter.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField select label="Direction" fullWidth value={direction} onChange={(e) => setDirection(e.target.value)}>
                    {["Inbound", "Outbound"].map((dir) => (
                      <MenuItem key={dir} value={dir}>{dir}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField select label="Priority Level" fullWidth value={priorityLevel} onChange={(e) => setPriorityLevel(e.target.value)}>
                    {["Normal", "Urgent", "Critical"].map((prio) => (
                      <MenuItem key={prio} value={prio}>{prio}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Expected Loading Time (Mins)" type="number" fullWidth value={expectedLoadingTime} onChange={(e) => setExpectedLoadingTime(e.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="RFID Tag Value (Simulated)" fullWidth readOnly value={rfidTag} InputProps={{ readOnly: true }} placeholder="Not scanned" />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Remarks / Special Instructions" multiline rows={3} fullWidth value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </Grid>
              </Grid>

              <div className="flex justify-end gap-3 pt-3">
                <Button type="submit" variant="contained" className="!rounded-lg !bg-sky-500 !px-8 !py-3 !font-semibold !normal-case hover:!bg-sky-600 shadow-md">
                  Submit Entry & Generate Token
                </Button>
              </div>
            </Box>
            {message && <Typography className="!mt-5 !rounded-lg !border !border-slate-200 !bg-sky-50 !p-4 !text-slate-700 font-semibold">{message}</Typography>}
          </Paper>
        </Grid>

        {/* Right Column: Hardware Simulators */}
        <Grid item xs={12} md={4}>
          <div className="space-y-6">
            {/* ANPR Camera Simulation */}
            <Card className="rounded-xl border border-slate-200 shadow-md bg-white">
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CameraAltIcon className="text-slate-650" />
                  <Typography variant="subtitle1" className="!font-bold text-slate-800">ANPR Simulator (License Plate)</Typography>
                </div>
                <Typography variant="body2" className="text-slate-450">Simulates gate camera plate capture and auto-fills registration form.</Typography>
                <div className="flex flex-col gap-2">
                  {anprLicensePlate && (
                    <div className="text-center rounded-lg border border-slate-350 bg-slate-50 py-3 font-mono text-2xl font-black text-slate-800 tracking-wider">
                      {anprLicensePlate}
                    </div>
                  )}
                  <Button variant="outlined" fullWidth onClick={simulateANPR} disabled={anprScanning} className="!normal-case !font-semibold !py-2.5">
                    {anprScanning ? <CircularProgress size={20} color="inherit" /> : "Simulate Camera Capture"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* RFID Scanner Simulation */}
            <Card className="rounded-xl border border-slate-200 shadow-md bg-white">
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <NfcIcon className="text-slate-650" />
                  <Typography variant="subtitle1" className="!font-bold text-slate-800">RFID Scanner Simulator</Typography>
                </div>
                <Typography variant="body2" className="text-slate-450">Simulates driver waving wind-shield RFID tag at the gate scanner.</Typography>
                <div className="flex flex-col gap-2">
                  {rfidTag && (
                    <div className="text-center rounded-lg border border-slate-300 bg-sky-50/50 py-3 font-mono text-lg font-bold text-sky-700">
                      {rfidTag}
                    </div>
                  )}
                  <Button variant="outlined" fullWidth onClick={simulateRFID} disabled={rfidScanning} className="!normal-case !font-semibold !py-2.5">
                    {rfidScanning ? <CircularProgress size={20} color="inherit" /> : "Simulate RFID Scan"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Token & QR Code Block */}
            {tokenGenerated && (
              <Card className="rounded-xl border border-sky-400 bg-sky-50/20 shadow-md">
                <CardContent className="text-center space-y-4">
                  <div className="flex justify-center items-center gap-2 text-sky-600">
                    <QrCode2Icon fontSize="large" />
                    <Typography variant="subtitle1" className="!font-bold">Digital Token Gate Pass</Typography>
                  </div>
                  <div className="inline-block p-4 bg-white border border-slate-200 rounded-xl">
                    {/* Simulated visual QR Code */}
                    <div className="w-32 h-32 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-800 to-slate-950 flex flex-wrap items-center justify-center p-2 rounded-lg">
                      <div className="w-full text-[9px] font-mono text-cyan-400 font-bold leading-3 break-all overflow-hidden max-h-full">
                        {qrCode}<br/>{tokenGenerated}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Typography variant="h5" className="!font-black text-slate-800">{tokenGenerated}</Typography>
                    <Typography variant="body2" className="text-slate-500 mt-1">Pass printed. Operator checked in.</Typography>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default GateEntry;
