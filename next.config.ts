import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'img.icons8.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'img.icons9.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'storage.googleapis.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.squarespace-cdn.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'fbbuildmart.co.za',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'www.builders.co.za',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'media.leroymerlin.co.za',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'www.makro.co.za',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
