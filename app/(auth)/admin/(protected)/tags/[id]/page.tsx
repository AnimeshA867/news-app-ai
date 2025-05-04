"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";

const tagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
});

type TagFormValues = z.infer<typeof tagSchema>;

export default function TagPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const isNew = id === "new";
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!isNew);

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  useEffect(() => {
    if (!isNew) {
      const fetchTag = async () => {
        try {
          const res = await fetch(`/api/tags/${id}`);
          if (!res.ok) throw new Error("Failed to fetch tag");
          const data = await res.json();
          form.reset({
            name: data.name,
            slug: data.slug,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load tag data",
            variant: "destructive",
          });
          router.push("/admin/tags");
        } finally {
          setIsFetching(false);
        }
      };
      fetchTag();
    }
  }, [id, isNew, form, router, toast]);

  const onSubmit = async (values: TagFormValues) => {
    try {
      setIsLoading(true);
      const url = isNew ? "/api/tags" : `/api/tags/${id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save tag");
      }

      toast({
        title: "Success",
        description: isNew
          ? "Tag created successfully"
          : "Tag updated successfully",
      });
      router.push("/admin/tags");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-");
  };

  if (isFetching) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">
        {isNew ? "Create New Tag" : "Edit Tag"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tag name"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (isNew) {
                        form.setValue("slug", generateSlug(e.target.value));
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>The display name of the tag.</FormDescription>
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
                  <Input placeholder="tag-slug" {...field} />
                </FormControl>
                <FormDescription>
                  URL-friendly version of the name. Used in URLs.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Tag
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/tags")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
