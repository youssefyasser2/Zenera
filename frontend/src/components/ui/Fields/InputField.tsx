// src/components/ui/InputField.tsx
"use client";

import { Box, Text, Input } from "@chakra-ui/react";
import * as React from "react";

interface InputFieldProps {
  label: string;
  type?: string;
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

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  placeholder = "",
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

      {/* Input */}
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        bg={bg}
        border="1px solid"
        borderColor={borderColor}
        color={color}
        _placeholder={{ color: placeholderColor }}
        borderRadius="md"
        py={6}
        px={4}
        fontSize="sm"
        autoComplete={autoComplete}
        disabled={disabled}
        _focus={{
          borderColor: disabled ? borderColor : "blue.500",
          boxShadow: "0 0 0 1px #4299E1",
        }}
        _hover={{
          borderColor: disabled ? borderColor : "gray.400",
        }}
      />
    </Box>
  );
};

export default InputField;