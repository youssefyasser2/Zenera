"use client";

import { Box, Flex, Input, Button, Text, Stack } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { RadioGroup, Radio } from "@chakra-ui/radio";
import { useToast } from "@chakra-ui/toast";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "@/services/api";

export default function NewShiftPage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [assignType, setAssignType] = useState<"user" | "name">("user");
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title,
        date,
        startTime,
        endTime,
        assignedTo: assignType === "user" ? { userId } : { name: name.trim() },
        notes,
      };

      await dashboardApi.createShift(payload);

      toast({
        title: "Success",
        description: "Shift created successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create shift",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="#F7F9FC" p={8}>
      <Box maxW="800px" mx="auto" bg="#162837" borderRadius="xl" boxShadow="md" p={8}>
        <Text fontSize="2xl" fontWeight="bold" mb={6} textAlign="center" color="gray.100">
          Creae New Shift
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack gap={5}>
            {/* Title */}
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
               bg="white"
               color="#1A202C"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. API Development"
              />
            </FormControl>

            {/* Date */}
            <FormControl isRequired>
              <FormLabel>Date</FormLabel>
              <Input bg="white"
               color="#1A202C" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </FormControl>

            {/* Time */}
            <Flex gap={4}>
              <FormControl isRequired flex="1">
                <FormLabel>Start Time</FormLabel>
                <Input bg="white"
               color="#1A202C" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </FormControl>
              <FormControl isRequired flex="1">
                <FormLabel>End Time</FormLabel>
                <Input bg="white"
               color="#1A202C" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </FormControl>
            </Flex>

            {/* Assign To */}
            <FormControl>
              <FormLabel>Assign To</FormLabel>
              <RadioGroup value={assignType} onChange={(v) => setAssignType(v as any)}>
                <Stack  direction="row" gap={48}>
                  <Radio  value="user">Employee (User ID)</Radio>
                  <Radio  value="name">Name Only</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {/* User ID or Name */}
            {assignType === "user" ? (
              <FormControl>
                <FormLabel>User ID</FormLabel>
                <Input
                bg="white"
               color="#1A202C"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. 69098fa7c144d3ce53627a25"
                />
              </FormControl>
            ) : (
              <FormControl>
                <FormLabel>Employee Name</FormLabel>
                <Input
                bg="white"
               color="#1A202C"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ahmed Mohamed"
                />
              </FormControl>
            )}

            {/* Notes */}
            <FormControl>
              <FormLabel>Notes (Optional)</FormLabel>
              <Input
              bg="white"
               color="#1A202C"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional info..."
              />
            </FormControl>

            {/* Buttons */}
            <Flex justify="flex-end" gap={3} mt={6}>
              <Button variant="outline" onClick={() => navigate(-1)} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                loading={isLoading}
                loadingText="Creating..."
                // Icon={isLoading ? <Spinner size="sm" /> : undefined}
              >
                Create Shift
              </Button>
            </Flex>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}