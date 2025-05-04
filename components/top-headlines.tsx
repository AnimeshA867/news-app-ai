import Link from "next/link"
import { Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Headline {
  id: string
  title: string
  slug: string
  publishedAt: Date | null
  category: {
    name: string
  }
}

interface TopHeadlinesProps {
  headlines: Headline[]
}

export function TopHeadlines({ headlines }: TopHeadlinesProps) {
  // Calculate time ago
  const getTimeAgo = (date: Date | null) => {
    if (!date) return "Recently"

    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()

    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`

    const days = Math.floor(hours / 24)
    return `${days} ${days === 1 ? "day" : "days"} ago`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Top Headlines</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {headlines && headlines.length > 0 ? (
          headlines.map((headline) => (
            <Link
              key={headline.id}
              href={`/article/${headline.slug}`}
              className="block border-t px-6 py-3 transition-colors hover:bg-muted/50"
            >
              <h3 className="font-medium">{headline.title}</h3>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{headline.category.name}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {getTimeAgo(headline.publishedAt)}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="px-6 py-4 text-center text-muted-foreground">No headlines available</div>
        )}
      </CardContent>
    </Card>
  )
}
