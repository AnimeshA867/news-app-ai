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

// Create a schema for author form validation
const authorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["USER", "ADMIN", "AUTHOR"]),
  bio: z.string().optional().nullable(),
  image: z.string().optional().optional(),
});

type FormData = z.infer<typeof authorSchema>;

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
        }
      : {
          name: initialAuthor?.name || "",
          email: initialAuthor?.email || "",
          role: initialAuthor?.role || "AUTHOR",
          bio: initialAuthor?.authorProfile?.bio || "",
          image: initialAuthor?.authorProfile?.image || "",
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

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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
              <TipTapEditor
                content={field.value || ""}
                onChange={field.onChange}
                placeholder="Write bio of the author..."
              />
            )}
          />
          {errors.bio && (
            <p className="mt-2 text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="profilePicture"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Profile Picture
          </label>

          <div
            className={`mt-1 border-2 border-dashed rounded-lg p-4 text-center ${
              dragActive ? "border-primary bg-primary/10" : "border-gray-300"
            } cursor-pointer`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            {profilePictureUrl ? (
              <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="relative h-40 w-40 mx-auto rounded-full overflow-hidden">
                  <Image
                    src={profilePictureUrl}
                    alt="Profile picture preview"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setValue("image", "");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : isUploading ? (
              <div className="py-8 flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
                <p>Uploading image... {uploadProgress}%</p>
                <div className="w-full max-w-md mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm text-gray-600">
                  Click or drag and drop an image
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            )}

            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleFileChange}
            />

            <Controller
              name="image"
              control={control}
              render={({ field }) => <input type="hidden" {...field} />}
            />
          </div>
          {errors.image && (
            <p className="mt-2 text-sm text-red-600">{errors.image.message}</p>
          )}
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
