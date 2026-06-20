// src/components/ui/password-input.tsx
"use client";

import { Box, Input, Button, ProgressRoot, ProgressTrack, ProgressRange } from "@chakra-ui/react";
import { useState } from "react";

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    stroke="currentColor"
    width="18"
    height="18"
  >
    {open ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 012.458 12c1.274 4.057 5.065 7 9.542 7 1.74 0 3.393-.41 4.835-1.137M9.88 9.88a3 3 0 104.24 4.24M9.88 9.88L4 4m10.12 10.12L20 20" />
      </>
    )}
  </svg>
);

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  bg?: string;
  borderColor?: string;
  color?: string;
  placeholderColor?: string;
  disabled?: boolean;
}

export const PasswordInput = ({
  value,
  onChange,
  placeholder,
  bg = "surface",
  borderColor = "gray.400",
  color = "inherit",
  placeholderColor = "gray.500",
  disabled = false,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box position="relative" width="100%">
      <Input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Enter your password"}
        pr="2.5rem"
        bg={bg}
        borderColor={borderColor}
        color={color}
        _placeholder={{ color: placeholderColor }}
        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #4299E1" }}
        _hover={{ borderColor: disabled ? borderColor : "blue.300" }}
        disabled={disabled}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPassword(!showPassword)}
        position="absolute"
        right="5px"
        top="50%"
        transform="translateY(-50%)"
        p="4px"
        _hover={{ bg: "transparent" }}
        disabled={disabled}
      >
        <EyeIcon open={showPassword} />
      </Button>
    </Box>
  );
};

interface PasswordStrengthMeterProps {
  value: number;
}

export const PasswordStrengthMeter = ({ value }: PasswordStrengthMeterProps) => {
  const colorPalettes = ["red", "orange", "yellow", "green"];
  const colorPalette = colorPalettes[value - 1] || "gray";

  return (
    <ProgressRoot value={value * 25} size="md" colorPalette={colorPalette} borderRadius="full">
      <ProgressTrack>
        <ProgressRange />
      </ProgressTrack>
    </ProgressRoot>
  );
};

export default PasswordInput;