import {
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
	useSwitchInlineQuery,
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
import errorHandler, { formatBigint, withoutDecimals } from "../../utils/utils";

function CreateCheck() {
	const context = useContext(AppContext);
	const toast = useToast();
	const router = useContext(HistoryContext);
	const navigate = router.push;
	const params = useParams();

	const [password, setPassword] = useState<string>("");
	const [amountString, setAmountString] = useState<string>("");
	const [impactOccurred, notificationOccurred, selectionChanged] =
		useHapticFeedback();

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
		let amount = BigInt(getBalance()?.amount || 0);
		amount -= BigInt(getBalance()?.frozen_amount || 0);

		return amount.toString();
	};

	const isOk = amountString.trim() !== "";
	const switchInlineQuery = useSwitchInlineQuery();

	const send = async () => {
		try {
			getTelegram().MainButton.showProgress();
			const balance = getBalance();
			if (balance) {
				const response = await api.wallet.checks.create(
					{
						balance_id: balance.id,
						amount: withoutDecimals(
							Number(amountString),
							balance.decimals
						).toString(),
						password,
					},
					context.props.auth?.token || ""
				);
				await context.update();
				notificationOccurred("success");
				navigate("/checks", false, "/");
				switchInlineQuery(`C${response.check.key}`, [
					"users",
					"groups",
					"channels",
				]);
			}
		} catch (error) {
			errorHandler(error, toast);
			notificationOccurred("error");
		} finally {
			getTelegram().MainButton.hideProgress();
		}
	};

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
					<FormLabel>{context.getTranslation("amount")}</FormLabel>
					<AmountInput
						value={amountString}
						onChange={setAmountString}
						maxValue={formatBigint(
							getFormattedBalance(),
							getBalance()?.decimals || 1
						)}
					/>
				</FormControl>

				<FormControl>
					<FormLabel>
						{context.getTranslation("password")} (
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
						value={password}
						onChange={e => setPassword(e.currentTarget.value)}
						inputMode="text"
						type="password"
						autoComplete="new-password"
					></Input>
				</FormControl>
			</Stack>
		</>
	) : (
		<Loader />
	);
}

export default CreateCheck;
