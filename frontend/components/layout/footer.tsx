export function Footer() {
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} ShopNest. All rights reserved.
      </div>
    </footer>
  );
}
