import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
    darkMode: ['class'],
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
        './modules/**/*.{js,ts,jsx,tsx,mdx}',
        './providers/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                heading: ['var(--font-urbanist)', 'sans-serif'],
                body: ['var(--font-urbanist)', 'sans-serif'],
                placeholder: ['var(--font-urbanist)', 'sans-serif'],
            },
            fontWeight: {
                thin: '200',
                extralight: '200',
                light: '300',
                normal: '400',
                medium: '500',
                semibold: '600',
                bold: '700',
                extrabold: '800',
                black: '900',
            },
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))',
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': {
                    from: {
                        height: '0',
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)',
                    },
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)',
                    },
                    to: {
                        height: '0',
                    },
                },
                'bounce-in': {
                    '0%': {
                        transform: 'scale(0.95)',
                        opacity: '0'
                    },
                    '50%': {
                        transform: 'scale(1.02)',
                        opacity: '0.5'
                    },
                    '100%': {
                        transform: 'scale(1)',
                        opacity: '1'
                    }
                },
                'fade-in-up': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(20px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                },
                'fade-in': {
                    '0%': {
                        opacity: '0'
                    },
                    '100%': {
                        opacity: '1'
                    }
                },
                'task-appear': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(20px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'bounce-in': 'bounce-in 0.3s ease-out',
                'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
                'fade-in': 'fade-in 0.5s ease-out forwards',
                'task-appear': 'task-appear 0.4s var(--task-delay, 0ms) ease-out forwards',
                'fade-in-up-1': 'fade-in-up 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
                'fade-in-up-2': 'fade-in-up 0.5s 0.1s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
                'fade-in-up-3': 'fade-in-up 0.5s 0.2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
                'fade-in-up-4': 'fade-in-up 0.5s 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
                'fade-in-up-5': 'fade-in-up 0.5s 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
                'fade-in-up-6': 'fade-in-up 0.5s 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
                'fade-in-up-7': 'fade-in-up 0.5s 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
                'fade-in-up-8': 'fade-in-up 0.5s 0.7s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
                'fade-in-up-9': 'fade-in-up 0.5s 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
                'fade-in-up-10': 'fade-in-up 0.5s 0.9s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
            },
        },
    },
    plugins: [animate],
} satisfies Config;
