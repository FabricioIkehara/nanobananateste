
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconOptions } from './Icons';

interface PhotoDisplayProps {
    era: string;
    imageUrl: string;
    onDownload: (imageUrl: string, era: string, ratio: string) => void;
    onRegenerate: () => void;
    showLabel: boolean;
}

export const PhotoDisplay: React.FC<PhotoDisplayProps> = ({ era, imageUrl, onDownload, onRegenerate, showLabel = true }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const containerClass = 'relative group pb-4 bg-black/50 border border-white/10 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-amber-400/50';
    const imageContainerClass = 'rounded-t-xl overflow-hidden';
    const textClass = 'text-center mt-3 text-lg font-semibold text-gray-200 px-3';

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={containerClass} >
            <div className={imageContainerClass}>
                <img src={imageUrl} alt={`You in ${era}`} className={'w-full h-auto'} />
            </div>
            {showLabel && <p className={textClass}>{era}</p>}

            <div className="absolute top-3 right-3 z-10" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm shadow-lg" aria-label="Options" >
                    <IconOptions />
                </button>

                {isMenuOpen && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.1 }} className="absolute right-0 top-12 mt-2 w-48 origin-top-right bg-black/80 backdrop-blur-md rounded-lg shadow-2xl ring-1 ring-white/10 text-white text-sm flex flex-col p-1" >
                        <span className="w-full text-left px-3 pt-2 pb-1 text-xs text-gray-500 uppercase tracking-wider">Actions</span>
                        <button onClick={() => { onRegenerate(); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-amber-400/20 rounded-md transition-colors">Regenerate</button>
                        
                        <div className="my-1 h-px bg-white/10"></div>
                        
                        <span className="w-full text-left px-3 pt-1 pb-1 text-xs text-gray-500 uppercase tracking-wider">Download</span>
                        <button onClick={() => { onDownload(imageUrl, era, '1:1'); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-amber-400/20 rounded-md transition-colors">Square (1:1)</button>
                        <button onClick={() => { onDownload(imageUrl, era, '9:16'); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-amber-400/20 rounded-md transition-colors">Portrait (9:16)</button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};