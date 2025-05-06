import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ArticleEditForm from "../../../../../../../components/admin/article-edit-form";
import { Metadata } from "next";
import { Article } from "@/lib/generated";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  if (id === "new") {
    return {
      title: "Create New Article - Admin Dashboard",
    };
  }

  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    return {
      title: "Article Not Found - Admin Dashboard",
    };
  }

  return {
    title: `Edit ${article.title} - Admin Dashboard`,
  };
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = params;

  // Fetch initial data on the server
  let article: {
    category: {
      id: string;
      description: string | null;
      name: string;
      createdAt: Date;
      updatedAt: Date;
      slug: string;
    };
    tags: {
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
      slug: string;
    }[];
  } | null = null;
  let initialCategories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  let initialTags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });

  // Case 1: New article - just fetch categories and tags

  // Case 2: Existing article - fetch article with relations

  // Fetch article with related data
  if (id !== "new") {
    article = await prisma.article.findUnique({
      where: { id },
      include: {
        tags: true,
        category: true,
      },
    });

    if (!article) {
      notFound();
    }
  }

  // Fetch all categories and tags for the form

  return (
    <div className="space-y-6 container">
      <ArticleEditForm
        articleId={id}
        initialArticle={article}
        initialCategories={initialCategories}
        initialTags={initialTags}
      />
    </div>
  );
}
