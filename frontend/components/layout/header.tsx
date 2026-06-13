"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartDropdown } from "@/components/cart/cart-dropdown";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, X, LayoutDashboard } from "lucide-react";

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
      {user ? (
        <>
          <Link
            href="/dashboard"
            className="text-sm hover:underline py-2 block"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t("dashboard")}
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
            <Button className="w-full justify-start">{t("register")}</Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Shopnest
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <Link href="/products" className="text-sm hover:underline px-2">
            {t("products")}
          </Link>
          <CartDropdown />
          <ThemeToggle />

          <div className="flex items-center gap-1 border-l pl-3 ml-2">
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
            <div className="flex items-center gap-2 border-l pl-3 ml-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <LayoutDashboard className="size-3.5" />
                  {t("dashboard")}
                </Button>
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="text-xs">
                    {t("admin")}
                  </Button>
                </Link>
              )}
              <span className="text-xs text-muted-foreground font-medium px-1">
                {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                {t("logout")}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l pl-3 ml-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{t("register")}</Button>
              </Link>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <CartDropdown />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <Button
              variant="ghost"
              size="icon"
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
                <div className="flex items-center gap-1">
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
                    <Link
                      href="/dashboard"
                      className="block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                      >
                        <LayoutDashboard className="size-4" />
                        {t("dashboard")}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      {t("logout")}
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
