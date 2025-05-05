import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import AuthorsTable from "@/components/admin/author-table";

export const metadata = {
  title: "Authors - Admin Dashboard",
};

export default async function AuthorsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    notFound();
  }

  try {
    // Fetch authors with article count on the server
    const authors = await prisma.user.findMany({
      where: {
        role: {
          in: ["AUTHOR", "ADMIN"],
        },
      },
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return (
      <div className="space-y-6">
        <AuthorsTable initialAuthors={authors} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching authors:", error);
    return (
      <div className="space-y-6">
        <div className="p-6 text-center">
          <h3 className="text-lg font-medium">Error loading authors</h3>
          <p className="text-muted-foreground mt-2">
            There was an error loading the author data. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
