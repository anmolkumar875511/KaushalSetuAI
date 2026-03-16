import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const ProgressBar = ({ value }) => {
    const { user } = useContext(AuthContext);
    const { colors } = getThemeColors(user?.theme || 'light');

    const safeValue = Math.min(Math.max(value || 0), 100);
    const fillColor =
        safeValue > 75 ? colors.success : safeValue >= 40 ? colors.warning : colors.danger;

    return (
        <div style={{ width: '100%' }}>
            <div
                style={{
                    width: '100%',
                    height: 8,
                    backgroundColor: colors.border,
                    borderRadius: 4,
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${safeValue}%`,
                        backgroundColor: fillColor,
                        borderRadius: 4,
                        transition: 'width 0.8s ease-out',
                    }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
