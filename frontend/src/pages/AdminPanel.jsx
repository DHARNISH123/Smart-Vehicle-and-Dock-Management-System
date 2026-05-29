import { useEffect, useState } from "react";
import axios from "axios";
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("auth_token")}` });

function AdminPanel() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/users", { headers: authHeaders() }).then((res) => setUsers(res.data));
  }, []);

  return (
    <Paper className="surface-panel rounded-xl p-6 text-slate-950">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h5" className="!font-semibold !text-slate-950">Admin Panel</Typography>
          <Typography variant="body2" className="!mt-1 !text-slate-400">Users and operating roles.</Typography>
        </div>
        <span className="signal-pill">{users.length} users</span>
      </div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="!text-slate-400">Username</TableCell>
              <TableCell className="!text-slate-400">Full Name</TableCell>
              <TableCell className="!text-slate-400">Role</TableCell>
              <TableCell className="!text-slate-400">Email</TableCell>
              <TableCell className="!text-slate-400">Mobile</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="!font-semibold !text-sky-600">{user.username}</TableCell>
                <TableCell className="!text-slate-950">{user.full_name}</TableCell>
                <TableCell><span className="signal-pill">{user.role}</span></TableCell>
                <TableCell className="!text-slate-600">{user.email || "-"}</TableCell>
                <TableCell className="!text-slate-600">{user.mobile || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default AdminPanel;
