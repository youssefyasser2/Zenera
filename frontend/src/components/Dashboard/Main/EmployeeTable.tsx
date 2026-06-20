// src/components/dashboard/EmployeeTable.tsx
"use client";

import { Box, Flex, Badge, Skeleton, Text, Button } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react/avatar";
import { SlidersHorizontal } from "lucide-react";
import { memo } from "react";
import type { Employee } from "@/types/dashboard.types";
import { HStack,  } from "@chakra-ui/react";

interface Props {
  employees: Employee[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const EmployeeTable = memo(({ employees, isLoading = false }: Props) => {
  if (isLoading) {
    return (
      <Box bg="white" p={6} borderRadius="xl" boxShadow="sm">
        <Skeleton height="30px" mb={4} width="150px" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height="60px" mb={2} borderRadius="lg" />
        ))}
      </Box>
    );
  }

  return (
    <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="xl" fontWeight="bold" color="gray.900">
          Employees
        </Text>
          <Button
          size="sm"
          variant="outline"
          fontSize="sm"
          fontWeight="500"
          color="blue.600"
          borderColor="blue.200"
          _hover={{ bg: "blue.50" }}
        >
          <HStack gap={2}>
            <SlidersHorizontal size={16} />
            <Text>Filters</Text>
          </HStack>
        </Button>
              </Flex>

      {/* Table Header */}
      <Flex
        px={4}
        py={2}
        mb={3}
      >
        <Box flex="3" fontSize="sm" fontWeight="500" color="gray.500">
          Employee Name
        </Box>
        <Box flex="2" fontSize="sm" fontWeight="500" color="gray.500">
          Department
        </Box>
        <Box flex="1" fontSize="sm" fontWeight="500" color="gray.500">
          Age
        </Box>
        <Box flex="1.5" fontSize="sm" fontWeight="500" color="gray.500">
          Discipline
        </Box>
        <Box flex="1.5" fontSize="sm" fontWeight="500" color="gray.500">
          Status
        </Box>
      </Flex>

      {/* Table Rows */}
      <Flex direction="column" gap={0}>
        {employees.map((emp, index) => (
          <Flex
            key={emp.id}
            align="center"
            px={4}
            py={4}
            borderTop={index === 0 ? "none" : "1px solid"}
            borderColor="gray.100"
            _hover={{ bg: "gray.50" }}
            transition="all 0.2s"
          >
            {/* Employee Name with Avatar */}
            <Flex flex="3" align="center" gap={3}>
              <Avatar.Root size="sm" variant="subtle">
                <Avatar.Image src={emp.avatar} alt={emp.name} />
                <Avatar.Fallback>
                  {emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
              <Text fontSize="sm" fontWeight="500" color="gray.900">
                {emp.name}
              </Text>
            </Flex>

            {/* Department */}
            <Box flex="2">
              <Text fontSize="sm" color="gray.700">
                {emp.department}
              </Text>
            </Box>

            {/* Age */}
            <Box flex="1">
              <Text fontSize="sm" color="gray.700">
                {emp.age}
              </Text>
            </Box>

            {/* Discipline */}
            <Box flex="1.5">
              <Text 
                fontSize="sm" 
                fontWeight="600" 
                color={
                  emp.discipline === "+100%" ? "green.600" : 
                  emp.discipline.startsWith("+") ? "green.600" : 
                  "gray.800"
                }
              >
                {emp.discipline}
              </Text>
            </Box>

            {/* Status */}
            <Box flex="1.5">
              <Badge
                colorScheme={emp.status === "Permanent" ? "blue" : "gray"}
                bg={emp.status === "Permanent" ? "blue.100" : "gray.200"}
                color={emp.status === "Permanent" ? "blue.700" : "gray.700"}
                borderRadius="md"
                px={3}
                py={1.5}
                fontSize="xs"
                fontWeight="500"
                textTransform="capitalize"
                overflow={"auto"}
              >
                {emp.status}
              </Badge>
            </Box>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
});

EmployeeTable.displayName = "EmployeeTable";

export default EmployeeTable;