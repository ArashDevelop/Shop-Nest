import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ["en", "fa"],
    defaultLocale: "en",
    localeDetection: false
  }
};

export default withNextIntl({
  ...nextConfig,
  output: "standalone",
  // Disable static export checks for locale‑prefixed pages
  // Vercel will treat the app as a server‑rendered build.
  // This prevents export‑path‑mismatch errors.
  // No additional export settings are needed.
});
