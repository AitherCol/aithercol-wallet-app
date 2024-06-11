export interface BasicResponse {
	errors: { message: string }[];
}

export interface PaginationMeta {
	total: number;
	per_page: number;
	current_page: number;
	last_page: number | null;
}
