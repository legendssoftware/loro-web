import * as React from 'react';
import { useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;
const SMALL_MOBILE_BREAKPOINT = 480;

export function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
        const onChange = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };
        mql.addEventListener('change', onChange);
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    return !!isMobile;
}

export function useIsSmallMobile() {
    const [isSmallMobile, setIsSmallMobile] = React.useState<boolean | undefined>(undefined);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${SMALL_MOBILE_BREAKPOINT - 1}px)`);
        const onChange = () => {
            setIsSmallMobile(window.innerWidth < SMALL_MOBILE_BREAKPOINT);
        };
        mql.addEventListener('change', onChange);
        setIsSmallMobile(window.innerWidth < SMALL_MOBILE_BREAKPOINT);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    return !!isSmallMobile;
}

export function useResponsiveTextSize() {
    const isMobile = useIsMobile();
    const isSmallMobile = useIsSmallMobile();

    const getHeroTextSize = () => {
        if (isSmallMobile) return "text-xl sm:text-2xl";
        if (isMobile) return "text-2xl sm:text-3xl";
        return "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl/none";
    };

    const getHeadingTextSize = () => {
        if (isSmallMobile) return "text-lg sm:text-xl";
        if (isMobile) return "text-xl sm:text-2xl";
        return "text-2xl sm:text-3xl md:text-4xl lg:text-5xl";
    };

    return {
        heroTextSize: getHeroTextSize(),
        headingTextSize: getHeadingTextSize(),
        isMobile,
        isSmallMobile
    };
}
