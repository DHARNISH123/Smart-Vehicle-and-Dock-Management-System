import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const navItems = [
  { label: "Dashboard", path: "/", icon: DashboardIcon, roles: ["admin", "gate_operator", "dock_supervisor", "warehouse", "management"] },
  { label: "Gate Entry", path: "/gate-entry", icon: LocalShippingIcon, roles: ["admin", "gate_operator"] },
  { label: "Dock Status", path: "/dock-management", icon: WarehouseIcon, roles: ["admin", "dock_supervisor"] },
  { label: "Queue", path: "/vehicle-queue", icon: LocalOfferOutlinedIcon, roles: ["admin", "gate_operator", "dock_supervisor"] },
  { label: "Tracking", path: "/vehicle-tracking", icon: Inventory2OutlinedIcon, roles: ["admin", "warehouse", "gate_operator", "dock_supervisor", "management"] },
  { label: "Reports", path: "/reports", icon: AssessmentIcon, roles: ["admin", "management"] },
  { label: "Masters", path: "/masters", icon: SettingsIcon, roles: ["admin"] },
  { label: "Display Board", path: "/display-board", icon: BarChartOutlinedIcon, roles: ["admin", "gate_operator", "dock_supervisor", "warehouse", "management"] },
];

function Layout() {
  const navigate = useNavigate();
  
  const userRole = localStorage.getItem("user_role") || "operator";
  const userName = localStorage.getItem("user_name") || "System User";

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    navigate("/login");
  };

  // Filter nav items based on current role (Phase 10)
  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="fixed left-0 right-0 top-0 z-30 flex h-[60px] items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-sky-500 text-sm font-black text-white">
            G2D
          </div>
          <h1 className="text-xl font-semibold text-slate-950 font-sans tracking-wide">Gate-2-Dock</h1>
        </div>
        <div className="flex items-center gap-7">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-950">{userName}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{userRole.replace("_", " ")}</p>
          </div>
          <Button
            variant="contained"
            startIcon={<ExitToAppIcon />}
            onClick={logout}
            className="!rounded !bg-red-500 !px-5 !py-2.5 !font-bold !normal-case hover:!bg-red-600 shadow-sm"
          >
            Logout
          </Button>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-[60px] z-20 hidden w-16 border-r border-slate-200 bg-white pt-7 shadow-sm md:block">
        <div className="mb-12 flex justify-center text-slate-400">
          <ChevronRightIcon />
        </div>
        <nav className="space-y-5">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                title={item.label}
                className={({ isActive }) =>
                  `mx-auto flex h-12 w-14 items-center justify-center rounded-lg transition ${
                    isActive ? "bg-sky-50 text-sky-600" : "text-slate-400 hover:bg-slate-50 hover:text-sky-600"
                  }`
                }
              >
                <Icon />
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex gap-1 overflow-x-auto border-t border-slate-200 bg-white p-2 md:hidden">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex min-w-16 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
                  isActive ? "bg-sky-50 text-sky-600" : "text-slate-400"
                }`
              }
            >
              <Icon fontSize="small" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <main className="min-h-screen px-5 pb-24 pt-[100px] md:ml-16 md:px-10 md:pb-10">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
