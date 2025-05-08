"use client";

import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { SocialImageUpload } from "@/components/settings/social-image-upload";
import { redirect, useRouter } from "next/navigation";

const generalSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteUrl: z.string().min(1, "Site URL is required"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  socialImageUrl: z.string().optional(),
  twitterImageUrl: z.string().optional(),
  facebookImageUrl: z.string().optional(),
});

const emailSettingsSchema = z.object({
  senderEmail: z.string().email("Invalid email address"),
  senderName: z.string().min(1, "Sender name is required"),
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
});

const featureSettingsSchema = z.object({
  enableNewsletter: z.boolean({
    required_error: "enableNewsletter is required",
  }),
  enableSearch: z.boolean({
    required_error: "enableSearch is required",
  }),
  enableSocialSharing: z.boolean({
    required_error: "enableSocialSharing is required",
  }),
  enableRelatedArticles: z.boolean({
    required_error: "enableRelatedArticles is required",
  }),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
type EmailSettingsValues = z.infer<typeof emailSettingsSchema>;
type FeatureSettingsValues = z.infer<typeof featureSettingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingFeatures, setIsSavingFeatures] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const router = useRouter();
  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: "",
      siteUrl: "",
      tagline: "",
      description: "",
      logoUrl: "",
      faviconUrl: "",
    },
  });

  const emailForm = useForm<EmailSettingsValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      senderEmail: "",
      senderName: "",
      smtpHost: "",
      smtpPort: "",
      smtpUsername: "",
      smtpPassword: "",
    },
  });

  const featureForm = useForm<FeatureSettingsValues>({
    resolver: zodResolver(featureSettingsSchema),
    defaultValues: {
      enableNewsletter: true,
      enableSearch: true,
      enableSocialSharing: true,
      enableRelatedArticles: true,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoadingSettings(true);

        // Fetch settings from API
        const response = await fetch("/api/settings");
        if (!response.ok) {
          throw new Error("Failed to fetch settings");
        }

        const settings = await response.json();

        // Set general settings
        generalForm.reset({
          siteName: settings.siteName || "",
          siteUrl: settings.siteUrl || "",
          tagline: settings.tagline || "",
          description: settings.description || "",
          logoUrl: settings.logoUrl || "",
          faviconUrl: settings.faviconUrl || "",
        });

        // Set email settings
        emailForm.reset({
          senderEmail: settings.senderEmail || "",
          senderName: settings.senderName || "",
          smtpHost: settings.smtpHost || "",
          smtpPort: settings.smtpPort || "",
          smtpUsername: settings.smtpUsername || "",
          smtpPassword: settings.smtpPassword || "",
        });

        // Set feature settings
        featureForm.reset({
          enableNewsletter: settings.enableNewsletter,
          enableSearch: settings.enableSearch,
          enableSocialSharing: settings.enableSocialSharing,
          enableRelatedArticles: settings.enableRelatedArticles,
        });

        setIsLoadingSettings(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [generalForm, emailForm, featureForm, toast]);

  const onSaveGeneralSettings = async (values: GeneralSettingsValues) => {
    try {
      setIsSavingGeneral(true);

      // Get current settings first
      const currentSettingsResponse = await fetch("/api/settings");
      const currentSettings = await currentSettingsResponse.json();

      // Merge current settings with new general settings to avoid losing other values
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentSettings, // Keep existing settings
          ...values, // Update with new general settings
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save general settings");
      }

      toast({
        title: "Success",
        description: "General settings updated successfully",
      });
      router.replace("/admin");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const onSaveEmailSettings = async (values: EmailSettingsValues) => {
    try {
      setIsSavingEmail(true);

      // Get current settings first
      const currentSettingsResponse = await fetch("/api/settings");
      const currentSettings = await currentSettingsResponse.json();

      // Merge current settings with new email settings to avoid losing other values
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentSettings, // Keep existing settings
          ...values, // Update with new email settings
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save email settings");
      }

      toast({
        title: "Success",
        description: "Email settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSavingEmail(false);
    }
  };

  const onSaveFeatureSettings = async (values: FeatureSettingsValues) => {
    try {
      setIsSavingFeatures(true);

      // Get current settings first
      const currentSettingsResponse = await fetch("/api/settings");
      const currentSettings = await currentSettingsResponse.json();

      // Merge current settings with new feature settings to avoid losing other values
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentSettings, // Keep existing settings
          ...values, // Update with new feature settings
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save feature settings");
      }

      toast({
        title: "Success",
        description: "Feature settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSavingFeatures(false);
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 container">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs
        defaultValue="general"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic settings for your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form
                  onSubmit={generalForm.handleSubmit(onSaveGeneralSettings)}
                  className="space-y-4"
                >
                  <FormField
                    control={generalForm.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of your website
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="siteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://news.manasukh.com"
                          />
                        </FormControl>
                        <FormDescription>
                          The full URL of your website (used for sitemap and
                          social sharing)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          A short description displayed under the site name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Describe your website"
                          />
                        </FormControl>
                        <FormDescription>
                          Used for SEO and social sharing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The URL to your site logo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="faviconUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Favicon URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The URL to your site favicon
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">
                      Social Media Images
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure images that appear when your content is shared
                      on social media platforms
                    </p>

                    <SocialImageUpload
                      name="socialImageUrl"
                      control={generalForm.control}
                      form={generalForm}
                      label="Default Social Image"
                      description="Default image used when content is shared on social media platforms"
                      recommendedSize="1200×630px"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <SocialImageUpload
                        name="twitterImageUrl"
                        control={generalForm.control}
                        form={generalForm}
                        label="Twitter Card Image"
                        description="Specific image for Twitter"
                        recommendedSize="1200×600px"
                      />

                      <SocialImageUpload
                        name="facebookImageUrl"
                        control={generalForm.control}
                        form={generalForm}
                        label="Facebook/Open Graph Image"
                        description="Specific image for Facebook"
                        recommendedSize="1200×630px"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSavingGeneral}>
                    {isSavingGeneral ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure email notifications and delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(onSaveEmailSettings)}
                  className="space-y-4"
                >
                  <FormField
                    control={emailForm.control}
                    name="senderEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormDescription>
                          Email address used to send notifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={emailForm.control}
                    name="senderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Name displayed in email notifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={emailForm.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Port</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={emailForm.control}
                      name="smtpUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtpPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isSavingEmail}>
                    {isSavingEmail ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Settings</CardTitle>
              <CardDescription>
                Enable or disable features on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...featureForm}>
                <form
                  onSubmit={featureForm.handleSubmit(onSaveFeatureSettings)}
                  className="space-y-6"
                >
                  <FormField
                    control={featureForm.control}
                    name="enableNewsletter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Newsletter</FormLabel>
                          <FormDescription>
                            Allow users to subscribe to your newsletter
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={featureForm.control}
                    name="enableSearch"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Search</FormLabel>
                          <FormDescription>
                            Enable search functionality on your website
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={featureForm.control}
                    name="enableSocialSharing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Social Sharing</FormLabel>
                          <FormDescription>
                            Display social sharing buttons on articles
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={featureForm.control}
                    name="enableRelatedArticles"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Related Articles</FormLabel>
                          <FormDescription>
                            Display related articles at the end of each article
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSavingFeatures}>
                    {isSavingFeatures ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
