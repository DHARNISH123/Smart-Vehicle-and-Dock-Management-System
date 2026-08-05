import { useEffect, useState } from "react";
import api from "../api";
import { 
  Paper, Typography, Tabs, Tab, Box, Button, TableContainer, Table, TableHead, 
  TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, Select, InputLabel, FormControl, Grid, IconButton 
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

function Masters() {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [priority, setPriority] = useState("");
  const [contact, setContact] = useState("");
  const [capabilities, setCapabilities] = useState("All");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("operator");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const tabEndpoints = [
    "suppliers",
    "transporters",
    "docks",
    "materials",
    "users",
    "audit-logs"
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/masters/${tabEndpoints[activeTab]}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleOpenAdd = () => {
    setEditId(null);
    setName("");
    setCode("");
    setPriority("");
    setContact("");
    setCapabilities("All");
    setUsername("");
    setPassword("");
    setRole("operator");
    setFullName("");
    setEmail("");
    setMobile("");
    setOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditId(item.id);
    setName(item.name || "");
    setCode(item.code || "");
    setPriority(item.priority || "");
    setContact(item.contact || "");
    setCapabilities(item.capabilities || item.dock_capabilities || "All");
    setUsername(item.username || "");
    setPassword("");
    setRole(item.role || "operator");
    setFullName(item.full_name || "");
    setEmail(item.email || "");
    setMobile(item.mobile || "");
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`/masters/${tabEndpoints[activeTab]}/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete record");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {};
    const endpoint = `/masters/${tabEndpoints[activeTab]}`;
    
    if (activeTab === 0) { // Suppliers
      payload.name = name;
      payload.priority = priority;
    } else if (activeTab === 1) { // Transporters
      payload.name = name;
      payload.contact = contact;
    } else if (activeTab === 2) { // Docks
      payload.code = code;
      payload.name = name;
      payload.capabilities = capabilities;
    } else if (activeTab === 3) { // Materials
      payload.code = code;
      payload.name = name;
      payload.dock_capabilities = capabilities;
    } else if (activeTab === 4) { // Users
      payload.username = username;
      payload.password = password;
      payload.role = role;
      payload.full_name = fullName;
      payload.email = email;
      payload.mobile = mobile;
    }

    try {
      if (editId) {
        await api.put(`${endpoint}/${editId}`, payload);
      } else {
        await api.post(endpoint, payload);
      }
      setOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Error saving master record");
    }
  };

  return (
    <Paper className="surface-panel rounded-xl p-6 text-slate-950">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h5" className="!font-semibold !text-slate-950">System Masters Control Panel</Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-400">Manage suppliers, transporters, loading dock capabilities, cargo materials, and system accounts.</Typography>
        </div>
        {activeTab !== 5 && (
          <Button variant="contained" startIcon={<AddIcon />} className="!rounded-lg !bg-sky-500 !px-4 !py-2 hover:!bg-sky-600 shadow-md" onClick={handleOpenAdd}>
            Add New Record
          </Button>
        )}
      </div>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} variant="scrollable" scrollButtons="auto">
          <Tab label="Suppliers" className="!font-semibold" />
          <Tab label="Transporters" className="!font-semibold" />
          <Tab label="Loading Docks" className="!font-semibold" />
          <Tab label="Materials" className="!font-semibold" />
          <Tab label="Users & Roles" className="!font-semibold" />
          <Tab label="Audit Logs" className="!font-semibold" />
        </Tabs>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {activeTab === 0 && ( // Suppliers
                <>
                  <TableCell className="!text-slate-400">Supplier Name</TableCell>
                  <TableCell className="!text-slate-400">Priority Weight</TableCell>
                  <TableCell className="!text-slate-400">Actions</TableCell>
                </>
              )}
              {activeTab === 1 && ( // Transporters
                <>
                  <TableCell className="!text-slate-400">Transporter Name</TableCell>
                  <TableCell className="!text-slate-400">Contact Number</TableCell>
                  <TableCell className="!text-slate-400">Actions</TableCell>
                </>
              )}
              {activeTab === 2 && ( // Docks
                <>
                  <TableCell className="!text-slate-400">Dock Code</TableCell>
                  <TableCell className="!text-slate-400">Dock Name</TableCell>
                  <TableCell className="!text-slate-400">Capabilities</TableCell>
                  <TableCell className="!text-slate-400">Status</TableCell>
                  <TableCell className="!text-slate-400">Actions</TableCell>
                </>
              )}
              {activeTab === 3 && ( // Materials
                <>
                  <TableCell className="!text-slate-400">Material Code</TableCell>
                  <TableCell className="!text-slate-400">Description</TableCell>
                  <TableCell className="!text-slate-400">Compatible Docks</TableCell>
                  <TableCell className="!text-slate-400">Actions</TableCell>
                </>
              )}
              {activeTab === 4 && ( // Users
                <>
                  <TableCell className="!text-slate-400">Username</TableCell>
                  <TableCell className="!text-slate-400">Full Name</TableCell>
                  <TableCell className="!text-slate-400">Role</TableCell>
                  <TableCell className="!text-slate-400">Email</TableCell>
                  <TableCell className="!text-slate-400">Actions</TableCell>
                </>
              )}
              {activeTab === 5 && ( // Audit Logs
                <>
                  <TableCell className="!text-slate-400">Timestamp</TableCell>
                  <TableCell className="!text-slate-400">Operator</TableCell>
                  <TableCell className="!text-slate-400">Action</TableCell>
                  <TableCell className="!text-slate-400">Description</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} hover>
                {activeTab === 0 && (
                  <>
                    <TableCell className="!font-bold text-slate-800">{item.name}</TableCell>
                    <TableCell>{item.priority}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenEdit(item)} color="primary"><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(item.id)} color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </>
                )}
                {activeTab === 1 && (
                  <>
                    <TableCell className="!font-bold text-slate-800">{item.name}</TableCell>
                    <TableCell>{item.contact || "N/A"}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenEdit(item)} color="primary"><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(item.id)} color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </>
                )}
                {activeTab === 2 && (
                  <>
                    <TableCell className="!font-mono font-bold text-sky-600">{item.code}</TableCell>
                    <TableCell className="!font-bold text-slate-800">{item.name}</TableCell>
                    <TableCell><span className="signal-pill">{item.capabilities}</span></TableCell>
                    <TableCell>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${item.is_active ? "border-emerald-300 bg-emerald-50 text-emerald-600" : "border-rose-300 bg-rose-50 text-rose-600"}`}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenEdit(item)} color="primary"><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(item.id)} color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </>
                )}
                {activeTab === 3 && (
                  <>
                    <TableCell className="!font-mono font-bold text-indigo-600">{item.code}</TableCell>
                    <TableCell className="!font-bold text-slate-800">{item.name}</TableCell>
                    <TableCell><span className="signal-pill">{item.dock_capabilities}</span></TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenEdit(item)} color="primary"><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(item.id)} color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </>
                )}
                {activeTab === 4 && (
                  <>
                    <TableCell className="!font-bold text-slate-800">{item.username}</TableCell>
                    <TableCell>{item.full_name || "N/A"}</TableCell>
                    <TableCell><span className="signal-pill uppercase">{item.role}</span></TableCell>
                    <TableCell>{item.email || "N/A"}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenEdit(item)} color="primary"><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(item.id)} color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </>
                )}
                {activeTab === 5 && (
                  <>
                    <TableCell className="!font-mono text-xs text-slate-400">
                      {new Date(item.timestamp).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="!font-bold text-slate-800">{item.operator}</TableCell>
                    <TableCell><span className="signal-pill">{item.action}</span></TableCell>
                    <TableCell className="italic text-slate-600">{item.description}</TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center !py-8 text-slate-400">
                  No records found in this master table.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CRUD dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="!font-bold text-slate-850">
          {editId ? "Edit Master Record" : "Add New Master Record"}
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleSubmit} className="space-y-4 pt-2">
            {activeTab === 0 && ( // Suppliers
              <>
                <TextField label="Supplier Name" fullWidth required value={name} onChange={(e) => setName(e.target.value)} />
                <TextField label="Priority Weight" type="number" fullWidth required value={priority} onChange={(e) => setPriority(e.target.value)} />
              </>
            )}
            {activeTab === 1 && ( // Transporters
              <>
                <TextField label="Transporter Name" fullWidth required value={name} onChange={(e) => setName(e.target.value)} />
                <TextField label="Contact Number" fullWidth value={contact} onChange={(e) => setContact(e.target.value)} />
              </>
            )}
            {activeTab === 2 && ( // Docks
              <>
                <TextField label="Dock Code (e.g. Dock-7)" fullWidth required value={code} onChange={(e) => setCode(e.target.value)} />
                <TextField label="Dock Name" fullWidth required value={name} onChange={(e) => setName(e.target.value)} />
                <FormControl fullWidth>
                  <InputLabel>Capabilities</InputLabel>
                  <Select value={capabilities} label="Capabilities" onChange={(e) => setCapabilities(e.target.value)}>
                    <MenuItem value="All">All Docks</MenuItem>
                    <MenuItem value="Perishable">Perishable Goods</MenuItem>
                    <MenuItem value="Hazardous">Hazardous Materials</MenuItem>
                    <MenuItem value="High Value">High Value Electronics</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            {activeTab === 3 && ( // Materials
              <>
                <TextField label="Material Code" fullWidth required value={code} onChange={(e) => setCode(e.target.value)} />
                <TextField label="Material Description" fullWidth required value={name} onChange={(e) => setName(e.target.value)} />
                <FormControl fullWidth>
                  <InputLabel>Compatible Dock Type</InputLabel>
                  <Select value={capabilities} label="Compatible Dock Type" onChange={(e) => setCapabilities(e.target.value)}>
                    <MenuItem value="All">All Docks</MenuItem>
                    <MenuItem value="Perishable">Perishable Docks</MenuItem>
                    <MenuItem value="Hazardous">Hazardous Docks</MenuItem>
                    <MenuItem value="High Value">High Value Docks</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            {activeTab === 4 && ( // Users
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Username" fullWidth required disabled={!!editId} value={username} onChange={(e) => setUsername(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Password" type="password" fullWidth required={!editId} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={editId ? "Leave blank to keep same" : ""} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>System Role</InputLabel>
                    <Select value={role} label="System Role" onChange={(e) => setRole(e.target.value)}>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="gate_operator">Gate Operator</MenuItem>
                      <MenuItem value="dock_supervisor">Dock Supervisor</MenuItem>
                      <MenuItem value="warehouse">Warehouse User</MenuItem>
                      <MenuItem value="management">Management Viewer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Full Name" fullWidth value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Mobile Number" fullWidth value={mobile} onChange={(e) => setMobile(e.target.value)} />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit" className="!font-semibold">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" className="!font-semibold">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default Masters;
