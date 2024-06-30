export default interface User {
	id: number;
	telegram_id: string;
	name: string;
	is_admin: boolean;
	language: "en" | "ru";
	created_at: string;
	is_premium: boolean;
	is_market_registred: boolean;
	market_currency: string;
	is_busy: boolean;
	is_transfers_allowed: boolean;
	deals: number;
	deals_amount: number;
	completed_deals: number;
}
