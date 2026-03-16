export const getThemeColors = (mode) => {
    const isDark = mode === 'dark';

    return {
        isDark,
        colors: {
            /* ── Brand ── */
            primary: isDark ? '#60A5FA' : '#2A6FA8',
            secondary: '#F97316',

            /* ── Text ── */
            textMain: isDark ? '#F1F5F9' : '#0F172A', // high-contrast body text
            textSub: isDark ? '#64748B' : '#94A3B8', // captions, labels, muted
            textOnBg: isDark ? '#FFFFFF' : '#0F172A', // headings directly on page bg
            textMuted: isDark ? '#475569' : '#CBD5E1', // placeholders, disabled

            /* ── Backgrounds ── */
            bgPage: isDark ? '#000000' : '#F1F5F9', // page / outermost bg
            bgCard: isDark ? '#0A0A0A' : '#FFFFFF', // cards, panels
            bgMuted: isDark ? '#111111' : '#F8FAFC', // inputs, subtle fills
            bgHover: isDark ? '#161616' : '#F1F5F9', // hover states

            /* ── Borders ── */
            border: isDark ? '#1E293B' : '#E2E8F0',
            borderFocus: isDark ? '#60A5FA' : '#2A6FA8', // focused inputs

            /* ── Semantic ── */
            success: '#22C55E',
            successBg: isDark ? '#14532D22' : '#DCFCE7',
            successText: '#15803D',

            danger: '#EF4444',
            dangerBg: isDark ? '#7F1D1D22' : '#FEE2E2',
            dangerText: '#B91C1C',

            warning: '#F59E0B',
            warningBg: isDark ? '#78350F22' : '#FEF9C3',
            warningText: '#B45309',

            /* ── Levels (difficulty pips) ── */
            levelEasy: '#22C55E',
            levelMedium: '#F59E0B',
            levelHard: '#EF4444',

            /* ── Utility ── */
            white: '#FFFFFF',
            black: '#000000',
            overlay: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)',
        },

        /* ── Typography scale ── */
        font: {
            display: '"Playfair Display", Georgia, serif',
            body: '"DM Sans", system-ui, sans-serif',
            mono: '"DM Mono", "Fira Mono", monospace',
        },

        /* ── Spacing ── */
        space: {
            xs: '0.25rem', //  4px
            sm: '0.5rem', //  8px
            md: '0.875rem', // 14px
            lg: '1.25rem', // 20px
            xl: '2rem', // 32px
            xxl: '3rem', // 48px
        },

        /* ── Radii ── */
        radius: {
            sm: '6px',
            md: '10px',
            lg: '14px',
            xl: '18px',
            full: '9999px',
        },

        /* ── Shadows ── */
        shadow: {
            sm: isDark ? '0 1px 3px rgba(0,0,0,0.6)' : '0 1px 3px rgba(0,0,0,0.08)',
            md: isDark ? '0 4px 16px rgba(0,0,0,0.8)' : '0 4px 16px rgba(0,0,0,0.08)',
            lg: isDark ? '0 8px 32px rgba(0,0,0,0.9)' : '0 8px 32px rgba(0,0,0,0.1)',
        },

        /* ── Transitions ── */
        transition: {
            fast: 'all 0.12s ease',
            normal: 'all 0.2s ease',
            slow: 'all 0.35s ease',
        },
    };
};
