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
import AmountInput from "../../components/AmountInput";
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

function WithdrawContract() {
	const context = useContext(AppContext);
	const toast = useToast();
	const router = useContext(HistoryContext);
	const navigate = router.push;
	const params = useParams();

	const [address, setAddress] = useState<string>("");
	const [amountString, setAmountString] = useState<string>("");
	const [comment, setComment] = useState<string>("");
	const [impactOccurred, notificationOccurred, selectionChanged] =
		useHapticFeedback();

	const [commission, setCommission] = useState<Commission | null>(
		getCacheItemJSON(`commission:${params?.contract}`) || null
	);

	useInterval(() => {
		const getBalances = async () => {
			try {
				const commission = await api.wallet.getCommission(
					context.balances.find(e => e.contract === params.contract)?.id || 0,
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
						comment: comment.trim(),
					},
					context.props.auth?.token || ""
				);

				toast({
					title: context.getTranslation("success"),
					description: context.getTranslation("Transaction in progress"),
				});
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
		const balance = context.balances.find(e => e.contract === contract);
		const rate = context.rates.find(e => e.contract === contract);
		if (!balance) {
			return null;
		}
		return { ...balance, rate };
	};

	const getFormattedBalance = () => {
		if (commission?.contract !== getBalance()?.contract) {
			return formatBalance(getBalance() as any) || "0";
		}
		let amount = BigInt(formatBalance(getBalance() as any) || 0);
		amount -= BigInt(commission?.amount || 0);

		if (amount < 0) {
			return "0";
		}

		return amount.toString();
	};

	const isOk = amountString.trim() !== "" && address.trim() !== "";

	return getBalance() !== null ? (
		<>
			<CustomBackButton />
			{isOk && (
				<MainButton text={context.getTranslation("send")} onClick={send} />
			)}
			<Stack direction={"column"} spacing={2}>
				<Heading
					size={"sm"}
					color={getTelegram().themeParams.hint_color}
					textTransform={"uppercase"}
				>
					{context.getTranslation("send")} {getBalance()?.symbol}
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
					subTitle={context.getTranslation("change_token")}
					additional={{
						title: `${formatBigint(
							getFormattedBalance(),
							getBalance()?.decimals || 1
						)} ${getBalance()?.symbol}`,
					}}
					onClick={() => navigate("/withdraw")}
				/>

				<FormControl>
					<FormLabel>{context.getTranslation("address")}</FormLabel>
					<Input
						borderColor={"transparent"}
						bgColor={getTelegram().themeParams.bg_color}
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
					<FormLabel>{context.getTranslation("amount")}</FormLabel>
					<AmountInput
						maxValue={formatBigint(
							getFormattedBalance(),
							getBalance()?.decimals || 1
						)}
						value={amountString}
						onChange={e => setAmountString(e)}
					/>

					{commission && (
						<FormHelperText color={getTelegram().themeParams.hint_color}>
							{context.getTranslation("fee")}:{" "}
							{formatBigint(
								commission.amount,
								getBalance(commission.contract)?.decimals || 1
							)}{" "}
							{getBalance(commission.contract)?.symbol}
						</FormHelperText>
					)}
				</FormControl>

				<FormControl>
					<FormLabel>
						{context.getTranslation("comment")} (
						{context.getTranslation("optional")})
					</FormLabel>
					<Input
						borderColor={"transparent"}
						bgColor={getTelegram().themeParams.bg_color}
						_hover={{
							borderColor: getTelegram().themeParams.hint_color,
						}}
						_focus={{
							borderColor: getTelegram().themeParams.accent_text_color,
							boxShadow: "none",
						}}
						value={comment}
						onChange={e => setComment(e.currentTarget.value)}
						inputMode="text"
					></Input>
				</FormControl>
			</Stack>
		</>
	) : (
		<Loader />
	);
}

export default WithdrawContract;
