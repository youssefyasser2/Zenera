// src/components/dashboard/TrendChart.tsx
"use client";

import { Box, Flex, Text, Skeleton } from "@chakra-ui/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { memo } from "react";

interface Breakdown {
  men: number;
  women: number;
}

interface Props {
  title: string;
  value: number;
  trend: number;
  breakdown: Breakdown;
  isLoading?: boolean;
}

const TrendChart = memo(({ title, value, trend, breakdown, isLoading = false }: Props) => {
  const isUp = trend >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  const color = isUp ? "green.500" : "red.500";

  if (isLoading) {
    return (
      <Box
        bg="white"
        p={6}
        borderRadius="xl"
        boxShadow="sm"
        minW="200px"
        overflow="hidden"
      >
        <Skeleton height="16px" mb={3} borderRadius="md" />
        <Skeleton height="36px" mb={3} borderRadius="md" />
        <Skeleton height="14px" borderRadius="md" />
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      p={6}
      borderRadius="xl"
      boxShadow="sm"
      minW="200px"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ shadow: "md", transform: "translateY(-1px)" }}
    >
      {/* Title */}
      <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={1} >
        {title}
      </Text>

      {/* Value + Trend */}
      <Flex align="baseline" gap={2} mb={3}>
        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          color="gray.800"
          lineHeight="1"
        >
          {value.toLocaleString()}
        </Text>
        <Flex align="center" color={color} fontSize="sm" fontWeight="semibold">
          <Icon size={14} />
          <Text ml={1} whiteSpace="nowrap">
            {Math.abs(trend)}%
          </Text>
        </Flex>
      </Flex>

      {/* Breakdown */}
      <Flex justify="space-between" fontSize="xs" color="gray.500" fontWeight="medium">
        <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" maxW="50%">
          Men: {breakdown.men}
        </Text>
        <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" maxW="50%" textAlign="right">
          Women: {breakdown.women}
        </Text>
      </Flex>
    </Box>
  );
});

TrendChart.displayName = "TrendChart";

export default TrendChart;