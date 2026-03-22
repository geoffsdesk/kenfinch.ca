import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/seller/dashboard', '/api/', '/ken'],
      },
    ],
    sitemap: 'https://www.kenfinch.ca/sitemap.xml',
  };
}
