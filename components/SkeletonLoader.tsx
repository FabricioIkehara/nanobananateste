
import React from 'react';

interface SkeletonLoaderProps {
    className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className }) => (
    <div className={`animate-pulse bg-gray-800 ${className}`}></div>
);
