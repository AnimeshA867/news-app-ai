import { PermissionGuard } from "@/components/admin/permission-guard";
import UserManagementTab from "@/components/admin/settings/user-management";

export const metadata = {
  title: "User Management - Admin Dashboard",
  description: "Manage user accounts and permissions",
};

export default function UsersPage() {
  return (
    <PermissionGuard allowedRoles={["ADMIN", "OWNER"]}>
      <div className="space-y-6 p-10 pb-16">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage user accounts and permissions.
          </p>
        </div>
        <UserManagementTab />
      </div>
    </PermissionGuard>
  );
}
