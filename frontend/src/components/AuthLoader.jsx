import React, { useContext } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const AuthLoader = () => {
    const { user } = useContext(AuthContext);
    const { colors, font } = getThemeColors(user?.theme || 'light');

    return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.bgPage,
                fontFamily: font.body,
            }}
        >
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <Loader2
                size={22}
                style={{ color: colors.primary, animation: 'spin 1s linear infinite' }}
            />
            <p
                style={{
                    marginTop: 10,
                    fontSize: '0.72rem',
                    color: colors.textSub,
                    fontFamily: font.mono,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                }}
            >
                Checking authentication…
            </p>
        </div>
    );
};

export default AuthLoader;
