// src/components/dashboard/ScheduleList.tsx
"use client";

import { Box, Flex, Text, Badge, Skeleton } from "@chakra-ui/react";
import { memo } from "react";
import type { Schedule } from "@/types/dashboard.types";

interface Props {
  schedules: Schedule[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const ScheduleList = memo(({ schedules, isLoading = false }: Props) => {
  if (isLoading) {
    return (
      <Box bg="white" p={6} borderRadius="xl" boxShadow="sm">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height="50px" mb={2} />
        ))}
      </Box>
    );
  }

  return (
    <Box bg="white" p={6} borderRadius="xl" boxShadow="sm">
      <Text fontWeight="600" mb={4} color="gray.800">
        Upcoming Schedules
      </Text>
      <Flex direction="column" gap={3}>
        {schedules.map((s) => (
          <Flex key={s.id} justify="space-between" align="center">
            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.800">
                {s.title}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {s.date} • {s.time}
              </Text>
            </Box>
            <Badge
              colorScheme={s.priority === "Priority" ? "red" : "gray"}
              variant="solid"
              fontSize="xs"
            >
              {s.priority}
            </Badge>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
});

ScheduleList.displayName = "ScheduleList";
export default ScheduleList;