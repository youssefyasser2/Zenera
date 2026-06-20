// src/layouts/DashLayout.tsx
import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import DashNavbar from "@/components/layout/DashNavbar";
import DashSidebar from "@/components/layout/DashSidebar";

const DashLayout = () => {
  return (
    <Box display="flex" minH="100vh" bg="#F7F9FC">
      <DashSidebar />
      <Box flex="1" display="flex" flexDirection="column">
        <DashNavbar />
        <Box flex="1" p={8} overflowY="auto">
          <Outlet /> 
        </Box>
      </Box>
    </Box>
  );
};

export default DashLayout;