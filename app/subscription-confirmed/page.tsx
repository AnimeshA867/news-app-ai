import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscriptionConfirmedPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="bg-green-100 p-6 rounded-full">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Subscription Confirmed!</h1>
        <p className="text-lg text-muted-foreground">
          Thank you for subscribing to our newsletter. You'll now receive our
          latest news and updates directly to your inbox.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/">Back to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}
