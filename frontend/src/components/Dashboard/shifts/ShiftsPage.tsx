"use client";

import {
  Box,
  Flex,
  Input,
  Button,
  Text,
  IconButton,
  Badge,
  Skeleton,
} from "@chakra-ui/react";
import { Search, Eye, Edit, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback, memo } from "react";
import { toaster } from "@/components/ui/toaster";
import { dashboardApi } from "@/services/api";
import { useNavigate } from "react-router-dom";

// === Types ===
interface Shift {
  id: string;
  name: string;
  time: string;
  department: string;
  status: "Visited" | "Scheduled" | "Waiting";
  timer?: string;
}

// === Constants ===
const ITEMS_PER_PAGE = 10;
const TEXT_PRIMARY = "#162837";
const TEXT_SECONDARY = "#4A5568";
const BORDER_COLOR = "#E2E8F0";

// === Skeleton ===
const ShiftsSkeleton = memo(() => (
  <Box>
    {[...Array(8)].map((_, i) => (
      <Skeleton key={i} height="60px" mb={2} borderRadius="md" />
    ))}
  </Box>
));
ShiftsSkeleton.displayName = "ShiftsSkeleton";

// === Main Component ===
const ShiftSection = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  // === Load Shifts ===
  const loadShifts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await dashboardApi.getShifts();
      const backendShifts = response.data.shifts;

      const mappedShifts: Shift[] = backendShifts.map((s: any) => {
        const employeeName =
          s.assignedTo?.name?.trim() ||
          s.userId?.name ||
          "Unknown";

        const time = `${s.startTime} - ${s.endTime}`;

        let status: Shift["status"] = "Scheduled";
        if (s.status === "COMPLETED") status = "Visited";
        else if (s.status === "MISSED") status = "Waiting";

        return {
          id: s._id,
          name: employeeName,
          time,
          department: "General",
          status,
          timer: s.totalHours ? `${s.totalHours}h` : undefined,
        };
      });

      setShifts(mappedShifts);
      setFilteredShifts(mappedShifts);
      setCurrentPage(1); // Reset to first page
    } catch (error: any) {
      toaster.create({
        title: "Error",
        description: error.message || "Failed to load shifts",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  // === Search Filter ===
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredShifts(shifts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = shifts.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.time.toLowerCase().includes(query) ||
        s.department.toLowerCase().includes(query)
    );

    setFilteredShifts(filtered);
    setCurrentPage(1);
  }, [searchQuery, shifts]);

  // === Pagination Logic ===
  const totalItems = filteredShifts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedShifts = filteredShifts.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // === Status Badge Color ===
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Visited":
        return { bg: "green.50", color: "green.700" };
      case "Scheduled":
        return { bg: "blue.50", color: "blue.700" };
      case "Waiting":
        return { bg: "orange.50", color: "orange.700" };
      default:
        return { bg: "gray.50", color: "gray.700" };
    }
  };

  return (


    
    <Flex minH="100vh" bg="#F7F9FC" overflow="hidden">
      <Flex flex="1" direction="column" overflow="hidden">
        <Box flex="1" overflowY="auto">
          <Box p={{ base: 4, md: 6, lg: 8 }}>
            {/* Search + New Shift */}
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4} mb={6}>
              <Box position="relative" flex="1" maxW="1400px">
                <Box position="absolute" left="16px" top="50%" transform="translateY(-50%)">
                  <Search size={18} color="#6f7986ff" />
                </Box>
                <Input
                  placeholder="Search shifts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  pl="44px"
                  py={6}
                  bg="white"
                  border="1px solid"
                  borderColor={BORDER_COLOR}
                  borderRadius="lg"
                  color={TEXT_PRIMARY}
                  _placeholder={{ color: "#A0AEC0" }}
                  _focus={{
                    borderColor: TEXT_PRIMARY,
                    boxShadow: `0 0 0 1px ${TEXT_PRIMARY}`,
                  }}
                />
              </Box>

              <Button
               bg="#162837"
          color="#EBEBEB"
          _hover={{ bg: "#0f1e2a" }}
          px={6}
          py={6}
          fontWeight="semibold"
          borderRadius="xl"
          shadow="lg"
                onClick={() => navigate("/shifts/new")}
              >
                New Shift
              </Button>
            </Flex>

            {/* Table Card */}
            <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden" border="1px solid" borderColor={BORDER_COLOR}>
              {/* Table Header */}
              <Flex px={6} py={4} bg="gray.50" borderBottom="1px solid" borderColor={BORDER_COLOR}>
                <Box flex="2.5" fontWeight="600" color={TEXT_SECONDARY} fontSize="sm">
                  Name
                </Box>
                <Box flex="1.5" fontWeight="600" color={TEXT_SECONDARY} fontSize="sm">
                  Time
                </Box>
                <Box flex="1.5" fontWeight="600" color={TEXT_SECONDARY} fontSize="sm">
                  Department
                </Box>
                <Box flex="1.5" fontWeight="600" color={TEXT_SECONDARY} fontSize="sm">
                  Status
                </Box>
                <Box flex="1" fontWeight="600" color={TEXT_SECONDARY} fontSize="sm">
                  Hours
                </Box>
                <Box flex="1" fontWeight="600" color={TEXT_SECONDARY} fontSize="sm" textAlign="right">
                  Actions
                </Box>
              </Flex>

              {/* Table Body */}
              {isLoading ? (
                <Box p={6}>
                  <ShiftsSkeleton />
                </Box>
              ) : paginatedShifts.length === 0 ? (
                <Flex justify="center" py={12}>
                  <Text color={TEXT_SECONDARY}>
                    {searchQuery ? "No shifts found" : "No shifts available"}
                  </Text>
                </Flex>
              ) : (
                <Box>
                  {paginatedShifts.map((shift, i) => (
                    <Flex
                      key={shift.id}
                      px={6}
                      py={4}
                      align="center"
                      borderBottom={
                        i !== paginatedShifts.length - 1 ? "1px solid" : "none"
                      }
                      borderColor={BORDER_COLOR}
                      _hover={{ bg: "gray.50" }}
                    >
                      {/* Name */}
                      <Box flex="2.5">
                        <Text fontWeight="600" color={TEXT_PRIMARY}>
                          {shift.name}
                        </Text>
                      </Box>

                      {/* Time */}
                      <Box flex="1.5">
                        <Text color={TEXT_PRIMARY}>{shift.time}</Text>
                      </Box>

                      {/* Department */}
                      <Box flex="1.5">
                        <Text color={TEXT_PRIMARY}>{shift.department}</Text>
                      </Box>

                      {/* Status */}
                      <Box flex="1.5">
                        <Badge
                          {...getStatusColor(shift.status)}
                          px={3}
                          py={1.5}
                          borderRadius="md"
                          fontSize="xs"
                          fontWeight="medium"
                        >
                          {shift.status}
                        </Badge>
                      </Box>

                      {/* Hours */}
                      <Box flex="1">
                        {shift.timer && (
                          <Flex align="center" gap={1}>
                            <Clock size={14} color="#EF4444" />
                            <Text fontSize="xs" color="red.500" fontWeight="600">
                              {shift.timer}
                            </Text>
                          </Flex>
                        )}
                      </Box>

                      {/* Actions */}
                      <Flex flex="1" justify="flex-end" gap={2}>
                        {shift.status === "Visited" ? (
                          <IconButton aria-label="View" size="sm" variant="ghost" color={TEXT_SECONDARY}>
                            <Eye size={18} />
                          </IconButton>
                        ) : (
                          <IconButton aria-label="Edit" size="sm" variant="ghost" color={TEXT_SECONDARY}>
                            <Edit size={18} />
                          </IconButton>
                        )}
                      </Flex>
                    </Flex>
                  ))}
                </Box>
              )}

              {/* Pagination Footer – Same as Employee Section */}
              {!isLoading && filteredShifts.length > 0 && (
                <Flex
                  px={6}
                  py={4}
                  justify="space-between"
                  align="center"
                  borderTop="1px solid"
                  borderColor={BORDER_COLOR}
                  bg="white"
                >
                  <Text fontSize="sm" color={TEXT_SECONDARY}>
                    Showing {startIndex + 1}-{endIndex} of {totalItems}
                  </Text>

                  <Flex gap={2}>
                    <IconButton
                      aria-label="Previous page"
                      size="sm"
                      variant="ghost"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      color={TEXT_SECONDARY}
                      _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                    >
                      <ChevronLeft size={18} />
                    </IconButton>

                    <IconButton
                      aria-label="Next page"
                      size="sm"
                      variant="ghost"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      color={TEXT_SECONDARY}
                      _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                    >
                      <ChevronRight size={18} />
                    </IconButton>
                  </Flex>
                </Flex>
              )}
            </Box>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default ShiftSection;