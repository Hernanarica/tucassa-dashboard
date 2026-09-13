import { supabase } from '@/lib/supabase';
import useSWR from 'swr';

const HOUSES_KEY = 'tucassa/table_houses';
const CATEGORIES_KEY = 'tucassa/table_category';

async function fetchHouses() {
    const { data, error } = await supabase
        .from('table_houses')
        .select('*, category:table_category(name)')
        .order('id');

    if (error) {
        throw error;
    }

    return data;
}

async function fetchCategories() {
    const { data, error } = await supabase.from('table_category').select('*').order('id');

    if (error) {
        throw error;
    }

    return data;
}

export function useHouses() {
    return useSWR(HOUSES_KEY, fetchHouses);
}

export function useCategories() {
    return useSWR(CATEGORIES_KEY, fetchCategories);
}
