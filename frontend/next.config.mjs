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

export default withNextIntl(nextConfig);
