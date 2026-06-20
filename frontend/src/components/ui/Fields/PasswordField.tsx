// src/components/ui/PasswordField.tsx
"use client";

import { Box, Input, Text } from "@chakra-ui/react";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { useState, useCallback } from "react";

interface PasswordFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  bg?: string;
  borderColor?: string;
  color?: string;
  placeholderColor?: string;
  labelColor?: string;    
  disabled?: boolean;
  autoComplete?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label = "Password",
  placeholder = "••••••••••",
  value,
  onChange,
  required = false,
  bg = "rgba(255,255,255,0.05)",
  borderColor = "rgba(255,255,255,0.1)",
  color = "white",
  placeholderColor = "gray.500",
  labelColor = "gray.300", 
  disabled = false,
  autoComplete,
}) => {
  const [show, setShow] = useState(false);
  const toggle = useCallback(() => setShow((s) => !s), []);

  return (
    <Box>
      {/* Label */}
      <Text
        fontSize="sm"
        fontWeight="medium"
        mb={2}
        color={disabled ? "gray.500" : labelColor}
      >
        {label}
        {required && (
          <Text as="span" color="red.500" ml={1} fontWeight="bold">
            *
          </Text>
        )}
      </Text>

      {/* Input + Toggle */}
      <Box position="relative">
        <Input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          bg={bg}
          border="1px solid"
          borderColor={borderColor}
          color={color}
          _placeholder={{ color: placeholderColor }}
          borderRadius="md"
          py={6}
          px={4}
          pr="3rem"
          fontSize="sm"
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          _focus={{
            borderColor: disabled ? borderColor : "blue.500",
            boxShadow: "0 0 0 1px #4299E1",
          }}
          _hover={{
            borderColor: disabled ? borderColor : "gray.400",
          }}
        />

        {/* Eye Icon */}
        <Box
          position="absolute"
          right="0.5rem"
          top="50%"
          transform="translateY(-50%)"
          cursor={disabled ? "not-allowed" : "pointer"}
          color={disabled ? "gray.500" : "gray.400"}
          onClick={disabled ? undefined : toggle}
          p={2}
          aria-label={show ? "Hide password" : "Show password"}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled) {
              e.preventDefault();
              toggle();
            }
          }}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </Box>
      </Box>
    </Box>
  );
};

export default PasswordField;