import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  return (
    <div className="container max-w-md mx-auto py-16 px-4 text-center">
      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>
      </div>
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild size="lg">
        <Link href="/">Back to Homepage</Link>
      </Button>
    </div>
  );
}
