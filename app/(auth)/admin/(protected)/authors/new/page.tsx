"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Loader2,
  Save,
  User,
  ImageIcon,
  X,
  Upload,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { authorSchema, AuthorFormValues } from "@/lib/schemas/author-schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export default function NewAuthorPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AuthorFormValues>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "AUTHOR",
      image: "",
      bio: "",
    },
  });

  const fetchMediaItems = async () => {
    try {
      setIsLoadingMedia(true);
      const response = await fetch("/api/media");

      if (!response.ok) {
        throw new Error("Failed to fetch media");
      }

      const data = await response.json();
      setMediaItems(data);
    } catch (error) {
      console.error("Error fetching media:", error);
      toast({
        title: "Error",
        description: "Failed to load media files",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append("files", files[0]);

    try {
      setIsUploading(true);
      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      if (data && data.length > 0) {
        form.setValue("image", data[0].url);
        // Refresh media list
        fetchMediaItems();
      }

      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onSubmit = async (values: AuthorFormValues) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/authors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create author");
      }

      toast({
        title: "Success",
        description: "Author created successfully",
      });

      router.push("/admin/authors");
      router.refresh();
    } catch (error) {
      console.error("Error creating author:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create author",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">New Author</h1>
        <p className="text-muted-foreground">Create a new author account</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar
                  className="h-20 w-20 cursor-pointer"
                  onClick={() => setShowMediaDialog(true)}
                >
                  <AvatarImage src={form.watch("image") || undefined} />
                  <AvatarFallback className="text-lg">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {form.watch("name") || "New Author"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {form.watch("email") || "email@example.com"}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setShowMediaDialog(true)}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Change Avatar
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      The author's full name as it will appear on articles.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john@example.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The email address used for login and notifications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Must be at least 6 characters long.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="EDITOR">Editor</SelectItem>
                        <SelectItem value="AUTHOR">Author</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This determines what permissions the user will have.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="https://example.com/avatar.jpg"
                          {...field}
                        />
                      </FormControl>
                      <Dialog
                        open={showMediaDialog}
                        onOpenChange={setShowMediaDialog}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                              if (mediaItems.length === 0) {
                                fetchMediaItems();
                              }
                            }}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" /> Browse
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Select Profile Image</DialogTitle>
                          </DialogHeader>

                          <div className="flex items-center gap-2 mb-4">
                            <div className="relative flex-1">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="search"
                                placeholder="Search media..."
                                className="pl-8"
                                value={mediaSearchQuery}
                                onChange={(e) =>
                                  setMediaSearchQuery(e.target.value)
                                }
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={handleUploadClick}
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" /> Upload New
                                </>
                              )}
                            </Button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              onChange={handleFileChange}
                              accept="image/*"
                            />
                          </div>

                          <div className="h-[60vh] overflow-y-auto">
                            {isLoadingMedia ? (
                              <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                  <div
                                    key={i}
                                    className="aspect-square bg-muted animate-pulse rounded-md"
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 gap-4">
                                {mediaItems
                                  .filter(
                                    (item) =>
                                      item.type.startsWith("image/") &&
                                      (mediaSearchQuery
                                        ? item.name
                                            .toLowerCase()
                                            .includes(
                                              mediaSearchQuery.toLowerCase()
                                            )
                                        : true)
                                  )
                                  .map((item) => (
                                    <div
                                      key={item.id}
                                      className={`relative aspect-square rounded-md cursor-pointer overflow-hidden border-2 ${
                                        field.value === item.url
                                          ? "border-primary"
                                          : "border-transparent hover:border-muted"
                                      }`}
                                      onClick={() => {
                                        field.onChange(item.url);
                                        setShowMediaDialog(false);
                                      }}
                                    >
                                      <Image
                                        src={item.url}
                                        alt={item.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="object-cover"
                                      />
                                    </div>
                                  ))}
                              </div>
                            )}

                            {!isLoadingMedia &&
                              mediaItems.filter((item) =>
                                item.type.startsWith("image/")
                              ).length === 0 && (
                                <div className="text-center py-12">
                                  <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                                  <p className="text-muted-foreground mb-4">
                                    No images found. Upload some images first.
                                  </p>
                                  <Button
                                    onClick={handleUploadClick}
                                    disabled={isUploading}
                                  >
                                    {isUploading ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                        Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="mr-2 h-4 w-4" />{" "}
                                        Upload Image
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {field.value && (
                      <div className="mt-2 relative h-40 w-40">
                        <Image
                          src={field.value}
                          alt="Profile preview"
                          fill
                          className="object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => field.onChange("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <FormDescription>
                      Upload or select an image for the author's profile
                      picture.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a short bio about the author..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description about the author's background.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/authors")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Create Author
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
