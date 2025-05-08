"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, ArrowUp, ArrowDown, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface NavigationLink {
  id: string;
  name: string;
  href: string;
  group: string;
  order: number;
  isEnabled?: boolean;
}

const linkSchema = z.object({
  name: z.string().min(1, "Name is required"),
  href: z.string().min(1, "URL is required"),
  group: z.string().min(1, "Group is required"),
  order: z.number().int().min(0),
  isEnabled: z.boolean().default(true),
});

export default function NavigationPage() {
  const [links, setLinks] = useState<NavigationLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState("Company");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<NavigationLink | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      name: "",
      href: "",
      group: "Company",
      order: 0,
      isEnabled: true,
    },
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/navigation");
      if (!res.ok) throw new Error("Failed to fetch links");

      const data = await res.json();
      // Flatten the grouped links
      const allLinks: NavigationLink[] = [];
      Object.values(data.links).forEach((groupLinks: any) => {
        allLinks.push(...groupLinks);
      });

      setLinks(allLinks);
    } catch (error) {
      console.error("Error fetching links:", error);
      toast({
        title: "Error",
        description: "Failed to load navigation links",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof linkSchema>) => {
    try {
      const method = editingLink ? "PUT" : "POST";
      const url = editingLink
        ? `/api/navigation/${editingLink.id}`
        : "/api/navigation";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error(`Failed to ${editingLink ? "update" : "create"} link`);
      }

      toast({
        title: "Success",
        description: `Link ${editingLink ? "updated" : "created"} successfully`,
      });

      fetchLinks();
      setIsDialogOpen(false);
      form.reset();
      setEditingLink(null);
    } catch (error) {
      console.error("Error saving link:", error);
      toast({
        title: "Error",
        description: `Failed to ${editingLink ? "update" : "create"} link`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (link: NavigationLink) => {
    setEditingLink(link);
    form.reset({
      name: link.name,
      href: link.href,
      group: link.group,
      order: link.order,
      isEnabled: link.isEnabled ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const res = await fetch(`/api/navigation/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete link");

      toast({
        title: "Success",
        description: "Link deleted successfully",
      });

      fetchLinks();
    } catch (error) {
      console.error("Error deleting link:", error);
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
    }
  };

  const handleMoveLink = async (id: string, direction: "up" | "down") => {
    const index = links.findIndex((link) => link.id === id);
    if (index === -1) return;

    const currentLink = links[index];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Don't move if at the edges
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const targetLink = links[targetIndex];

    try {
      // Update the orders by swapping
      await Promise.all([
        fetch(`/api/navigation/${currentLink.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...currentLink, order: targetLink.order }),
        }),
        fetch(`/api/navigation/${targetLink.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...targetLink, order: currentLink.order }),
        }),
      ]);

      fetchLinks();
    } catch (error) {
      console.error("Error reordering links:", error);
      toast({
        title: "Error",
        description: "Failed to reorder links",
        variant: "destructive",
      });
    }
  };

  const getGroupedLinks = () => {
    return links.filter((link) => link.group === activeGroup);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Navigation Management
          </h1>
          <p className="text-muted-foreground">
            Manage navigation links that appear in the site footer and elsewhere
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingLink(null);
                form.reset({
                  name: "",
                  href: "",
                  group: activeGroup,
                  order: links.filter((l) => l.group === activeGroup).length,
                  isEnabled: true,
                });
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLink ? "Edit Link" : "Add New Link"}
              </DialogTitle>
              <DialogDescription>
                {editingLink
                  ? "Edit this navigation link's details"
                  : "Create a new navigation link for your website"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Text</FormLabel>
                      <FormControl>
                        <Input placeholder="About Us" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="href"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="/about" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="group"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Company">Company</SelectItem>
                          <SelectItem value="Advertising">
                            Advertising
                          </SelectItem>
                          <SelectItem value="Legal">Legal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label className="text-sm font-medium leading-none">
                            Enabled
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    {editingLink ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        defaultValue="Company"
        value={activeGroup}
        onValueChange={setActiveGroup}
      >
        <TabsList>
          <TabsTrigger value="Company">Company</TabsTrigger>
          <TabsTrigger value="Advertising">Advertising</TabsTrigger>
          <TabsTrigger value="Legal">Legal</TabsTrigger>
        </TabsList>

        <TabsContent value={activeGroup} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{activeGroup} Links</CardTitle>
              <CardDescription>
                Links displayed in the {activeGroup} section of your site footer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-6 text-center text-muted-foreground">
                  Loading...
                </div>
              ) : getGroupedLinks().length > 0 ? (
                <div className="space-y-2">
                  {getGroupedLinks().map((link, index) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 rounded-md border"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{link.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {link.href}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={index === 0}
                          onClick={() => handleMoveLink(link.id, "up")}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={index === getGroupedLinks().length - 1}
                          onClick={() => handleMoveLink(link.id, "down")}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(link)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  No links found in this group. Add one to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
