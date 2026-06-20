"use client";

import { useProfile } from "@/components/Dashboard/Profile/ProfileLogic";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Input,
  Grid,
  Skeleton,
  Avatar,
} from "@chakra-ui/react";
import { Camera, Mail, Phone, MapPin, Briefcase, Calendar, Edit, Save, X } from "lucide-react";
import { memo } from "react";

// === UI COMPONENTS ===
const InfoCard = memo(
  ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <Flex
      align="center"
      gap={3}
      p={4}
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="#EBEBEB"
      _hover={{ borderColor: "#162837", boxShadow: "sm" }}
      transition="all 0.2s"
    >
      <Flex
        align="center"
        justify="center"
        w="40px"
        h="40px"
        bg="#EBEBEB"
        borderRadius="lg"
        color="#162837"
      >
        <Icon size={20} />
      </Flex>
      <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="500" mb={0.5}>
          {label}
        </Text>
        <Text fontSize="sm" color="gray.900" fontWeight="600">
          {value}
        </Text>
      </Box>
    </Flex>
  )
);
InfoCard.displayName = "InfoCard";

const LoadingSkeleton = () => (
  <Box bg="#F7F9FC" minH="100vh" p={8}>
    <Box maxW="1200px" mx="auto">
      <Skeleton height="200px" borderRadius="2xl" mb={6} />
      <Skeleton height="120px" borderRadius="2xl" mb={6} />
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={6}>
        <Skeleton height="100px" borderRadius="lg" />
        <Skeleton height="100px" borderRadius="lg" />
        <Skeleton height="100px" borderRadius="lg" />
      </Grid>
    </Box>
  </Box>
);

const ErrorScreen = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <Box textAlign="center" py={16} bg="#F7F9FC" minH="100vh">
    <Text color="red.500" fontSize="lg" fontWeight="medium" mb={4}>
      {message}
    </Text>
    <Button onClick={onRetry} colorScheme="blue">
      Retry
    </Button>
  </Box>
);

// === MAIN COMPONENT ===
const ProfileSection = () => {
  const {
    profile,
    isLoading,
    isEditing,
    editedProfile,
    setEditedProfile,
    isSaving,
    error,
    loadProfile,
    saveProfile,
    cancelEdit,
    startEdit,
  } = useProfile();

  if (isLoading) return <LoadingSkeleton />;
  if (error || !profile) return <ErrorScreen message={error || "No user data"} onRetry={loadProfile} />;

  const currentProfile = isEditing ? editedProfile! : profile;

  return (
    <Box minH="100vh" p={{ base: 4, md: 6, lg: 8 }}>
      <Box maxW="1200px" mx="auto">
        {/* Profile Header */}
        <Box bg="white" borderRadius="2xl" boxShadow="sm" overflow="hidden" mb={6}>
          <Box h="200px" bg="#162837" />
          <Box px={{ base: 6, md: 8 }} pb={8}>
            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "center", md: "flex-end" }}
              justify="space-between"
              mt="-60px"
              gap={4}
            >
              <Flex align="center" gap={4}>
                <Box position="relative">
                  <Avatar.Root
                    size="2xl"
                    css={{
                      w: "120px",
                      h: "120px",
                      border: "4px solid white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Avatar.Image src={currentProfile.avatar} alt={currentProfile.name} />
                    <Avatar.Fallback>
                      {currentProfile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar.Root>

                  {isEditing && (
                    <Flex
                      position="absolute"
                      bottom={0}
                      right={0}
                      w="36px"
                      h="36px"
                      bg="#162837"
                      borderRadius="full"
                      align="center"
                      justify="center"
                      cursor="pointer"
                      border="3px solid white"
                      _hover={{ bg: "#0f1e2a" }}
                    >
                      <Camera size={16} color="white" />
                    </Flex>
                  )}
                </Box>

                <Box>
                  {isEditing ? (
                    <Input
                      value={editedProfile?.name}
                      onChange={(e) =>
                        setEditedProfile((prev) => ({ ...prev!, name: e.target.value }))
                      }
                      fontSize="xl"
                      fontWeight="bold"
                      maxW="250px"
                    />
                  ) : (
                    <Heading size="lg">{currentProfile.name}</Heading>
                  )}
                  <Text color="gray.600">{currentProfile.role}</Text>
                  <Flex align="center" gap={1} color="gray.500" fontSize="sm">
                    <Calendar size={14} />
                    <Text>Joined {currentProfile.joinDate}</Text>
                  </Flex>
                </Box>
              </Flex>

              <Flex gap={2}>
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={cancelEdit} disabled={isSaving} gap={2}>
                      <X size={18} /> Cancel
                    </Button>
                    <Button
                      bg="#162837"
                      color="white"
                      _hover={{ bg: "#0f1e2a" }}
                      onClick={saveProfile}
                      loading={isSaving}
                      loadingText="Saving"
                      gap={2}
                    >
                      <Save size={18} /> Save
                    </Button>
                  </>
                ) : (
                  <Button
                    bg="#162837"
                    color="white"
                    _hover={{ bg: "#0f1e2a" }}
                    onClick={startEdit}
                    gap={2}
                  >
                    <Edit size={18} /> Edit Profile
                  </Button>
                )}
              </Flex>
            </Flex>

            <Box mt={6}>
              <Text fontWeight="600" color="gray.700" mb={2}>
                About
              </Text>
              {isEditing ? (
                <Input
                  value={editedProfile?.bio}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({ ...prev!, bio: e.target.value }))
                  }
                  placeholder="Write about yourself..."
                />
              ) : (
                <Text color="gray.700">{currentProfile.bio}</Text>
              )}
            </Box>
          </Box>
        </Box>

        {/* Contact Info */}
        <Box mb={6}>
          <Heading size="md" mb={4} color="#162837">
            Contact Information
          </Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <InfoCard icon={Mail} label="Email Address" value={currentProfile.email} />
            <InfoCard icon={Phone} label="Phone Number" value={currentProfile.phone} />
            <InfoCard icon={MapPin} label="Location" value={currentProfile.location} />
          </Grid>
        </Box>

        {/* Professional Info */}
        <Box>
          <Heading size="md" mb={4} color="#162837">
            Professional Information
          </Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
            <InfoCard icon={Briefcase} label="Position" value={currentProfile.role} />
            <InfoCard icon={Calendar} label="Member Since" value={currentProfile.joinDate} />
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileSection;