export interface ServiceFilters{
    isActive:boolean;
    priceMin: number|null;
    priceMax: number|null;
    category: string|null;
    durationMin: number|null;
    durationMax: number|null;
    city: string|null;
}