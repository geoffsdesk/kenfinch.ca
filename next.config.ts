
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    // Analytics & tracking pixels
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID,
    NEXT_PUBLIC_GOOGLE_ADS_CONTACT_LABEL: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONTACT_LABEL,
    NEXT_PUBLIC_GOOGLE_ADS_VALUATION_LABEL: process.env.NEXT_PUBLIC_GOOGLE_ADS_VALUATION_LABEL,
    NEXT_PUBLIC_GOOGLE_ADS_EXPERT_LABEL: process.env.NEXT_PUBLIC_GOOGLE_ADS_EXPERT_LABEL,
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
    NEXT_PUBLIC_TIKTOK_PIXEL_ID: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
  }
};

export default nextConfig;
