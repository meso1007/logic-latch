"use client";

import { useEffect, useState } from "react";
import enMessages from "../messages/en.json";
import jaMessages from "../messages/ja.json";

type Messages = Record<string, any>;

const translations: Record<string, Messages> = {
    en: enMessages,
    ja: jaMessages,
};

export function useTranslations(namespace?: string) {
    const [locale, setLocale] = useState<string>("ja");
    const [messages, setMessages] = useState<Messages>(jaMessages);

    useEffect(() => {
        const storedLocale = (localStorage.getItem("locale") || "ja") as string;
        setLocale(storedLocale);
        setMessages(translations[storedLocale] || jaMessages);
    }, []);

    const t = <T = string>(key: string, params?: Record<string, any>): T => {
        const fullKey = namespace ? `${namespace}.${key}` : key;
        const keys = fullKey.split(".");
        let value: any = messages;

        for (const k of keys) {
            value = value?.[k];
        }

        if (params?.returnObjects) {
            return (value || key) as T;
        }

        let text = (typeof value === "string" ? value : JSON.stringify(value)) || key;

        if (params && typeof text === "string") {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                if (paramKey !== "returnObjects") {
                    text = text.replace(`{${paramKey}}`, String(paramValue));
                }
            });
        }

        return text as T;
    };

    return { t, locale };
}
