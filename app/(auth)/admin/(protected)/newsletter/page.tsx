"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

// Form schema
const newsletterSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  headline: z.string().min(1, "Headline is required"),
  intro: z.string().optional(),
  articleIds: z.array(z.string()).min(1, "At least one article is required"),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

interface Article {
  id: string;
  title: string;
  publishedAt: string;
  slug: string;
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  verified: boolean;
}

interface Newsletter {
  id: string;
  subject: string;
  sentAt: string;
  sentTo: number;
  opens: number;
  clicks: number;
}

export default function NewsletterPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      subject: "",
      headline: "",
      intro: "",
      articleIds: [],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get published articles
        const articlesRes = await fetch(
          "/api/articles?status=PUBLISHED&limit=50"
        );
        if (articlesRes.ok) {
          const articlesData = await articlesRes.json();
          setArticles(articlesData.articles || []);
        }

        // Get subscribers stats
        const subscribersRes = await fetch("/api/admin/newsletter/subscribers");
        if (subscribersRes.ok) {
          const subscribersData = await subscribersRes.json();
          setSubscribers(subscribersData.subscribers || []);
        }

        // Get newsletter history
        const newslettersRes = await fetch("/api/admin/newsletter/history");
        if (newslettersRes.ok) {
          const newslettersData = await newslettersRes.json();
          setNewsletters(newslettersData.newsletters || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load newsletter data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsLoadingStats(false);
      }
    };

    fetchData();
  }, [toast]);

  async function onSubmit(data: NewsletterFormValues) {
    try {
      setIsSending(true);
      const response = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to send newsletter");
      }

      toast({
        title: "Newsletter sent!",
        description: `Successfully sent to ${responseData.sentTo} subscribers.`,
      });

      form.reset();
      router.refresh(); // Refresh data
    } catch (error) {
      console.error("Error sending newsletter:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to send newsletter",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const subscriberCount = subscribers.filter((sub) => sub.verified).length;
  const pendingCount = subscribers.filter((sub) => !sub.verified).length;

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Newsletter Management</h1>

      <Tabs defaultValue="compose">
        <TabsList className="mb-6">
          <TabsTrigger value="compose">Compose Newsletter</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Compose Newsletter</CardTitle>
                <CardDescription>
                  Create and send a newsletter to all your subscribers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Subject</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your newsletter subject"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The subject line of your newsletter email
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="headline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Newsletter Headline</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Main headline for the newsletter"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Introduction Text (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief introduction to your newsletter"
                              className="resize-y min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="articleIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Articles to Include</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                if (field.value.includes(value)) {
                                  // Remove if already selected
                                  field.onChange(
                                    field.value.filter((v) => v !== value)
                                  );
                                } else {
                                  // Add if not selected
                                  field.onChange([...field.value, value]);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={`${field.value.length} articles selected`}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {isLoading ? (
                                  <div className="p-4 text-center">
                                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                    <p className="text-sm mt-2">
                                      Loading articles...
                                    </p>
                                  </div>
                                ) : articles.length === 0 ? (
                                  <p className="p-4 text-center text-muted-foreground">
                                    No published articles found
                                  </p>
                                ) : (
                                  articles.map((article) => (
                                    <SelectItem
                                      key={article.id}
                                      value={article.id}
                                      className={
                                        field.value.includes(article.id)
                                          ? "bg-primary/10"
                                          : ""
                                      }
                                    >
                                      {article.title}
                                      {field.value.includes(article.id) && " ✓"}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Selected: {field.value.length} articles
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Newsletter...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Newsletter
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Newsletter Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Loading stats...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-lg bg-muted p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MailOpen className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Subscribers</h3>
                      </div>
                      <div className="text-2xl font-bold">
                        {subscriberCount}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Verified subscribers
                      </p>
                      {pendingCount > 0 && (
                        <p className="text-sm text-amber-500 mt-1">
                          {pendingCount} pending verification
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Send className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Newsletters Sent</h3>
                      </div>
                      <div className="text-2xl font-bold">
                        {newsletters.length}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Past campaigns
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Subscribers</CardTitle>
              <CardDescription>
                Manage your newsletter subscribers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : subscribers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No subscribers yet</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell>{sub.email}</TableCell>
                          <TableCell>{sub.name || "-"}</TableCell>
                          <TableCell>
                            {sub.verified ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(sub.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter History</CardTitle>
              <CardDescription>
                Past newsletters sent to subscribers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : newsletters.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No newsletters sent yet
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Opens</TableHead>
                        <TableHead>Clicks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newsletters.map((newsletter) => (
                        <TableRow key={newsletter.id}>
                          <TableCell>{newsletter.subject}</TableCell>
                          <TableCell>{formatDate(newsletter.sentAt)}</TableCell>
                          <TableCell>{newsletter.sentTo}</TableCell>
                          <TableCell>{newsletter.opens}</TableCell>
                          <TableCell>{newsletter.clicks}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
