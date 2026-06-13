"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
        {t("copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
