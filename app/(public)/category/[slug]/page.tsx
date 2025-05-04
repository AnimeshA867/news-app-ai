import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import type { Metadata } from "next";

// Mock data - would be fetched from API in production
const categories = {
  politics: {
    title: "Politics",
    description:
      "Latest political news, policy updates, and government affairs from around the world.",
  },
  world: {
    title: "World",
    description:
      "International news, global events, and stories from across continents.",
  },
  business: {
    title: "Business",
    description:
      "Business news, economic updates, financial markets, and corporate developments.",
  },
  technology: {
    title: "Technology",
    description:
      "Tech news, innovations, digital trends, and the latest from the world of technology.",
  },
  entertainment: {
    title: "Entertainment",
    description:
      "Entertainment news, celebrity updates, film, music, and cultural trends.",
  },
  sports: {
    title: "Sports",
    description:
      "Sports news, results, analysis, and coverage of major sporting events.",
  },
  health: {
    title: "Health",
    description:
      "Health news, medical research, wellness tips, and healthcare developments.",
  },
};

// Mock articles data
const articles = [
  {
    id: 1,
    title: "Major Policy Shift Announced by Government on Climate Change",
    excerpt:
      "New environmental regulations set ambitious targets for carbon reduction over the next decade, impacting industries nationwide.",
    category: "politics",
    image: "/placeholder.svg?height=400&width=600",
    author: "Sarah Johnson",
    date: "2023-05-15",
    readTime: 8,
    slug: "major-policy-shift-climate-change",
  },
  {
    id: 2,
    title: "Opposition Leaders Challenge New Legislative Proposal",
    excerpt:
      "Contentious debate erupts in parliament as opposition figures criticize government's approach to economic reform.",
    category: "politics",
    image: "/placeholder.svg?height=400&width=600",
    author: "Michael Chen",
    date: "2023-05-14",
    readTime: 6,
    slug: "opposition-leaders-challenge-proposal",
  },
  {
    id: 3,
    title: "International Summit Addresses Global Security Concerns",
    excerpt:
      "World leaders gather to discuss emerging threats and collaborative solutions to pressing security challenges.",
    category: "politics",
    image: "/placeholder.svg?height=400&width=600",
    author: "Omar Al-Farsi",
    date: "2023-05-13",
    readTime: 7,
    slug: "international-summit-security-concerns",
  },
  // More articles would be added here for each category
];

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  const category = categories[slug as keyof typeof categories];

  if (!category) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
    };
  }

  return {
    title: category.title,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = categories[slug as keyof typeof categories];

  if (!category) {
    notFound();
  }

  const categoryArticles = articles.filter(
    (article) => article.category === slug
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold md:text-4xl">{category.title}</h1>
        <p className="mt-2 text-muted-foreground">{category.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categoryArticles.map((article) => (
          <Link
            key={article.id}
            href={`/article/${article.slug}`}
            className="group overflow-hidden rounded-lg border transition-colors hover:bg-muted/50"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h2 className="mb-2 text-xl font-bold transition-colors group-hover:text-primary">
                {article.title}
              </h2>
              <p className="mb-4 text-muted-foreground">{article.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{article.author}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {article.readTime} min read
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {categoryArticles.length === 0 && (
        <div className="my-12 text-center">
          <h2 className="text-xl font-medium">No articles found</h2>
          <p className="mt-2 text-muted-foreground">
            Check back soon for updates in this category.
          </p>
        </div>
      )}
    </main>
  );
}
