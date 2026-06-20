"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Grid,
} from "@chakra-ui/react";
import { MessageCircle, Mail, Phone, ChevronRight } from "lucide-react";
import { memo, useState } from "react";
import { useToast } from "@chakra-ui/toast";


// === Contact Card ===
const ContactCard = memo(
  ({
    icon: Icon,
    title,
    description,
    action,
  }: {
    icon: any;
    title: string;
    description: string;
    action: string;
  }) => (
    <Box
      bg="white"
      p={6}
      rounded="xl"
      shadow="md"
      _hover={{ transform: "translateY(-4px)", shadow: "lg" }}
      transition="all 0.25s"
      cursor="pointer"
      textAlign="center"
    >
      <Flex
        w={12}
        h={12}
        bg="#EBEBEB"
        rounded="xl"
        align="center"
        justify="center"
        mx="auto"
        mb={3}
      >
        <Icon size={22} color="#162837" />
      </Flex>
      <Heading size="sm" mb={1} color="#162837">
        {title}
      </Heading>
      <Text fontSize="sm" color="gray.600" mb={3}>
        {description}
      </Text>
      <Flex
        align="center"
        justify="center"
        gap={1}
        color="#162837"
        fontWeight="medium"
        fontSize="sm"
      >
        {action}
        <ChevronRight size={15} />
      </Flex>
    </Box>
  )
);
ContactCard.displayName = "ContactCard";

const SupportPage = () => {
  const toast = useToast();
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    description: "",
  });

  const handleSubmit = () => {
    if (!form.subject || !form.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    toast({
      title: "Ticket Submitted",
      description: "We'll get back to you within 24 hours",
      status: "success",
      duration: 3000,
    });

    setShowNewTicket(false);
    setForm({ subject: "", description: "" });
  };

  return (
    <Flex minH="100vh"  direction="column">
      {/* Header */}
      <Box
        bg="#162837"
        color="white"
        py={8}
        px={{ base: 4, md: 10 }}
        textAlign="center"
        shadow="md"
      >
        <Heading size="xl" mb={2}>
          Support Center
        </Heading>
        <Text fontSize="sm" opacity={0.9}>
          Get help from our team or find answers in our FAQ
        </Text>
      </Box>

      {/* Main Content */}
      <Flex
        flex={1}
        p={{ base: 4, md: 8 }}
        direction="column"
        gap={8}
        maxW="1000px"
        mx="auto"
        w="full"
      >
        {/* Contact Section */}
        <Box>
          <Heading
            size="md"
            mb={4}
            color="#162837"
            textAlign={{ base: "center", md: "left" }}
          >
            Get in Touch
          </Heading>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
            gap={5}
          >
            <ContactCard
              icon={MessageCircle}
              title="Live Chat"
              description="Chat with our support team"
              action="Start Chat"
            />
            <ContactCard
              icon={Mail}
              title="Email Support"
              description="support@insighta.com"
              action="Send Email"
            />
            <ContactCard
              icon={Phone}
              title="Phone Support"
              description="+1 (555) 123-4567"
              action="Call Now"
            />
          </Grid>
        </Box>

        {/* Ticket Section */}
        <Box
          bg="white"
          p={7}
          rounded="2xl"
          shadow="md"
          border="1px solid"
          borderColor="gray.200"
        >
          {!showNewTicket ? (
            <Flex
              justify="space-between"
              align={{ base: "start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={3}
            >
              <Box>
                <Heading size="md" mb={1} color="#162837">
                  Need Help?
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Create a support ticket and we'll assist you shortly
                </Text>
              </Box>
              <Button
                bg="#162837"
                color="white"
                _hover={{ bg: "#0f1e2a" }}
                px={6}
                onClick={() => setShowNewTicket(true)}
              >
                New Ticket
              </Button>
            </Flex>
          ) : (
            <Box>
              <Heading size="md" mb={4} color="#162837">
                Create Support Ticket
              </Heading>
              <Flex direction="column" gap={4}>
                {/* Subject */}
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    mb={1.5}
                    color="gray.700"
                  >
                    Subject *
                  </Text>
                  <Input
                    placeholder="Brief description of your issue"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    bg="#EBEBEB"
                    border="none"
                    _focus={{ border: "1px solid #162837", bg: "white" }}
                  />
                </Box>

                {/* Description */}
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    mb={1.5}
                    color="gray.700"
                  >
                    Description *
                  </Text>
                  <Textarea
                    placeholder="Please describe your issue in detail..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={4}
                    bg="#EBEBEB"
                    border="none"
                    _focus={{ border: "1px solid #162837", bg: "white" }}
                  />
                </Box>

                <Flex justify="flex-end" gap={3}>
                  <Button color={"black"} variant="ghost" onClick={() => setShowNewTicket(false)}>
                    Back
                  </Button>
                  <Button
                    bg="#162837"
                    color="white"
                    _hover={{ bg: "#0f1e2a" }}
                    px={6}
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </Flex>
              </Flex>
            </Box>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export default SupportPage;
