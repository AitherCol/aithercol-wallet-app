export default interface Merchant {
	id: number;
	title: string;
	description: string | null;
	photo: string | null;
	url: string | null;
	fee: number;
	is_verified: boolean;
	is_banned: boolean;
	created_at: string;
	updated_at: string;
}
