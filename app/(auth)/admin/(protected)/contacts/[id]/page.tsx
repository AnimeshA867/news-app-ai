"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  User,
  Clock,
  Tag,
  MessageSquare,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  reason: string;
  message: string;
  status: string;
  isResolved: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ContactDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchContact();
  }, [id]);

  const fetchContact = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/contacts/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch contact details");
      }

      const data = await response.json();
      setContact(data);
      setNotes(data.notes || "");

      // Mark as read automatically when opened
      if (data.status === "NEW") {
        updateStatus("READ");
      }
    } catch (error) {
      console.error("Error fetching contact:", error);
      toast({
        title: "Error",
        description: "Failed to load contact details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/admin/contacts/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Update local state
      if (contact) {
        setContact({
          ...contact,
          status,
        });
      }

      toast({
        title: "Success",
        description: "Status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const toggleResolved = async () => {
    if (!contact) return;

    try {
      const response = await fetch(`/api/admin/contacts/${id}/resolve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isResolved: !contact.isResolved }),
      });

      if (!response.ok) {
        throw new Error("Failed to update resolution status");
      }

      // Update local state
      setContact({
        ...contact,
        isResolved: !contact.isResolved,
      });

      toast({
        title: "Success",
        description: contact.isResolved
          ? "Contact marked as unresolved"
          : "Contact marked as resolved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update resolution status",
        variant: "destructive",
      });
    }
  };

  const saveNotes = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/admin/contacts/${id}/notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to save notes");
      }

      // Update local state
      if (contact) {
        setContact({
          ...contact,
          notes,
        });
      }

      toast({
        title: "Success",
        description: "Notes saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <Badge variant="default">New</Badge>;
      case "READ":
        return <Badge variant="secondary">Read</Badge>;
      case "RESPONDED":
        return <Badge variant="success">Responded</Badge>;
      case "ARCHIVED":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Contact Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The requested contact message doesn't exist or has been deleted.
          </p>
          <Button asChild>
            <Link href="/admin/contacts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contacts
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/admin/contacts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all messages
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {contact.subject}
            </h1>
            <p className="text-muted-foreground mt-1">
              From {contact.name} • {formatDate(contact.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(contact.status)}
            {contact.isResolved && (
              <Badge variant="success" className="ml-2">
                Resolved
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap">{contact.message}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                Add private notes about this contact message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes here..."
                rows={5}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveNotes} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Notes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p>{contact.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-primary hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Reason</p>
                  <p className="capitalize">{contact.reason}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Received</p>
                  <p>{formatDate(contact.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => updateStatus("READ")}
                  disabled={contact.status === "READ"}
                  className={cn(
                    contact.status === "READ" &&
                      "bg-muted text-muted-foreground"
                  )}
                >
                  Mark as Read
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateStatus("RESPONDED")}
                  disabled={contact.status === "RESPONDED"}
                  className={cn(
                    contact.status === "RESPONDED" &&
                      "bg-muted text-muted-foreground"
                  )}
                >
                  Mark as Responded
                </Button>
                <Button
                  variant={contact.isResolved ? "outline" : "default"}
                  onClick={toggleResolved}
                >
                  {contact.isResolved ? "Unmark Resolved" : "Mark as Resolved"}
                  {contact.isResolved && (
                    <CheckCircle className="ml-2 h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateStatus("ARCHIVED")}
                  disabled={contact.status === "ARCHIVED"}
                  className={cn(
                    contact.status === "ARCHIVED" &&
                      "bg-muted text-muted-foreground"
                  )}
                >
                  Archive
                </Button>
              </div>

              <Button className="w-full" asChild>
                <a
                  href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Reply by Email
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
