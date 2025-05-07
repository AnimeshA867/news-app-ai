"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash, Loader2, Search, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import Image from "next/image";
import React from "react";

interface Advertisement {
  id: string;
  name: string;
  position: string;
  imageUrl: string | null;
  isActive: boolean;
  impressions: number;
  clicks: number;
  startDate: string;
  endDate: string | null;
  priority: number;
}

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  async function fetchAdvertisements() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/advertisements");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch advertisements");
      }

      setAds(data);
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast({
        title: "Error",
        description: "Failed to load advertisements",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleAdStatus(id: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/advertisements/${id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to update advertisement status");
      }

      // Update local state
      setAds((prevAds) =>
        prevAds.map((ad) =>
          ad.id === id ? { ...ad, isActive: !currentStatus } : ad
        )
      );

      toast({
        title: "Success",
        description: `Advertisement ${
          !currentStatus ? "activated" : "deactivated"
        }`,
      });
    } catch (error) {
      console.error("Error updating ad status:", error);
      toast({
        title: "Error",
        description: "Failed to update advertisement status",
        variant: "destructive",
      });
    }
  }

  async function deleteAdvertisement() {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/advertisements/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete advertisement");
      }

      setAds((prevAds) => prevAds.filter((ad) => ad.id !== deleteId));
      setDeleteId(null);

      toast({
        title: "Success",
        description: "Advertisement deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast({
        title: "Error",
        description: "Failed to delete advertisement",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredAds = ads.filter(
    (ad) =>
      ad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No end date";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advertisements</h1>
          <p className="text-muted-foreground">
            Manage advertisements across your site
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/admin/advertisements/new">
              <Plus className="mr-2 h-4 w-4" /> New Ad
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search advertisements..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Advertisement</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAds.length > 0 ? (
              filteredAds.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {ad.imageUrl ? (
                        <div className="relative h-10 w-16 overflow-hidden rounded">
                          <Image
                            src={ad.imageUrl}
                            alt={ad.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-16 bg-muted flex items-center justify-center rounded">
                          <span className="text-xs text-muted-foreground">
                            No image
                          </span>
                        </div>
                      )}
                      <span className="font-medium">{ad.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{ad.position}</TableCell>
                  <TableCell>
                    <Badge variant={ad.isActive ? "default" : "outline"}>
                      {ad.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>From: {formatDate(ad.startDate)}</div>
                      <div className="text-muted-foreground">
                        To: {formatDate(ad.endDate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{ad.impressions.toLocaleString()} impressions</div>
                      <div className="text-muted-foreground">
                        {ad.clicks.toLocaleString()} clicks
                        {ad.impressions > 0 ? (
                          <span className="ml-1">
                            ({((ad.clicks / ad.impressions) * 100).toFixed(2)}%)
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleAdStatus(ad.id, ad.isActive)}
                        title={ad.isActive ? "Deactivate" : "Activate"}
                      >
                        {ad.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/advertisements/${ad.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(ad.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  {searchQuery ? (
                    <div className="text-muted-foreground">
                      No advertisements matching &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-muted-foreground">
                        No advertisements yet
                      </div>
                      <Button asChild variant="outline">
                        <Link href="/admin/advertisements/new">
                          <Plus className="mr-2 h-4 w-4" /> Create your first
                          advertisement
                        </Link>
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <AlertDialog
        open={Boolean(deleteId)}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              advertisement and all of its analytics data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteAdvertisement}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
