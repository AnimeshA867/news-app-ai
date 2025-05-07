import { StatCard } from "@/components/ui/stat-card";
import {
  FileText,
  Eye,
  Users,
  BookOpen,
  MessageSquare,
  Calendar,
  Tag,
  Layers,
} from "lucide-react";

interface StatsGridProps {
  stats: {
    articlesCount: number;
    draftCount: number;
    scheduledCount: number;
    viewsCount: number;
    usersCount: number;
    categoriesCount: number;
    tagsCount: number;
  };
  isLoading?: boolean;
}

export function StatsGrid({ stats, isLoading = false }: StatsGridProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Articles Published"
        value={stats?.articlesCount || 0}
        icon={<FileText className="h-6 w-6 text-blue-500" />}
        linkText="View all articles"
        linkHref="/admin/articles"
        isLoading={isLoading}
      />

      <StatCard
        title="Draft Articles"
        value={stats?.draftCount || 0}
        icon={<BookOpen className="h-6 w-6 text-amber-500" />}
        linkText="View drafts"
        linkHref="/admin/articles?status=DRAFT"
        isLoading={isLoading}
      />

      <StatCard
        title="Scheduled Articles"
        value={stats?.scheduledCount || 0}
        icon={<Calendar className="h-6 w-6 text-purple-500" />}
        linkText="View scheduled"
        linkHref="/admin/scheduled-articles"
        isLoading={isLoading}
      />

      <StatCard
        title="Total Views"
        value={stats?.viewsCount || 0}
        icon={<Eye className="h-6 w-6 text-green-500" />}
        linkText="Analytics"
        linkHref="/admin/analytics"
        isLoading={isLoading}
      />

      <StatCard
        title="Users"
        value={stats?.usersCount || 0}
        icon={<Users className="h-6 w-6 text-indigo-500" />}
        linkText="Manage users"
        linkHref="/admin/users"
        isLoading={isLoading}
      />

      <StatCard
        title="Categories"
        value={stats?.categoriesCount || 0}
        icon={<Layers className="h-6 w-6 text-pink-500" />}
        linkText="Manage categories"
        linkHref="/admin/categories"
        isLoading={isLoading}
      />

      <StatCard
        title="Tags"
        value={stats?.tagsCount || 0}
        icon={<Tag className="h-6 w-6 text-cyan-500" />}
        linkText="Manage tags"
        linkHref="/admin/tags"
        isLoading={isLoading}
      />
    </div>
  );
}
