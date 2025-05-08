import Link from "next/link";
import { XCircle, Mail } from "lucide-react"; // Import Mail from Lucide icons
import { Button } from "@/components/ui/button";

export default function UnsubscribeConfirmedPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="bg-red-100 p-6 rounded-full">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold">You've Been Unsubscribed</h1>
        <p className="text-lg text-muted-foreground">
          You have successfully unsubscribed from our newsletter. We're sorry to
          see you go!
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/">Back to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}

// Add this to the navigation items in your admin sidebar
const adminSidebarNavigation = [
  {
    title: "Newsletter",
    href: "/admin/newsletter",
    icon: Mail,
  },
];
