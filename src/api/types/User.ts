export default interface User {
	id: number;
	telegram_id: string;
	is_admin: boolean;
	language: "en" | "ru";
	created_at: string;
}
