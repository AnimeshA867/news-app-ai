"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, User, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadDropzone } from "@/utils/uploadthing";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  image: z.string().optional(),
  bio: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  role: string | null;
}

interface UserSettingsClientProps {
  initialUserData: UserData;
}

export function UserSettingsClient({
  initialUserData,
}: UserSettingsClientProps) {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialUserData.name || "",
      email: initialUserData.email || "",
      image: initialUserData.image || "",
      bio: initialUserData.bio || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSaveProfile = async (values: ProfileFormValues) => {
    if (!session?.user?.id) return;

    try {
      setIsSavingProfile(true);

      const response = await fetch(`/api/users/${session.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();

      // Update the session with new user data
      await update({
        ...session,
        user: {
          ...session.user,
          name: updatedUser.name,
          image: updatedUser.image,
        },
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onChangePassword = async (values: PasswordFormValues) => {
    if (!session?.user?.id) return;

    try {
      setIsSavingPassword(true);

      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to change password");
      }

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      // Reset the form
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 container max-w-3xl">
      <h1 className="text-3xl font-bold">Account Settings</h1>

      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={initialUserData.image || ""}
            alt={initialUserData.name || "User"}
          />
          <AvatarFallback className="text-xl">
            {initialUserData.name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-semibold">{initialUserData.name}</h2>
          <p className="text-muted-foreground">{initialUserData.email}</p>
          <p className="text-sm text-muted-foreground capitalize mt-1">
            Role: {initialUserData.role?.toLowerCase() || "User"}
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onSaveProfile)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Your name as it appears publicly
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormDescription>
                            Your email address used for login
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            A brief description about yourself
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Picture</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              {field.value && (
                                <div className="relative h-40 w-40 mx-auto rounded-full overflow-hidden">
                                  <Avatar className="h-40 w-40">
                                    <AvatarImage src={field.value} />
                                    <AvatarFallback className="text-4xl">
                                      {profileForm.getValues("name")?.[0] ||
                                        "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                              )}
                              <UploadDropzone<OurFileRouter, "imageUploader">
                                endpoint="imageUploader"
                                onClientUploadComplete={(res) => {
                                  if (res && res.length > 0) {
                                    field.onChange(res[0].url);
                                    toast({
                                      title: "Upload complete",
                                      description:
                                        "Profile picture updated successfully",
                                    });
                                  }
                                }}
                                onUploadError={(error) => {
                                  toast({
                                    title: "Upload failed",
                                    description:
                                      "Failed to upload image. Please try again.",
                                    variant: "destructive",
                                  });
                                }}
                              />
                              <input type="hidden" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isSavingProfile}>
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onChangePassword)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter your current password for verification
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Password must be at least 6 characters long
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Re-enter your new password to confirm
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isSavingPassword}>
                    {isSavingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Change Password
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
