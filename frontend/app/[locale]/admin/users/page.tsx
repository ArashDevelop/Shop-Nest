"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { adminApi, type AdminUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Users,
  ShieldBan,
  Trash2,
  Shield,
  User as UserIcon,
} from "lucide-react";

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.users()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <ShieldBan className="size-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">{t("accessDenied")}</h1>
      </div>
    );
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      const updated = await adminApi.updateUser(userId, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast.success(`User role updated to ${newRole}`);
    } catch {
      toast.error("Failed to update role");
    }
  }

  async function deleteUser(userId: string, userName: string) {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} total users</p>
        </div>
      </div>

      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="size-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          users.map((u) => (
            <Card key={u.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted flex-shrink-0">
                    <UserIcon className="size-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={u.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                    {u.role === "ADMIN" ? (
                      <Shield className="size-3 mr-1" />
                    ) : (
                      <UserIcon className="size-3 mr-1" />
                    )}
                    {u.role}
                  </Badge>
                  {u.id !== currentUser?.id && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => toggleRole(u.id, u.role)}
                      >
                        {u.role === "ADMIN" ? "Demote" : "Promote"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                        onClick={() => deleteUser(u.id, u.name)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
