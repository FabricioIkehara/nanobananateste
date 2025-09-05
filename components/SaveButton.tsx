
import React from 'react';
import { IconSave } from './Icons';

interface SaveButtonProps {
    status: string;
    onSave: () => void;
    disabled: boolean;
    hasProject: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ status, onSave, disabled, hasProject }) => {
    let content;
    switch (status) {
        case 'saving':
            content = <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Saving...</span>
            </>;
            break;
        case 'saved':
            content = <span>Saved!</span>;
            break;
        case 'error':
            content = <span>Error</span>;
            break;
        default:
            content = <>
                <IconSave />
                <span>{hasProject ? 'Save Project' : 'Save As...'}</span>
            </>;
    }
    return (
        <button onClick={onSave} disabled={disabled} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${status === 'saved' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}>
           {content}
        </button>
    );
};
