
import React from 'react';
import { SkeletonLoader } from './SkeletonLoader';

interface LoadingCardProps {
    era: string;
    showLabel: boolean;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ showLabel = true }) => {
    const containerClass = 'pb-4 bg-black/50 border border-white/10 rounded-xl shadow-md';
    const loaderClass = 'aspect-[3/4] rounded-t-xl';
    
    return (
        <div className={containerClass}>
            <SkeletonLoader className={loaderClass} />
            
            {showLabel && (
                 <div className="mt-3 flex justify-center">
                    <SkeletonLoader className="h-5 w-1/2 rounded-md" />
                </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-400"></div>
            </div>
        </div>
    );
};