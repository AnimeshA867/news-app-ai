"use client";

import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UploadDropzone } from "../../utils/uploadthing";

interface UploadImageProps {
  value: string;
  onChange: (url: string) => void;
}

export function UploadProfilePicture({ value, onChange }: UploadImageProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-4">
      {value && (
        <div className="relative h-40 w-40 mx-auto rounded-full overflow-hidden">
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex justify-center">
        <UploadDropzone
          endpoint="imageUploader" // Ensure this matches a valid key in OurFileRouter
          onBeforeUploadBegin={(files) => {
            setIsUploading(true);
            return files;
          }}
          onClientUploadComplete={(res) => {
            setIsUploading(false);
            if (res && res.length > 0) {
              onChange(res[0].url);
              toast({
                title: "Upload complete",
                description: "Image has been uploaded successfully",
              });
            }
          }}
          onUploadError={(error: Error) => {
            setIsUploading(false);
            console.error("Upload failed:", error);
            toast({
              title: "Upload failed",
              description: "Failed to upload image. Please try again.",
              variant: "destructive",
            });
          }}
        />
      </div>
    </div>
  );
}
