"use client";

import { useEffect, useState } from "react";
import enMessages from "../messages/en.json";
import jaMessages from "../messages/ja.json";

type Messages = Record<string, any>;

const translations: Record<string, Messages> = {
    en: enMessages,
    ja: jaMessages,
};

export function useTranslations() {
    const [locale, setLocale] = useState<string>("ja");
    const [messages, setMessages] = useState<Messages>(jaMessages);

    useEffect(() => {
        const storedLocale = (localStorage.getItem("locale") || "ja") as string;
        setLocale(storedLocale);
        setMessages(translations[storedLocale] || jaMessages);
    }, []);

    const t = (key: string): string => {
        const keys = key.split(".");
        let value: any = messages;

        for (const k of keys) {
            value = value?.[k];
        }

        return value || key;
    };

    return { t, locale };
}
