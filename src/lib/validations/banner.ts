import { z } from 'zod';

export const bannerSectionSchema = z.enum(
    ['home', 'traditional', 'minimalist', 'cabin', 'deliveries', 'contact'],
    { error: 'Sección inválida' }
);

export const bannerSaveSchema = z.object({
    section: bannerSectionSchema,
});

export type BannerSection = z.infer<typeof bannerSectionSchema>;
export type BannerSaveValues = z.infer<typeof bannerSaveSchema>;
