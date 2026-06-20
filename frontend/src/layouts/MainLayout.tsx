// src/layouts/MainLayout.tsx
import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const MainLayout = () => {
  return (
    <Box display="flex" flexDirection="column" minH="100vh">
      <Navbar />

      <Box flex="1" as="main" bg="#0F1A26">
        <Outlet /> {/* This is where the nested routes will be rendered */}
      </Box>

      <Footer />
    </Box>
  );
};

export default MainLayout;
