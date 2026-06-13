"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export function Header() {
  const t = useTranslations("nav");
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params.locale as string) || "en";

  function switchLocale(locale: string) {
    router.replace(pathname, { locale });
  }

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          ShopNest
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/products" className="text-sm hover:underline">
            {t("products")}
          </Link>
          <Link href="/cart" className="text-sm hover:underline">
            {t("cart")}
          </Link>
          <ThemeToggle />

          <div className="flex items-center gap-1 border-l pl-4 ml-2">
            <button
              onClick={() => switchLocale("en")}
              className={`text-xs px-2 py-1 rounded ${
                currentLocale === "en"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => switchLocale("fa")}
              className={`text-xs px-2 py-1 rounded ${
                currentLocale === "fa"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              FA
            </button>
          </div>

          {user ? (
            <>
              <Link href="/orders" className="text-sm hover:underline">
                {t("orders")}
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="text-sm hover:underline">
                  {t("admin")}
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                {t("logout")}
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{t("register")}</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
