"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor } from "@/components/ui/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils";

// Form schema
const pageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  content: z.string().min(1, "Content is required"),
  metaTitle: z.string().optional(),
  metaDesc: z
    .string()
    .max(160, "Meta description should be 160 characters or less")
    .optional(),
  isPublished: z.boolean().default(true),
});

type PageFormValues = z.infer<typeof pageSchema>;

export default function PageEditorPage() {
  const params = useParams();
  const isNew = params.id === "new";
  const pageId = params.id as string;

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      metaTitle: "",
      metaDesc: "",
      isPublished: true,
    },
  });

  // Watch the title to generate slug
  const watchTitle = form.watch("title");

  useEffect(() => {
    if (watchTitle && !form.getValues("slug")) {
      form.setValue("slug", slugify(watchTitle), {
        shouldValidate: true,
      });
    }
  }, [watchTitle, form]);

  useEffect(() => {
    if (isNew) return;

    const fetchPage = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/pages/${pageId}`);

        if (!response.ok) {
          throw new Error("Failed to load page");
        }

        const data = await response.json();

        form.reset({
          title: data.title,
          slug: data.slug,
          content: data.content,
          metaTitle: data.metaTitle || "",
          metaDesc: data.metaDesc || "",
          isPublished: data.isPublished,
        });
      } catch (error) {
        console.error("Error fetching page:", error);
        toast({
          title: "Error",
          description: "Failed to load page. Please try again.",
          variant: "destructive",
        });
        router.push("/admin/pages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [pageId, isNew, form, router, toast]);

  const onSubmit = async (values: PageFormValues) => {
    try {
      setIsSaving(true);

      const url = isNew ? "/api/admin/pages" : `/api/admin/pages/${pageId}`;

      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save page");
      }

      const savedPage = await response.json();

      toast({
        title: "Success",
        description: isNew
          ? "Page created successfully"
          : "Page updated successfully",
      });

      if (isNew) {
        router.push(`/admin/pages/${savedPage.id}`);
      }
    } catch (error) {
      console.error("Error saving page:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to save page",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading page data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Link
          href="/admin/pages"
          className="inline-flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pages
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mt-2">
          {isNew ? "Create New Page" : "Edit Page"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter page title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Editor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Start writing your page content here..."
                        className="min-h-[500px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Page Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Slug</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <span className="bg-muted px-2 py-2 text-muted-foreground border rounded-l-md border-r-0">
                              /
                            </span>
                            <Input
                              placeholder="page-slug"
                              {...field}
                              className="rounded-l-none"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          The URL path for this page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Published</FormLabel>
                          <FormDescription>
                            This page will be visible to visitors
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO</CardTitle>
                  <CardDescription>
                    Search engine optimization settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SEO title (leave blank to use page title)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaDesc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief description for search engines"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0}/160 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full"
                disabled={isSaving || form.formState.isSubmitting}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isNew ? "Creating..." : "Saving..."}
                  </>
                ) : (
                  <>{isNew ? "Create Page" : "Save Changes"}</>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
