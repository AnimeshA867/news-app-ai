"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Search,
  UserPlus,
  User,
  FileText,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Author {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
  _count: {
    articles: number;
  };
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    return () => {
      fetchAuthors();
    };
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredAuthors(
        authors.filter(
          (author) =>
            author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            author.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            author.role.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredAuthors(authors);
    }
  }, [searchQuery, authors]);

  const fetchAuthors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/authors");

      if (!response.ok) {
        throw new Error("Failed to fetch authors");
      }

      const data = await response.json();
      setAuthors(data);
      setFilteredAuthors(data);
    } catch (error) {
      console.error("Error fetching authors:", error);
      toast({
        title: "Error",
        description: "Failed to load authors",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/authors/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete author");
      }

      toast({
        title: "Success",
        description: "Author deleted successfully",
      });

      // Remove the deleted author from state
      setAuthors((prevAuthors) =>
        prevAuthors.filter((author) => author.id !== id)
      );
    } catch (error) {
      console.error("Error deleting author:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete author",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "EDITOR":
        return "default";
      default:
        return "secondary";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Authors</h1>
        <Button asChild>
          <Link href="/admin/authors/new">
            <UserPlus className="mr-2 h-4 w-4" /> Add Author
          </Link>
        </Button>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search authors..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Articles</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredAuthors.length > 0 ? (
              filteredAuthors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={author.image || undefined} />
                      <AvatarFallback>
                        {getInitials(author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{author.name}</div>
                  </TableCell>
                  <TableCell>{author.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(author.role)}>
                      {author.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {author._count.articles}
                  </TableCell>
                  <TableCell>{formatDate(author.createdAt)}</TableCell>
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
                            href={`/admin/authors/${author.id}/edit`}
                            className="flex cursor-pointer items-center"
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/articles?author=${author.id}`}
                            className="flex cursor-pointer items-center"
                          >
                            <FileText className="mr-2 h-4 w-4" /> Articles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(author.id)}
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
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <User className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No authors found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery
                        ? "No authors match your search criteria"
                        : "There are no authors yet"}
                    </p>
                    <Button asChild>
                      <Link href="/admin/authors/new">
                        <UserPlus className="mr-2 h-4 w-4" /> Add Author
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              author account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
