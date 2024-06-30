export default interface Deal {
	id: number;
	user_id: number;
	dealer_id: number;
	offer_id: number;
	contract: string;
	currency: string;
	type: string;
	amount: string;
	amount_fiat: number;
	payment_method: any;
	status:
		| "waiting"
		| "rejected"
		| "canceled"
		| "waiting_payment"
		| "waiting_method"
		| "payment_sent"
		| "success";
	expired_at: string;
	created_at: string;
	updated_at: string;
	method_type: number;
	is_dispute_opened: boolean;
}
