"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
    variant?: "sidebar" | "header";
    className?: string;
}

export function LanguageSwitcher({ variant = "sidebar", className }: LanguageSwitcherProps) {
    const handleLanguageChange = (locale: string) => {
        localStorage.setItem("locale", locale);
        window.location.reload();
    };

    const currentLocale = typeof window !== "undefined"
        ? localStorage.getItem("locale") || "ja"
        : "ja";

    const isSidebar = variant === "sidebar";

    const buttonClass = isSidebar
        ? "text-slate-600  hover:text-white hover:bg-emerald-800"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100";

    const contentClass = isSidebar
        ? "bg-emerald-950 border-emerald-800 text-emerald-100"
        : "bg-white border-slate-200 text-slate-900";

    const itemClass = (locale: string) => {
        const isActive = currentLocale === locale;
        if (isSidebar) {
            return `cursor-pointer focus:bg-emerald-800 focus:text-white ${isActive ? "bg-emerald-800" : ""}`;
        }
        return `cursor-pointer focus:bg-slate-100 focus:text-slate-900 ${isActive ? "bg-slate-100" : ""}`;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(buttonClass, className)}>
                    <Globe className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`${contentClass} z-[101]`}>
                <DropdownMenuItem
                    onClick={() => handleLanguageChange("ja")}
                    className={itemClass("ja")}
                >
                    🇯JP
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleLanguageChange("en")}
                    className={itemClass("en")}
                >
                    🇺EN
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
