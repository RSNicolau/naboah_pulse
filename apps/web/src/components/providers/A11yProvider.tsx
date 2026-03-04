"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const A11yContext = createContext({
    highContrast: false,
    reduceMotion: false,
    fontSize: 16,
    toggleHighContrast: () => { },
    setReducedMotion: (val: boolean) => { }
});

export const useA11y = () => useContext(A11yContext);

export default function A11yProvider({ children }: { children: React.ReactNode }) {
    const [highContrast, setHighContrast] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);

    const toggleHighContrast = () => setHighContrast(!highContrast);

    useEffect(() => {
        const root = document.documentElement;
        if (highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }
    }, [highContrast]);

    return (
        <A11yContext.Provider value={{ highContrast, reduceMotion, fontSize: 16, toggleHighContrast, setReducedMotion: setReduceMotion }}>
            <div className={reduceMotion ? 'reduce-motion' : ''}>
                {children}
            </div>
        </A11yContext.Provider>
    );
}
