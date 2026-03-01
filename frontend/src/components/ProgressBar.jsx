import React from 'react';

const ProgressBar = ({ value }) => {
    const safeValue = Math.min(Math.max(value, 0), 100);

    const getGradient = () => {
        if (safeValue > 75) return 'from-emerald-400 to-emerald-600 shadow-emerald-100';
        if (safeValue >= 40) return 'from-amber-400 to-orange-500 shadow-orange-100';
        return 'from-rose-400 to-rose-600 shadow-rose-100';
    };

    return (
        <div className="w-full">
            <div className="relative w-full bg-slate-100 h-5 rounded-full p-1 border border-slate-200 shadow-inner">
                {/* Fill with Gradient and Glow */}
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out bg-linear-to-r ${getGradient()} shadow-lg relative`}
                    style={{ width: `${safeValue}%` }}
                >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-white/20 rounded-full w-full h-[40%] top-0"></div>
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
