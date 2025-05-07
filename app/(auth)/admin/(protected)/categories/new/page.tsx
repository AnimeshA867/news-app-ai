import { redirect } from "next/navigation";

export default function NewCategoryPage() {
  // This just redirects to the dynamic [id] route with "new" as the ID
  redirect("/admin/categories/new");

  // This component won't actually render anything since we're redirecting
  return null;
}
