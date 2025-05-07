"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import React from "react";
import { TipTapEditor } from "../editor/tiptap-editor";
import { UploadButton } from "@/utils/uploadthing";
import { UploadProfilePicture } from "./upload-image";

// Create a schema for author form validation

interface AuthorEditFormProps {
  authorId: string;
  initialAuthor: any; // The author data from server
  isNew: boolean;
}

export default function AuthorEditForm({
  authorId,
  initialAuthor,
  isNew,
}: AuthorEditFormProps) {
  const authorSchema = z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      role: z.enum(["USER", "ADMIN", "AUTHOR"]),
      bio: z.string().optional().nullable(),
      image: z.string().optional(),
      // Add password fields
      password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        // Make password optional for existing users
        .optional()
        .refine((val) => !isNew || val, {
          message: "Password is required for new users",
        }),
      confirmPassword: z.string().optional(),
    })
    .refine(
      (data) => !data.password || data.password === data.confirmPassword,
      {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      }
    );

  type FormData = z.infer<typeof authorSchema>;

  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(authorSchema),
    defaultValues: isNew
      ? {
          name: "",
          email: "",
          role: "AUTHOR",
          bio: "",
          image: "",
          password: "",
          confirmPassword: "",
        }
      : {
          name: initialAuthor?.name || "",
          email: initialAuthor?.email || "",
          role: initialAuthor?.role || "AUTHOR",
          bio: initialAuthor?.authorProfile?.bio || "",
          image: initialAuthor?.authorProfile?.image || "",
          password: "", // Default to empty for existing users
          confirmPassword: "",
        },
  });

  const profilePictureUrl = watch("image");

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();

      setValue("image", data.url);

      setUploadProgress(100);

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleImageUpload(event.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      // For new authors use POST, for existing ones use PUT
      const url = isNew ? "/api/authors" : `/api/authors/${authorId}`;
      const method = isNew ? "POST" : "PUT";

      // Prepare payload - only include password if provided
      const payload = {
        name: data.name,
        email: data.email,
        role: data.role,
        bio: data.bio,
        image: data.image,
        ...(data.password ? { password: data.password } : {}),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to ${isNew ? "create" : "update"} author`
        );
      }

      toast({
        title: "Success",
        description: `Author ${isNew ? "created" : "updated"} successfully.`,
      });

      router.replace("/admin/authors");
    } catch (error) {
      console.error(`Error ${isNew ? "creating" : "saving"} author:`, error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${
                isNew ? "create" : "update"
              } author. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return; // Can't delete a new author

    if (
      !confirm(
        "Are you sure you want to delete this author? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/authors/${authorId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete author");
      }

      toast({
        title: "Success",
        description: "Author deleted successfully.",
      });

      router.replace("/admin/authors");
    } catch (error) {
      console.error("Error deleting author:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete author. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {isNew ? "Create Author" : "Edit Author"}
        </h1>
        {!isNew && (
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete Author
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} id="name" placeholder="Author name" />
              )}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="author@example.com"
                />
              )}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTHOR">Author</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700"
          >
            Biography
          </label>
          <Controller
            name="bio"
            control={control}
            render={({ field }) => (
              <Textarea
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
                id="bio"
                placeholder="Write bio of the author..."
                rows={4}
              />
            )}
          />
          {errors.bio && (
            <p className="mt-2 text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>

        <div className="flex flex-col items-center ">
          <label
            htmlFor="profilePicture"
            className="block text-sm font-medium text-gray-700 mb-4 mx-auto "
          >
            Profile Picture
          </label>

          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <UploadProfilePicture
                value={field.value || ""}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Password fields - only show when creating new author or explicitly changing password */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              {isNew ? "Password" : "New Password"}
              {!isNew && (
                <span className="text-xs text-muted-foreground ml-1">
                  (leave blank to keep unchanged)
                </span>
              )}
            </label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="password"
                  type="password"
                  placeholder={
                    isNew ? "Enter password" : "Enter new password (optional)"
                  }
                />
              )}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  disabled={!watch("password")}
                />
              )}
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isNew ? "Create Author" : "Save Author"}
          </Button>
        </div>
      </form>
    </>
  );
}
