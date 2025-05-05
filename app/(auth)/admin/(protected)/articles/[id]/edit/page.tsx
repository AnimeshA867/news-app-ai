"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2, X } from "lucide-react";
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
// import { articleSchema } from "@/lib/validations/article";
import { Article, Category, Tag } from "@/lib/generated/client";
import { useSWRConfig } from "swr";
import Image from "next/image";
import React from "react";
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
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
  noIndex: z.boolean().optional(),
  structuredData: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
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
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      canonicalUrl: "",
      noIndex: false,
      structuredData: "",
    },
  });

  const fetchCategoriesAndTags = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/tags"),
      ]);

      if (!categoriesRes.ok || !tagsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [categoriesData, tagsData] = await Promise.all([
        categoriesRes.json(),
        tagsRes.json(),
      ]);

      setCategories(categoriesData.categories || []);
      setTags(tagsData.tags || []);
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
        metaTitle: data.article.metaTitle || "",
        metaDescription: data.article.metaDescription || "",
        metaKeywords: data.article.metaKeywords || "",
        canonicalUrl: data.article.canonicalUrl || "",
        noIndex: !!data.article.noIndex,
        structuredData: data.article.structuredData || "",
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
    fetchCategoriesAndTags();
    if (id !== "new") {
      fetchArticle();
    } else {
      setIsLoading(false);
    }
  }, [id]);

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
            <Controller
              name="featuredImage"
              control={control}
              render={({ field }) => (
                <Input {...field} id="featuredImage" placeholder="Image URL" />
              )}
            />
            {errors.featuredImage && (
              <p className="mt-2 text-sm text-red-600">
                {errors.featuredImage.message}
              </p>
            )}
            {featuredImageUrl && (
              <div className="mt-2 relative aspect-video w-full max-w-md rounded-md overflow-hidden border">
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
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => {
                    control._reset();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
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
                    <Input
                      {...field}
                      id="metaTitle"
                      placeholder="Custom meta title (defaults to article title if empty)"
                      value={field.value || ""}
                      className="mt-1"
                    />
                  )}
                />
                {control._formValues.metaTitle &&
                  control._formValues.metaTitle.length > 60 && (
                    <p className="mt-1 text-xs text-amber-500">
                      Meta title is {control._formValues.metaTitle.length}{" "}
                      characters long (recommended: 50-60)
                    </p>
                  )}
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
                    <Textarea
                      {...field}
                      id="metaDescription"
                      placeholder="Custom meta description (defaults to article excerpt if empty)"
                      value={field.value || ""}
                      className="mt-1"
                      rows={3}
                    />
                  )}
                />
                {control._formValues.metaDescription &&
                  control._formValues.metaDescription.length > 160 && (
                    <p className="mt-1 text-xs text-amber-500">
                      Meta description is{" "}
                      {control._formValues.metaDescription.length} characters
                      long (recommended: 150-160)
                    </p>
                  )}
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

              <div>
                <label
                  htmlFor="canonicalUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Canonical URL
                </label>
                <Controller
                  name="canonicalUrl"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="canonicalUrl"
                      placeholder="https://example.com/original-article (only if this is syndicated content)"
                      value={field.value || ""}
                      className="mt-1"
                    />
                  )}
                />
              </div>

              <div className="flex items-center">
                <Controller
                  name="noIndex"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="noIndex"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label
                        htmlFor="noIndex"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Exclude from search engines (noindex)
                      </label>
                    </div>
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor="structuredData"
                  className="block text-sm font-medium text-gray-700"
                >
                  Custom Structured Data (JSON-LD)
                </label>
                <Controller
                  name="structuredData"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="structuredData"
                      placeholder='{"@context":"https://schema.org","@type":"NewsArticle",...}'
                      value={field.value || ""}
                      className="mt-1 font-mono text-sm"
                      rows={8}
                    />
                  )}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Advanced: Custom JSON-LD schema markup (defaults to
                  auto-generated if empty)
                </p>
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
              {id === "new" ? "Create" : "Save"} Article
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
