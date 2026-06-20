// hooks/useProfile.ts
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@chakra-ui/toast";
import { dashboardApi } from "@/services/api";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  joinDate: string;
  avatar: string;
  bio: string;
}

interface GeoLocation {
  type: "Point";
  coordinates: [number, number];
}

interface ApiUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string | GeoLocation;
  role: string;
  createdAt: string | number | Date;
  avatar?: string;
  bio?: string;
  companyId: string;
  linkedEmployees: string[];
}

export const useProfile = () => {
  const toast = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ProfileData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") || undefined : undefined;

  const formatLocation = (location?: string | GeoLocation): string => {
    if (!location) return "Unknown";
    if (typeof location === "string") return location;
    if ("coordinates" in location) {
      const [lng, lat] = location.coordinates;
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    return "Unknown";
  };

  const mapApiUserToProfile = (user: ApiUser): ProfileData => ({
    name: user.name,
    email: user.email,
    phone: user.phone || "+1 (555) 123-4567",
    location: formatLocation(user.location),
    role: user.role,
    joinDate: new Date(user.createdAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    avatar: user.avatar || `https://i.pravatar.cc/300?u=${user._id}`,
    bio: user.bio || "No bio available yet.",
  });

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!token) throw new Error("No access token. Please log in again.");

      const response = await dashboardApi.getMe(token);
      const userData: ApiUser = (response.data as any).user || response.data;

      if (!userData || !userData.name) throw new Error("Invalid user data received");

      const profileData = mapApiUserToProfile(userData);
      setProfile(profileData);
      setEditedProfile(profileData);
    } catch (err: any) {
      const message = err.message || "Failed to load profile";
      setError(message);
      toast({
        title: "Error loading profile",
        description: message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  const saveProfile = async () => {
    if (!editedProfile || !token) return;
    setIsSaving(true);
    try {
      await dashboardApi.updateProfile(token, {
        name: editedProfile.name,
        phone: editedProfile.phone,
        bio: editedProfile.bio,
        avatar: editedProfile.avatar,
      });

      setProfile(editedProfile);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
        status: "success",
        duration: 3000,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save profile",
        status: "error",
        duration: 3000,
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const startEdit = () => {
    setIsEditing(true);
  };

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
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
  };
};