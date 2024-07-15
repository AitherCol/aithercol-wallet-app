export default interface TransactionStats {
	total: string;
	categories: TransactionStatsCategory[];
	decimals: number;
}

export interface TransactionStatsCategory {
	type: string;
	amount: string;
	percent: number;
}
