import Balance from "../api/types/Balance";
import MarketMethod from "../api/types/MarketMethod";
import { AppContextType } from "../providers/AppProvider";
import { getTelegram } from "../utils";

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

export function reduceString(
	text: string,
	to: number,
	elipses?: boolean
): string {
	if (text.length <= to) {
		return text;
	}

	if (elipses) {
		return text.substring(0, to).trim() + "...";
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

export function getTonApi(context: AppContextType) {
	return context.props.network === "testnet"
		? "https://testnet.tonapi.io"
		: "https://tonapi.io";
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

export function getMethodName(method: MarketMethod, context: AppContextType) {
	return context.props.auth?.profile.language === "ru"
		? method.name_ru || method.name_en
		: method.name_en;
}

export function getCSSVariable(variable: string) {
	return getComputedStyle(document.body).getPropertyValue(variable);
}

export function getAvailableCategories() {
	return [
		{ type: "market", color: getCSSVariable("--aithercol-colors-yellow-500") },
		{
			type: "blockchain",
			color: getCSSVariable("--aithercol-colors-pink-500"),
		},
		{ type: "cashback", color: getCSSVariable("--aithercol-colors-green-300") },
		{ type: "fee", color: getCSSVariable("--aithercol-colors-red-300") },
		{ type: "transfers", color: getTelegram().themeParams.accent_text_color },
		{ type: "purchases", color: getCSSVariable("--aithercol-colors-red-300") },
		{ type: "checks", color: getCSSVariable("--aithercol-colors-orange-500") },
		{ type: "rewards", color: getCSSVariable("--aithercol-colors-green-500") },
		{ type: "swaps", color: getCSSVariable("--aithercol-colors-yellow-300") },
		{
			type: "giveaways",
			color: getCSSVariable("--aithercol-colors-purple-500"),
		},
		{ type: "restores", color: getCSSVariable("--aithercol-colors-pink-300") },
		{ type: "staking", color: getCSSVariable("--aithercol-colors-gray-500") },
	];
}

export function getCategoryColor(category: string) {
	return (
		getAvailableCategories().find(e => e.type === category)?.color ||
		getTelegram().themeParams.secondary_bg_color
	);
}
