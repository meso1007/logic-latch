"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { HelpCircle } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
    const { t } = useTranslations();

    return (
        <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden">
                        <img src="/logo.png" alt="LogicLatch AI" className="h-full w-full object-cover" />
                    </div>
                    <span className="font-bold text-xl text-slate-900">LogicLatch AI</span>
                </Link>
            </div>

            <div className="flex items-center gap-2">

                <Link href="/login">
                    <Button variant="ghost" size="default" className="  text-black border border-black bg-white hover:bg-slate-100 hover:text-black rounded-xl px-4 cursor-pointer">
                        {t("common.login")}
                    </Button>
                </Link>
                <Link href="/signup">
                    <Button size="default" className="bg-primary  hover:bg-primary/90 text-primary-foreground hover:text-primary-foreground rounded-xl px-4 cursor-pointer">
                        {t("common.signup")}
                    </Button>
                </Link>

                <Link href="/help">
                    <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900 rounded-full cursor-pointer">
                        <HelpCircle className="h-12 w-12" />
                    </Button>
                </Link>
                <LanguageSwitcher variant="header" className="cursor-pointer" />

            </div>
        </header>
    );
}
