import { getCategories } from "@/utils/fetcher";
import CategoryList from "./category-list"; // Note: Capitalization fixed

export async function SiteHeader() {
  const categories = await getCategories();

  return <CategoryList categories={categories} />;
}

// Add a default export
export default SiteHeader;
