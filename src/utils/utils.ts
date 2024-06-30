import Balance from "../api/types/Balance";
import { AppContextType } from "../providers/AppProvider";

export function toDecimals(amount: number, decimals: number): number {
	const factor = Math.pow(10, decimals);
	return Math.round(amount / factor) / Math.pow(10, decimals);
}

export default function errorHandler(err: any, toast: any) {
	if (err?.response && err.response?.data && err.response.data?.errors) {
		for (const error of err.response.data.errors) {
			if (error.message === "E_UNAUTHORIZED_ACCESS: Unauthorized access") {
				window.location.reload();
				return;
			}
			toast({
				title: "Error",
				description: error.message,
				status: "error",
			});
		}
	} else {
		toast({
			title: "Unknown error",
			description: `${err}`,
			status: "error",
		});
	}
}

export function reduceString(text: string, to: number): string {
	if (text.length <= to) {
		return text;
	}

	const partLength = Math.floor((to - 3) / 2);
	const start = text.substring(0, partLength);
	const end = text.substring(text.length - partLength);

	return `${start}...${end}`;
}

export function formatBigint(input: string, decimals: number): string {
	// Преобразуем строку в число
	let num = BigInt(input);

	// Делаем деление на 10^decimals
	let divisor = BigInt(10 ** decimals);

	// Результат деления
	let result = num / divisor;

	// Остаток от деления
	let remainder = num % divisor;

	// Формируем строку результата с учетом остатков
	if (remainder > 0) {
		// Форматируем остаток так, чтобы он был нужной длины
		let remainderStr = remainder.toString().padStart(decimals, "0");
		// Убираем лишние нули в конце
		remainderStr = remainderStr.replace(/0+$/, "");
		return `${result.toString()}.${remainderStr}`;
	} else {
		return result.toString();
	}
}

export function withoutDecimals(amount: number, decimals: number): BigInt {
	const factor = 10 ** decimals;
	const result = amount * factor;
	return BigInt(Math.round(result));
}

export function getTonViewer(context: AppContextType) {
	return context.props.network === "testnet"
		? "https://testnet.tonviewer.com"
		: "https://tonviewer.com";
}

export function formatBalance(balance?: Balance) {
	if (!balance) {
		return "0";
	}
	return (BigInt(balance.amount) - BigInt(balance.frozen_amount)).toString();
}

export function arrayToString(arr: string[]): string {
	if (arr.length === 0) {
		return "";
	}
	if (arr.length === 1) {
		return arr[0];
	}
	const lastElement = arr.pop();
	return arr.join(", ") + " and " + lastElement;
}
