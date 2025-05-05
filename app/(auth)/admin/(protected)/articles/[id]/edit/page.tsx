"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2, X, Upload } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Article, Category, Tag } from "@/lib/generated/client";
import { useSWRConfig } from "swr";
import Image from "next/image";
import React from "react";
import { useSelector } from "react-redux";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
  featuredImage: z.string().optional(),
  categoryId: z.string(),
  isBreakingNews: z.boolean(),
  isFeatured: z.boolean(),
  tagIds: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

// Add this function to generate slugs from titles
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove consecutive hyphens
    .trim();
}

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const storedCategories = useSelector(
    (state: { category: { categories: Category[] } }) =>
      state.category.categories
  );
  const [categories, setCategories] = useState<Category[]>(
    storedCategories || []
  );
  const [article, setArticle] = useState<Article | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      status: "DRAFT",
      featuredImage: "",
      categoryId: "",
      isBreakingNews: false,
      isFeatured: false,
      tagIds: [],
    },
  });

  console.log("Stored categories:", storedCategories);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }
      const data = await response.json();
      setTags(data.tags || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast({
        title: "Error",
        description: "Failed to load tags. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchArticle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/articles/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch article");
      }

      const data = await response.json();

      if (!data || !data.article) {
        throw new Error("Article not found");
      }

      setArticle(data.article);

      reset({
        title: data.article.title || "",
        slug: data.article.slug || "",
        content: data.article.content || "",
        excerpt: data.article.excerpt || "",
        status: data.article.status || "DRAFT",
        featuredImage: data.article.featuredImage || "",
        categoryId: data.article.categoryId || "",
        tagIds: Array.isArray(data.article.tags)
          ? data.article.tags.map((tag: any) => tag.id)
          : [],

        isBreakingNews: !!data.article.isBreakingNews,
        isFeatured: !!data.article.isFeatured,
      });
    } catch (error) {
      console.error("Error fetching article:", error);
      toast({
        title: "Error",
        description: "Failed to load article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTags();
    if (id !== "new") {
      fetchArticle();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
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
        throw new Error("Failed to upload image");
      }

      const data = await response.json();

      control._formValues.featuredImage = data.url;
      reset({ ...control._formValues });

      setUploadProgress(100);

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
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

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const title = watch("title");

  useEffect(() => {
    if (title && (id === "new" || !article)) {
      // Only auto-generate for new articles or when article isn't loaded yet
      const newSlug = generateSlug(title);
      setValue("slug", newSlug);
    }
  }, [title, setValue, id, article]);

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const url = id === "new" ? "/api/articles" : `/api/articles/${id}`;

      const method = id === "new" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${id === "new" ? "create" : "update"} article`
        );
      }

      toast({
        title: "Success",
        description: `Article ${
          id === "new" ? "created" : "updated"
        } successfully.`,
      });

      if (id !== "new") {
        mutate(`/api/articles/${id}`);
      }
      router.push("/admin/articles");
    } catch (error) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          id === "new" ? "create" : "update"
        } article. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this article?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete article");
      }

      toast({
        title: "Success",
        description: "Article deleted successfully.",
      });

      router.push("/admin/articles");
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description: "Failed to delete article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const featuredImageUrl = watch("featuredImage");

  return (
    <div className="container space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {id === "new" ? "Create Article" : "Edit Article"}
        </h1>
        {id !== "new" && (
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
            Delete Article
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="title" placeholder="Article title" />
                )}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700"
              >
                Slug
              </label>
              <Controller
                name="slug"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="slug" placeholder="article-slug" />
                )}
              />
              {errors.slug && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.slug.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="excerpt"
              className="block text-sm font-medium text-gray-700"
            >
              Excerpt
            </label>
            <Controller
              name="excerpt"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="excerpt"
                  placeholder="Brief summary of the article"
                  rows={3}
                />
              )}
            />
            {errors.excerpt && (
              <p className="mt-2 text-sm text-red-600">
                {errors.excerpt.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Content
            </label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="content"
                  placeholder="Article content"
                  rows={10}
                />
              )}
            />
            {errors.content && (
              <p className="mt-2 text-sm text-red-600">
                {errors.content.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="featuredImage"
              className="block text-sm font-medium text-gray-700"
            >
              Featured Image
            </label>

            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center ${
                dragActive ? "border-primary bg-primary/10" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              {featuredImageUrl ? (
                <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-md overflow-hidden">
                  <Image
                    src={featuredImageUrl}
                    alt="Featured image preview"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => {
                      control._formValues.featuredImage = "";
                      reset({ ...control._formValues });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPG, GIF up to 5MB
                  </p>

                  <Controller
                    name="featuredImage"
                    control={control}
                    render={({ field }) => <input type="hidden" {...field} />}
                  />
                </div>
              )}
            </div>
            {errors.featuredImage && (
              <p className="mt-2 text-sm text-red-600">
                {errors.featuredImage.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="tagIds"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tags
              </label>
              <Controller
                name="tagIds"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center space-x-2 bg-muted p-2 rounded-md text-sm"
                      >
                        <Checkbox
                          checked={field.value?.includes(tag.id)}
                          onCheckedChange={(checked) => {
                            const updatedTags = checked
                              ? [...(field.value || []), tag.id]
                              : (field.value || []).filter(
                                  (id) => id !== tag.id
                                );
                            field.onChange(updatedTags);
                          }}
                        />
                        <span>{tag.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.tagIds && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.tagIds.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFeatured"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label htmlFor="isFeatured" className="text-sm font-medium">
                      Feature this article on homepage
                    </label>
                  </div>
                )}
              />
            </div>

            <div>
              <Controller
                name="isBreakingNews"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isBreakingNews"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label
                      htmlFor="isBreakingNews"
                      className="text-sm font-medium"
                    >
                      Mark as breaking news
                    </label>
                  </div>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {id === "new" ? "Create" : "Save"} Article
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
