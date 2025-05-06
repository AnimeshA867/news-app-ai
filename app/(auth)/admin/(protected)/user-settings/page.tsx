import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserSettingsClient } from "./user-settings-client";

export const metadata = {
  title: "Account Settings - Admin Dashboard",
  description: "Manage your account settings and preferences",
};

export default async function UserSettingsPage() {
  // Get user server-side
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/admin/login");
  }

  // Fetch user data server-side
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      role: true,
    },
  });

  if (!userData) {
    redirect("/admin/login");
  }

  return <UserSettingsClient initialUserData={userData} />;
}
