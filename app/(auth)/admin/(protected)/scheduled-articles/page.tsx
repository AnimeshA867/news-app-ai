"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface ScheduledArticle {
  id: string;
  title: string;
  slug: string;
  scheduledAt: string;
  author: {
    name: string | null;
  };
  category: {
    name: string;
  };
}

export default function ScheduledArticlesPage() {
  const [articles, setArticles] = useState<ScheduledArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchScheduledArticles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/articles?status=SCHEDULED");

        if (!response.ok) {
          throw new Error("Failed to fetch scheduled articles");
        }

        const data = await response.json();
        setArticles(data.articles);
      } catch (error) {
        console.error("Error fetching scheduled articles:", error);
        toast({
          title: "Error",
          description: "Failed to load scheduled articles",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduledArticles();
  }, [toast]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scheduled article?")) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete article");
      }

      toast({
        title: "Success",
        description: "Scheduled article deleted successfully",
      });

      setArticles((prev) => prev.filter((article) => article.id !== id));
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description: "Failed to delete scheduled article",
        variant: "destructive",
      });
    }
  };

  const publishNow = async (id: string) => {
    if (!confirm("Are you sure you want to publish this article now?")) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "PUBLISHED",
          publishedAt: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish article");
      }

      toast({
        title: "Success",
        description: "Article published successfully",
      });

      setArticles((prev) => prev.filter((article) => article.id !== id));
    } catch (error) {
      console.error("Error publishing article:", error);
      toast({
        title: "Error",
        description: "Failed to publish article",
        variant: "destructive",
      });
    }
  };

  const formatScheduledTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${formatDate(date)} at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Scheduled Articles
        </h1>
        <p className="text-muted-foreground">
          Manage articles scheduled for future publication
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No scheduled articles</h3>
          <p className="text-muted-foreground mb-4">
            You haven't scheduled any articles for future publication.
          </p>
          <Button asChild>
            <Link href="/admin/articles/new/edit">Create New Article</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Scheduled For</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">
                    <div className="line-clamp-1 max-w-[300px]">
                      {article.title}
                    </div>
                  </TableCell>
                  <TableCell>{article.category.name}</TableCell>
                  <TableCell>{article.author?.name || "Unknown"}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {formatScheduledTime(article.scheduledAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="flex cursor-pointer items-center"
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/article/${article.slug}?preview=true`}
                            className="flex cursor-pointer items-center"
                            target="_blank"
                          >
                            <Eye className="mr-2 h-4 w-4" /> Preview
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => publishNow(article.id)}
                          className="flex cursor-pointer items-center"
                        >
                          <Clock className="mr-2 h-4 w-4" /> Publish Now
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(article.id)}
                          className="flex cursor-pointer items-center text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
