import { ArrowUpRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Mock data
const topArticles = [
  {
    id: 1,
    title: "Global Leaders Gather for Climate Summit",
    views: 12453,
    change: 23.1,
    category: "Politics",
  },
  {
    id: 2,
    title: "Tech Giant Unveils Revolutionary AI System",
    views: 8932,
    change: 15.4,
    category: "Technology",
  },
  {
    id: 3,
    title: "Historic Peace Agreement Signed",
    views: 7845,
    change: 10.2,
    category: "World",
  },
  {
    id: 4,
    title: "Breakthrough Medical Research Offers New Hope",
    views: 6721,
    change: -5.3,
    category: "Health",
  },
  {
    id: 5,
    title: "Major Sports League Announces Expansion",
    views: 5438,
    change: 8.7,
    category: "Sports",
  },
]

export function AdminOverview() {
  // Calculate max views for relative progress bars
  const maxViews = Math.max(...topArticles.map((article) => article.views))

  return (
    <div className="space-y-4">
      {topArticles.map((article) => (
        <div key={article.id} className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium line-clamp-1">{article.title}</div>
              <div className="text-xs text-muted-foreground">{article.category}</div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>{article.views.toLocaleString()}</span>
              <span className={`flex items-center text-xs ${article.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                <ArrowUpRight className={`h-3 w-3 ${article.change < 0 ? "rotate-180" : ""}`} />
                {Math.abs(article.change)}%
              </span>
            </div>
          </div>
          <Progress value={(article.views / maxViews) * 100} className="h-2" />
        </div>
      ))}
    </div>
  )
}
