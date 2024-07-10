import {
	Avatar,
	FormControl,
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
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import Transaction from "../../api/types/Transaction";
import AmountInput from "../../components/AmountInput";
import Cell from "../../components/Cell";
import CustomBackButton from "../../components/CustomBackButton";
import Loader from "../../components/Loader";
import TransactionScreen from "../../components/TransactionScreen";
import config from "../../config";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";
import errorHandler, {
	formatBalance,
	formatBigint,
	withoutDecimals,
} from "../../utils/utils";

function WithdrawTelegram() {
	const context = useContext(AppContext);
	const toast = useToast();
	const router = useContext(HistoryContext);
	const navigate = router.push;
	const params = useParams();

	const [amountString, setAmountString] = useState<string>("");
	const [comment, setComment] = useState<string>("");
	const [impactOccurred, notificationOccurred, selectionChanged] =
		useHapticFeedback();
	const [transaction, setTransaction] = useState<Transaction | null>(null);

	const [user, setUser] = useState<any | null>(null);

	const send = async () => {
		try {
			getTelegram().MainButton.showProgress();
			const balance = getBalance();
			if (balance) {
				const data = await api.custom.post(
					"wallet/balances/transfer",
					context.props.auth?.token,
					{
						balance_id: balance.id,
						amount: withoutDecimals(
							Number(amountString),
							balance.decimals
						).toString(),
						telegram_id: params.telegram_id,
						comment: comment.trim(),
					}
				);

				await context.update();

				notificationOccurred("success");
				setTransaction(data.transaction);
			}
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
		return formatBalance(getBalance() as any) || "0";
	};

	useEffect(() => {
		(async () => {
			try {
				const data = await api.custom.get(
					`get_telegram_profile?id=${params.telegram_id}`,
					context.props.auth?.token
				);
				setUser(data.profile);
			} catch (error) {
				notificationOccurred("error");
				errorHandler(error, toast);
				router.push("/");
			}
		})();
	}, []);

	const isOk = amountString.trim() !== "" && user;
	if (transaction) {
		return <TransactionScreen transaction={transaction} />;
	}

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
					<FormLabel>{context.getTranslation("User")}</FormLabel>
					{user && (
						<Cell
							icon={
								<Avatar
									borderRadius={"999px"}
									width={"40px"}
									height={"40px"}
									src={user.photo}
									name={user.first_name || "unknown"}
								/>
							}
							title={user.first_name || "unknown"}
							subTitle={context.getTranslation("Change user")}
							onClick={async () => {
								await api.custom.post(
									"wallet/balances/transfer/select_telegram_user",
									context.props.auth?.token,
									{ contract: params.contract }
								);
								getTelegram().openTelegramLink(
									`https://t.me/${config.username}`
								);
								getTelegram().close();
							}}
						/>
					)}
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

export default WithdrawTelegram;
