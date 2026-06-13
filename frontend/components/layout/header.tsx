"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

export function Header() {
  const t = useTranslations("nav");
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params.locale as string) || "en";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function switchLocale(locale: string) {
    router.replace(pathname, { locale });
    setMobileMenuOpen(false);
  }

  const navItems = (
    <>
      <Link
        href="/products"
        className="text-sm hover:underline py-2 block"
        onClick={() => setMobileMenuOpen(false)}
      >
        {t("products")}
      </Link>
      <Link
        href="/cart"
        className="text-sm hover:underline py-2 block"
        onClick={() => setMobileMenuOpen(false)}
      >
        {t("cart")}
      </Link>
      {user ? (
        <>
          <Link
            href="/orders"
            className="text-sm hover:underline py-2 block"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t("orders")}
          </Link>
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-sm hover:underline py-2 block"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("admin")}
            </Link>
          )}
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="py-2 block"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Button variant="outline" className="w-full justify-start">
              {t("login")}
            </Button>
          </Link>
          <Link
            href="/register"
            className="py-2 block"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Button className="w-full justify-start">
              {t("register")}
            </Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          ShopNest
        </Link>

        <nav className="hidden md:flex items-center gap-4">
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

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <SheetContent side="right" className="w-72 p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t("menu")}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 space-y-2">{navItems}</div>
            <div className="p-4 border-t">
              <div className="flex items-center gap-1 border-l pl-4">
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
              {user && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {user.name} ({user.role})
                  </p>
                  <Button variant="outline" className="w-full justify-start" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                    {t("logout")}
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
