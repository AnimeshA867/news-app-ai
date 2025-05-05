"use client";

import { useState, useEffect, use } from "react";
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
import { articleSchema } from "@/lib/validations/article";
import { Article, Category, Tag } from "@prisma/client";
import { useSWRConfig } from "swr";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { MultiSelect } from "@/components/ui/multi-select";

const schema = articleSchema.extend({
  categoryId: z.string().nonempty("Category is required"),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
  isBreakingNews: z.boolean(),
  isFeatured: z.boolean(),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);

  const categories = useAppSelector((state) => state.category.categories) || [];
  const tags = useAppSelector((state) => state.tag.tags) || [];
  const dispatch = useAppDispatch();

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
      featuredImageAlt: "",
      categoryId: "",
      tagIds: [],
      isBreakingNews: false,
      isFeatured: false,
    },
  });

  const featuredImageUrl = watch("featuredImage");

  const fetchCategoriesAndTags = async () => {
    try {
      const [categoriesResponse, tagsResponse] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/tags"),
      ]);

      if (!categoriesResponse.ok) {
        throw new Error(
          `Error fetching categories: ${categoriesResponse.status}`
        );
      }

      if (!tagsResponse.ok) {
        throw new Error(`Error fetching tags: ${tagsResponse.status}`);
      }

      const categoriesData = await categoriesResponse.json();
      const tagsData = await tagsResponse.json();

      dispatch({ type: "category/setCategories", payload: categoriesData });
      dispatch({ type: "tag/setTags", payload: tagsData });
    } catch (error) {
      console.error("Error fetching categories and tags:", error);
      toast({
        title: "Error",
        description: "Failed to load categories and tags. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchArticle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/articles/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch article: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.article) {
        throw new Error("Article data is missing");
      }

      setArticle(data.article);

      reset({
        ...data.article,
        categoryId: data.article.categoryId || "",
        tagIds: Array.isArray(data.article.tags)
          ? data.article.tags.map((tag: Tag) => tag.id)
          : [],
        featuredImageAlt: data.article.featuredImageAlt || "",
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
        throw new Error("Failed to upload image");
      }

      const data = await response.json();

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

  useEffect(() => {
    fetchCategoriesAndTags().then(() => fetchArticle());
  }, [id]);

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save article");
      }

      toast({
        title: "Success",
        description: "Article saved successfully.",
      });

      mutate(`/api/articles/${id}`);
      router.push("/admin/articles");
    } catch (error) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description: "Failed to save article. Please try again.",
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

  return (
    <div className="space-y-6 container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Article</h1>
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                render={({ field }) => (
                  <MultiSelect
                    selected={field.value || []}
                    options={tags.map((tag) => ({
                      value: tag.id,
                      label: tag.name,
                    }))}
                    onChange={field.onChange}
                    placeholder="Select tags"
                    emptyMessage="No tags found"
                    className="w-full"
                  />
                )}
              />
              {errors.tagIds && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.tagIds.message}
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
              htmlFor="featuredImage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Featured Image
            </label>

            <div
              className={`mt-1 border-2 border-dashed rounded-lg p-4 text-center ${
                dragActive ? "border-primary bg-primary/10" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              {featuredImageUrl ? (
                <div className="space-y-4">
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
                </div>
              )}

              <Controller
                name="featuredImage"
                control={control}
                render={({ field }) => <input type="hidden" {...field} />}
              />
            </div>
            {errors.featuredImage && (
              <p className="mt-2 text-sm text-red-600">
                {errors.featuredImage.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Save Article
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
