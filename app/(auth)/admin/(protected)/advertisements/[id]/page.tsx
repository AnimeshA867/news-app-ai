"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, Calendar, Link2, Upload, Trash2, Plus } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { UploadDropzone } from "@/utils/uploadthing";
import { DayPicker } from "react-day-picker";
import { AdImageUpload } from "@/components/advertisements/ad-image-upload";

const positionOptions = [
  { value: "header", label: "Header" },
  { value: "footer", label: "Footer" },
  { value: "in-article", label: "In-Article" },
  { value: "before-content", label: "Before Content" },
  { value: "after-content", label: "After Content" },
  { value: "homepage-featured", label: "Homepage Featured" },
  { value: "category-top", label: "Category Top" },
];

interface AdZone {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  linkUrl: z.string().url("Must be a valid URL").nullable().optional(),
  adCode: z.string().nullable().optional(),
  width: z.number().min(1, "Width is required"),
  height: z.number().min(1, "Height is required"),
  position: z.string().min(1, "Position is required"),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  isActive: z.boolean(),
  priority: z.number().min(1).max(10),
  pageTypes: z.array(z.string()).optional(),
  pageIdentifiers: z.array(z.string().nullable()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdEditPage() {
  const params = useParams();
  const { id } = params;
  const isNew = id === "new";
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      adCode: "",
      width: 600,
      height: 400,
      position: "header",
      startDate: new Date(),
      endDate: null,
      priority: 1,
      isActive: false,
      pageTypes: [],
      pageIdentifiers: [],
    },
  });

  // Watch values for preview
  const watchImageUrl = form.watch("imageUrl");
  const watchLinkUrl = form.watch("linkUrl");
  const watchAdCode = form.watch("adCode");
  const watchWidth = form.watch("width") || 600;
  const watchHeight = form.watch("height") || 400;
  const watchPosition = form.watch("position");

  async function fetchAd() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/advertisements/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch advertisement");
      }

      const data = await response.json();

      // Prepare data for form
      form.reset({
        name: data.name,
        description: data.description || "",
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        adCode: data.adCode,
        width: data.width,
        height: data.height,
        position: data.position,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive,
        priority: data.priority,
        pageTypes: data.pages?.map((page: any) => page.pageType) || [],
        pageIdentifiers:
          data.pages?.map((page: any) => page.pageIdentifier).filter(Boolean) ||
          [],
      });
    } catch (error) {
      console.error("Error fetching advertisement:", error);
      toast({
        title: "Error",
        description: "Failed to load advertisement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isNew) {
      fetchAd();
    }
  }, [isNew, id]);

  async function onSubmit(values: FormValues) {
    try {
      setIsSaving(true);

      const response = await fetch(
        isNew ? "/api/advertisements" : `/api/advertisements/${id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message ||
            `Failed to ${isNew ? "create" : "update"} advertisement`
        );
      }

      toast({
        title: "Success",
        description: `Advertisement ${
          isNew ? "created" : "updated"
        } successfully`,
      });

      router.push("/admin/advertisements");
    } catch (error) {
      console.error(
        `Error ${isNew ? "creating" : "updating"} advertisement:`,
        error
      );
      toast({
        title: "Error",
        description: `Failed to ${isNew ? "create" : "update"} advertisement`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "advertisements");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      form.setValue("imageUrl", data.url);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {isNew ? "Create Advertisement" : "Edit Advertisement"}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="content">Ad Content</TabsTrigger>
                  <TabsTrigger value="targeting">Targeting</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Advertisement Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter advertisement name"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Internal name to identify this advertisement
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter a brief description"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Notes about the purpose or content of this ad
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="width"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Width (px)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (px)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {positionOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Where this ad will appear on the page
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <DayPicker
                                  animate
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    // Ensure we have a valid date and set it
                                    if (date) {
                                      field.onChange(date);
                                    }
                                  }}
                                  classNames={{
                                    today: "text-red-500",
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              When this ad should start showing
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date (Optional)</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>No end date</span>
                                    )}
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <div className="p-2 flex justify-between">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      field.onChange(null);
                                    }}
                                  >
                                    Clear
                                  </Button>
                                </div>
                                <DayPicker
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={(date) => field.onChange(date)}
                                  // Make sure the disabled function doesn't cause issues
                                  disabled={(date) => {
                                    const startDate =
                                      form.getValues("startDate");
                                    return startDate && date
                                      ? date < startDate
                                      : false;
                                  }}
                                  classNames={{
                                    today: "text-red-500",
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              When this ad should stop showing (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority (1-10)</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(parseInt(value))
                              }
                              defaultValue={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[...Array(10)].map((_, i) => (
                                  <SelectItem
                                    key={i + 1}
                                    value={(i + 1).toString()}
                                  >
                                    {i + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Higher priority ads are shown first when multiple
                              ads compete
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Active Status</FormLabel>
                              <FormDescription>
                                Enable or disable this advertisement
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="pt-4 space-y-4">
                  <AdImageUpload
                    name="imageUrl"
                    control={form.control}
                    form={form}
                    width={watchWidth}
                    height={watchHeight}
                    label="Advertisement Image"
                    description={`Recommended size: ${watchWidth}x${watchHeight}px`}
                  />

                  <FormField
                    control={form.control}
                    name="linkUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Click URL</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                              <Link2 className="h-4 w-4" />
                            </span>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="https://example.com/landing-page"
                              className="rounded-l-none"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Where users will go when they click the ad
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Ad Code (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            placeholder="Paste custom HTML or JavaScript ad code here"
                            className="font-mono text-sm"
                            rows={10}
                          />
                        </FormControl>
                        <FormDescription>
                          If provided, this custom code will be used instead of
                          the image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="targeting" className="pt-4 space-y-4">
                  <div className="mt-8 space-y-4">
                    <div>
                      <FormLabel className="text-base">
                        Page Targeting
                      </FormLabel>
                      <FormDescription>
                        Specify which types of pages this ad should appear on
                      </FormDescription>
                    </div>

                    <div className="space-y-4">
                      {form.watch("pageTypes")?.map((_, index) => (
                        <div
                          key={index}
                          className="flex flex-col space-y-2 p-4 border rounded-md"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Target #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentPageTypes =
                                  form.getValues("pageTypes") || [];
                                const currentPageIds =
                                  form.getValues("pageIdentifiers") || [];

                                currentPageTypes.splice(index, 1);
                                currentPageIds.splice(index, 1);

                                form.setValue("pageTypes", currentPageTypes);
                                form.setValue(
                                  "pageIdentifiers",
                                  currentPageIds
                                );
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <FormLabel>Page Type</FormLabel>
                              <Select
                                value={form.watch(`pageTypes.${index}`)}
                                onValueChange={(value) => {
                                  const pageTypes = [
                                    ...(form.getValues("pageTypes") || []),
                                  ];
                                  pageTypes[index] = value;
                                  form.setValue("pageTypes", pageTypes);
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select page type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="global">
                                    Global (All Pages)
                                  </SelectItem>
                                  <SelectItem value="homepage">
                                    Homepage
                                  </SelectItem>
                                  <SelectItem value="article">
                                    Article
                                  </SelectItem>
                                  <SelectItem value="category">
                                    Category
                                  </SelectItem>
                                  <SelectItem value="author">Author</SelectItem>
                                  <SelectItem value="search">
                                    Search Results
                                  </SelectItem>
                                  <SelectItem value="tag">Tag Page</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <FormLabel>Page Identifier (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Page ID or slug"
                                  value={
                                    form.watch(`pageIdentifiers.${index}`) || ""
                                  }
                                  onChange={(e) => {
                                    const pageIds = [
                                      ...(form.getValues("pageIdentifiers") ||
                                        []),
                                    ];
                                    pageIds[index] = e.target.value || null;
                                    form.setValue("pageIdentifiers", pageIds);
                                  }}
                                />
                              </FormControl>
                              <p className="text-sm text-muted-foreground mt-1">
                                Leave empty to target all pages of this type
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const currentPageTypes =
                            form.getValues("pageTypes") || [];
                          const currentPageIds =
                            form.getValues("pageIdentifiers") || [];

                          form.setValue("pageTypes", [...currentPageTypes, ""]);
                          form.setValue("pageIdentifiers", [
                            ...currentPageIds,
                            null,
                          ]);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Page Targeting
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isNew ? "Creating..." : "Updating..."}
                    </>
                  ) : (
                    <>
                      {isNew ? "Create Advertisement" : "Update Advertisement"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Ad Preview</h3>
              <div
                className="border rounded-md flex items-center justify-center bg-muted/30 overflow-hidden"
                style={{
                  width: "100%",
                  height: `${Math.min(400, watchHeight)}px`,
                }}
              >
                {watchAdCode ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: watchAdCode }}
                    className="w-full h-full"
                  />
                ) : watchImageUrl ? (
                  <div className="relative">
                    <Image
                      src={watchImageUrl}
                      alt="Ad preview"
                      width={Math.min(400, watchWidth)}
                      height={Math.min(400, watchHeight)}
                      className="object-contain"
                    />
                    {watchLinkUrl && (
                      <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-1 text-xs text-center truncate">
                        Links to: {watchLinkUrl}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    Add an image or custom code to see preview
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Size & Position</h4>
                <p className="text-sm flex justify-between border-b py-1">
                  <span className="text-muted-foreground">Size:</span>
                  <span>
                    {watchWidth} × {watchHeight}px
                  </span>
                </p>
                <p className="text-sm flex justify-between border-b py-1">
                  <span className="text-muted-foreground">Position:</span>
                  <span>
                    {positionOptions.find((p) => p.value === watchPosition)
                      ?.label || watchPosition}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
