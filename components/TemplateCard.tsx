
import React from 'react';

interface TemplateCardProps {
    id: string;
    name: string;
    icon: string;
    description: string;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ id, name, icon, description, isSelected, onSelect }) => (
    <div
        onClick={() => onSelect(id)}
        className={`cursor-pointer p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 shadow-lg
        ${isSelected ? 'border-amber-400 bg-amber-900/20 ring-1 ring-amber-400' : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'}`}
    >
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
    </div>
);