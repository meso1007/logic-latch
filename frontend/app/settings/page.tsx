"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Mail, Bell, Lock, Trash2, ArrowUpRight, Camera, MoveRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
            // In a real app, we'd show a toast here
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-emerald-950 selection:bg-[#D4AF37] selection:text-white overflow-x-hidden font-sans pb-20">
            {/* Ultra-Fine Grain Texture */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-multiply"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* Ambient Light - Emerald Tinted */}
            <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-emerald-50/80 to-teal-50/50 rounded-full blur-[120px] opacity-60 pointer-events-none" />

            <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12 relative z-10">
                {/* Top Bar */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-32 gap-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="group flex items-center gap-3 hover:bg-transparent pl-0 text-slate-500 hover:text-emerald-950 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full border-[0.5px] border-emerald-200/60 flex items-center justify-center group-hover:border-emerald-950 group-hover:rotate-45 transition-all duration-700 bg-white/50 backdrop-blur-sm">
                            <ArrowUpRight className="h-3.5 w-3.5 rotate-[225deg]" />
                        </div>
                        <span className="font-light tracking-wide text-sm uppercase">Back</span>
                    </Button>

                    <div className="hidden lg:flex items-center gap-8">
                        <div className="text-xs font-medium text-slate-400 tracking-widest uppercase rotate-90 origin-right translate-x-4">Account</div>
                        <div className="h-20 w-[0.5px] bg-emerald-200/60" />
                        <div className="text-xs font-medium text-emerald-950 tracking-widest uppercase">Preferences</div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="relative mb-24">
                    <h1 className="text-[5rem] lg:text-[7.5rem] leading-[0.9] font-medium tracking-tighter text-emerald-950 lg:ml-24">
                        Settings
                    </h1>
                </div>

                <div className="grid lg:grid-cols-12 gap-16">
                    {/* Left Column: Navigation (Visual only for now) */}
                    <div className="lg:col-span-3 hidden lg:block">
                        <div className="sticky top-12 space-y-2">
                            {['Profile', 'Notifications', 'Security'].map((item, i) => (
                                <div key={item} className={cn(
                                    "text-sm tracking-widest uppercase py-2 border-l-2 pl-4 transition-all duration-300 cursor-pointer",
                                    i === 0 ? "border-emerald-950 text-emerald-950 font-medium" : "border-transparent text-slate-400 hover:text-slate-600"
                                )}>
                                    {item}
                                </div>
                            ))}
                            <div className="text-sm tracking-widest uppercase py-2 border-l-2 border-transparent pl-4 text-red-400 hover:text-red-600 cursor-pointer mt-8">
                                Danger Zone
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Forms */}
                    <div className="lg:col-span-9 space-y-20">

                        {/* Profile Section */}
                        <section className="space-y-12">
                            <div className="flex items-end justify-between border-b-[0.5px] border-emerald-100 pb-6">
                                <h2 className="text-2xl font-light text-emerald-950">{t("settings.profile")}</h2>
                                <span className="text-[10px] uppercase tracking-widest text-slate-400">01</span>
                            </div>

                            <div className="grid md:grid-cols-12 gap-12">
                                <div className="md:col-span-4">
                                    <div className="relative group w-40 h-40 mx-auto md:mx-0">
                                        <div className="w-full h-full rounded-full overflow-hidden border-[0.5px] border-emerald-100 bg-slate-50">
                                            {profileImage ? (
                                                <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-emerald-50/50">
                                                    <User className="h-12 w-12 text-emerald-200" />
                                                </div>
                                            )}
                                        </div>
                                        <label
                                            htmlFor="profile-image"
                                            className="absolute inset-0 rounded-full bg-emerald-950/0 group-hover:bg-emerald-950/5 flex items-center justify-center cursor-pointer transition-all duration-500"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-500">
                                                <Camera className="h-4 w-4 text-emerald-950" />
                                            </div>
                                            <input
                                                id="profile-image"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <div className="md:col-span-8 space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-xs uppercase tracking-widest text-slate-400 font-bold">{t("settings.username")}</Label>
                                        <Input
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="border-0 border-b-[0.5px] border-emerald-100 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-950 text-lg font-light bg-transparent h-12 transition-colors text-emerald-950"
                                            placeholder={t("settings.usernamePlaceholder")}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-xs uppercase tracking-widest text-slate-400 font-bold">{t("settings.email")}</Label>
                                        <Input
                                            value={user?.email || ""}
                                            disabled
                                            className="border-0 border-b-[0.5px] border-emerald-100 rounded-none px-0 text-lg font-light bg-transparent h-12 text-slate-400"
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <Button
                                            onClick={handleUpdateProfile}
                                            disabled={isUpdating}
                                            className="bg-emerald-950 hover:bg-emerald-900 text-white rounded-none h-12 px-8 text-xs tracking-widest uppercase transition-all duration-500"
                                        >
                                            {isUpdating ? t("settings.updating") : t("settings.updateProfile")}
                                            {!isUpdating && <MoveRight className="ml-2 h-3 w-3" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Notifications Section */}
                        <section className="space-y-12">
                            <div className="flex items-end justify-between border-b-[0.5px] border-emerald-100 pb-6">
                                <h2 className="text-2xl font-light text-emerald-950">{t("settings.notifications")}</h2>
                                <span className="text-[10px] uppercase tracking-widest text-slate-400">02</span>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center justify-between group">
                                    <div className="space-y-1">
                                        <Label className="text-base font-light text-emerald-950">{t("settings.emailNotifications")}</Label>
                                        <p className="text-sm text-slate-500 font-light">{t("settings.emailNotificationsDesc")}</p>
                                    </div>
                                    <Switch
                                        checked={emailNotifications}
                                        onCheckedChange={setEmailNotifications}
                                        className="data-[state=checked]:bg-emerald-950 data-[state=unchecked]:bg-slate-200"
                                    />
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="space-y-1">
                                        <Label className="text-base font-light text-emerald-950">{t("settings.quizReminders")}</Label>
                                        <p className="text-sm text-slate-500 font-light">{t("settings.quizRemindersDesc")}</p>
                                    </div>
                                    <Switch
                                        checked={quizReminders}
                                        onCheckedChange={setQuizReminders}
                                        className="data-[state=checked]:bg-emerald-950 data-[state=unchecked]:bg-slate-200"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Security Section */}
                        <section className="space-y-12">
                            <div className="flex items-end justify-between border-b-[0.5px] border-emerald-100 pb-6">
                                <h2 className="text-2xl font-light text-emerald-950">{t("settings.security")}</h2>
                                <span className="text-[10px] uppercase tracking-widest text-slate-400">03</span>
                            </div>

                            <div className="space-y-8 max-w-md">
                                <div className="space-y-4">
                                    <Label className="text-xs uppercase tracking-widest text-slate-400 font-bold">{t("settings.currentPassword")}</Label>
                                    <Input
                                        type="password"
                                        className="border-0 border-b-[0.5px] border-emerald-100 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-950 text-lg font-light bg-transparent h-12 transition-colors text-emerald-950"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-xs uppercase tracking-widest text-slate-400 font-bold">{t("settings.newPassword")}</Label>
                                    <Input
                                        type="password"
                                        className="border-0 border-b-[0.5px] border-emerald-100 rounded-none px-0 focus-visible:ring-0 focus-visible:border-emerald-950 text-lg font-light bg-transparent h-12 transition-colors text-emerald-950"
                                    />
                                </div>
                                <div className="pt-4">
                                    <Button className="bg-white border-[0.5px] border-emerald-100 text-emerald-950 hover:bg-emerald-50 hover:border-emerald-950 rounded-none h-12 px-8 text-xs tracking-widest uppercase transition-all duration-500">
                                        {t("settings.changePassword")}
                                    </Button>
                                </div>
                            </div>
                        </section>

                        {/* Danger Zone */}
                        <section className="space-y-12 pt-12">
                            <div className="p-8 border-[0.5px] border-red-100 bg-red-50/30">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-red-50 rounded-full">
                                        <Trash2 className="h-5 w-5 text-red-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-red-900 mb-2">{t("settings.dangerZone")}</h3>
                                        <p className="text-sm text-red-700/70 font-light mb-6 leading-relaxed max-w-xl">
                                            {t("settings.deleteAccountDesc")}
                                        </p>
                                        <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 px-0 h-auto font-medium text-xs uppercase tracking-widest">
                                            {t("settings.deleteAccountButton")}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
