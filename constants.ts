
import type { Template, TemplateOptions } from './types';

export const DEFAULT_TEMPLATE_OPTIONS: TemplateOptions = {
    headshotExpression: 'Friendly Smile',
    headshotPose: 'Forward',
    lookbookStyle: '',
    customLookbookStyle: '',
    hairColors: [],
    selectedHairStyles: [],
    customHairStyle: '',
    isCustomHairActive: false,
};

export const TEMPLATES: { [key: string]: Template } = {
    decades: {
        name: 'Time Traveler',
        description: 'See yourself through the decades.',
        icon: '⏳',
        isPolaroid: false,
        prompts: [
            { id: '1950s', base: 'A 1950s style portrait.' },
            { id: '1960s', base: 'A 1960s style portrait.' },
            { id: '1970s', base: 'A 1970s style portrait.' },
            { id: '1980s', base: 'An 1980s style portrait.' },
            { id: '1990s', base: 'A 1990s style portrait.' },
            { id: '2000s', base: 'A 2000s style portrait.' },
        ]
    },
    styleLookbook: {
        name: "Style Lookbook",
        description: "Your personal fashion photoshoot.",
        icon: '👗',
        isPolaroid: false,
        styles: [
            'Classic / Casual', 'Streetwear', 'Vintage', 'Goth', 'Preppy', 'Minimalist', 
            'Athleisure', 'Old Money / Quiet Luxury', 'Bohemian (Boho)', 'Business Casual', 
            '90s Grunge', 'Cocktail / Formal'
        ],
        prompts: [
            { id: 'Look 1', base: 'a full-body shot, standing' },
            { id: 'Look 2', base: 'a half-body shot, smiling' },
            { id: 'Look 3', base: 'a candid walking shot' },
            { id: 'Look 4', base: 'a shot showing off outfit details' },
            { id: 'Look 5', base: 'a seated pose' },
            { id: 'Look 6', base: 'a close-up shot focusing on accessories' },
        ]
    },
    eightiesMall: {
        name: "'80s Mall Shoot",
        description: "Totally tubular 1980s portraits.",
        icon: '📼',
        isPolaroid: false,
        prompts: [
            { id: 'Smiling', base: 'a friendly, smiling pose' },
            { id: 'Thoughtful', base: 'a thoughtful, looking away from the camera pose' },
            { id: 'Fun', base: 'a fun, laughing pose' },
            { id: 'Serious', base: 'a serious, dramatic pose' },
            { id: 'Hand on Chin', base: 'posing with their hand on their chin' },
            { id: 'Over the Shoulder', base: 'looking back over their shoulder' },
        ]
    },
    figurines: {
        name: 'Miniature Me',
        description: 'Your own collectible figurines.',
        icon: '🧍‍♂️',
        isPolaroid: false,
        prompts: [
            { id: 'Bobblehead', base: 'A realistic bobblehead figure of the person with an oversized head, displayed on a polished wooden desk next to a computer keyboard.' },
            { id: 'Porcelain Figurine', base: 'A delicate souvenir porcelain figurine of the person, painted with glossy colors, sitting on a lace doily on a vintage dresser.' },
            { id: 'Retro Action Figure', base: 'A retro 1980s-style action figure of the person, complete with articulated joints and slightly worn paint, posed in a dynamic stance on a rocky diorama base.' },
            { id: 'Vinyl Figure', base: 'A stylized collectible vinyl art toy of the person with minimalist features, standing on a shelf filled with other similar toys.' },
            { id: 'Plushy Figure', base: 'A soft, cute plushy figure of the person with detailed fabric texture and stitching, sitting on a neatly made bed.' },
            { id: 'Wooden Folk Art', base: 'A hand-carved wooden folk art figure of the person, painted with rustic, charming details, standing on a simple wooden block on a craft fair table.' },
        ]
    },
    hairStyler: {
        name: 'Hair Styler',
        description: 'Try on new hairstyles and colors.',
        icon: '💇‍♀️',
        isPolaroid: false,
        prompts: [
            { id: 'Short', base: 'a short hairstyle' },
            { id: 'Medium', base: 'a medium-length hairstyle' },
            { id: 'Long', base: 'a long hairstyle' },
            { id: 'Straight', base: 'straight hair' },
            { id: 'Wavy', base: 'wavy hair' },
            { id: 'Curly', base: 'curly hair' },
        ]
    },
    impossibleSelfies: {
        name: 'Impossible Pics',
        description: 'Photos that defy reality.',
        icon: '🚀',
        isPolaroid: false,
        prompts: [
            { id: 'With Lincoln', base: 'The person posing with Abraham Lincoln, who is also making a peace sign and sticking his tongue out. Keep the original location.' },
            { id: 'Alien & Bubbles', base: 'The person posing next to a realistic alien holding two bubble guns, blowing thousands of bubbles. Keep the person\'s pose and the original location.' },
            { id: 'Room of Puppies', base: 'The person posing in a room filled with a hundred different puppies.' },
            { id: 'Singing Puppets', base: 'The person posing in a room full of large, whimsical, brightly colored felt puppets that are singing.' },
            { id: 'Giant Chicken Tender', base: 'The person posing with their arm around a 4-foot-tall chicken tender. Keep the person\'s facial expression exactly the same.' },
            { id: 'Yeti Photobomb', base: 'Add a realistic yeti standing next to the person on the left side of the photo, matching the lighting. Keep the person\'s pose and face exactly the same.' },
        ]
    },
    headshots: {
        name: "Pro Headshots",
        description: "Professional profile pictures.",
        icon: '💼',
        isPolaroid: false,
        prompts: [
            { id: 'Business Suit', base: 'wearing a dark business suit with a crisp white shirt' },
            { id: 'Smart Casual', base: 'wearing a smart-casual knit sweater over a collared shirt' },
            { id: 'Creative Pro', base: 'wearing a dark turtleneck' },
            { id: 'Corporate Look', base: 'wearing a light blue button-down shirt' },
            { id: 'Bright & Modern', base: 'wearing a colorful blazer' },
            { id: 'Relaxed', base: 'wearing a simple, high-quality t-shirt under a casual jacket' },
        ]
    },
};