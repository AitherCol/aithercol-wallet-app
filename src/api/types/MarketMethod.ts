export default interface MarketMethod {
	id: number;
	name_en: string;
	name_ru: string | null;
	currency: string;
}

export interface UserMarketMethod {
	id: number;
	method_id: number;
	name: string;
	value: string;
}
