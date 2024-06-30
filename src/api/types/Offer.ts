export default interface Offer {
	id: number;
	user_id: number;
	methods: number[];
	type: "buy" | "sell";
	contract: string;
	currency: string;
	description: string | null;
	volume: string;
	price: number;
	percent: number | null;
	min_amount: number;
	max_amount: number | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}
