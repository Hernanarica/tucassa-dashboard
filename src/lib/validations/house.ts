import { z } from 'zod';

export const houseSchema = z.object({
    category_id: z.coerce
        .number({ error: 'Elegí una categoría' })
        .int('Elegí una categoría')
        .positive('Elegí una categoría'),
    title: z.string().trim().min(1, 'Ingresá el título'),
    price: z.coerce
        .number({ error: 'Ingresá el precio' })
        .min(0, 'El precio no puede ser negativo'),
    bedrooms: z.coerce
        .number({ error: 'Ingresá los dormitorios' })
        .int('Los dormitorios deben ser un número entero')
        .min(0, 'Los dormitorios no pueden ser negativos'),
    bathrooms: z.coerce
        .number({ error: 'Ingresá los baños' })
        .int('Los baños deben ser un número entero')
        .min(0, 'Los baños no pueden ser negativos'),
    covered_sqm: z.coerce
        .number({ error: 'Ingresá los m² cubiertos' })
        .min(0, 'Los m² cubiertos no pueden ser negativos'),
    gallery_sqm: z.coerce
        .number({ error: 'Ingresá los m² de galería' })
        .min(0, 'Los m² de galería no pueden ser negativos'),
    is_bestseller: z.boolean(),
});

export type HouseValues = z.infer<typeof houseSchema>;

export type HouseFieldErrors = {
    category_id?: string;
    title?: string;
    price?: string;
    bedrooms?: string;
    bathrooms?: string;
    covered_sqm?: string;
    gallery_sqm?: string;
    is_bestseller?: string;
};

export function houseFieldErrors(error: z.ZodError<HouseValues>): HouseFieldErrors {
    const { fieldErrors } = z.flattenError(error);

    return {
        category_id: fieldErrors.category_id?.[0],
        title: fieldErrors.title?.[0],
        price: fieldErrors.price?.[0],
        bedrooms: fieldErrors.bedrooms?.[0],
        bathrooms: fieldErrors.bathrooms?.[0],
        covered_sqm: fieldErrors.covered_sqm?.[0],
        gallery_sqm: fieldErrors.gallery_sqm?.[0],
        is_bestseller: fieldErrors.is_bestseller?.[0],
    };
}
