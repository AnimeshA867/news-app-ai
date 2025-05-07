"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";

// Simple category form validation schema
const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be at most 50 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CategoryPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const isNew = id === "new";
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(isNew ? false : true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [articleCount, setArticleCount] = useState(0);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  // Generate slug automatically when name changes
  const watchName = form.watch("name");
  useEffect(() => {
    if (watchName && !form.getValues("slug")) {
      form.setValue("slug", slugify(watchName), {
        shouldValidate: true,
      });
    }
  }, [watchName, form]);

  // Fetch category data if editing existing category
  useEffect(() => {
    if (isNew) return;

    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/categories/${id}`);

        if (!response.ok) {
          throw new Error("Failed to load category");
        }

        const data = await response.json();

        if (!data.category) {
          throw new Error("Category not found");
        }

        // Set form values
        form.reset({
          name: data.category.name,
          slug: data.category.slug,
          description: data.category.description || "",
        });

        // Store article count for safety check when deleting
        setArticleCount(data.category._count?.articles || 0);
      } catch (error) {
        console.error("Error fetching category:", error);
        toast({
          title: "Error",
          description: "Failed to load category data",
          variant: "destructive",
        });
        // Redirect back to category list on error
        router.push("/admin/categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [id, isNew, router, toast, form]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSaving(true);
      const method = isNew ? "POST" : "PUT";
      const endpoint = isNew ? "/api/categories" : `/api/categories/${id}`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save category");
      }

      toast({
        title: "Success",
        description: isNew
          ? "Category created successfully"
          : "Category updated successfully",
      });

      // Navigate back to category list
      router.push("/admin/categories");
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save category",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle category deletion
  const handleDelete = async () => {
    if (isNew) return;

    // Check if category has articles
    if (articleCount > 0) {
      toast({
        title: "Category Contains Articles",
        description: `This category contains ${articleCount} article${
          articleCount === 1 ? "" : "s"
        }. You must reassign or delete these articles before removing this category.`,
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog
    if (
      !confirm(
        `Are you sure you want to delete the category "${form.getValues(
          "name"
        )}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete category");
      }

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });

      // Navigate back to category list
      router.push("/admin/categories");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {isNew ? "Create Category" : "Edit Category"}
        </h1>
        {!isNew && (
          <div>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || articleCount > 0}
              className="relative"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Category
              {articleCount > 0 && (
                <span className="ml-2 text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded-sm">
                  {articleCount} article{articleCount === 1 ? "" : "s"}
                </span>
              )}
            </Button>
            {articleCount > 0 && (
              <p className="text-xs text-destructive mt-1">
                Cannot delete categories with existing articles
              </p>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="category-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Category description"
                        className="resize-vertical min-h-[100px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isNew ? "Create" : "Save"} Category
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
