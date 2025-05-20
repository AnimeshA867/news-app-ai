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
import { TipTapEditor } from "@/components/editor/tiptap-editor";
import { UploadDropzone } from "@/utils/uploadthing";
import { UploadImage } from "./upload-image";

// Schema extension for form
// Update your schema
const schema = articleSchema.extend({
  categoryId: z.string().nonempty("Category is required"),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
  featuredImageAlt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  noIndex: z.boolean().default(false).optional(),
  structuredData: z.string().optional(),
  jsonLd: z.record(z.any()).optional(),
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
          structuredData: "{}",
          jsonLd: {},
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
          structuredData: initialArticle?.structuredData || "{}",
          jsonLd: initialArticle?.jsonLd
            ? typeof initialArticle.jsonLd === "string"
              ? JSON.parse(initialArticle.jsonLd)
              : initialArticle.jsonLd
            : {},
        },
  });

  const featuredImageUrl = watch("featuredImage");
  const title = watch("title");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue("title", newTitle);

    if (isNewArticle) {
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
    // Validate JSON-LD if needed
    try {
      if (data.structuredData && data.structuredData.trim() !== "") {
        JSON.parse(data.structuredData);
      }
    } catch (err) {
      toast({
        title: "Invalid JSON-LD",
        description: "Please fix the JSON-LD syntax before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
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
      router.refresh();
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error("Invalid response from server");
      }

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
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleDelete = async () => {
    if (isNewArticle) return;

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
      router.refresh();
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
              <TipTapEditor
                content={field.value || ""}
                onChange={field.onChange}
                placeholder="Write article content here..."
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
              const options = tags.map((tag) => ({
                value: tag.id,
                label: tag.name,
              }));

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
                          ? "#1f2937"
                          : "#ffffff",
                      borderColor: state.isFocused
                        ? "#3b82f6"
                        : document.documentElement.classList.contains("dark")
                          ? "#374151"
                          : "#d1d5db",
                      color: document.documentElement.classList.contains("dark")
                        ? "#ffffff"
                        : "#000000",
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor:
                        document.documentElement.classList.contains("dark")
                          ? "#1f2937"
                          : "#ffffff",
                      color: document.documentElement.classList.contains("dark")
                        ? "#ffffff"
                        : "#000000",
                    }),
                    menuList: (base) => ({
                      ...base,
                      backgroundColor:
                        document.documentElement.classList.contains("dark")
                          ? "#1f2937"
                          : "#ffffff",
                      color: document.documentElement.classList.contains("dark")
                        ? "#ffffff"
                        : "#000000",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused
                        ? document.documentElement.classList.contains("dark")
                          ? "#374151"
                          : "#e5e7eb"
                        : "transparent",
                      color: state.isFocused
                        ? document.documentElement.classList.contains("dark")
                          ? "#ffffff"
                          : "#000000"
                        : base.color,
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor:
                        document.documentElement.classList.contains("dark")
                          ? "#374151"
                          : "#e5e7eb",
                      color: document.documentElement.classList.contains("dark")
                        ? "#ffffff"
                        : "#000000",
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: document.documentElement.classList.contains("dark")
                        ? "#ffffff"
                        : "#000000",
                    }),
                    multiValueRemove: (base) => ({
                      ...base,
                      color: document.documentElement.classList.contains("dark")
                        ? "#f87171"
                        : "#ef4444",
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
            className="block text-sm font-medium text-gray-700"
          >
            Featured Image
          </label>
          <UploadImage
            onChange={(url) => {
              if (url) setValue("featuredImage", url);
            }}
            value={featuredImageUrl}
          />
          {errors.featuredImage && (
            <p className="mt-2 text-sm text-red-600">
              {errors.featuredImage.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="featuredImage"
            className="block text-sm font-medium text-gray-700"
          >
            Featured Image Alt
          </label>
          <Controller
            name="featuredImageAlt"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="featuredImageAlt"
                placeholder="Alternative text for the image"
              />
            )}
          />
        </div>

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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Structured Data (JSON-LD)</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const articleData = watch();
                const jsonLd = {
                  "@context": "https://schema.org",
                  "@type": "NewsArticle",
                  headline: articleData.title,
                  description: articleData.excerpt || "",
                  image: articleData.featuredImage
                    ? [articleData.featuredImage]
                    : [],
                  datePublished: new Date().toISOString(),
                  dateModified: new Date().toISOString(),
                  author: {
                    "@type": "Person",
                    name: "Editor",
                  },
                  publisher: {
                    "@type": "Organization",
                    name: "NewsHub",
                    logo: {
                      "@type": "ImageObject",
                      url: "/logo.png",
                    },
                  },
                  mainEntityOfPage: {
                    "@type": "WebPage",
                    "@id": `https://yourdomain.com/article/${articleData.slug}`,
                  },
                };

                setValue("jsonLd", jsonLd);
                setValue("structuredData", JSON.stringify(jsonLd, null, 2));
              }}
            >
              Generate
            </Button>
          </div>

          <Controller
            name="structuredData"
            control={control}
            render={({ field }) => (
              <div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <label
                      htmlFor="structuredData"
                      className="text-sm font-medium"
                    >
                      JSON-LD
                    </label>
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Structured data for SEO)
                    </span>
                  </div>
                  <Textarea
                    placeholder='{
                      "@context": "https://schema.org",
                      "@type": "NewsArticle",
                      "headline": "Article Title",
                      ...
                    }'
                    className="font-mono text-sm h-48"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setValue("jsonLd", parsed);
                      } catch (err) {
                        // Only show error if there's actual content and it's invalid
                        if (e.target.value.trim().length > 0) {
                          console.error("Invalid JSON-LD:", err);
                          // Optional: You can comment out this toast if it's too intrusive
                          // toast({
                          //   title: "Invalid JSON-LD",
                          //   description: "Please check your JSON-LD syntax.",
                          //   variant: "destructive",
                          // });
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          />
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
