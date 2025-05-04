import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = [
    {
      name: "Politics",
      slug: "politics",
      description: "Latest political news and updates",
    },
    {
      name: "World",
      slug: "world",
      description: "International news and global events",
    },
    {
      name: "Business",
      slug: "business",
      description: "Business news and economic updates",
    },
    {
      name: "Technology",
      slug: "technology",
      description: "Tech news and digital trends",
    },
    {
      name: "Entertainment",
      slug: "entertainment",
      description: "Entertainment and celebrity news",
    },
    { name: "Sports", slug: "sports", description: "Sports news and coverage" },
    {
      name: "Health",
      slug: "health",
      description: "Health news and wellness information",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  // Create tags
  const tags = [
    { name: "Breaking News", slug: "breaking-news" },
    { name: "Analysis", slug: "analysis" },
    { name: "Opinion", slug: "opinion" },
    { name: "Feature", slug: "feature" },
    { name: "Interview", slug: "interview" },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  // Create admin user
  const adminPassword = await hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create sample articles
  const politicsCategory = await prisma.category.findUnique({
    where: { slug: "politics" },
  });
  const technologyCategory = await prisma.category.findUnique({
    where: { slug: "technology" },
  });
  const breakingTag = await prisma.tag.findUnique({
    where: { slug: "breaking-news" },
  });
  const analysisTag = await prisma.tag.findUnique({
    where: { slug: "analysis" },
  });

  if (politicsCategory && technologyCategory && breakingTag && analysisTag) {
    // Sample article 1
    await prisma.article.upsert({
      where: { slug: "major-policy-shift-climate-change" },
      update: {},
      create: {
        title: "Major Policy Shift Announced by Government on Climate Change",
        slug: "major-policy-shift-climate-change",
        excerpt:
          "New environmental regulations set ambitious targets for carbon reduction over the next decade, impacting industries nationwide.",
        content: `<h2>Government Announces New Climate Policy</h2>
        <p>In a significant move that signals a major shift in environmental policy, the government today announced sweeping new regulations aimed at combating climate change. The new framework sets ambitious targets for carbon reduction across all sectors of the economy.</p>
        <p>Industry leaders have expressed mixed reactions to the announcement, with some praising the bold action while others raise concerns about implementation costs and timelines.</p>
        <h2>Key Points of the New Policy</h2>
        <ul>
          <li>50% reduction in carbon emissions by 2030</li>
          <li>Mandatory renewable energy adoption for large corporations</li>
          <li>New tax incentives for green technology development</li>
          <li>Phased elimination of single-use plastics</li>
        </ul>
        <p>Environmental groups have largely welcomed the announcement, though some activists argue the measures don't go far enough to address the urgency of the climate crisis.</p>`,
        status: "PUBLISHED",
        featuredImage: "/placeholder.svg?height=600&width=1200",
        readTime: 8,
        publishedAt: new Date(),
        authorId: admin.id,
        categoryId: politicsCategory.id,
        tags: {
          connect: [{ id: breakingTag.id }, { id: analysisTag.id }],
        },
      },
    });

    // Sample article 2
    await prisma.article.upsert({
      where: { slug: "tech-giant-ai-system-market-trends" },
      update: {},
      create: {
        title:
          "Tech Giant Unveils Revolutionary AI System That Can Predict Market Trends",
        slug: "tech-giant-ai-system-market-trends",
        excerpt:
          "New artificial intelligence platform claims to forecast economic shifts with unprecedented accuracy.",
        content: `<h2>Revolutionary AI System Unveiled</h2>
        <p>In a packed conference hall in Silicon Valley, one of the world's leading tech companies unveiled what they claim is a breakthrough in artificial intelligence technology. The new system, called "EconoPredict," reportedly can analyze vast amounts of global economic data to predict market trends with accuracy levels previously thought impossible.</p>
        <p>The AI system uses a combination of machine learning algorithms, natural language processing of news and social media, and analysis of historical economic patterns to generate its forecasts.</p>
        <h2>Potential Impact on Financial Markets</h2>
        <p>Financial experts are divided on the implications of such technology. Some see it as a game-changer that could democratize market intelligence, while others express concern about the potential for market manipulation or unfair advantages.</p>
        <p>"If this technology works as advertised, it could fundamentally change how investment decisions are made," said Dr. Elena Rodriguez, an economist at Capital University. "But there are serious questions about transparency and access that need to be addressed."</p>`,
        status: "PUBLISHED",
        featuredImage: "/placeholder.svg?height=600&width=1200",
        readTime: 6,
        publishedAt: new Date(),
        authorId: admin.id,
        categoryId: technologyCategory.id,
        tags: {
          connect: [{ id: breakingTag.id }],
        },
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
