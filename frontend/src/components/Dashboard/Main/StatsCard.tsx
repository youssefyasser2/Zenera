// src/components/dashboard/StatsCard.tsx
"use client";

import { Box, Text, Skeleton } from "@chakra-ui/react";
import { memo } from "react";

interface StatsCardProps {
  title: string;
  value: number;
  subtitle: string;
  bg: string;
  color: string;
  isLoading?: boolean;
}

const StatsCard = memo(({ 
  title, 
  value, 
  subtitle, 
  bg, 
  color, 
  isLoading = false 
}: StatsCardProps) => {
  if (isLoading) {
    return (
      <Box bg={bg} p={6} borderRadius="xl" minH="140px">
        <Skeleton height="20px" mb={4} />
        <Skeleton height="40px" mb={3} />
        <Skeleton height="16px" width="60%" />
      </Box>
    );
  }

  return (
    <Box
      bg={bg}
      p={6}
      borderRadius="xl"
      minH="140px"
      transition="all 0.3s"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "lg",
      }}
    >
      <Text
        fontSize="sm"
        fontWeight="medium"
        color={color}
        opacity={0.9}
        mb={3}
      >
        {title}
      </Text>
      <Text
        fontSize="4xl"
        fontWeight="bold"
        color={color}
        mb={2}
      >
        {value}
      </Text>
      <Text
        fontSize="xs"
        color={color}
        opacity={0.8}
      >
        {subtitle}
      </Text>
    </Box>
  );
});

StatsCard.displayName = "StatsCard";

export default StatsCard;