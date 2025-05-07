"use client";

import React from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UploadDropzone } from "@/utils/uploadthing";
import { useToast } from "@/hooks/use-toast";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Control,
  FieldPath,
  UseFormReturn,
  useController,
} from "react-hook-form";

interface AdImageUploadProps<TFieldValues extends Record<string, any>> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  form: any;
  width: number;
  height: number;
  label?: string;
  description?: string;
  className?: string;
}

export function AdImageUpload<TFieldValues extends Record<string, any>>({
  name,
  control,
  form,
  width,
  height,
  label = "Advertisement Image",
  description,
  className,
}: AdImageUploadProps<TFieldValues>) {
  const { toast } = useToast();
  const { field } = useController({ name, control });

  // Default description if none provided
  const defaultDescription = `Recommended size: ${width}x${height}px`;
  const displayDescription = description || defaultDescription;

  return (
    <FormItem className={className}>
      <FormLabel>{label}</FormLabel>
      <FormDescription className="mb-2">{displayDescription}</FormDescription>
      <FormControl>
        <div
          className={cn(
            "border-2 border-dashed rounded-md transition-colors",
            field.value
              ? "border-border hover:border-muted-foreground/50"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
        >
          {field.value ? (
            <div className="relative w-full flex items-center justify-center py-4">
              <Image
                src={field.value}
                alt="Advertisement preview"
                width={width > 600 ? 600 : width}
                height={height > 400 ? 400 : height}
                className="object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  form.setValue(name, "");
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <UploadDropzone
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  form.setValue(name, res[0].url);
                  toast({
                    title: "Success",
                    description: "Image uploaded successfully",
                  });
                }
              }}
              onUploadError={(error) => {
                toast({
                  title: "Error",
                  description: error.message || "Failed to upload image",
                  variant: "destructive",
                });
              }}
            />
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
