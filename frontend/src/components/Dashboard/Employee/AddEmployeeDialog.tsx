"use client";

import {
  Button,
  Dialog,
  Flex,
  IconButton,
  Box,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const AddEmployeeDialog = () => {
  const navigate = useNavigate();

  const handleNewEmployee = () => {
    navigate("/Employee/new");
  };

  const handleLinkExisting = () => {
    navigate("/Employee/link");
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          bg="#162837"
          color="#EBEBEB"
          _hover={{ bg: "#0f1e2a" }}
          px={4}
          py={6}
          fontWeight="semibold"
          borderRadius="xl"
          shadow="lg"
        >
          + Add Employee
        </Button>
      </Dialog.Trigger>
      <Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(6px)" />
      <Dialog.Positioner>
        <Dialog.Content
          mx={4}
          borderRadius="2xl"
          maxW="md"
          bg="#162837"
          color="#EBEBEB"
          p={8}
          shadow="2xl"
          transform="translateY(-10%)"
        >
          <Dialog.CloseTrigger
            position="absolute"
            top="4"
            right="4"
            asChild
          >
            <IconButton
              aria-label="Close"
              size="md"
              variant="ghost"
              color="#EBEBEB"
              fontSize="2xl"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              ×
            </IconButton>
          </Dialog.CloseTrigger>

          <Box textAlign="center" mt={3}>
            <Text fontSize="2xl" fontWeight="bold" mb={3}>
              Add Employee
            </Text>
            <Text fontSize="md" color="#CFCFCF" mb={8}>
              Would you like to create a new employee or link an existing one?
            </Text>
          </Box>

          <Flex justify="center" gap={4}>
            <Button
              onClick={handleLinkExisting}
              bg="#EBEBEB"
              color="#162837"
              _hover={{ bg: "#d8d8d8" }}
              flex="1"
              borderRadius="lg"
              fontWeight="semibold"
              py={6}
            >
              Link Existing
            </Button>
            <Button
              onClick={handleNewEmployee}
              bg="#0f1e2a"
              color="#EBEBEB"
              _hover={{ bg: "#0b1620" }}
              flex="1"
              borderRadius="lg"
              fontWeight="semibold"
              py={6}
            >
              New Employee
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default AddEmployeeDialog;
