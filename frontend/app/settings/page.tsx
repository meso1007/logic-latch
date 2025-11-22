"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Mail, Bell, Lock, Trash2 } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const { user, logout, updateProfile } = useAuth();
    const { t } = useTranslations();
    const router = useRouter();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [quizReminders, setQuizReminders] = useState(true);
    const [username, setUsername] = useState(user?.username || "");
    const [profileImage, setProfileImage] = useState(user?.profile_image || "");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        try {
            await updateProfile(username, profileImage);
            alert(t("settings.profileUpdated"));
        } catch (error) {
            alert(t("settings.profileUpdateFailed"));
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{t("settings.title")}</h1>
                    <p className="text-slate-600">{t("settings.subtitle")}</p>
                </div>

                <div className="space-y-6">
                    {/* Profile Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-emerald-600" />
                                <CardTitle>{t("settings.profile")}</CardTitle>
                            </div>
                            <CardDescription>{t("settings.profileDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="h-24 w-24 rounded-full bg-emerald-600 flex items-center justify-center overflow-hidden">
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-12 w-12 text-white" />
                                        )}
                                    </div>
                                    <label
                                        htmlFor="profile-image"
                                        className="absolute bottom-0 right-0 h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors"
                                    >
                                        <input
                                            id="profile-image"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </label>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-600">{t("settings.uploadImage")}</p>
                                    <p className="text-xs text-slate-500">{t("settings.imageFormats")}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">{t("settings.email")}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="bg-slate-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username">{t("settings.username")}</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder={t("settings.usernamePlaceholder")}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="focus-visible:ring-emerald-600"
                                />
                            </div>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={handleUpdateProfile}
                                disabled={isUpdating}
                            >
                                {isUpdating ? t("settings.updating") : t("settings.updateProfile")}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-emerald-600" />
                                <CardTitle>{t("settings.notifications")}</CardTitle>
                            </div>
                            <CardDescription>{t("settings.notificationsDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>{t("settings.emailNotifications")}</Label>
                                    <p className="text-sm text-slate-500">
                                        {t("settings.emailNotificationsDesc")}
                                    </p>
                                </div>
                                <Switch
                                    checked={emailNotifications}
                                    onCheckedChange={setEmailNotifications}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>{t("settings.quizReminders")}</Label>
                                    <p className="text-sm text-slate-500">
                                        {t("settings.quizRemindersDesc")}
                                    </p>
                                </div>
                                <Switch
                                    checked={quizReminders}
                                    onCheckedChange={setQuizReminders}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-emerald-600" />
                                <CardTitle>{t("settings.security")}</CardTitle>
                            </div>
                            <CardDescription>{t("settings.securityDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">{t("settings.currentPassword")}</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    className="focus-visible:ring-emerald-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">{t("settings.newPassword")}</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    className="focus-visible:ring-emerald-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">{t("settings.confirmPassword")}</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    className="focus-visible:ring-emerald-600"
                                />
                            </div>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                {t("settings.changePassword")}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-5 w-5 text-red-600" />
                                <CardTitle className="text-red-600">{t("settings.dangerZone")}</CardTitle>
                            </div>
                            <CardDescription>{t("settings.deleteAccount")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 mb-4">
                                {t("settings.deleteAccountDesc")}
                            </p>
                            <Button variant="destructive">{t("settings.deleteAccountButton")}</Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8 text-center">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="border-slate-300"
                    >
                        {t("common.back")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
