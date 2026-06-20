import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashLayout from "@/layouts/DashLayout";

import HomePage from "../pages/Home";
import AboutPage from "../pages/About";
import ContactPage from "../pages/Contact";
import PricingPage from "../pages/Pricing";

import LoginPage from "@/pages/Auth/Login";
import RegisterPage from "@/pages/Auth/Register";
import RoleSelectionPage from "@/pages/RoleSelectionPage";

import DashboardPage from "@/pages/Dashboard";
import ShiftsPage from "@/pages/Shifts";
import SupportPage from "@/pages/Support";
import ProfilePage from "@/pages/Profile";
import EmployeePage from "@/pages/Employee";
import PageEmployee from "@/pages/EmployeePage";
import NewShiftPage from "@/components/Dashboard/shifts/CreateShiftModal";
import NewEmployeePage from "@/components/Dashboard/Employee/CreateEmployee";

import NotFoundPage from "@/pages/404";

// Route Guards
import PublicRoute from "./PublicRoutes";
import EmployeeRoute from "./EmployeeRoute";
import ManagerRoute from "./ManagerRoute";
import LinkEmployeePage from "@/components/Dashboard/Employee/LinkEmployeePage";

const AppRoutes = () => (
  <Routes>

    {/* 1️⃣ Public Info Routes (Only visible to guests) */}
    <Route
      element={
        <PublicRoute>
          <MainLayout />
        </PublicRoute>
      }
    >
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/pricing" element={<PricingPage />} />
    </Route>

    {/* 2️⃣ Auth Routes (Guest Only) */}
    <Route
      path="/login"
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      }
    />
    <Route
      path="/register"
      element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      }
    />
    <Route
      path="/manager/register"
      element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      }
    />
    <Route
      path="/employee/register"
      element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      }
    />
    <Route path="/role-selector" element={<RoleSelectionPage />} />

    {/* 3️⃣ Manager Routes */}
    <Route
      element={
        <ManagerRoute>
          <DashLayout />
        </ManagerRoute>
      }
    >
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/shifts" element={<ShiftsPage />} />
      <Route path="/shifts/new" element={<NewShiftPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/employee" element={<EmployeePage />} />
      <Route path="/employee/new" element={<NewEmployeePage />} />
      <Route path="/employee/link" element={<LinkEmployeePage/>} />
    </Route>

    {/* 4️⃣ Employee Routes */}
    <Route
      path="/employee-page"
      element={
        <EmployeeRoute>
          <PageEmployee />
        </EmployeeRoute>
      }
    />

    {/* 5️⃣ Not Found */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
