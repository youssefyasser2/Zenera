// src/pages/DashboardPage.tsx
"use client";

import { Box, Flex, Grid, Button, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import StatsCard from "./StatsCard";
import TrendChart from "./TrendChart";
import Calendar from "./Calendar";
import ScheduleList from "./ScheduleList";
import EmployeeTable from "./EmployeeTable";
import { toaster } from "@/components/ui/toaster";
import type {
  DashboardStats,
  Employee,
  Schedule,
} from "@/types/dashboard.types";
import { dashboardApi } from "@/services/api";

const DashboardPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Load dashboard data
  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [, empRes, schRes] = await Promise.all([
        dashboardApi.getMe(),
        dashboardApi.getUsers(),
        dashboardApi.getShifts(),
      ]);

      setStats({
        availablePositions: 24,
        jobOpen: 10,
        newEmployees: empRes.data.users.length,
        totalEmployees: empRes.data.total || 0,
        totalEmployeesTrend: 2,
        talentRequest: 16,
        talentRequestTrend: 5,
        totalEmployeesBreakdown: { men: 12, women: 4 },
        talentRequestBreakdown: { men: 6, women: 10 },
      });

      setEmployees(
        empRes.data.users.map((u: any) => ({
          id: u._id,
          name: u.name,
          avatar: `https://i.pravatar.cc/150?u=${u._id}`,
          department: u.role === "employee" ? "Engineering" : "Management",
          age: Math.floor(Math.random() * 40) + 25,
          discipline: "95%",
          status: "Permanent" as const,
        }))
      );

      setSchedules(
        schRes.data.shifts.map((s: any) => ({
          id: s._id,
          title: s.title,
          date: s.date,
          time: `${s.startTime || "09:00"} - ${s.endTime || "17:00"}`,
          priority: "Priority" as const,
        }))
      );
    } catch (error: any) {
      const msg = error.message || "Failed to connect to backend";
      setError(msg);
      toaster.create({
        title: "Connection Error",
        description: `${msg} – Check if backend is running on localhost:5000`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  /* -------------------- UI States -------------------- */

  // Loading State
  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#F7F9FC">
        <Box textAlign="center">
          <Spinner size="xl" color="blue.500" />
          <Text mt={4} fontSize="lg">
            Loading dashboard...
          </Text>
        </Box>
      </Flex>
    );
  }

  // Error State
  if (error) {
    return (
      <Flex direction="column" minH="100vh" bg="#F7F9FC">
        <Flex flex="0.6" align="center" justify="center" p={8}>
          <Box
            bg="white"
            p={9}
            borderRadius="lg"
            boxShadow="md"
            textAlign="center"
          >
            <Text color="red.500" fontWeight="bold" mb={2}>
              Connection Failed
            </Text>
            <Text color="gray.600" mb={4}>
              {error}
            </Text>
            <Button onClick={loadData} colorScheme="blue">
              Retry
            </Button>
          </Box>
        </Flex>
      </Flex>
    );
  }

  // No Data State
  if (!stats) {
    return (
      <Flex minH="100vh" bg="#F7F9FC" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  /* -------------------- Main Layout -------------------- */

  return (
    <Box flex="1" p={8} overflow="hidden" maxH="100vh">
      {/* Content Grid */}
      <Grid templateColumns={{ base: "1fr", xl: "1fr 350px" }} gap={6} pb={8}>
        {/* Left Section (Main) */}
        <Flex direction="column" gap={6}>
          {/* Stats Cards */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <StatsCard
              title="Available Positions"
              value={stats.availablePositions}
              subtitle="4 urgently needed"
              bg="#162837"
              color="white"
            />
            <StatsCard
              title="Job Open"
              value={stats.jobOpen}
              subtitle="4 active hiring"
              bg="#162837"
              color="white"
            />
            <StatsCard
              title="New Employees"
              value={stats.newEmployees}
              subtitle="4 departments"
              bg="#162837"
              color="white"
            />
          </Grid>

          {/* Charts */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
            <TrendChart
              title="Total Employees"
              value={stats.totalEmployees}
              trend={stats.totalEmployeesTrend}
              breakdown={stats.totalEmployeesBreakdown}
            />
            <TrendChart
              title="Talent Request"
              value={stats.talentRequest}
              trend={stats.talentRequestTrend}
              breakdown={stats.talentRequestBreakdown}
            />
          </Grid>

          {/* Employees Table */}
          <EmployeeTable employees={employees} onRefresh={loadData} />
        </Flex>

        {/* Right Section (Sidebar Widgets) */}
        <Flex direction="column" gap={6}>
          <Calendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          <ScheduleList schedules={schedules} onRefresh={loadData} />
        </Flex>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
