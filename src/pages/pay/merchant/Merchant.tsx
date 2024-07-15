import {
	Avatar,
	Box,
	Center,
	Heading,
	IconButton,
	Stack,
	Text,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import {
	useHapticFeedback,
	useShowPopup,
} from "@vkruglikov/react-telegram-web-app";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaBook, FaGear } from "react-icons/fa6";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useParams } from "react-router-dom";
import api from "../../../api/api";
import Balance from "../../../api/types/Balance";
import Merchant from "../../../api/types/Merchant";
import Rate from "../../../api/types/Rate";
import Cell from "../../../components/Cell";
import CellButton from "../../../components/CellButton";
import CustomBackButton from "../../../components/CustomBackButton";
import Loader from "../../../components/Loader";
import config from "../../../config";
import { AppContext } from "../../../providers/AppProvider";
import { HistoryContext } from "../../../providers/HistoryProviders";
import { getTelegram } from "../../../utils";
import errorHandler, { formatBigint } from "../../../utils/utils";
import MerchantSettings from "./MerchantSettings";

export interface MerchantPageProps {
	merchant: Merchant;
	rates: Rate[];
	balances: Balance[];
	getRate: (contract: string) => Rate;
	getTotalBalance: () => number;
	update: () => void;
	onClose: () => void;
}

