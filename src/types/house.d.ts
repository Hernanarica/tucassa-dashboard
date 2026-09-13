import type { Category } from '@/types/category';
import type { Database } from '@/types/db/database.types';

export type House = Database['tucassa']['Tables']['table_houses']['Row'] & {
    category: Pick<Category, 'name'> | null;
};

export type HouseInsert = Database['tucassa']['Tables']['table_houses']['Insert'];
export type HouseUpdate = Database['tucassa']['Tables']['table_houses']['Update'];
