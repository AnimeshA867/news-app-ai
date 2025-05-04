"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
// import { formatDate } from "@/lib/utils";
import { Article, Category, Tag } from "@prisma/client";
import { useSWRConfig } from "swr";
import Image from "next/image";

const schema = articleSchema.extend({
  categoryId: z.string().nonempty("Category is required"),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
  isBreakingNews: z.boolean(),
  isFeatured: z.boolean(),
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
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fetchCategoriesAndTags = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/tags"),
      ]);

      const [categoriesData, tagsData] = await Promise.all([
        categoriesRes.json(),
        tagsRes.json(),
      ]);

      setCategories(categoriesData.categories);
      setTags(tagsData.tags);
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
      const data = await response.json();
      setArticle(data.article);
      reset({
        ...data.article,
        categoryId: data.article.categoryId || "",
        tagIds: data.article.tags.map((tag: Tag) => tag.id) || [],
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
    fetchArticle();
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
                  <Select
                    value={field.value?.[0] || undefined} // Use the first tag ID or undefined
                    onValueChange={(value: string) => field.onChange([value])} // Wrap the selected value in an array
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
                  <Select
                    value={field.value?.[0] || undefined}
                    onValueChange={(value: string) => {
                      const newValue = field.value?.includes(value)
                        ? field.value.filter((id) => id !== value)
                        : [...(field.value || []), value];
                      field.onChange(newValue);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tags" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                htmlFor="featuredImage"
                className="block text-sm font-medium text-gray-700"
              >
                Featured Image
              </label>
              <Controller
                name="featuredImage"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="featuredImage"
                    placeholder="Image URL"
                    value={field.value ?? ""}
                  />
                )}
              />
              {errors.featuredImage && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.featuredImage.message}
                </p>
              )}
            </div>
          </div>

          {article?.featuredImage && (
            <div className="mt-4">
              <Image
                src={article.featuredImage}
                alt="Featured Image"
                width={600}
                height={300}
                className="rounded-md"
              />
            </div>
          )}

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