export default function MerchantPage() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();
	const params = useParams();
	const showPopup = useShowPopup();

	const [merchant, setMerchant] = useState<Merchant>();
	const [balances, setBalances] = useState<Balance[]>([]);
	const [rates, setRates] = useState<Rate[]>([]);

	const settingsPage = useDisclosure();

	const getRate = (contract: string): Rate => {
		const rate = rates.find(e => e.contract === contract);
		if (rate) {
			return rate;
		} else {
			return {
				contract,
				price: 0,
				diff_24h: "0.00%",
				diff_30d: "0.00%",
				diff_7d: "0.00%",
			};
		}
	};

	const getTotalBalance = (): number => {
		let total = 0;
		for (const balance of balances) {
			total +=
				getRate(balance.contract).price *
				Number(formatBigint(balance.amount, balance.decimals));
		}

		return total;
	};

	const update = async () => {
		try {
			const data = await api.custom.get(
				`pay/internal/merchants/get?id=${params.id}`,
				context.props.auth?.token
			);
			setBalances(data.balances);

			try {
				const rates = await api.wallet.getRates(
					data.balances.map((e: Balance) => e.contract),
					context.props.auth?.token || ""
				);
				setRates(rates.rates);
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
			}
			setMerchant(data.merchant);
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
			router.back();
		}
	};

	useEffect(() => {
		update();
	}, []);

	if (settingsPage.isOpen && merchant) {
		return (
			<MerchantSettings
				merchant={merchant}
				update={update}
				rates={rates}
				balances={balances}
				getRate={getRate}
				getTotalBalance={getTotalBalance}
				onClose={settingsPage.onClose}
			/>
		);
	}

	return !merchant ? (
		<Loader />
	) : (
		<>
			<CustomBackButton />
			<Center mt="36px" mb="36px">
				<Stack direction={"column"} spacing={6} alignItems={"center"}>
					<Stack alignItems={"center"} direction={"column"} spacing={2}>
						<Stack direction={"row"} alignItems={"center"} spacing={2}>
							<Avatar
								src={merchant.photo || undefined}
								name={merchant.title}
								size={"xs"}
							/>
							<Text>
								{merchant.title}{" "}
								{merchant.is_verified ? (
									<i className="verified-icon"></i>
								) : (
									<></>
								)}
							</Text>
						</Stack>
						<Heading alignItems={"center"} size={"2xl"}>
							${getTotalBalance().toFixed(2)}
						</Heading>
						<Text fontSize={"sm"} color={getTelegram().themeParams.hint_color}>
							{context.getTranslation("fee")}: {merchant.fee}%
						</Text>
					</Stack>
					<Stack direction={"row"} spacing={6}>
						<Stack
							onClick={async () => {
								const button = await showPopup({
									title: context.getTranslation("Withdraw"),
									message: context.getTranslation(
										"Are you sure you want to withdraw all coins to your wallet?"
									),
									buttons: [
										{
											id: "confirm",
											type: "default",
											text: context.getTranslation("Confirm"),
										},
										{ type: "cancel" },
									],
								});
								if (button === "confirm") {
									try {
										const data = await api.custom.get(
											`pay/internal/merchants/api_key?id=${merchant.id}`,
											context.props.auth?.token
										);
										for (const balance of balances) {
											if (balance.amount === "0") {
												continue;
											}
											await axios.post(
												`${config.apiUrl}/pay/transfers/create`,
												{
													user_id: context.props.auth?.profile.telegram_id,
													contract: balance.contract,
													amount: formatBigint(
														balance.amount,
														balance.decimals
													),
												},
												{
													headers: {
														"AitherCol-Pay-Token": data.api_key,
													},
												}
											);
										}
										await update();
										notificationOccurred("success");
										toast({
											title: context.getTranslation("success"),
											description: context.getTranslation(
												"Withdrawal completed successfully"
											),
										});
									} catch (error) {
										notificationOccurred("error");
										errorHandler(error, toast);
									}
								}
							}}
							alignItems={"center"}
							direction={"column"}
							spacing={2}
							cursor={"pointer"}
						>
							<Box>
								<IconButton
									aria-label="deposit"
									borderRadius={"999px"}
									icon={<FaArrowDown size={"20px"} />}
									colorScheme="button"
								></IconButton>
							</Box>
							<Heading color={"button.500"} size={"sm"}>
								{context.getTranslation("Withdraw")}
							</Heading>
						</Stack>

						<Stack
							onClick={settingsPage.onOpen}
							alignItems={"center"}
							direction={"column"}
							spacing={2}
							cursor={"pointer"}
						>
							<Box>
								<IconButton
									aria-label="deposit"
									borderRadius={"999px"}
									icon={<FaGear size={"20px"} />}
									colorScheme="button"
								></IconButton>
							</Box>
							<Heading color={"button.500"} size={"sm"}>
								{context.getTranslation("settings")}
							</Heading>
						</Stack>
					</Stack>
				</Stack>
			</Center>

			{balances.length === 0 && (
				<Stack direction={"column"} spacing={2}>
					<CellButton
						icon={
							<Center
								w={"24px"}
								h="24px"
								borderRadius={"999px"}
								overflow={"hidden"}
								bgColor={getTelegram().themeParams.accent_text_color}
								color={getTelegram().themeParams.button_text_color}
							>
								<FaBook size={"14px"} />
							</Center>
						}
						title={context.getTranslation("API Documentation")}
						onClick={() => {
							getTelegram().openLink("https://docs.pay.aithercol.com/");
						}}
						rightItem={
							<FaArrowUp
								color={getTelegram().themeParams.hint_color}
								style={{ transform: "rotate(45deg)" }}
							/>
						}
					/>
				</Stack>
			)}

			<Stack direction={"column"} spacing={2}>
				{balances.map(e => (
					<Cell
						icon={
							<LazyLoadImage
								style={{ borderRadius: "999px" }}
								width={"40px"}
								height={"40px"}
								src={e.image}
							/>
						}
						title={e.name}
						subTitle={`$${getRate(e.contract).price.toFixed(2)}`}
						additional={{
							title: `${Number(formatBigint(e.amount, e.decimals)).toFixed(
								2
							)} ${e.symbol}`,
							subTitle: `$${(
								getRate(e.contract).price *
								Number(formatBigint(e.amount, e.decimals))
							).toFixed(2)}`,
						}}
					/>
				))}
			</Stack>
		</>
	);
}
