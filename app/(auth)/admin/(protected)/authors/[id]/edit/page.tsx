import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AuthorEditForm from "@/components/admin/author-edit-form";
import { Metadata } from "next";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = params;

  if (id === "new") {
    return {
      title: "Create New Author - Admin Dashboard",
    };
  }

  const author = await prisma.user.findUnique({
    where: { id },
  });

  if (!author) {
    return {
      title: "Author Not Found - Admin Dashboard",
    };
  }

  return {
    title: `Edit ${author.name || "Author"} - Admin Dashboard`,
  };
}

export default async function EditAuthorPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    notFound();
  }

  // For a new author, just render the empty form
  if (id === "new") {
    return (
      <div className="space-y-6 container">
        <AuthorEditForm authorId={id} initialAuthor={null} isNew={true} />
      </div>
    );
  }

  // For existing author, fetch the data
  try {
    const author = await prisma.user.findUnique({
      where: { id },
    });

    if (!author) {
      notFound();
    }

    return (
      <div className="space-y-6 container">
        <AuthorEditForm authorId={id} initialAuthor={author} isNew={false} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching author:", error);
    notFound();
  }
}
