import { redirect } from "next/navigation";
const NewPage = () => {
  return redirect("/admin/authors/new/edit");
};

export default NewPage;
