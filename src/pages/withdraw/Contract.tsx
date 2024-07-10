import {
	FormControl,
	FormHelperText,
	FormLabel,
	Heading,
	IconButton,
	Image,
	Input,
	InputGroup,
	InputRightElement,
	Stack,
	useToast,
} from "@chakra-ui/react";
import { LuScanLine } from "react-icons/lu";

import {
	MainButton,
	useHapticFeedback,
	useScanQrPopup,
} from "@vkruglikov/react-telegram-web-app";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import Commission from "../../api/types/Commission";
import Transaction from "../../api/types/Transaction";
import AmountInput from "../../components/AmountInput";
import Cell from "../../components/Cell";
import CustomBackButton from "../../components/CustomBackButton";
import Loader from "../../components/Loader";
import TransactionScreen from "../../components/TransactionScreen";
import useContacts from "../../hooks/useContacts";
import useInterval from "../../hooks/useInterval";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";
import { getCacheItemJSON, setCacheItem } from "../../utils/cache";
import errorHandler, {
	formatBalance,
	formatBigint,
	getTonViewer,
	reduceString,
	withoutDecimals,
} from "../../utils/utils";

function WithdrawContract() {
	const context = useContext(AppContext);
	const toast = useToast();
	const router = useContext(HistoryContext);
	const navigate = router.push;
	const params = useParams();
	const [showQrPopup, closeQrPopup] = useScanQrPopup();
	const { contacts } = useContacts();
	const [search, setSearch] = useState<string>("");

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

	const [transaction, setTransaction] = useState<Transaction | null>(null);

	const send = async () => {
		try {
			getTelegram().MainButton.showProgress();
			const balance = getBalance();
			if (balance) {
				const data = await api.wallet.balances.withdraw(
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
					<FormLabel>{context.getTranslation("address")}</FormLabel>
					<InputGroup>
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
						<InputRightElement width="3rem">
							<IconButton
								variant={"ghost"}
								colorScheme="button"
								color="button.500"
								size={"sm"}
								aria-label="scan"
								icon={<LuScanLine size={"20px"} />}
								onClick={() => {
									showQrPopup(
										{
											text: context.getTranslation(
												"Find QR that contains wallet address"
											),
										},
										text => {
											closeQrPopup();
											setAddress(text);
										}
									);
								}}
							/>
						</InputRightElement>
					</InputGroup>
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

				{contacts &&
					contacts.filter(e => e.address !== address).length !== 0 && (
						<>
							<Heading
								size={"sm"}
								color={getTelegram().themeParams.hint_color}
								textTransform={"uppercase"}
							>
								{context.getTranslation("Saved Addreses")}
							</Heading>
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
								_placeholder={{
									color: getTelegram().themeParams.hint_color,
								}}
								placeholder={`${context.getTranslation("search")}...`}
								value={search}
								onChange={e => setSearch(e.currentTarget.value)}
							/>
							{contacts
								.filter(
									e =>
										e.address !== address &&
										(search.trim() === "" ||
											e.title
												.toLowerCase()
												.includes(search.trim().toLowerCase()))
								)
								.map(contact => (
									<Cell
										title={contact.title}
										subTitle={reduceString(contact.address, 20)}
										subTitleLink={`${getTonViewer(context)}/${contact.address}`}
										onClick={() => setAddress(contact.address)}
									/>
								))}
						</>
					)}
			</Stack>
		</>
	) : (
		<Loader />
	);
}

export default WithdrawContract;
