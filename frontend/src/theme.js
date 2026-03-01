export const getThemeColors = (mode) => {
    const isDark = mode === 'dark';

    return {
        colors: {
            // Neon Blue for dark mode, Deep Blue for light mode
            primary: isDark ? "#60A5FA" : "#2A6FA8",      
            secondary: "#F97316", // Universal Orange (visible everywhere)
            
            // FIX: textMain is now a "Universal Slate" 
            // Visible on white cards AND black backgrounds
            textMain: isDark ? "#94A3B8" : "#0F172A", 
            
            // Headings sitting directly on the Black BG need to be bright
            textOnBg: isDark ? "#FFFFFF" : "#0F172A",    
            
            textMuted: isDark ? "#64748B" : "#94A3B8",    
            
            // Backgrounds
            bgLight: isDark ? "#000000" : "#F1F5F9",  // True Black for dark mode
            white: "#FFFFFF",    // Keeping cards PURE WHITE as requested
            
            // Accents
            border: isDark ? "#1E293B" : "#E2E8F0",
        }
    };
};