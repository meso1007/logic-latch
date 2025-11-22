"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
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
            alert("プロフィールを更新しました！");
        } catch (error) {
            alert("プロフィールの更新に失敗しました");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">設定</h1>
                    <p className="text-slate-600">アカウントと環境設定を管理</p>
                </div>

                <div className="space-y-6">
                    {/* Profile Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-emerald-600" />
                                <CardTitle>プロフィール</CardTitle>
                            </div>
                            <CardDescription>基本情報の管理</CardDescription>
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
                                    <p className="text-sm text-slate-600">プロフィール画像をアップロード</p>
                                    <p className="text-xs text-slate-500">JPG, PNG (最大5MB)</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">メールアドレス</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="bg-slate-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username">ユーザー名</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="ユーザー名を入力"
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
                                {isUpdating ? "更新中..." : "プロフィールを更新"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-emerald-600" />
                                <CardTitle>通知設定</CardTitle>
                            </div>
                            <CardDescription>通知の受信方法を管理</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>メール通知</Label>
                                    <p className="text-sm text-slate-500">
                                        重要な更新をメールで受け取る
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
                                    <Label>クイズリマインダー</Label>
                                    <p className="text-sm text-slate-500">
                                        学習の進捗リマインダーを受け取る
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
                                <CardTitle>セキュリティ</CardTitle>
                            </div>
                            <CardDescription>パスワードとセキュリティ設定</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">現在のパスワード</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    className="focus-visible:ring-emerald-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">新しいパスワード</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    className="focus-visible:ring-emerald-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">パスワード確認</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    className="focus-visible:ring-emerald-600"
                                />
                            </div>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                パスワードを変更
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-5 w-5 text-red-600" />
                                <CardTitle className="text-red-600">危険な操作</CardTitle>
                            </div>
                            <CardDescription>アカウントの削除</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 mb-4">
                                アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
                            </p>
                            <Button variant="destructive">アカウントを削除</Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8 text-center">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="border-slate-300"
                    >
                        戻る
                    </Button>
                </div>
            </div>
        </div>
    );
}
