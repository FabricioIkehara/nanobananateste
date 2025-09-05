
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { IconFolder, IconTrash, IconX } from './Icons';
import type { Project } from '../types';

interface ProjectsModalProps {
    isOpen: boolean;
    onClose: () => void;
    projects: Project[];
    onLoad: (project: Project) => void;
    onDelete: (projectId: string) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({ isOpen, onClose, projects, onLoad, onDelete }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="bg-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl w-full max-w-2xl text-white relative flex flex-col" style={{ maxHeight: '80vh' }} >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold">My Projects</h3>
                    <button onClick={onClose} className="p-2 rounded-full bg-gray-800/70 hover:bg-gray-700 transition-colors">
                        <IconX />
                    </button>
                </div>
                <div className="overflow-y-auto styled-scrollbar pr-2 flex-grow">
                    {projects && projects.length > 0 ? (
                        <ul className="space-y-3">
                            {projects.map(project => (
                                <li key={project.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <img src={project.uploadedImage} alt={project.projectName} className="w-16 h-16 object-cover rounded-md bg-gray-700" />
                                        <div>
                                            <p className="font-semibold">{project.projectName}</p>
                                            <p className="text-xs text-gray-400">Last saved: {project.lastSaved ? new Date(project.lastSaved.seconds * 1000).toLocaleString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button onClick={() => { onLoad(project); onClose(); }} primary>Load</Button>
                                        <button onClick={() => onDelete(project.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"><IconTrash /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-16 flex flex-col items-center">
                            <IconFolder />
                            <p className="mt-4 text-gray-500">You haven't saved any projects yet.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
