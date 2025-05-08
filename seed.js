import { PrismaClient } from "./lib/generated/index.js";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function seedPages() {
  const defaultPages = [
    {
      title: "About Us",
      slug: "about",
      content: `
      <h1>About Us</h1>
      <p>Welcome to our news platform. We are dedicated to delivering accurate, timely, and relevant news to our audience.</p>
      <h2>Our Mission</h2>
      <p>Our mission is to provide our readers with the most accurate, unbiased reporting possible. We believe in the power of journalism to inform, educate, and inspire.</p>
      <h2>Our Team</h2>
      <p>Our team consists of experienced journalists, editors, and content creators who are passionate about delivering quality news content.</p>
    `,
      isPublished: true,
    },
    {
      title: "Contact Us",
      slug: "contact",
      content: `
      <h1>Contact Us</h1>
      <p>We'd love to hear from you! Whether you have a news tip, feedback, or just want to say hello, there are several ways to get in touch with us.</p>
      <h2>Email</h2>
      <p>General inquiries: <a href="mailto:info@example.com">info@example.com</a></p>
      <p>News tips: <a href="mailto:news@example.com">news@example.com</a></p>
      <h2>Address</h2>
      <p>123 News Street<br>Cityville, State 12345<br>United States</p>
      <h2>Phone</h2>
      <p>(123) 456-7890</p>
    `,
      isPublished: true,
    },
    {
      title: "Careers",
      slug: "careers",
      content: `
      <h1>Join Our Team</h1>
      <p>We're always looking for talented individuals to join our team. Check out our current openings below.</p>
      <h2>Current Openings</h2>
      <ul>
        <li>Senior Editor</li>
        <li>News Reporter</li>
        <li>Content Writer</li>
        <li>Web Developer</li>
      </ul>
      <p>To apply, please send your resume and cover letter to <a href="mailto:careers@example.com">careers@example.com</a>.</p>
    `,
      isPublished: true,
    },
    {
      title: "Advertise With Us",
      slug: "advertise",
      content: `
      <h1>Advertise With Us</h1>
      <p>Reach our engaged audience through strategic advertising partnerships.</p>
      <h2>Why Advertise With Us</h2>
      <ul>
        <li>Targeted audience of engaged readers</li>
        <li>Multiple ad formats and placements</li>
        <li>Custom campaign options</li>
        <li>Detailed analytics and reporting</li>
      </ul>
      <p>For advertising inquiries, please contact <a href="mailto:ads@example.com">ads@example.com</a>.</p>
    `,
      isPublished: true,
    },
    {
      title: "Ethics Policy",
      slug: "ethics-policy",
      content: `
      <h1>Ethics Policy</h1>
      <p>This ethics policy outlines the principles and standards that guide our journalism.</p>
      <h2>Editorial Independence</h2>
      <p>We maintain a strict separation between news coverage and advertising. Our editorial decisions are made independently of commercial or political interests.</p>
      <h2>Accuracy and Fact-Checking</h2>
      <p>We are committed to factual accuracy in our reporting. All articles undergo thorough fact-checking before publication.</p>
      <h2>Corrections and Updates</h2>
      <p>We promptly correct errors and provide updates when necessary to ensure our coverage remains accurate.</p>
    `,
      isPublished: true,
    },
    {
      title: "Terms of Use",
      slug: "terms",
      content: `
      <h1>Terms of Use</h1>
      <p>By accessing and using this website, you agree to be bound by these Terms of Use.</p>
      <h2>Content Usage</h2>
      <p>All content on this website is protected by copyright. You may not reproduce, distribute, or modify any content without our express permission.</p>
      <h2>User Accounts</h2>
      <p>If you create an account, you are responsible for maintaining the security of your account and for all activities that occur under your account.</p>
      <h2>Limitation of Liability</h2>
      <p>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
    `,
      isPublished: true,
    },
    {
      title: "Privacy Policy",
      slug: "privacy",
      content: `
      <h1>Privacy Policy</h1>
      <p>This Privacy Policy explains how we collect, use, and protect your personal information.</p>
      <h2>Information Collection</h2>
      <p>We collect information you provide directly to us when you create an account, subscribe to our newsletter, or contact us.</p>
      <h2>How We Use Your Information</h2>
      <p>We use your information to provide and improve our services, communicate with you, and personalize your experience.</p>
      <h2>Information Sharing</h2>
      <p>We do not sell or rent your personal information to third parties. We may share your information with service providers who assist us in operating our website.</p>
    `,
      isPublished: true,
    },
    {
      title: "Cookie Policy",
      slug: "cookie-policy",
      content: `
      <h1>Cookie Policy</h1>
      <p>This Cookie Policy explains how we use cookies and similar technologies on our website.</p>
      <h2>What Are Cookies</h2>
      <p>Cookies are small text files that are stored on your device when you visit our website.</p>
      <h2>How We Use Cookies</h2>
      <p>We use cookies to remember your preferences, analyze website traffic, and personalize content.</p>
      <h2>Managing Cookies</h2>
      <p>You can control and delete cookies through your browser settings. However, if you disable cookies, some features of our website may not function properly.</p>
    `,
      isPublished: true,
    },
    {
      title: "Accessibility",
      slug: "accessibility",
      content: `
      <h1>Accessibility Statement</h1>
      <p>We are committed to making our website accessible to everyone, including people with disabilities.</p>
      <h2>Accessibility Standards</h2>
      <p>We strive to comply with the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA.</p>
      <h2>Assistive Technologies</h2>
      <p>Our website is designed to be compatible with various assistive technologies, including screen readers and voice recognition software.</p>
      <h2>Feedback</h2>
      <p>If you encounter any accessibility issues on our website, please contact us at <a href="mailto:accessibility@example.com">accessibility@example.com</a>.</p>
    `,
      isPublished: true,
    },
  ];

  console.log("Seeding default pages...");

  for (const page of defaultPages) {
    const existingPage = await prisma.page.findUnique({
      where: { slug: page.slug },
    });

    if (!existingPage) {
      await prisma.page.create({
        data: page,
      });
      console.log(`Created page: ${page.title}`);
    } else {
      console.log(`Page already exists: ${page.title}`);
    }
  }
}
async function main() {
  await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: { role: "OWNER" },
    create: {
      email: "owner@example.com",
      name: "Site Owner",
      role: "OWNER",
      password: await hash("ownerpassword", 10), // Hash the password
      // other fields...
    },
  });

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

  // Add this to your seed function

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
  const adminPassword = await hash("animesh123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "animeshacharya867@gmail.com" },
    update: {},
    create: {
      name: "Animesh Acharya",
      email: "animeshacharya867@gmail.com",
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
    // Call the seedPages function to create the default pages
    await seedPages();

    console.log("Database seeded successfully!");
  }
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
