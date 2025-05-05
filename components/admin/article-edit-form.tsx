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
import ReactSelect from "react-select";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { articleSchema } from "@/lib/validations/article";
import React from "react";

// Schema extension for form
// Update your schema
const schema = articleSchema.extend({
  categoryId: z.string().nonempty("Category is required"),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
  // featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  // SEO fields
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  noIndex: z.boolean().default(false).optional(),
});

type FormData = z.infer<typeof schema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface ArticleEditFormProps {
  articleId: string;
  initialArticle: any; // The article data from server
  initialCategories: Category[];
  initialTags: Tag[];
}

export default function ArticleEditForm({
  articleId,
  initialArticle,
  initialCategories,
  initialTags,
}: ArticleEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Save our server-fetched data in state
  const [categories, setCategories] = useState<Category[]>(
    initialCategories || []
  );
  const [tags, setTags] = useState<Tag[]>(initialTags || []);

  const isNewArticle = articleId === "new";

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isNewArticle
      ? {
          title: "",
          slug: "",
          content: "",
          excerpt: "",
          status: "DRAFT",
          featuredImage: "",
          featuredImageAlt: "",
          categoryId: "",
          tagIds: [],
          metaTitle: "",
          metaDescription: "",
          metaKeywords: "",
          noIndex: false,
        }
      : {
          title: initialArticle?.title || "",
          slug: initialArticle?.slug || "",
          content: initialArticle?.content || "",
          excerpt: initialArticle?.excerpt || "",
          status: initialArticle?.status || "DRAFT",
          featuredImage: initialArticle?.featuredImage || "",
          featuredImageAlt: initialArticle?.featuredImageAlt || "",
          categoryId: initialArticle?.categoryId || "",
          tagIds: initialArticle?.tags?.map((tag: any) => tag.id) || [],
          metaTitle: initialArticle?.metaTitle || "",
          metaDescription: initialArticle?.metaDescription || "",
          metaKeywords: initialArticle?.metaKeywords || "",
          noIndex: initialArticle?.noIndex || false,
        },
  });

  const featuredImageUrl = watch("featuredImage");
  const title = watch("title");

  // Generate a slug from the title automatically
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue("title", newTitle);

    if (isNewArticle) {
      // Only auto-generate slug for new articles
      const slug = newTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      setValue("slug", slug);
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
      // For new articles use POST, for existing ones use PUT
      const url = isNewArticle ? "/api/articles" : `/api/articles/${articleId}`;
      const method = isNewArticle ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isNewArticle ? "create" : "update"} article`
        );
      }

      toast({
        title: "Success",
        description: `Article ${
          isNewArticle ? "created" : "updated"
        } successfully.`,
      });

      router.push("/admin/articles");
      router.refresh(); // Refresh server components
    } catch (error) {
      console.error(
        `Error ${isNewArticle ? "creating" : "saving"} article:`,
        error
      );
      toast({
        title: "Error",
        description: `Failed to ${
          isNewArticle ? "create" : "update"
        } article. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
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
      // Create form data
      const formData = new FormData();
      formData.append("image", file);

      // Simulate upload progress with intervals
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      // Upload the image
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();

      // Check if data has url property
      if (!data.url) {
        throw new Error("Invalid response from server");
      }

      // Set the image URL in the form
      setValue("featuredImage", data.url);

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
      // Small delay to show 100% progress before resetting
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleDelete = async () => {
    if (isNewArticle) return; // Can't delete a new article

    if (!confirm("Are you sure you want to delete this article?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
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
      router.refresh(); // Refresh server components
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

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {isNewArticle ? "Create Article" : "Edit Article"}
        </h1>
        {!isNewArticle && (
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
                <Input
                  {...field}
                  id="title"
                  placeholder="Article title"
                  onChange={handleTitleChange}
                />
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
              Slug (URL)
            </label>
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="slug"
                  placeholder="article-url-slug"
                  className={isNewArticle ? "bg-muted" : ""}
                  readOnly={isNewArticle}
                />
              )}
            />
            {isNewArticle && (
              <p className="mt-1 text-xs text-muted-foreground">
                Auto-generated from title
              </p>
            )}
            {errors.slug && (
              <p className="mt-2 text-sm text-red-600">{errors.slug.message}</p>
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <SelectItem value="loading" disabled>
                        No categories found
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status">
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
                placeholder="Article excerpt"
                value={field.value || ""}
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
            htmlFor="tagIds"
            className="block text-sm font-medium text-gray-700"
          >
            Tags
          </label>
          <Controller
            name="tagIds"
            control={control}
            render={({ field }) => {
              // Prepare the options and selected values
              const options = tags.map((tag) => ({
                value: tag.id,
                label: tag.name,
              }));

              // Create the currently selected values array
              const selectedValues = options.filter(
                (option) => field.value && field.value.includes(option.value)
              );

              return (
                <ReactSelect
                  isMulti
                  id="tagIds"
                  name="tagIds"
                  value={selectedValues}
                  options={options}
                  className={`basic-multi-select ${
                    document.documentElement.classList.contains("dark")
                      ? "dark-mode-select"
                      : "light-mode-select"
                  }`}
                  classNamePrefix="select"
                  placeholder="Select tags"
                  noOptionsMessage={() => "No tags found"}
                  onChange={(selectedOptions) => {
                    const values = selectedOptions
                      ? selectedOptions.map((option: any) => option.value)
                      : [];
                    field.onChange(values);
                  }}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      backgroundColor:
                        document.documentElement.classList.contains("dark")
                          ? "#1f2937" // Dark mode background
                          : "#ffffff", // Light mode background
                      borderColor: state.isFocused
                        ? "#3b82f6" // Focus border color
                        : document.documentElement.classList.contains("dark")
                        ? "#374151" // Dark mode border
                        : "#d1d5db", // Light mode border
                      color: document.documentElement.classList.contains("dark")
                        ? "#ffffff" // Dark mode text
                        : "#000000", // Light mode text
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor:
                        document.documentElement.classList.contains("dark")
                          ? "#1f2937" // Dark mode menu background
                          : "#ffffff", // Light mode menu background
                      color: document.documentElement.classList.contains("dark")
                        ? "#ffffff" // Dark mode menu text
                        : "#000000", // Light mode menu text
                    }),
                    menuList: (base) => ({
                      ...base,
                      backgroundColor:
                        document.documentElement.classList.contains("dark")
                          ? "#1f2937" // Dark mode menu list background
                          : "#ffffff", // Light mode menu list background
                      color: document.documentElement.classList.contains("dark")
                        ? "#ffffff" // Dark mode menu list text
                        : "#000000", // Light mode menu list text
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused
                        ? document.documentElement.classList.contains("dark")
                          ? "#374151" // Dark mode hover background
                          : "#e5e7eb" // Light mode hover background
                        : "transparent",
                      color: state.isFocused
                        ? document.documentElement.classList.contains("dark")
                          ? "#ffffff" // Dark mode hover text
                          : "#000000" // Light mode hover text
                        : base.color,
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor:
                        document.documentElement.classList.contains("dark")
                          ? "#374151" // Dark mode multi-value background
                          : "#e5e7eb", // Light mode multi-value background
                      color: document.documentElement.classList.contains("dark")
                        ? "#ffffff" // Dark mode multi-value text
                        : "#000000", // Light mode multi-value text
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: document.documentElement.classList.contains("dark")
                        ? "#ffffff" // Dark mode multi-value label text
                        : "#000000", // Light mode multi-value label text
                    }),
                    multiValueRemove: (base) => ({
                      ...base,
                      color: document.documentElement.classList.contains("dark")
                        ? "#f87171" // Dark mode remove icon
                        : "#ef4444", // Light mode remove icon
                    }),
                  }}
                />
              );
            }}
          />
          {errors.tagIds && (
            <p className="mt-2 text-sm text-red-600">{errors.tagIds.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="featuredImage"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Featured Image
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
            {featuredImageUrl ? (
              <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setValue("featuredImage", "");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-2">
                  <label
                    htmlFor="featuredImageAlt"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Image Alt Text (for accessibility)
                  </label>
                  <Controller
                    name="featuredImageAlt"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="featuredImageAlt"
                        placeholder="Describe the image for screen readers and SEO"
                        value={field.value || ""}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  />
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
              name="featuredImage"
              control={control}
              render={({ field }) => (
                <input type="hidden" {...field} value={field.value || ""} />
              )}
            />
          </div>
          {errors.featuredImage && (
            <p className="mt-2 text-sm text-red-600">
              {errors.featuredImage.message}
            </p>
          )}
        </div>

        {/* SEO Settings Section */}
        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="metaTitle"
                className="block text-sm font-medium text-gray-700"
              >
                Meta Title
                <span className="text-muted-foreground ml-1 text-xs">
                  (Recommended: 50-60 characters)
                </span>
              </label>
              <Controller
                name="metaTitle"
                control={control}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      id="metaTitle"
                      placeholder="Custom meta title (defaults to article title if empty)"
                      value={field.value || ""}
                      className="mt-1"
                    />
                    {field.value && field.value.length > 60 && (
                      <p className="mt-1 text-xs text-amber-500">
                        Meta title is {field.value.length} characters long
                        (recommended: 50-60)
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div>
              <label
                htmlFor="metaDescription"
                className="block text-sm font-medium text-gray-700"
              >
                Meta Description
                <span className="text-muted-foreground ml-1 text-xs">
                  (Recommended: 150-160 characters)
                </span>
              </label>
              <Controller
                name="metaDescription"
                control={control}
                render={({ field }) => (
                  <>
                    <Textarea
                      {...field}
                      id="metaDescription"
                      placeholder="Custom meta description (defaults to article excerpt if empty)"
                      value={field.value || ""}
                      className="mt-1"
                      rows={3}
                    />
                    {field.value && field.value.length > 160 && (
                      <p className="mt-1 text-xs text-amber-500">
                        Meta description is {field.value.length} characters long
                        (recommended: 150-160)
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div>
              <label
                htmlFor="metaKeywords"
                className="block text-sm font-medium text-gray-700"
              >
                Meta Keywords (comma-separated)
              </label>
              <Controller
                name="metaKeywords"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="metaKeywords"
                    placeholder="news, article, keyword1, keyword2"
                    value={field.value || ""}
                    className="mt-1"
                  />
                )}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Less important for SEO now, but still used by some search
                engines
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="noIndex"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="noIndex"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary"
                  />
                )}
              />
              <label htmlFor="noIndex" className="text-sm font-medium">
                Exclude from search engines (noindex)
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isNewArticle ? "Create Article" : "Save Article"}
          </Button>
        </div>
      </form>
    </>
  );
}
