import {
	Avatar,
	Box,
	Center,
	Heading,
	Stack,
	Text,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import {
	BackButton,
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import HTMLReactParser from "html-react-parser";
import Lottie from "lottie-react";
import { useContext, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useParams } from "react-router-dom";
import api from "../../../api/api";
import Cell from "../../../components/Cell";
import Loader from "../../../components/Loader";
import DepositModal from "../../../components/modals/DepositModal";
import useInterval from "../../../hooks/useInterval";
import { AppContext } from "../../../providers/AppProvider";
import { HistoryContext } from "../../../providers/HistoryProviders";
import loopmoney from "../../../stickers/loopmoney.json";
import { getTelegram } from "../../../utils";
import errorHandler, {
	formatBalance,
	formatBigint,
} from "../../../utils/utils";

export default function InvoicePage() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();
	const params = useParams();
	const depositModal = useDisclosure();

	const [invoice, setInvoice] = useState<any>();

	const [selectedContract, setSelectedContract] = useState<string>("");

	const update = async () => {
		try {
			const data = await api.custom.get(
				`pay/internal/invoice?key=${params.key}`,
				context.props.auth?.token
			);

			setInvoice(data.invoice);
			if (!selectedContract) {
				if (data.invoice.type === "crypto") {
					setSelectedContract(data.invoice.contract.contract);
				} else {
					setSelectedContract(
						getSortedContracts(data.invoice.contracts, data.invoice)[0].contract
					);
				}
			}
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
			router.push("/");
		}
	};

	useInterval(update, 5000);

	const getContract = (contract?: string) => {
		if (!contract) {
			contract = selectedContract;
		}
		const contracts = invoice.contracts || [];
		if (invoice.type === "crypto") {
			contracts.push(invoice.contract);
		}

		const findedContract = contracts.find((e: any) => e.contract === contract);
		const balance = context.balances.find(e => e.contract === contract);

		let fiatBalance = 0;
		if (invoice.type === "fiat") {
			const rate =
				Number(invoice.amount) /
				Number(
					formatBigint(findedContract.amount, findedContract.decimals || 1)
				);
			fiatBalance = Number(
				(
					Number(
						formatBigint(formatBalance(balance), findedContract.decimals)
					) * rate
				).toFixed(2)
			);
		}

		return {
			...findedContract,
			balance: {
				id: balance?.id || null,
				amount: formatBalance(balance),
				fiatBalance,
				not_enough:
					BigInt(formatBalance(balance)) > BigInt(findedContract.amount)
						? "0"
						: (
								BigInt(findedContract.amount) - BigInt(formatBalance(balance))
						  ).toString(),
			},
		};
	};

	const getSortedContracts = (contracts: any[], invoiceData?: any) => {
		if (!invoiceData) {
			invoiceData = invoice;
		}
		return contracts.sort((a, b) => {
			const balance = context.balances.find(e => e.contract === a.contract);

			let fiatBalanceA = 0;

			const rateA =
				Number(invoiceData.amount) /
				Number(formatBigint(a.amount, a.decimals || 1));
			fiatBalanceA = Number(
				(
					Number(formatBigint(formatBalance(balance), a.decimals)) * rateA
				).toFixed(2)
			);
			let fiatBalanceB = 0;

			const rateB =
				Number(invoiceData.amount) /
				Number(formatBigint(b.amount, b.decimals || 1));
			fiatBalanceB = Number(
				(
					Number(formatBigint(formatBalance(balance), b.decimals)) * rateB
				).toFixed(2)
			);

			return fiatBalanceB - fiatBalanceA;
		});
	};

	const pay = async () => {
		try {
			getTelegram().MainButton.showProgress();
			await api.custom.post(
				"pay/internal/invoice/pay",
				context.props.auth?.token,
				{
					key: params.key,
					balance_id: getContract().balance.id,
				}
			);
			await update();
			notificationOccurred("success");
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		} finally {
			getTelegram().MainButton.hideProgress();
		}
	};

	const contractSelect = useDisclosure();
	if (contractSelect.isOpen && invoice) {
		return (
			<Stack direction={"column"} spacing={2}>
				<Stack direction={"column"} spacing={2}>
					<BackButton onClick={contractSelect.onClose} />
					<Heading
						size={"sm"}
						color={getTelegram().themeParams.hint_color}
						textTransform={"uppercase"}
					>
						{context.getTranslation("Choose token")}
					</Heading>

					{getSortedContracts(invoice.contracts).map(({ contract }: any) => (
						<Cell
							icon={
								<LazyLoadImage
									style={{ borderRadius: "999px" }}
									width={"40px"}
									height={"40px"}
									src={getContract(contract).image}
								/>
							}
							onClick={() => {
								setSelectedContract(contract);
								if (getContract(contract).balance.not_enough !== "0") {
									depositModal.onOpen();
								}
								contractSelect.onClose();
							}}
							additional={
								getContract(contract).balance.not_enough !== "0"
									? { title: context.getTranslation("Deposit") }
									: undefined
							}
							title={getContract(contract).name}
							subTitle={`${formatBigint(
								getContract(contract).balance.amount,
								getContract(contract).decimals
							)} ${getContract(contract).symbol} (${
								getContract(contract).balance.fiatBalance
							} ${invoice.fiat})`}
						/>
					))}
				</Stack>
			</Stack>
		);
	}

	if (invoice && invoice.status === "paid") {
		const texts = {
			viewItem: context.getTranslation("View Item"),
			callback: context.getTranslation("Return"),
			openChannel: context.getTranslation("Open Channel"),
			openBot: context.getTranslation("Open Bot"),
			close: context.getTranslation("Close"),
		};

		return (
			<Center minH={"var(--tg-viewport-stable-height)"}>
				<Stack alignItems={"center"} direction={"column"} spacing={4}>
					<Lottie
						animationData={loopmoney}
						loop
						style={{ width: 100, height: 100 }}
					/>
					<Stack direction="column" spacing={2} alignItems={"center"}>
						<Text textAlign="center">
							{HTMLReactParser(
								context
									.getTranslation("You paid the invoice from <b>%merchant%</b>")
									.replaceAll("%merchant%", invoice.merchant.title)
							)}{" "}
							{invoice.merchant.is_verified ? (
								<i className="verified-icon"></i>
							) : (
								<></>
							)}
						</Text>

						<Heading>
							{formatBigint(
								invoice.data.paid_amount,
								getContract(invoice.data.paid_contract).decimals
							) +
								" " +
								getContract(invoice.data.paid_contract).symbol}
						</Heading>
						{invoice.type === "fiat" ? (
							<Text
								fontSize={"sm"}
								color={getTelegram().themeParams.hint_color}
							>
								{invoice.amount} {invoice.fiat}
							</Text>
						) : (
							<Text
								fontSize={"sm"}
								color={getTelegram().themeParams.hint_color}
							>
								${invoice.amount_in_usd}
							</Text>
						)}
					</Stack>
				</Stack>

				<MainButton
					text={texts[invoice.data.paid_btn_name as "viewItem"]}
					onClick={() => {
						if (invoice.data.paid_btn_url) {
							if (invoice.data.paid_btn_url.startsWith("https://t.me")) {
								getTelegram().openTelegramLink(invoice.data.paid_btn_url);
							} else {
								getTelegram().openLink(invoice.data.paid_btn_url);
							}
						}
						getTelegram().close();
					}}
				/>
			</Center>
		);
	}

	return !invoice || !selectedContract ? (
		<Loader />
	) : (
		<Center
			minH={"var(--tg-viewport-stable-height)"}
			transition={"min-height 0.3s linear"}
		>
			<Stack alignItems={"center"} direction={"column"} spacing={4}>
				<Avatar
					size={"xl"}
					width={"100px"}
					height={"100px"}
					name={invoice.merchant.title}
					src={invoice.merchant.photo || undefined}
				/>
				<Stack
					alignItems={"center"}
					textAlign={"center"}
					direction={"column"}
					spacing={2}
				>
					<Stack alignItems={"center"} direction={"row"} spacing={1}>
						<Text textAlign={"center"}>
							{HTMLReactParser(
								context
									.getTranslation("Invoice from <b>%merchant%</b>")
									.replaceAll("%merchant%", invoice.merchant.title)
							)}{" "}
							{invoice.merchant.is_verified ? (
								<i className="verified-icon"></i>
							) : (
								<></>
							)}
						</Text>
					</Stack>

					<Heading>
						{invoice.type === "fiat"
							? invoice.amount + " " + invoice.fiat
							: formatBigint(invoice.amount, invoice.contract.decimals) +
							  " " +
							  invoice.contract.symbol}
					</Heading>
					{invoice.type === "crypto" ? (
						<Text fontSize={"sm"} color={getTelegram().themeParams.hint_color}>
							${invoice.amount_in_usd}
						</Text>
					) : (
						<Text fontSize={"sm"} color={getTelegram().themeParams.hint_color}>
							{formatBigint(getContract().amount, getContract().decimals)}{" "}
							{getContract().symbol}
						</Text>
					)}
				</Stack>

				{invoice.description && <Text>{invoice.description}</Text>}

				{!depositModal.isOpen && (
					<MainButton
						text={
							getContract().balance.not_enough === "0"
								? context
										.getTranslation("Pay %amount%")
										.replaceAll(
											"%amount%",
											invoice.type === "fiat"
												? invoice.amount + " " + invoice.fiat
												: formatBigint(
														invoice.amount,
														invoice.contract.decimals
												  ) +
														" " +
														invoice.contract.symbol
										)
								: context
										.getTranslation("Deposit %symbol%")
										.replaceAll("%symbol%", getContract().symbol)
						}
						onClick={
							getContract().balance.not_enough === "0"
								? pay
								: depositModal.onOpen
						}
					/>
				)}
			</Stack>

			{selectedContract.trim() !== "" && (
				<Box p={3} position={"fixed"} bottom={"0"} w="full">
					<Cell
						icon={
							<LazyLoadImage
								style={{ borderRadius: "999px" }}
								width={"40px"}
								height={"40px"}
								src={getContract().image}
							/>
						}
						title={getContract().name}
						subTitle={
							invoice.type === "fiat"
								? context.getTranslation("Change token")
								: undefined
						}
						onClick={
							invoice.type === "fiat" ? contractSelect.onOpen : undefined
						}
						additional={{
							title: `${formatBigint(
								getContract().balance.amount,
								getContract().decimals
							)} ${getContract().symbol}`,
							subTitle: context.getTranslation("Your balance"),
						}}
					/>
				</Box>
			)}

			{context.wallet && (
				<DepositModal
					isOpen={depositModal.isOpen}
					onClose={depositModal.onClose}
					wallet={context.wallet}
				/>
			)}
		</Center>
	);
}
