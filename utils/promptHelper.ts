
import type { TemplatePrompt, TemplateOptions } from '../types';

interface GetModelInstructionOptions extends TemplateOptions {
    currentAlbumStyle?: string;
}

export const getModelInstruction = (template: string, prompt: TemplatePrompt, options: GetModelInstructionOptions): string => {
    const {
        headshotExpression, headshotPose,
        currentAlbumStyle,
        hairColors,
        lookbookStyle, customLookbookStyle
    } = options;

    switch (template) {
        case 'decades':
            return `The highest priority is to maintain the exact facial features, likeness, perceived gender, framing, and composition of the person in the provided reference photo. Keeping the original photo's composition, change the person's hair, clothing, and accessories, as well as the photo's background, to match the style of the ${prompt.id}. Do not alter the person's core facial structure.`;
        case 'impossibleSelfies':
            return `The highest priority is to maintain the exact facial features, likeness, and perceived gender of the person in the provided reference photo. Keeping the original photo's composition as much as possible, place the person into the following scene, changing their clothing, hair, and the background to match: ${prompt.base}. Do not alter the person's core facial structure.`;
        case 'hairStyler': {
            let instruction = `The highest priority is to maintain the exact facial features, likeness, and perceived gender of the person in the provided reference photo. Keeping the original photo's composition, style the person's hair to be a perfect example of ${prompt.base}. If the person's hair already has this style, enhance and perfect it. Do not alter the person's core facial structure, clothing, or the background.`;

            if (['Short', 'Medium', 'Long'].includes(prompt.id)) {
                instruction += " Maintain the person's original hair texture (e.g., straight, wavy, curly).";
            }

            if (hairColors && hairColors.length > 0) {
                if (hairColors.length === 1) {
                    instruction += ` The hair color should be ${hairColors[0]}.`;
                } else if (hairColors.length === 2) {
                    instruction += ` The hair should be a mix of two colors: ${hairColors[0]} and ${hairColors[1]}.`;
                }
            }
            return instruction;
        }
        case 'headshots': {
            const poseInstruction = headshotPose === 'Forward' ? 'facing forward towards the camera' : 'posed at a slight angle to the camera';
            return `The highest priority is to maintain the exact facial features, likeness, and perceived gender of the person in the provided reference photo. Transform the image into a professional headshot. The person should be ${poseInstruction} with a "${headshotExpression}" expression. They should be ${prompt.base}. Please maintain the original hairstyle from the photo. The background should be a clean, neutral, out-of-focus studio background (like light gray, beige, or white). Do not alter the person's core facial structure. The final image should be a well-lit, high-quality professional portrait.`;
        }
        case 'eightiesMall':
            return `The highest priority is to maintain the exact facial features, likeness, and perceived gender of the person in the provided reference photo. Transform the image into a photo from a single 1980s mall photoshoot. The overall style for the entire photoshoot is: "${currentAlbumStyle}". For this specific photo, the person should be in ${prompt.base}. The person's hair and clothing should be 80s style and be consistent across all photos in this set. The background and lighting must also match the overall style for every photo.`;
        case 'styleLookbook': {
            const finalStyle = lookbookStyle === 'Other' ? customLookbookStyle : lookbookStyle;
            return `The highest priority is to maintain the exact facial features, likeness, and perceived gender of the person in the provided reference photo. Transform the image into a high-fashion lookbook photo. The overall fashion style for the entire lookbook is "${finalStyle}". For this specific photo, create a unique, stylish outfit that fits the overall style, and place the person in ${prompt.base} in a suitable, fashionable setting. The person's hair and makeup should also complement the style. Each photo in the lookbook should feature a different outfit. Do not alter the person's core facial structure.`;
        }
        case 'figurines':
            return `The highest priority is to maintain the exact facial features and likeness of the person in the provided reference photo. Transform the person into a miniature figurine based on the following description, placing it in a realistic environment: ${prompt.base}. The final image should look like a real photograph of a physical object. Do not alter the person's core facial structure.`;
        default:
            return `Create an image based on the reference photo and this prompt: ${prompt.base}`;
    }
};
