import { prisma } from "../lib/prisma";

// Add this to your existing seed script

async function seedNavigation() {
  // Define initial links based on your current hardcoded array
  const initialLinks = [
    { name: "About Us", href: "/about", group: "Company", order: 0 },
    { name: "Contact", href: "/contact", group: "Company", order: 1 },
    { name: "Careers", href: "/careers", group: "Company", order: 2 },
    { name: "Advertise", href: "/advertise", group: "Advertising", order: 0 },
    {
      name: "Ethics Policy",
      href: "/ethics-policy",
      group: "Advertising",
      order: 1,
    },
    { name: "Terms of Use", href: "/terms", group: "Legal", order: 0 },
    { name: "Privacy Policy", href: "/privacy", group: "Legal", order: 1 },
    { name: "Cookie Policy", href: "/cookie-policy", group: "Legal", order: 2 },
    { name: "Accessibility", href: "/accessibility", group: "Legal", order: 3 },
  ];

  console.log(`Seeding navigation links...`);

  // Clear existing links if needed
  // await prisma.navigationLink.deleteMany();

  // Check if links already exist
  const existingCount = await prisma.navigationLink.count();

  if (existingCount === 0) {
    // Create initial links if none exist
    for (const link of initialLinks) {
      await prisma.navigationLink.create({
        data: {
          name: link.name,
          href: link.href,
          group: link.group,
          order: link.order,
          isEnabled: true,
        },
      });
    }
    console.log(`Created ${initialLinks.length} navigation links`);
  } else {
    console.log(
      `Skipping navigation links seed - ${existingCount} links already exist`
    );
  }
}

// Call this in your main seed function
async function main() {
  // Other seed functions
  await seedNavigation();
}

main();
