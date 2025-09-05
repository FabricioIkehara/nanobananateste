
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { IconDownload } from './Icons';

interface AlbumDownloadButtonProps {
    onDownload: (ratio: string) => void;
    isDownloading: boolean;
}

export const AlbumDownloadButton: React.FC<AlbumDownloadButtonProps> = ({ onDownload, isDownloading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);
    
    return (
         <div className="relative" ref={menuRef}>
            <Button primary disabled={isDownloading} onClick={() => setIsOpen(!isOpen)}>
                {isDownloading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                        <span>Preparing...</span>
                    </div>
                ) : (
                     <div className="flex items-center gap-2">
                        <IconDownload />
                        <span>Download Album</span>
                    </div>
                )}
            </Button>
            {isOpen && !isDownloading && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.1 }}
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-20"
                >
                   <div className="bg-black/80 backdrop-blur-lg rounded-xl text-white text-sm flex flex-col items-start p-1 shadow-2xl w-48 border border-gray-700">
                       <button onClick={() => { onDownload('1:1'); setIsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-amber-400/20 rounded-lg transition-colors">Square (1:1)</button>
                       <button onClick={() => { onDownload('9:16'); setIsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-amber-400/20 rounded-lg transition-colors">Portrait (9:16)</button>
                   </div>
                </motion.div>
            )}
        </div>
    );
};