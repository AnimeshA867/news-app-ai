"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Eye, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  category: {
    name: string;
  };
  author: {
    name: string | null;
  };
}

export function AdminRecentArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecentArticles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/articles?limit=5");
        if (!response.ok) {
          throw new Error("Failed to fetch recent articles");
        }
        const data = await response.json();
        setArticles(data.articles);
      } catch (error) {
        console.error("Error fetching articles:", error);
        toast({
          title: "Error",
          description: "Failed to load recent articles",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentArticles();
  }, [toast]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) {
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
        description: "Article deleted successfully",
      });

      // Remove the deleted article from state
      setArticles(articles.filter((article) => article.id !== id));
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Recent Articles</h2>
        <Button asChild>
          <Link href="/admin/articles/new/edit">New Article</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length > 0 ? (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">
                    <div className="line-clamp-1 max-w-[300px]">
                      {article.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        article.status === "PUBLISHED"
                          ? "default"
                          : article.status === "DRAFT"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {article.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{article.category.name}</TableCell>
                  <TableCell>{article.author?.name || "Unknown"}</TableCell>
                  <TableCell>
                    {formatDate(article.publishedAt || article.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {article.viewCount.toLocaleString()}
                  </TableCell>
                  <TableCell>
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
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/article/${article.slug}`}
                            className="flex cursor-pointer items-center"
                          >
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Link>
                        </DropdownMenuItem>
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No articles found. Create your first article.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
