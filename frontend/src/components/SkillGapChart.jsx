import React, { useContext } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const SkillGapChart = ({ matchedCount, unmatchedCount }) => {
    const { user } = useContext(AuthContext);
    const { colors, font } = getThemeColors(user?.theme || 'light');

    const data = [
        { name: 'Matched', value: matchedCount, color: colors.success },
        { name: 'Missing', value: unmatchedCount, color: colors.danger },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload?.length) return null;
        const { name, value, color } = payload[0].payload;
        return (
            <div
                style={{
                    padding: '0.625rem 0.875rem',
                    backgroundColor: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
            >
                <p
                    style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        color: colors.textSub,
                        fontFamily: font.mono,
                        margin: 0,
                        marginBottom: 3,
                    }}
                >
                    {name}
                </p>
                <p
                    style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color,
                        margin: 0,
                        fontFamily: font.mono,
                        lineHeight: 1,
                    }}
                >
                    {value}{' '}
                    <span style={{ fontSize: '0.65rem', color: colors.textSub, fontWeight: 400 }}>
                        skills
                    </span>
                </p>
            </div>
        );
    };

    return (
        <div
            style={{
                width: '100%',
                border: `1px solid ${colors.border}`,
                borderRadius: 14,
                backgroundColor: colors.bgCard,
                padding: '1.25rem',
                fontFamily: font.body,
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
                }}
            >
                <div>
                    <h2
                        style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: colors.textMain,
                            margin: 0,
                            marginBottom: 3,
                        }}
                    >
                        Skill Distribution
                    </h2>
                    <p
                        style={{
                            fontSize: '0.75rem',
                            color: colors.textSub,
                            fontStyle: 'italic',
                            margin: 0,
                        }}
                    >
                        Visualizing your compatibility
                    </p>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '0.875rem' }}>
                    {data.map(({ name, color }) => (
                        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div
                                style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    backgroundColor: color,
                                    flexShrink: 0,
                                }}
                            />
                            <span
                                style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    color: colors.textSub,
                                    fontFamily: font.mono,
                                }}
                            >
                                {name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={colors.border}
                        />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: colors.textSub,
                                fontSize: 11,
                                fontFamily: font.mono,
                                fontWeight: 600,
                            }}
                            dy={8}
                        />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Bar
                            dataKey="value"
                            barSize={48}
                            radius={[6, 6, 6, 6]}
                            animationDuration={1200}
                        >
                            {data.map((entry, i) => (
                                <Cell key={`cell-${i}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SkillGapChart;
