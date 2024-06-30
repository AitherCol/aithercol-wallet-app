import {
	FormControl,
	FormLabel,
	Heading,
	Image,
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
import AmountInput from "../../components/AmountInput";
import Cell from "../../components/Cell";
import CustomBackButton from "../../components/CustomBackButton";
import Loader from "../../components/Loader";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";
import errorHandler, {
	formatBalance,
	formatBigint,
	withoutDecimals,
} from "../../utils/utils";

function DepositToPool() {
	const context = useContext(AppContext);
	const toast = useToast();
	const router = useContext(HistoryContext);
	const navigate = router.push;
	const params = useParams();
	const [impactOccurred, notificationOccurred, selectionChanged] =
		useHapticFeedback();

	const getBalance = () => {
		const balance = context.balances.find(e => e.contract === params.contract);
		if (!balance) {
			return null;
		}
		const rate = context.rates.find(e => e.contract === balance.contract);
		return { ...balance, rate };
	};

	const [amountString, setAmountString] = useState<string>("");
	const isOk = amountString.trim() !== "";

	const send = async () => {
		try {
			getTelegram().MainButton.showProgress();
			const balance = getBalance();
			if (balance) {
				await api.wallet.exchange.transferToPool(
					{
						balance_id: balance.id,
						amount: withoutDecimals(
							Number(amountString),
							balance.decimals
						).toString(),
					},
					context.props.auth?.token || ""
				);

				toast({
					title: context.getTranslation("success"),
					description: context.getTranslation("Transaction in progress"),
				});
				notificationOccurred("success");
			}

			router.back();
		} catch (error) {
			errorHandler(error, toast);
			notificationOccurred("error");
		} finally {
			getTelegram().MainButton.hideProgress();
		}
	};

	return !getBalance() ? (
		<Loader />
	) : (
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
					{context
						.getTranslation("send_to_pool")
						.replaceAll("%symbol%", getBalance()?.symbol || "")}
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
							formatBalance(getBalance() as any),
							getBalance()?.decimals || 1
						)} ${getBalance()?.symbol}`,
					}}
				/>

				<FormControl>
					<FormLabel>{context.getTranslation("amount")}</FormLabel>
					<AmountInput
						value={amountString}
						onChange={setAmountString}
						maxValue={formatBigint(
							formatBalance(getBalance() as any),
							getBalance()?.decimals || 1
						)}
					/>
				</FormControl>
			</Stack>
		</>
	);
}

export default DepositToPool;
