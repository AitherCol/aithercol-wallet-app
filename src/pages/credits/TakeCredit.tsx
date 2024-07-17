import {
	FormControl,
	FormHelperText,
	FormLabel,
	Heading,
	Select,
	Stack,
	useToast,
} from "@chakra-ui/react";
import {
	BackButton,
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import { useContext, useState } from "react";
import { CreditPageProps } from ".";
import api from "../../api/api";
import AmountInput from "../../components/AmountInput";
import Loader from "../../components/Loader";
import NotFoundBadge from "../../components/NotFoundBadge";
import useInterval from "../../hooks/useInterval";
import { AppContext } from "../../providers/AppProvider";
import { getTelegram } from "../../utils";
import errorHandler, { formatBigint, withoutDecimals } from "../../utils/utils";

export default function TakeCredit(props: CreditPageProps) {
	const context = useContext(AppContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [available, setAvailable] = useState<any[]>();

	const [contract, setContract] = useState<string>("");
	const [amountString, setAmountString] = useState<string>("");

	const update = async () => {
		try {
			const { contracts } = await api.custom.get(
				"wallet/credits/available",
				context.props.auth?.token
			);
			setAvailable(contracts);
			if (contracts.length !== 0) {
				setContract(contracts[0].contract);
			}
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		}
	};

	useInterval(update, 10000);

	const getContract = () => {
		return available?.find(e => e.contract === contract);
	};

	const isOk = amountString.trim() !== "" && contract.trim() !== "";

	const take = async () => {
		try {
			getTelegram().MainButton.showProgress();
			await api.custom.post("wallet/credits/take", context.props.auth?.token, {
				contract,
				amount: withoutDecimals(
					Number(amountString),
					getContract().decimals
				).toString(),
			});
			await props.update();
			await context.update();
			notificationOccurred("success");
			props.onClose();
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		} finally {
			getTelegram().MainButton.hideProgress();
		}
	};

	return !available ? (
		<Loader />
	) : available.length === 0 ? (
		<>
			<BackButton onClick={props.onClose} />
			<NotFoundBadge text={context.getTranslation("Nothing Found")} />
		</>
	) : (
		<Stack direction={"column"} spacing={2}>
			<BackButton onClick={props.onClose} />

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("Take a loan")}
			</Heading>

			<FormControl>
				<FormLabel>{context.getTranslation("Token")}</FormLabel>

				<Select
					borderColor={"transparent"}
					bgColor={getTelegram().themeParams.bg_color}
					_hover={{
						borderColor: getTelegram().themeParams.hint_color,
					}}
					_focus={{
						borderColor: getTelegram().themeParams.accent_text_color,
						boxShadow: "none",
					}}
					value={contract}
					onChange={e => setContract(e.currentTarget.value)}
				>
					{available.map(e => (
						<option value={e.contract}>{e.symbol}</option>
					))}
				</Select>
			</FormControl>

			<FormControl>
				<FormLabel>{context.getTranslation("amount")}</FormLabel>
				<AmountInput
					maxValue={formatBigint(
						getContract().available,
						getContract().decimals
					)}
					value={amountString}
					onChange={e => setAmountString(e)}
				/>
				<FormHelperText>
					{context.getTranslation("maximum")}:{" "}
					{formatBigint(getContract().available, getContract().decimals)}{" "}
					{getContract().symbol}
				</FormHelperText>
			</FormControl>

			{isOk && (
				<MainButton text={context.getTranslation("Continue")} onClick={take} />
			)}
		</Stack>
	);
}
