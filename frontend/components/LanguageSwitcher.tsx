"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
    const handleLanguageChange = (locale: string) => {
        localStorage.setItem("locale", locale);
        window.location.reload();
    };

    const currentLocale = typeof window !== "undefined"
        ? localStorage.getItem("locale") || "ja"
        : "ja";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-emerald-200 hover:text-white hover:bg-emerald-800">
                    <Globe className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-emerald-950 border-emerald-800 text-emerald-100 z-[101]">
                <DropdownMenuItem
                    onClick={() => handleLanguageChange("ja")}
                    className={`cursor-pointer focus:bg-emerald-800 focus:text-white ${currentLocale === "ja" ? "bg-emerald-800" : ""
                        }`}
                >
                    🇯JP
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleLanguageChange("en")}
                    className={`cursor-pointer focus:bg-emerald-800 focus:text-white ${currentLocale === "en" ? "bg-emerald-800" : ""
                        }`}
                >
                    🇺EN
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
