// src/components/dashboard/Calendar.tsx
"use client";

import { Box, Flex, Text, IconButton, Grid } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo, useState } from "react";

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const Calendar = memo(({ selectedDate, onDateChange }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateChange(newDate);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <Box bg="white" p={6} borderRadius="xl" boxShadow="sm">
      <Flex justify="space-between" align="center" mb={4}>
        <IconButton aria-label="Prev" size="sm" variant="ghost" onClick={handlePrevMonth}>
          <ChevronLeft size={18} />
        </IconButton>
        <Text fontWeight="600" fontSize="md" color="gray.800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <IconButton aria-label="Next" size="sm" variant="ghost" onClick={handleNextMonth}>
          <ChevronRight size={18} />
        </IconButton>
      </Flex>

      <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={2}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <Flex key={i} justify="center" h="32px" fontSize="xs" fontWeight="600" color="gray.500">
            {d}
          </Flex>
        ))}
      </Grid>

      <Grid templateColumns="repeat(7, 1fr)" gap={1}>
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <Box key={`empty-${i}`} h="32px" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const today = isToday(day);
          const selected = isSelected(day);
          return (
            <Flex
              key={day}
              justify="center"
              align="center"
              h="32px"
              fontSize="sm"
              fontWeight={today || selected ? "600" : "normal"}
              color={selected ? "white" : today ? "blue.500" : "gray.700"}
              bg={selected ? "blue.500" : "transparent"}
              borderRadius="md"
              cursor="pointer"
              _hover={{ bg: selected ? "blue.600" : "gray.100" }}
              onClick={() => handleDateClick(day)}
              transition="all 0.2s"
            >
              {day}
            </Flex>
          );
        })}
      </Grid>
    </Box>
  );
});

Calendar.displayName = "Calendar";
export default Calendar;