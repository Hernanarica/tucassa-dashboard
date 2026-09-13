import { supabase } from '@/lib/supabase';
import useSWR from 'swr';

const BANNERS_KEY = 'tucassa/table_banners';

async function fetchBanners() {
    const { data, error } = await supabase
        .from('table_banners')
        .select('*')
        .order('section')
        .order('sort_order');

    if (error) {
        throw error;
    }

    return data;
}

export function useBanners() {
    return useSWR(BANNERS_KEY, fetchBanners);
}
