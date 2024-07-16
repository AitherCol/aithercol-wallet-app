export default interface StakingToken {
	id: number;
	contract: string;
	name: string;
	image: string;
	symbol: string;
	decimals: number;
	verification: string;
	percent: number;
	min_amount: string;
	bonus_percent: number | null;
	bonus_expires_at: string | null;
	is_active: boolean;
}
