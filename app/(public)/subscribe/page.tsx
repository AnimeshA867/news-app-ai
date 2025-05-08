"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Mail,
  Check,
  Newspaper,
  Bell,
  Clock,
  Loader2,
  ShieldCheck,
} from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/components/providers/settings-provider";
import React from "react";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Invalid email address"),
  name: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and privacy policy",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubscribePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { settings } = useSettings();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      agreeToTerms: false,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: FormValues) {
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          name: values.name || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe to newsletter");
      }

      setIsSubscribed(true);

      toast({
        title: "Successfully subscribed!",
        description: "You have been added to our newsletter.",
      });

      setTimeout(() => {
        router.push("/");
      }, 5000); // Redirect to homepage after 5 seconds
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription failed",
        description:
          (error as Error).message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (!settings?.enableNewsletter) {
    return (
      <div className="container max-w-3xl mx-auto py-16 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Newsletter Subscriptions
          </h1>
          <p className="mt-4 text-muted-foreground">
            Newsletter subscriptions are currently disabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-16 px-4">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          Subscribe to Our Newsletter
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Stay updated with the latest news, features, and articles from{" "}
          {settings?.siteName || "us"}. We'll deliver carefully curated content
          straight to your inbox.
        </p>
      </div>

      {isSubscribed ? (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/30">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-xl font-medium mb-2">
              Thank you for subscribing!
            </h2>
            <p className="text-muted-foreground">
              You've been successfully added to our newsletter.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => router.push("/")}
            >
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        We'll use this email to send you newsletters.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Help us personalize your newsletter experience.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to receive newsletters and marketing emails
                        </FormLabel>
                        <FormDescription>
                          You can unsubscribe at any time. By subscribing, you
                          agree to our{" "}
                          <a href="/privacy" className="underline text-primary">
                            Privacy Policy
                          </a>
                          .
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    "Subscribe to Newsletter"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium">What you'll receive:</h3>

            <div className="grid gap-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Newspaper className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Latest Articles</h4>
                  <p className="text-sm text-muted-foreground">
                    Get our freshest content delivered to your inbox.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Breaking News</h4>
                  <p className="text-sm text-muted-foreground">
                    Be the first to know about important developments.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Weekly Digest</h4>
                  <p className="text-sm text-muted-foreground">
                    A summary of the most important stories of the week.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Privacy First</h4>
                  <p className="text-sm text-muted-foreground">
                    We respect your privacy and will never share your email.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground mt-6 pt-4 border-t">
              <p>
                You can unsubscribe at any time by clicking the link in the
                footer of our emails, or by contacting us at{" "}
                <a
                  href={`mailto:${settings?.senderEmail || "contact@example.com"}`}
                  className="text-primary hover:underline"
                >
                  {settings?.senderEmail || "contact@example.com"}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
