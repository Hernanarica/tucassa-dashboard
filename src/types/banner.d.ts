import type { Database } from '@/types/db/database.types';

export type Banner = Database['tucassa']['Tables']['table_banners']['Row'];
export type BannerInsert = Database['tucassa']['Tables']['table_banners']['Insert'];
export type BannerUpdate = Database['tucassa']['Tables']['table_banners']['Update'];
