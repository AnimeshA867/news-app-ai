"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
  Heading1,
  Heading2,
  Heading3,
  LinkIcon,
  ImageIcon,
  X,
  Search,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NextImage from "next/image";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = "Start writing...",
}: TipTapEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [activeImageTab, setActiveImageTab] = useState<"url" | "media">("url");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-primary underline decoration-primary decoration-2 underline-offset-2 hover:text-primary/80",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg mx-auto my-4",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const fetchMediaItems = async () => {
    try {
      setIsLoadingMedia(true);
      const response = await fetch("/api/media");

      if (!response.ok) {
        throw new Error("Failed to fetch media");
      }

      const data = await response.json();
      setMediaItems(data);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl) {
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl("");
      setIsLinkDialogOpen(false);
    }
  };

  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run();
      setImageUrl("");
      setImageAlt("");
      setIsImageDialogOpen(false);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/50 p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive("bold") && "bg-muted")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive("italic") && "bg-muted")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={cn(editor.isActive("heading", { level: 1 }) && "bg-muted")}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={cn(editor.isActive("heading", { level: 2 }) && "bg-muted")}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={cn(editor.isActive("heading", { level: 3 }) && "bg-muted")}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive("bulletList") && "bg-muted")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive("orderedList") && "bg-muted")}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(editor.isActive("blockquote") && "bg-muted")}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(editor.isActive("link") && "bg-muted")}
              title="Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Link</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Add Link</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isImageDialogOpen}
          onOpenChange={(open) => {
            setIsImageDialogOpen(open);
            if (open && activeImageTab === "media" && mediaItems.length === 0) {
              fetchMediaItems();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Image">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add Image</DialogTitle>
            </DialogHeader>

            <Tabs
              defaultValue="url"
              value={activeImageTab}
              onValueChange={(value) => {
                setActiveImageTab(value as "url" | "media");
                if (value === "media" && mediaItems.length === 0) {
                  fetchMediaItems();
                }
              }}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="url">Image URL</TabsTrigger>
                <TabsTrigger value="media">Media Library</TabsTrigger>
              </TabsList>

              <TabsContent value="url">
                <form onSubmit={handleImageSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageAlt">Alt Text</Label>
                    <Input
                      id="imageAlt"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="Image description"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit">Add Image</Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="media">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search media..."
                      className="pl-8"
                      value={mediaSearchQuery}
                      onChange={(e) => setMediaSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="h-[50vh] overflow-y-auto">
                  {isLoadingMedia ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {mediaItems
                        .filter(
                          (item) =>
                            item.type.startsWith("image/") &&
                            (mediaSearchQuery
                              ? item.name
                                  .toLowerCase()
                                  .includes(mediaSearchQuery.toLowerCase())
                              : true)
                        )
                        .map((item) => (
                          <div
                            key={item.id}
                            className="relative aspect-square rounded-md cursor-pointer overflow-hidden border hover:border-primary"
                            onClick={() => {
                              editor
                                .chain()
                                .focus()
                                .setImage({
                                  src: item.url,
                                  alt: item.name,
                                })
                                .run();
                              setIsImageDialogOpen(false);
                            }}
                          >
                            <NextImage
                              src={item.url}
                              alt={item.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover"
                            />
                          </div>
                        ))}
                    </div>
                  )}

                  {!isLoadingMedia &&
                    mediaItems.filter((item) => item.type.startsWith("image/"))
                      .length === 0 && (
                      <div className="text-center py-12">
                        <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="mb-2 text-muted-foreground">
                          No images found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Upload images in the Media Library section
                        </p>
                      </div>
                    )}
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="mediaImageAlt">Alt Text</Label>
                  <Input
                    id="mediaImageAlt"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Image description"
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
        {editor.isActive("link") && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remove Link"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-lg max-w-none p-4 focus:outline-none dark:prose-invert"
      />
    </div>
  );
}
