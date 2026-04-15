import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/ken'],
      },
    ],
    sitemap: 'https://www.kenfinch.ca/sitemap.xml',
    host: 'https://www.kenfinch.ca',
  };
}
