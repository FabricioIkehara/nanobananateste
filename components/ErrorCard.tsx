
import React from 'react';
import { Button } from './Button';

interface ErrorCardProps {
    era: string;
    onRegenerate: () => void;
    showLabel: boolean;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ era, onRegenerate, showLabel = true }) => {
    const containerClass = 'pb-4 bg-black/50 border border-white/10 rounded-xl shadow-md';
    const errorContainerClass = 'rounded-t-xl bg-gray-900 border-2 border-dashed border-red-500/50 aspect-[3/4]';
    const textClass = 'text-center mt-3 text-lg font-semibold text-gray-300 px-3';

    return (
        <div className={`relative transition-all duration-500 ease-in-out group ${containerClass}`}>
            <div className={`flex flex-col items-center justify-center text-center p-4 ${errorContainerClass}`} >
                <p className="text-red-400 font-medium mb-4">Generation failed</p>
                {onRegenerate && (
                    <Button onClick={onRegenerate} primary>
                        Retry
                    </Button>
                )}
            </div>
            {showLabel && <p className={textClass}>{era}</p>}
        </div>
    );
};