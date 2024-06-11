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
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import Balance from "../../api/types/Balance";
import Commission from "../../api/types/Commission";
import Rate from "../../api/types/Rate";
import Cell from "../../components/Cell";
import CustomBackButton from "../../components/CustomBackButton";
import Loader from "../../components/Loader";
import useInterval from "../../hooks/useInterval";
import { AppContext } from "../../providers/AppProvider";
import { getTelegram } from "../../utils";
import { getCacheItemJSON, setCacheItem } from "../../utils/cache";
import errorHandler, { formatBigint, withoutDecimals } from "../../utils/utils";

function WithdrawContract() {
	const context = useContext(AppContext);
	const toast = useToast();
	const navigate = useNavigate();
	const params = useParams();

	const [address, setAddress] = useState<string>("");
	const [amountString, setAmountString] = useState<string>("");
	const [impactOccurred, notificationOccurred, selectionChanged] =
		useHapticFeedback();

	const [balances, setBalances] = useState<Balance[]>(
		getCacheItemJSON("balances") || []
	);
	const [rates, setRates] = useState<Rate[]>(getCacheItemJSON("rates") || []);
	const [commission, setCommission] = useState<Commission | null>(
		getCacheItemJSON(`commission:${params?.contract}`) || null
	);

	useInterval(() => {
		const getBalances = async () => {
			try {
				const data = await api.wallet.balances.list(
					context.props.auth?.token || ""
				);
				setBalances(data.balances);
				setCacheItem("balances", JSON.stringify(data.balances));
				try {
					const commission = await api.wallet.getCommission(
						data.balances.find(e => e.contract === params.contract)?.id || 0,
						context.props.auth?.token || ""
					);
					setCommission(commission.commission);
					setCacheItem(
						`commission:${params?.contract}`,
						JSON.stringify(commission.commission)
					);
				} catch (error) {
					errorHandler(error, toast);
					notificationOccurred("error");
				}
				try {
					const rates = await api.wallet.getRates(
						data.balances.map(e => e.contract),
						context.props.auth?.token || ""
					);
					setRates(rates.rates);
					setCacheItem("rates", JSON.stringify(rates.rates));
				} catch (error) {
					errorHandler(error, toast);
					notificationOccurred("error");
				}
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
			}
		};

		getBalances();
	}, 10000);

	const send = async () => {
		try {
			getTelegram().MainButton.showProgress();
			const balance = getBalance();
			if (balance) {
				await api.wallet.balances.withdraw(
					{
						balance_id: balance.id,
						amount: withoutDecimals(
							Number(amountString),
							balance.decimals
						).toString(),
						address: address.trim(),
					},
					context.props.auth?.token || ""
				);

				toast({ title: "Success", description: "Transaction in progress" });
				notificationOccurred("success");
			}

			navigate("/");
		} catch (error) {
			errorHandler(error, toast);
			notificationOccurred("error");
		} finally {
			getTelegram().MainButton.hideProgress();
		}
	};

	const getBalance = (contract?: string) => {
		if (!contract) {
			contract = params.contract;
		}
		const balance = balances.find(e => e.contract === contract);
		const rate = rates.find(e => e.contract === contract);
		if (!balance) {
			return null;
		}
		return { ...balance, rate };
	};

	const getFormattedBalance = () => {
		if (commission?.contract !== getBalance()?.contract) {
			return getBalance()?.amount || "0";
		}
		let amount = BigInt(getBalance()?.amount || 0);
		amount -= BigInt(commission?.amount || 0);

		return amount.toString();
	};

	const isOk = amountString.trim() !== "" && address.trim() !== "";

	return getBalance() !== null ? (
		<>
			<CustomBackButton />
			{isOk && <MainButton text="Send" onClick={send} />}
			<Stack direction={"column"} spacing={2}>
				<Heading
					size={"sm"}
					color={getTelegram().themeParams.hint_color}
					textTransform={"uppercase"}
				>
					Send {getBalance()?.symbol}
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
					subTitle={"Change token"}
					additional={{
						title: `${formatBigint(
							getFormattedBalance(),
							getBalance()?.decimals || 1
						)} ${getBalance()?.symbol}`,
					}}
					onClick={() => navigate("/withdraw")}
				/>

				<FormControl>
					<FormLabel>Address</FormLabel>
					<Input
						borderColor={getTelegram().themeParams.hint_color}
						_hover={{
							borderColor: getTelegram().themeParams.hint_color,
						}}
						_focus={{
							borderColor: getTelegram().themeParams.accent_text_color,
							boxShadow: "none",
						}}
						value={address}
						onChange={e => setAddress(e.currentTarget.value)}
						inputMode="text"
					></Input>
				</FormControl>
				<FormControl>
					<FormLabel>Amount</FormLabel>
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
					{commission && (
						<FormHelperText color={getTelegram().themeParams.hint_color}>
							Fee:{" "}
							{formatBigint(
								commission.amount,
								getBalance(commission.contract)?.decimals || 1
							)}{" "}
							{getBalance(commission.contract)?.symbol}
						</FormHelperText>
					)}
				</FormControl>
			</Stack>
		</>
	) : (
		<Loader />
	);
}

export default WithdrawContract;
