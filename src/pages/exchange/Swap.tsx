import {
	FormControl,
	FormHelperText,
	FormLabel,
	Heading,
	Image,
	Input,
	Stack,
	useToast,
} from "@chakra-ui/react";
import {
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import Commission from "../../api/types/Commission";
import Pool from "../../api/types/Pool";
import Cell from "../../components/Cell";
import CustomBackButton from "../../components/CustomBackButton";
import Loader from "../../components/Loader";
import useInterval from "../../hooks/useInterval";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";
import { getCacheItemJSON, setCacheItem } from "../../utils/cache";
import errorHandler, {
	formatBalance,
	formatBigint,
	withoutDecimals,
} from "../../utils/utils";

function Swap() {
	const context = useContext(AppContext);
	const toast = useToast();
	const router = useContext(HistoryContext);
	const navigate = router.push;
	const params = useParams();
	const [impactOccurred, notificationOccurred, selectionChanged] =
		useHapticFeedback();

	const [poolBalance, setPoolBalance] = useState<string>(
		getCacheItemJSON(`poolbalance:${params.contract}`) || "0"
	);
	const [pools, setPools] = useState<Pool[]>(getCacheItemJSON("pools") || []);
	const [swapRate, setSwapRate] = useState<{
		output_amount: string;
		commission: Commission;
	}>(
		getCacheItemJSON(`swap:rate:${params.contract}:${params.output}`) ||
			undefined
	);

	useInterval(() => {
		const getBalances = async () => {
			try {
				const poolBalance = await api.wallet.exchange.getPoolBalance(
					params.contract || "",
					context.props.auth?.token || ""
				);
				setPoolBalance(poolBalance.balance);
				setCacheItem(
					`poolbalance:${params.contract}`,
					JSON.stringify(poolBalance.balance)
				);
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
			}

			try {
				const pools = await api.wallet.exchange.getPools(
					context.props.auth?.token || ""
				);
				setPools(pools.pools);
				setCacheItem(`pools`, JSON.stringify(pools.pools));
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
			}

			try {
				const input = context.balances.find(
					e => e.contract === params.contract
				);
				const swapRate = await api.wallet.exchange.swap(
					{
						preview: true,
						input: params.contract as string,
						output: params.output as string,
						amount: (1)
							.toPrecision((input?.decimals || 9) + 1)
							.toString()
							.replaceAll(".", ""),
					},
					context.props.auth?.token || ""
				);
				setSwapRate(swapRate);
				setCacheItem(
					`swap:rate:${params.contract}:${params.output}`,
					JSON.stringify(swapRate)
				);
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
			}
		};

		getBalances();
	}, 10000);

	const getBalance = (contract?: string) => {
		if (!contract) {
			contract = params.contract;
		}
		const balance = context.balances.find(e => e.contract === contract);
		if (!balance) {
			return null;
		}
		const rate = context.rates.find(e => e.contract === balance.contract);
		return { ...balance, rate };
	};

	const getSwap = () => {
		const pool = pools.find(e => e.contract === params.output);
		if (!pool) {
			return null;
		}
		const rate = context.rates.find(e => e.contract === pool.contract);
		return { ...pool, rate };
	};

	const [amountString, setAmountString] = useState<string>("");
	const isOk = amountString.trim() !== "";

	const formatRecieve = () => {
		let number = 0;
		try {
			number = Number(amountString);
		} catch (error) {
			return "";
		}
		return (
			formatBigint(
				(
					number *
					Number(
						formatBigint(
							swapRate?.output_amount || "0",
							getSwap()?.decimals || 0
						)
					)
				)
					.toFixed(getSwap()?.decimals || 0)
					.replaceAll(".", ""),
				getSwap()?.decimals || 0
			) + ` ${getSwap()?.symbol}`
		);
	};

	const swap = async () => {
		try {
			getTelegram().MainButton.showProgress();
			await api.wallet.exchange.swap(
				{
					amount: withoutDecimals(
						Number(amountString),
						getBalance()?.decimals || 9
					).toString(),
					preview: false,
					output: params.output as string,
					input: params.contract as string,
				},
				context.props.auth?.token || ""
			);

			toast({
				title: context.getTranslation("success"),
				description: context.getTranslation("Transaction in progress"),
			});
			notificationOccurred("success");
			navigate("/");
		} catch (error) {
			errorHandler(error, toast);
			notificationOccurred("error");
		} finally {
			getTelegram().MainButton.hideProgress();
		}
	};

	const getFormattedBalance = () => {
		if (swapRate?.commission?.contract !== getBalance()?.contract) {
			return formatBalance(getBalance() as any) || "0";
		}
		let amount = BigInt(formatBalance(getBalance() as any) || 0);
		amount -= BigInt(swapRate?.commission?.amount || 0);
		if (BigInt(amount) <= 0) {
			return "0";
		}

		return amount.toString();
	};

	return !getBalance() ? (
		<Loader />
	) : (
		<>
			<CustomBackButton />
			{isOk && (
				<MainButton
					text={context.getTranslation("swap_action")}
					onClick={swap}
				/>
			)}
			<Stack direction={"column"} spacing={2}>
				<Heading
					size={"sm"}
					color={getTelegram().themeParams.hint_color}
					textTransform={"uppercase"}
				>
					{context
						.getTranslation("swap_token_to")
						.replaceAll("%input%", getBalance()?.symbol || "")
						.replaceAll("%output%", getSwap()?.symbol || "")}
				</Heading>

				<Cell
					icon={
						<Image
							borderRadius={"999px"}
							width={"40px"}
							height={"40px"}
							src={getBalance()?.image}
						/>
					}
					title={getBalance()?.name || ""}
					additional={{
						title: `${formatBigint(
							getFormattedBalance(),
							getBalance()?.decimals || 1
						)} ${getBalance()?.symbol}`,
					}}
				/>

				<FormControl>
					<FormLabel>{context.getTranslation("amount")}</FormLabel>
					<Input
						borderColor={getTelegram().themeParams.hint_color}
						_hover={{
							borderColor: getTelegram().themeParams.hint_color,
						}}
						_focus={{
							borderColor: getTelegram().themeParams.accent_text_color,
							boxShadow: "none",
						}}
						value={amountString}
						inputMode="decimal"
						onChange={e => {
							let value = e.currentTarget.value.trim();
							if (value === "") {
								setAmountString("");
							}
							if (value.includes(",")) {
								value = value.replaceAll(",", ".");
							}
							if (value.startsWith(".")) {
								return;
							}
							if (value.endsWith(".")) {
								if (
									!new RegExp(/^[0-9]\d*(\.\d+)?$/gm).test(
										value.replace(".", "")
									)
								) {
									return;
								}
							} else {
								if (!new RegExp(/^[0-9]\d*(\.\d+)?$/gm).test(value)) {
									return;
								}
							}
							setAmountString(
								e.currentTarget.value.trim().replaceAll(",", ".")
							);
						}}
					></Input>
					{swapRate && (
						<FormHelperText color={getTelegram().themeParams.hint_color}>
							{context.getTranslation("rate")}: 1 {getBalance()?.symbol} ={" "}
							{formatBigint(
								swapRate?.output_amount || "0",
								getSwap()?.decimals || 0
							)}{" "}
							{getSwap()?.symbol}
							<br />
							{context.getTranslation("maximum")}:{" "}
							{formatBigint(getSwap()?.amount || "0", getSwap()?.decimals || 0)}{" "}
							{getSwap()?.symbol} |{" "}
							{(
								Number(
									formatBigint(
										getSwap()?.amount || "0",
										getSwap()?.decimals || 0
									)
								) /
								Number(
									formatBigint(
										swapRate?.output_amount || "0",
										getSwap()?.decimals || 0
									)
								)
							).toFixed(getBalance()?.decimals)}{" "}
							{getBalance()?.symbol}
							<br />
							{context.getTranslation("fee")}:{" "}
							{formatBigint(
								swapRate.commission.amount,
								getBalance(swapRate.commission.contract)?.decimals || 1
							)}{" "}
							{getBalance(swapRate.commission.contract)?.symbol}
						</FormHelperText>
					)}
				</FormControl>

				<FormControl>
					<FormLabel>{context.getTranslation("you_receive")}</FormLabel>
					<Input
						borderColor={getTelegram().themeParams.hint_color}
						_hover={{
							borderColor: getTelegram().themeParams.hint_color,
						}}
						_focus={{
							borderColor: getTelegram().themeParams.accent_text_color,
							boxShadow: "none",
						}}
						isReadOnly
						value={amountString ? formatRecieve() : ""}
					></Input>
				</FormControl>
			</Stack>
		</>
	);
}

export default Swap;
