
export interface GeneratedImage {
  id: string;
  status: 'pending' | 'success' | 'failed';
  imageUrl: string | null;
}

export interface TemplatePrompt {
  id: string;
  base: string;
}

export interface Template {
  name: string;
  description: string;
  icon: string;
  isPolaroid: boolean;
  prompts: TemplatePrompt[];
  styles?: string[];
}

export interface TemplateOptions {
    headshotExpression: string;
    headshotPose: string;
    lookbookStyle: string;
    customLookbookStyle: string;
    hairColors: string[];
    selectedHairStyles: string[];
    customHairStyle: string;
    isCustomHairActive: boolean;
}

export interface Project {
  id: string;
  projectName: string;
  uploadedImage: string;
  template: string;
  generatedImages: GeneratedImage[];
  templateOptions: TemplateOptions;
  currentAlbumStyle: string;
  lastSaved?: { seconds: number; nanoseconds: number; };
}
