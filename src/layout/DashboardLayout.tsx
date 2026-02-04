import { Box } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box display="flex" height="100vh" width="100vw" overflow="hidden">
      <Sidebar collapsed={collapsed} />

      <Box flex={1} display="flex" flexDirection="column" minWidth={0}>
        <Header
          collapsed={collapsed}
          onToggle={() => setCollapsed((p) => !p)}
        />

        <Box flex={1} px={2} pb={2} pt={10} overflow="auto">
          <Outlet />
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
