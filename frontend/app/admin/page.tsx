"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FolderKanban, Shield, Trash2, UserCog } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface UserData {
    id: number;
    email: string;
    username: string;
    profile_image: string;
    is_admin: boolean;
}

interface Stats {
    total_users: number;
    total_projects: number;
    total_admins: number;
}

export default function AdminPage() {
    const { user, token } = useAuth();
    const { t } = useTranslations();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.is_admin) {
            router.push("/");
            return;
        }
        fetchData();
    }, [user, token, router]);

    const fetchData = async () => {
        if (!token) return;
        try {
            const [usersRes, statsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/api/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(usersData);
            }
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAdmin = async (userId: number) => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/toggle-admin`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Failed to toggle admin:", error);
        }
    };

    const deleteUser = async (userId: number) => {
        if (!token) return;
        if (!confirm(t("admin.confirmDelete"))) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Failed to delete user:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <p>{t("common.loading")}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{t("admin.title")}</h1>
                    <p className="text-slate-600">{t("admin.subtitle")}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t("admin.totalUsers")}</CardTitle>
                            <Users className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t("admin.totalProjects")}</CardTitle>
                            <FolderKanban className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_projects || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t("admin.totalAdmins")}</CardTitle>
                            <Shield className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_admins || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t("admin.userManagement")}</CardTitle>
                        <CardDescription>{t("admin.userManagementDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">{t("admin.id")}</th>
                                        <th className="text-left p-4 font-medium">{t("admin.email")}</th>
                                        <th className="text-left p-4 font-medium">{t("admin.username")}</th>
                                        <th className="text-left p-4 font-medium">{t("admin.role")}</th>
                                        <th className="text-right p-4 font-medium">{t("admin.actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id} className="border-b hover:bg-slate-50">
                                            <td className="p-4">{u.id}</td>
                                            <td className="p-4">{u.email}</td>
                                            <td className="p-4">{u.username || "-"}</td>
                                            <td className="p-4">
                                                {u.is_admin ? (
                                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">{t("admin.admin")}</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{t("admin.user")}</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => toggleAdmin(u.id)}
                                                    disabled={u.id === user?.id}
                                                >
                                                    <UserCog className="h-4 w-4 mr-1" />
                                                    {u.is_admin ? t("admin.revokeAdmin") : t("admin.makeAdmin")}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => deleteUser(u.id)}
                                                    disabled={u.id === user?.id}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    {t("admin.deleteUser")}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center">
                    <Button variant="outline" onClick={() => router.back()}>{t("common.back")}</Button>
                </div>
            </div>
        </div>
    );
}
