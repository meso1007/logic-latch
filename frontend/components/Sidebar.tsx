"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    PlusCircle,
    MessageSquare,
    LogOut,
    User,
    Menu,
    Search,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronUp,
    Sparkles,
    HelpCircle,
    Settings,
    Shield,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

import { API_BASE_URL } from "@/config/api";

import { useProjects } from "@/context/ProjectContext";

// ... (imports remain the same, remove useState/useEffect for projects if not needed)

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function Sidebar() {
    const { projects, deleteProject } = useProjects(); // Use global state
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { user, logout } = useAuth(); // token not needed here anymore
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useTranslations();
    const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Removed local fetch logic


    const searchParams = useSearchParams();
    const currentProjectId = searchParams.get("id");

    const filteredProjects = (projects || []).filter((project) =>
        project.goal.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div
                className={cn(
                    "flex flex-col h-screen text-slate-100 border-r transition-all duration-300 ease-in-out relative z-[100]",
                    "bg-gradient-to-b from-emerald-950 to-emerald-900 border-emerald-800",
                    isCollapsed ? "w-16" : "w-64"
                )}
            >
                {/* Header: Toggle & Language Switcher */}
                <div className="p-4 flex items-center justify-between gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-emerald-200 hover:text-white hover:bg-emerald-800"
                    >
                        {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                    </Button>

                    {!isCollapsed && <LanguageSwitcher />}
                </div>

                {/* New Project Button */}
                <div className="px-3 mb-2">
                    <Button
                        onClick={() => router.push("/?new=true")}
                        className={cn(
                            "w-full bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 transition-all shadow-lg shadow-primary/20",
                            isCollapsed ? "justify-center px-0" : "justify-start gap-2"
                        )}
                        variant="outline"
                        title={t("common.newProject")}
                    >
                        <PlusCircle className="h-5 w-5" />
                        {!isCollapsed && <span>{t("common.newProject")}</span>}
                    </Button>
                </div>

                {/* Search Input (only visible when expanded) */}
                {!isCollapsed && (
                    <div className="px-3 mb-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-emerald-400" />
                            <Input
                                placeholder={t("sidebar.searchProjects")}
                                className="pl-8 bg-emerald-950 border-emerald-800 text-slate-200 h-9 text-sm focus-visible:ring-emerald-600"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Project List */}
                <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-emerald-700 scrollbar-track-transparent">
                    {!isCollapsed && <div className="text-xs font-semibold text-emerald-400 px-2 mb-2">{t("sidebar.history")}</div>}
                    <div className="space-y-1">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                className={cn(
                                    "group relative flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                                    pathname === `/roadmap` && currentProjectId === String(project.id)
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "text-emerald-100 hover:bg-emerald-800/50",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <Link
                                    href={`/roadmap?id=${project.id}`}
                                    className="flex items-center gap-2 flex-1 min-w-0"
                                    title={isCollapsed ? project.goal : undefined}
                                >
                                    <MessageSquare className="h-4 w-4 shrink-0 text-emerald-300" />
                                    {!isCollapsed && (
                                        <div className="flex flex-col min-w-0">
                                            <span className="truncate font-medium">{project.goal}</span>
                                            <span className="truncate text-xs text-emerald-400/70">{project.stack}</span>
                                        </div>
                                    )}
                                </Link>

                                {!isCollapsed && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setProjectToDelete(project.id);
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-emerald-700 rounded transition-all text-emerald-300 hover:text-white"
                                        title={t("common.delete")}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Footer with Dropdown Menu */}
                <div className="p-3 border-t border-emerald-800">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={cn(
                                    "w-full flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-emerald-800",
                                    isCollapsed ? "justify-center" : ""
                                )}
                            >
                                <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 overflow-hidden">
                                    {user?.profile_image ? (
                                        <img src={user.profile_image} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-4 w-4 text-white" />
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-medium truncate text-emerald-100">
                                            {user?.username || user?.email}
                                        </p>
                                    </div>
                                )}
                                {!isCollapsed && (
                                    <ChevronUp className="h-4 w-4 text-emerald-300" />
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="top"
                            align="end"
                            className="w-56 bg-emerald-950 border-emerald-800 text-emerald-100 z-[101]"
                        >
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-emerald-100">
                                        {user?.username || user?.email}
                                    </p>
                                    <p className="text-xs leading-none text-emerald-400">{t("sidebar.freePlan")}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-emerald-800" />
                            <DropdownMenuItem
                                className="cursor-pointer focus:bg-emerald-800 focus:text-white"
                                onClick={() => router.push("/upgrade")}
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                <span>{t("menu.upgradePlan")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer focus:bg-emerald-800 focus:text-white"
                                onClick={() => router.push("/settings")}
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                <span>{t("menu.settings")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer focus:bg-emerald-800 focus:text-white"
                                onClick={() => router.push("/help")}
                            >
                                <HelpCircle className="mr-2 h-4 w-4" />
                                <span>{t("menu.help")}</span>
                            </DropdownMenuItem>
                            {user?.is_admin && (
                                <>
                                    <DropdownMenuSeparator className="bg-emerald-800" />
                                    <DropdownMenuItem
                                        className="cursor-pointer focus:bg-emerald-800 focus:text-white text-yellow-400 focus:text-yellow-300"
                                        onClick={() => router.push("/admin")}
                                    >
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span>{t("menu.adminDashboard")}</span>
                                    </DropdownMenuItem>
                                </>
                            )}
                            <DropdownMenuSeparator className="bg-emerald-800" />
                            <DropdownMenuItem
                                className="cursor-pointer focus:bg-emerald-800 focus:text-white text-red-400 focus:text-red-300"
                                onClick={logout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>{t("common.logout")}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <AlertDialogContent className="bg-white border-slate-200 text-slate-900 shadow-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-slate-900">
                            {t("common.deleteConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 text-base">
                            {t("common.deleteConfirmDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setProjectToDelete(null)}
                            className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
                        >
                            {t("common.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (projectToDelete) deleteProject(projectToDelete);
                                setProjectToDelete(null);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white border-none shadow-sm"
                        >
                            {t("common.delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
