
import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    primary?: boolean;
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, disabled, primary = false, className = '' }) => {
    const baseClass = "px-6 py-2 rounded-md font-semibold tracking-wider uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
    const themeClass = primary 
        ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold hover:opacity-90 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
        : "bg-transparent border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white";
    
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClass} ${themeClass} ${className}`}
        >
            {children}
        </button>
    );
};