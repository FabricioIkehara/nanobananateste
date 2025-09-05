
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

import { useFirebase } from './hooks/useFirebase';
import { generateImage, generateDynamicPrompt } from './services/geminiService';
import { createSingleFramedImage, cropImage, toBase64 } from './utils/imageUtils';
import { getModelInstruction } from './utils/promptHelper';
import { TEMPLATES, DEFAULT_TEMPLATE_OPTIONS } from './constants';
import type { GeneratedImage, TemplateOptions } from './types';

import { TemplateCard } from './components/TemplateCard';
import { PhotoDisplay } from './components/PhotoDisplay';
import { LoadingCard } from './components/LoadingCard';
import { ErrorCard } from './components/ErrorCard';
import { Button } from './components/Button';
import { ErrorNotification } from './components/ErrorNotification';
import { CameraModal } from './components/CameraModal';
import { ProjectsModal } from './components/ProjectsModal';
import { RadioPill } from './components/RadioPill';
import { AlbumDownloadButton } from './components/AlbumDownloadButton';
import { SaveButton } from './components/SaveButton';
import { IconCamera, IconFolder, IconPlus, IconSparkles, IconUpload, IconX } from './components/Icons';


const App: React.FC = () => {
    // Core state
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [isDownloadingAlbum, setIsDownloadingAlbum] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Template state
    const [template, setTemplate] = useState<string | null>(null);
    const [currentAlbumStyle, setCurrentAlbumStyle] = useState('');
    const [templateOptions, setTemplateOptions] = useState<TemplateOptions>(DEFAULT_TEMPLATE_OPTIONS);

    // Firebase hook
    const { 
        projects, 
        loadProject, 
        deleteProject, 
        saveProject, 
        isAuthReady, 
        saveStatus,
        currentProjectId,
        setCurrentProjectId
    } = useFirebase({
        uploadedImage,
        template,
        generatedImages,
        templateOptions,
        currentAlbumStyle
    });
    
    const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);

    useEffect(() => {
        if (loadProject) {
            const handleLoad = (projectToLoad: any) => {
                setUploadedImage(projectToLoad.uploadedImage);
                setGeneratedImages(projectToLoad.generatedImages || []);
                setTemplate(projectToLoad.template);
                setCurrentProjectId(projectToLoad.id);
                setTemplateOptions(projectToLoad.templateOptions || DEFAULT_TEMPLATE_OPTIONS);
                setCurrentAlbumStyle(projectToLoad.currentAlbumStyle || '');
                setError(null);
            };
            loadProject.current.handler = handleLoad;
        }
    }, [loadProject, setCurrentProjectId]);


    const handleTemplateOptionsChange = (newOptions: Partial<TemplateOptions>) => {
        setTemplateOptions(prev => ({ ...prev, ...newOptions }));
    };

    const handleColorChange = (index: number, newColor: string) => {
        const newColors = [...templateOptions.hairColors];
        newColors[index] = newColor;
        handleTemplateOptionsChange({ hairColors: newColors });
    };

    const addHairColor = () => {
        if (templateOptions.hairColors.length < 2) {
            const newColors = [...templateOptions.hairColors, '#4a2c20']; // Start with a common hair color
            handleTemplateOptionsChange({ hairColors: newColors });
        }
    };

    const removeHairColor = (index: number) => {
        const newColors = templateOptions.hairColors.filter((_, i) => i !== index);
        handleTemplateOptionsChange({ hairColors: newColors });
    };

    const handleHairStyleSelect = (styleId: string) => {
        const { isCustomHairActive, selectedHairStyles } = templateOptions;
        if (styleId === 'Other') {
            const isActivating = !isCustomHairActive;
            if (isActivating && selectedHairStyles.length >= 6) {
                setError("You can select a maximum of 6 styles.");
                return;
            }
            handleTemplateOptionsChange({
                isCustomHairActive: isActivating,
                customHairStyle: isActivating ? templateOptions.customHairStyle : ''
            });
            return;
        }

        const isSelected = selectedHairStyles.includes(styleId);
        const totalSelected = selectedHairStyles.length + (isCustomHairActive ? 1 : 0);

        if (isSelected) {
            handleTemplateOptionsChange({ selectedHairStyles: selectedHairStyles.filter(s => s !== styleId) });
        } else if (totalSelected < 6) {
            handleTemplateOptionsChange({ selectedHairStyles: [...selectedHairStyles, styleId] });
        } else {
            setError("You can select a maximum of 6 styles.");
        }
    };
    
    const regenerateImageAtIndex = useCallback(async (imageIndex: number) => {
        const imageToRegenerate = generatedImages[imageIndex];
        if (!imageToRegenerate || !template || !uploadedImage) return;

        setGeneratedImages(prev => prev.map((img, index) =>
            index === imageIndex ? { ...img, status: 'pending' } : img
        ));
        setError(null);

        const activeTemplate = TEMPLATES[template];
        const promptsForGeneration = activeTemplate.prompts;
        const prompt = promptsForGeneration[imageIndex];

        if (!prompt) {
            setError("Could not find the prompt to regenerate.");
            setGeneratedImages(prev => prev.map((img, index) => index === imageIndex ? { ...img, status: 'failed' } : img));
            return;
        }

        try {
            const modelInstruction = getModelInstruction(template, prompt, {
                ...templateOptions,
                currentAlbumStyle,
            });
            
            const imageUrl = await generateImage(uploadedImage, modelInstruction);

            setGeneratedImages(prev => prev.map((img, index) =>
                index === imageIndex ? { ...img, status: 'success', imageUrl } : img
            ));

        } catch (err) {
            console.error(`Regeneration failed for ${prompt.id}:`, err);
            setError(`Oops! Regeneration for "${prompt.id}" failed. Please try again.`);
            setGeneratedImages(prev => prev.map((img, index) =>
                index === imageIndex ? { ...img, status: 'failed' } : img
            ));
        }
    }, [generatedImages, template, uploadedImage, templateOptions, currentAlbumStyle]);
    
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploading(true);
            setError(null);
            try {
                const base64Image = await toBase64(file);
                setUploadedImage(base64Image as string);
                setGeneratedImages([]); 
            } catch (err) {
                console.error("Error during image upload:", err);
                setError("That image couldn't be processed. Please try another file.");
            } finally {
                setIsUploading(false);
            }
        }
    };
    
    const handleCaptureConfirm = (imageDataUrl: string) => {
        setUploadedImage(imageDataUrl);
        setGeneratedImages([]);
        setError(null);
    };

    const handleGenerateClick = async () => {
        if (!uploadedImage) {
            setError("Please upload a photo to get started!");
            return;
        }

        if (!template) {
            setError("Please select a theme!");
            return;
        }
        
        const validationError = validateTemplateOptions();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        let dynamicStyleForAlbum = '';
        if (template === 'eightiesMall') {
            setIsSettingUp(true);
            try {
                dynamicStyleForAlbum = await generateDynamicPrompt("A specific, creative, and detailed style for an 80s mall portrait studio photoshoot.");
                setCurrentAlbumStyle(dynamicStyleForAlbum);
            } catch(e) {
                setError("We couldn't generate a photoshoot style. Please try again.");
                setIsLoading(false);
                setIsSettingUp(false);
                return;
            }
            setIsSettingUp(false);
        } else {
            setCurrentAlbumStyle(''); 
        }

        let promptsForGeneration = getPromptsForGeneration();

        if (!promptsForGeneration || promptsForGeneration.length === 0) {
            setError("There was an issue preparing the creative ideas. Please try again.");
            setIsLoading(false);
            return;
        }

        setGeneratedImages(promptsForGeneration.map(p => ({
            id: p.id,
            status: 'pending',
            imageUrl: null,
        })));

        for (let i = 0; i < promptsForGeneration.length; i++) {
            const p = promptsForGeneration[i];
            try {
                const modelInstruction = getModelInstruction(template, p, {
                    ...templateOptions,
                    currentAlbumStyle: dynamicStyleForAlbum,
                });
                
                const imageUrl = await generateImage(uploadedImage, modelInstruction);

                setGeneratedImages(prev => prev.map((img, index) => 
                    index === i ? { ...img, status: 'success', imageUrl } : img
                ));

            } catch (err) {
                console.error(`Failed to generate image for ${p.id}:`, err);
                setGeneratedImages(prev => prev.map((img, index) =>
                    index === i ? { ...img, status: 'failed' } : img
                ));
            }
        }

        setIsLoading(false);
    };

    const validateTemplateOptions = () => {
        if (template === 'styleLookbook' && (templateOptions.lookbookStyle === '' || (templateOptions.lookbookStyle === 'Other' && templateOptions.customLookbookStyle.trim() === ''))) {
            return "Please choose or enter a fashion style for your lookbook!";
        }
        if (template === 'hairStyler' && templateOptions.selectedHairStyles.length === 0 && (!templateOptions.isCustomHairActive || templateOptions.customHairStyle.trim() === '')) {
            return "Please select at least one hairstyle to generate!";
        }
        if (template === 'hairStyler' && templateOptions.isCustomHairActive && templateOptions.customHairStyle.trim() === '') {
            return "Please enter your custom hairstyle or deselect 'Other...'";
        }
        return null;
    }

    const getPromptsForGeneration = () => {
        if (!template) return [];
        const activeTemplate = TEMPLATES[template];

        if (template === 'hairStyler') {
            const selectedPrompts = activeTemplate.prompts.filter(p => templateOptions.selectedHairStyles.includes(p.id));
            if (templateOptions.isCustomHairActive && templateOptions.customHairStyle.trim() !== '') {
                selectedPrompts.push({ id: templateOptions.customHairStyle, base: templateOptions.customHairStyle });
            }
            return selectedPrompts;
        }
        return activeTemplate.prompts;
    }

    const triggerDownload = async (href: string, fileName: string) => {
        try {
            const response = await fetch(href);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (error) {
            console.error("Could not download the image:", error);
            setError("Sorry, the download failed. Please try again.");
        }
    };

    const handleDownloadRequest = async (imageUrl: string, era: string, ratio: string) => {
        const fileName = `picture-me-${era.toLowerCase().replace(/\s+/g, '-')}-${ratio.replace(':', 'x')}.png`;
        try {
            const shouldAddLabel = !['headshots', 'eightiesMall', 'styleLookbook', 'figurines'].includes(template || '');
            const framedImageUrl = await createSingleFramedImage(imageUrl, ratio, shouldAddLabel ? era : null);
            await triggerDownload(framedImageUrl, fileName);
        } catch (err) {
            console.error(`Failed to create framed image for download:`, err);
            setError(`Could not prepare that image for download. Please try again.`);
        }
    };


    const handleAlbumDownloadRequest = async (ratio: string) => {
        if (isDownloadingAlbum || !template) return;
        setIsDownloadingAlbum(true);
        setError(null);

        try {
            const successfulImages = generatedImages.filter(img => img.status === 'success');
            if (successfulImages.length === 0) {
                setError("There are no successful images to include in an album.");
                setIsDownloadingAlbum(false);
                return;
            }
            let albumTitle = "My PictureMe Album";
            const currentTemplateInfo = TEMPLATES[template];
            if (currentTemplateInfo) {
                albumTitle = `PictureMe: ${currentTemplateInfo.name}`;
            }

            const shouldAddLabel = !['headshots', 'eightiesMall', 'styleLookbook', 'figurines'].includes(template);

            const croppedImageUrls = await Promise.all(
                successfulImages.map(img => cropImage(img.imageUrl!, ratio))
            );

            const imagesToStitch = await Promise.all(
                croppedImageUrls.map((url, index) => new Promise<HTMLImageElement>((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.src = url;
                    img.onload = () => {
                        if (shouldAddLabel) {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d')!;
                            const bottomPadding = img.width * 0.14;
                            canvas.width = img.width;
                            canvas.height = img.height + bottomPadding;
                            
                            ctx.drawImage(img, 0, 0);

                            const labelFontSize = Math.max(24, Math.floor(img.width * 0.08));
                            ctx.font = `800 ${labelFontSize}px Poppins, sans-serif`;
                            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(successfulImages[index].id, canvas.width / 2, img.height + bottomPadding / 2);

                            const finalImage = new Image();
                            finalImage.crossOrigin = "anonymous";
                            finalImage.src = canvas.toDataURL('image/png');
                            finalImage.onload = () => resolve(finalImage);
                            finalImage.onerror = () => reject(new Error('Failed to load final canvas image'));
                        } else {
                            resolve(img);
                        }
                    };
                    img.onerror = () => reject(new Error('Failed to load cropped image'));
                }))
            );

            if (imagesToStitch.length === 0) throw new Error("No images to create an album.");
            
            const stitchCanvas = document.createElement('canvas');
            const stitchCtx = stitchCanvas.getContext('2d')!;
            const cols = imagesToStitch.length > 4 ? 3 : 2;
            const rows = Math.ceil(imagesToStitch.length / cols);
            const imageWidth = imagesToStitch[0].width;
            const imageHeight = imagesToStitch[0].height;
            const padding = Math.floor(imageWidth * 0.05);

            stitchCanvas.width = (cols * imageWidth) + ((cols + 1) * padding);
            stitchCanvas.height = (rows * imageHeight) + ((rows + 1) * padding);
            stitchCtx.fillStyle = '#FFFFFF';
            stitchCtx.fillRect(0, 0, stitchCanvas.width, stitchCanvas.height);

            imagesToStitch.forEach((img, index) => {
                const row = Math.floor(index / cols);
                const col = index % cols;
                stitchCtx.drawImage(img, padding + col * (imageWidth + padding), padding + row * (imageHeight + padding), imageWidth, imageHeight);
            });
            
            const finalCanvas = document.createElement('canvas');
            const finalCtx = finalCanvas.getContext('2d')!;
            const outerPadding = stitchCanvas.width * 0.05;
            const titleFontSize = Math.max(48, Math.floor(stitchCanvas.width * 0.07));
            const footerFontSize = Math.max(24, Math.floor(stitchCanvas.width * 0.025));
            const titleSpacing = titleFontSize * 1.5;
            const footerSpacing = footerFontSize * 4.0;

            finalCanvas.width = stitchCanvas.width + outerPadding * 2;
            finalCanvas.height = stitchCanvas.height + outerPadding * 2 + titleSpacing + footerSpacing;
            finalCtx.fillStyle = '#111827';
            finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            finalCtx.font = `800 ${titleFontSize}px Poppins, sans-serif`;
            finalCtx.fillStyle = "rgba(255, 255, 255, 0.9)";
            finalCtx.textAlign = 'center';
            finalCtx.textBaseline = 'middle';
            finalCtx.fillText(albumTitle, finalCanvas.width / 2, outerPadding + titleSpacing / 2);
            finalCtx.drawImage(stitchCanvas, outerPadding, outerPadding + titleSpacing);
            finalCtx.font = `600 ${footerFontSize}px Poppins, sans-serif`;
            finalCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
            finalCtx.textAlign = 'center';
            finalCtx.textBaseline = 'middle';
            finalCtx.fillText("Made with Gemini", finalCanvas.width / 2, finalCanvas.height - footerSpacing * 0.66);

            const nanoFooterFontSize = Math.max(18, Math.floor(stitchCanvas.width * 0.022));
            finalCtx.font = `600 ${nanoFooterFontSize}px Poppins, sans-serif`;
            finalCtx.fillText("Edit your images with Nano Banana at gemini.google", finalCanvas.width / 2, finalCanvas.height - footerSpacing * 0.33);

            await triggerDownload(finalCanvas.toDataURL('image/png'), `picture-me-album-${ratio.replace(':', 'x')}.png`);
        } catch (err) {
            console.error("Failed to create or download album:", err);
            setError("Sorry, the album download failed. Please try again.");
        } finally {
            setIsDownloadingAlbum(false);
        }
    };
    
    const handleTemplateSelect = (templateId: string) => {
        if (templateId === template) return;
        setTemplate(templateId);
        setTemplateOptions(DEFAULT_TEMPLATE_OPTIONS);
    };

    const handleStartOver = () => {
        setGeneratedImages([]);
        setUploadedImage(null);
        setError(null);
        setTemplate(null);
        setCurrentProjectId(null);
        setTemplateOptions(DEFAULT_TEMPLATE_OPTIONS);
        setCurrentAlbumStyle('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const progress = generatedImages.length > 0
        ? (generatedImages.filter(img => img.status !== 'pending').length / generatedImages.length) * 100
        : 0;

    const totalSelectedStyles = templateOptions.selectedHairStyles.length + (templateOptions.isCustomHairActive ? 1 : 0);
    
    return (
        <>
            <style>{`
              body { 
                font-family: 'Poppins', sans-serif; 
                color: #EAEAEA;
                background-color: #000000;
                background-image: radial-gradient(ellipse at bottom, hsl(45, 76%, 15%), #000000);
                background-attachment: fixed;
                min-height: 100vh;
              }
              @keyframes fade-in-down {
                0% { opacity: 0; transform: translateY(-20px) translateX(-50%); }
                100% { opacity: 1; transform: translateY(0) translateX(-50%); }
              }
              .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
               .styled-scrollbar::-webkit-scrollbar { width: 8px; }
               .styled-scrollbar::-webkit-scrollbar-track { background: #1f2937; border-radius: 10px; }
               .styled-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; }
               .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: #fbbf24; }
            `}</style>
            
            <CameraModal
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onCapture={handleCaptureConfirm}
            />

            <ProjectsModal 
                isOpen={isProjectsModalOpen}
                onClose={() => setIsProjectsModalOpen(false)}
                projects={projects}
                onLoad={(project) => loadProject.current.handler?.(project)}
                onDelete={deleteProject}
            />

            <div className="text-gray-200 min-h-screen flex flex-col items-center p-4 pb-20">
                 <ErrorNotification message={error} onDismiss={() => setError(null)} />
                
                <div className="w-full max-w-6xl mx-auto">
                    
                    <header className="text-center my-12 relative">
                        <h1 className="text-6xl md:text-7xl font-extrabold text-white tracking-tight">
                            Picture<span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-amber-500">Me</span>
                        </h1>
                        <p className="mt-4 text-lg text-gray-400">Transform your photos with the power of Gemini.</p>
                        <div className="absolute top-0 right-0 flex items-center gap-3">
                           <SaveButton status={saveStatus} onSave={saveProject} disabled={!uploadedImage || saveStatus === 'saving' || !isAuthReady} hasProject={!!currentProjectId} />
                           <button onClick={() => setIsProjectsModalOpen(true)} disabled={!isAuthReady} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-gray-800 hover:bg-gray-700 text-white transition-colors disabled:opacity-50">
                                <IconFolder />
                                <span>My Projects</span>
                           </button>
                        </div>
                    </header>

                    <main>
                        <div className="bg-black/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/10 mb-16">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                                <div>
                                    <h2 className="text-2xl font-semibold mb-6 text-white">1. Your Photo</h2>
                                    <div 
                                        className="w-full aspect-square border-4 border-dashed border-gray-800 rounded-xl flex items-center justify-center cursor-pointer hover:border-amber-400 transition-colors bg-black/30 overflow-hidden shadow-inner"
                                        onClick={() => !uploadedImage && fileInputRef.current?.click()}
                                    >
                                        {isUploading ? (
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-400"></div>
                                                <p className="text-gray-400 mt-4">Uploading...</p>
                                            </div>
                                        ) : uploadedImage ? (
                                            <img src={uploadedImage} alt="Uploaded preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
                                                <IconUpload />
                                                <p className="mt-4 text-lg text-gray-300">Click to upload a file</p>
                                                <p className="mt-4 text-sm">or</p>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsCameraOpen(true);
                                                    }}
                                                    className="mt-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <IconCamera />
                                                        <span>Use Camera</span>
                                                    </div>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    {uploadedImage && !isUploading && (
                                        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
                                            <Button onClick={() => fileInputRef.current?.click()} className="flex-1">
                                                Change File
                                            </Button>
                                            <Button onClick={() => setIsCameraOpen(true)} className="flex-1">
                                                <div className="flex items-center justify-center gap-2">
                                                    <IconCamera />
                                                    <span>Use Camera</span>
                                                </div>
                                            </Button>
                                        </div>
                                    )}
                                     <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg" className="hidden" />
                                </div>

                                <div>
                                     <h2 className="text-2xl font-semibold mb-6 text-white">2. Choose a Theme</h2>
                                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                                        {Object.entries(TEMPLATES).map(([key, data]) => (
                                            <TemplateCard
                                                key={key}
                                                id={key}
                                                name={data.name}
                                                icon={data.icon}
                                                description={data.description}
                                                isSelected={template === key}
                                                onSelect={handleTemplateSelect}
                                            />
                                        ))}
                                     </div>
                                     
                                     {template === 'hairStyler' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            transition={{ duration: 0.3 }}
                                            className="p-6 border border-white/10 rounded-xl space-y-6 bg-black/30"
                                        >
                                            <div className="flex justify-between items-center">
                                                <h3 className='text-xl font-semibold text-white'>Customize Hairstyle</h3>
                                                 <span className={`text-sm font-bold ${totalSelectedStyles >= 6 ? 'text-amber-400' : 'text-gray-500'}`}>{totalSelectedStyles} / 6</span>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-3">Style (select up to 6)</label>
                                                <div className="flex flex-wrap gap-3">
                                                    {TEMPLATES.hairStyler.prompts.map(prompt => (
                                                        <button
                                                            key={prompt.id}
                                                            onClick={() => handleHairStyleSelect(prompt.id)}
                                                            className={`cursor-pointer px-3 py-1.5 text-sm rounded-full transition-colors font-semibold 
                                                                ${templateOptions.selectedHairStyles.includes(prompt.id) ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                                                        >
                                                            {prompt.id}
                                                        </button>
                                                    ))}
                                                    <button
                                                        onClick={() => handleHairStyleSelect('Other')}
                                                        className={`cursor-pointer px-3 py-1.5 text-sm rounded-full transition-colors font-semibold 
                                                            ${templateOptions.isCustomHairActive ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                                                    >
                                                        Other...
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {templateOptions.isCustomHairActive && (
                                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} >
                                                    <label className="block text-sm font-medium text-gray-400 mb-2">Your Custom Style</label>
                                                    <input type="text" placeholder="e.g., A vibrant pink mohawk" value={templateOptions.customHairStyle} onChange={(e) => handleTemplateOptionsChange({ customHairStyle: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white" />
                                                </motion.div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-3">Hair Color</label>
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    {templateOptions.hairColors.map((color, index) => (
                                                        <motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 p-2 bg-gray-800/80 rounded-lg border border-gray-700" >
                                                            <div className="relative w-10 h-10 rounded-md overflow-hidden" style={{ backgroundColor: color }}>
                                                                <input type="color" value={color} onChange={(e) => handleColorChange(index, e.target.value)} className="absolute inset-0 w-full h-full cursor-pointer opacity-0" />
                                                            </div>
                                                            <span className="font-mono text-sm text-gray-300 uppercase">{color}</span>
                                                            <button onClick={() => removeHairColor(index)} className="p-1 rounded-full text-gray-500 hover:bg-gray-600 hover:text-red-400 transition-colors" aria-label="Remove color" >
                                                                <IconX />
                                                            </button>
                                                        </motion.div>
                                                    ))}

                                                    {templateOptions.hairColors.length < 2 && (
                                                        <button onClick={addHairColor} className="flex items-center justify-center gap-2 h-[68px] px-4 rounded-lg border-2 border-dashed border-gray-700 hover:border-amber-400 text-gray-400 hover:text-amber-300 transition-colors bg-gray-800/50" >
                                                            <IconPlus />
                                                            <span>{templateOptions.hairColors.length === 0 ? 'Add Color' : 'Add Highlight'}</span>
                                                        </button>
                                                    )}
                                                </div>
                                                {templateOptions.hairColors.length > 0 && (
                                                     <button onClick={() => handleTemplateOptionsChange({hairColors: []})} className="text-xs text-gray-500 hover:text-white transition-colors mt-3">
                                                        Clear all colors
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                     )}

                                     {template === 'headshots' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} className="p-6 border border-white/10 rounded-xl space-y-6 bg-black/30" >
                                            <h3 className='text-xl font-semibold text-white'>Customize Headshot</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-3">Facial Expression</label>
                                                <div className="flex flex-wrap gap-3">
                                                    <RadioPill name="expression" value="Friendly Smile" label="Friendly Smile" checked={templateOptions.headshotExpression === 'Friendly Smile'} onChange={e => handleTemplateOptionsChange({ headshotExpression: e.target.value })} />
                                                    <RadioPill name="expression" value="Confident Look" label="Confident Look" checked={templateOptions.headshotExpression === 'Confident Look'} onChange={e => handleTemplateOptionsChange({ headshotExpression: e.target.value })} />
                                                    <RadioPill name="expression" value="Thoughtful Gaze" label="Thoughtful Gaze" checked={templateOptions.headshotExpression === 'Thoughtful Gaze'} onChange={e => handleTemplateOptionsChange({ headshotExpression: e.target.value })} />
                                                </div>
                                            </div>
                                             <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-3">Pose</label>
                                                 <div className="flex flex-wrap gap-3">
                                                    <RadioPill name="pose" value="Forward" label="Facing Forward" checked={templateOptions.headshotPose === 'Forward'} onChange={e => handleTemplateOptionsChange({ headshotPose: e.target.value })} />
                                                    <RadioPill name="pose" value="Angle" label="Slight Angle" checked={templateOptions.headshotPose === 'Angle'} onChange={e => handleTemplateOptionsChange({ headshotPose: e.target.value })} />
                                                </div>
                                            </div>
                                         </motion.div>
                                     )}

                                     {template === 'styleLookbook' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} className="p-6 border border-white/10 rounded-xl space-y-6 bg-black/30" >
                                            <h3 className='text-xl font-semibold text-white'>Choose a Fashion Style</h3>
                                            <div>
                                                <div className="flex flex-wrap gap-3">
                                                    {TEMPLATES.styleLookbook.styles.map(style => (
                                                        <RadioPill key={style} name="style" value={style} label={style} checked={templateOptions.lookbookStyle === style} onChange={e => { handleTemplateOptionsChange({ lookbookStyle: e.target.value, customLookbookStyle: '' }); }} />
                                                    ))}
                                                    <RadioPill name="style" value="Other" label="Other..." checked={templateOptions.lookbookStyle === 'Other'} onChange={e => handleTemplateOptionsChange({ lookbookStyle: e.target.value })} />
                                                </div>
                                            </div>
                                            {templateOptions.lookbookStyle === 'Other' && (
                                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} >
                                                    <label className="block text-sm font-medium text-gray-400 mb-2">Your Custom Style</label>
                                                    <input type="text" placeholder="e.g., Cyberpunk, Avant-garde" value={templateOptions.customLookbookStyle} onChange={(e) => handleTemplateOptionsChange({ customLookbookStyle: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white" />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                     )}
                                </div>
                            </div>

                            <div className="mt-12 text-center">
                                 <Button onClick={handleGenerateClick} disabled={!uploadedImage || !template || isLoading || isUploading || isSettingUp} primary className="text-lg px-12 py-4" >
                                    <div className="flex items-center gap-3">
                                        {isLoading || isSettingUp ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                                                {isSettingUp ? "Setting the stage..." : `Generating... (${Math.round(progress)}%)`}
                                            </>
                                        ) : (
                                            <>
                                                <IconSparkles />
                                                Generate Photos
                                            </>
                                        )}
                                    </div>
                                 </Button>
                            </div>
                        </div>

                        <div ref={resultsRef}>
                            {isSettingUp && (
                                <div className="text-center my-20 flex flex-col items-center p-10 bg-black/70 rounded-2xl">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-400 mb-6"></div>
                                    <p className="text-2xl text-amber-300 font-semibold tracking-wider italic">Teasing our hair and firing up the lasers...</p>
                                    <p className="text-gray-400 mt-2">Generating a totally tubular '80s photoshoot style!</p>
                                </div>
                            )}
                            
                            {(isLoading || generatedImages.length > 0) && !isSettingUp && (
                                <div className="mt-16">
                                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Your Generated Photos</h2>

                                    {isLoading && (
                                        <div className="w-full max-w-4xl mx-auto mb-8 text-center">
                                            <div className="bg-gray-800 rounded-full h-3 overflow-hidden shadow-md">
                                                <motion.div className="bg-gradient-to-r from-yellow-400 to-amber-500 h-3 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                                            </div>
                                            <p className="text-gray-400 mt-4 text-sm">Please keep this window open while your photos are being generated.</p>
                                        </div>
                                    )}
                                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-8">
                                        {generatedImages.map((img, index) => {
                                            const showLabel = !['headshots', 'eightiesMall', 'styleLookbook', 'figurines'].includes(template || '');
                                            
                                            switch (img.status) {
                                                case 'success':
                                                    return <PhotoDisplay key={`${img.id}-${index}-success`} era={img.id} imageUrl={img.imageUrl!} onDownload={handleDownloadRequest} onRegenerate={() => regenerateImageAtIndex(index)} showLabel={showLabel} />;
                                                case 'failed':
                                                    return <ErrorCard key={`${img.id}-${index}-failed`} era={img.id} onRegenerate={() => regenerateImageAtIndex(index)} showLabel={showLabel} />;
                                                case 'pending':
                                                default:
                                                    return <LoadingCard key={`${img.id}-${index}-pending`} era={img.id} showLabel={showLabel} />;
                                            }
                                        })}
                                    </div>
                                    <p className="text-center text-xs text-gray-600 mt-8">Made with Gemini</p>
                                </div>
                            )}

                            {!isLoading && generatedImages.length > 0 && (
                                <div className="text-center mt-16 mb-12 flex justify-center gap-6">
                                    <Button onClick={handleStartOver}>Start Over</Button>
                                    <AlbumDownloadButton onDownload={handleAlbumDownloadRequest} isDownloading={isDownloadingAlbum} />
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default App;
