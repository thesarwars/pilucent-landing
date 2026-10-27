"use client"

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

const SmoothScroll = () => {

    const lenisRef = useRef(null);
    const pathname = usePathname();

    useEffect(() => {
        if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    }, [pathname]);

    useEffect(() => {
        const lenis = new Lenis();
        lenisRef.current = lenis;
        lenis.on('scroll', (e) => {
            // Handle scroll events if needed
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        return () => {
            lenis.destroy();
        };
    }, []);

    return <></>;

}

export default SmoothScroll;