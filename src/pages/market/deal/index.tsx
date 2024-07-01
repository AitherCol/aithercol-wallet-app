import {
	Avatar,
	Box,
	Button,
	Center,
	Heading,
	Stack,
	Text,
	useToast,
} from "@chakra-ui/react";
import {
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import HTMLReactParser from "html-react-parser";
import moment from "moment";
import { useContext, useState } from "react";
import Countdown from "react-countdown";
import { FaComment, FaStar } from "react-icons/fa6";
import { IoWarning } from "react-icons/io5";
import { useParams } from "react-router-dom";
import { getDealStatuses } from "..";
import api from "../../../api/api";
import Deal from "../../../api/types/Deal";
import { UserMarketMethod } from "../../../api/types/MarketMethod";
import Offer from "../../../api/types/Offer";
import Rate from "../../../api/types/Rate";
import User from "../../../api/types/User";
import CustomBackButton from "../../../components/CustomBackButton";
import InfoCell from "../../../components/InfoCell";
import InfoRawCell from "../../../components/InfoRawCell";
import Loader from "../../../components/Loader";
import useInterval from "../../../hooks/useInterval";
import { AppContext } from "../../../providers/AppProvider";
import { HistoryContext } from "../../../providers/HistoryProviders";
import { MarketContext } from "../../../providers/MarketProvider";
import { getTelegram } from "../../../utils";
import errorHandler, { formatBigint } from "../../../utils/utils";
import DealerWaiting from "./statuses/DealerWaiting";
import SendMethod from "./statuses/SendMethod";
import SendPayment from "./statuses/SendPayment";
import WaitingPaymentConfirmation from "./statuses/WaitingPaymentConfirmation";

export interface DealStatusProps {
	dealInfo: {
		deal: Deal;
		rate: Rate;
		user: User;
		dealer: User;
		offer: Offer | null;
		method: UserMarketMethod | null;
	};
	update: (disableVibration?: boolean) => void;
}

export default function DealPage() {
	const router = useContext(HistoryContext);
	const context = useContext(AppContext);
	const market = useContext(MarketContext);
	const params = useParams();
	const [dealInfo, setDealInfo] = useState<{
		deal: Deal;
		rate: Rate;
		user: User;
		dealer: User;
		offer: Offer | null;
		method: UserMarketMethod | null;
	} | null>(null);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const update = async (disableVibration?: boolean) => {
		try {
			const data = await api.custom.get(
				`wallet/market/deals/get?id=${params.id}`,
				context.props.auth?.token
			);

			if (data.deal.status !== dealInfo?.deal.status && !disableVibration) {
				notificationOccurred("warning");
				context.updateProfile();
				context.update();
			}
			setDealInfo(data);
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
			router.push("/");
		}
	};

	useInterval(update, 10000);

	const isDealer = dealInfo?.deal?.dealer_id === context.props.auth?.profile.id;
	const isUser = dealInfo?.deal?.user_id === context.props.auth?.profile.id;
	const isBuy = !(
		(isDealer && dealInfo?.deal.type === "buy") ||
		(isUser && dealInfo?.deal.type === "sell")
	);

	const getContract = () => {
		return market.tokens?.find(e => e.contract === dealInfo?.deal.contract);
	};
	const getMyMethod = (id: number) => {
		return market.myMethods?.find(e => e.id === id);
	};
	const getMethod = (id: number) => {
		return market.methods?.find(e => e.id === id);
	};

	const isSendPaymentStatus =
		(isDealer &&
			dealInfo?.deal.type === "buy" &&
			dealInfo.deal.status === "waiting_payment") ||
		(isUser &&
			dealInfo?.deal.type === "sell" &&
			dealInfo.deal.status === "waiting_payment");

	const canCancel =
		dealInfo?.deal.status !== "canceled" &&
		dealInfo?.deal.status !== "success" &&
		((isUser && dealInfo?.deal.status === "waiting") ||
			(dealInfo?.deal.is_dispute_opened &&
				((isUser && dealInfo.deal.type === "sell") ||
					(isDealer && dealInfo?.deal.type === "buy"))));

	const isWaitingPaymentConfirmationWithoutDispute =
		(isDealer &&
			dealInfo?.deal.type === "buy" &&
			dealInfo.deal.status === "payment_sent") ||
		(isUser &&
			dealInfo?.deal.type === "sell" &&
			dealInfo.deal.status === "payment_sent");
	const isWaitingPaymentConfirmation =
		isWaitingPaymentConfirmationWithoutDispute &&
		!dealInfo.deal.is_dispute_opened;

	return !dealInfo ? (
		<Loader />
	) : (
		<Stack direction={"column"} spacing={4}>
			<CustomBackButton />
			{isWaitingPaymentConfirmation && (
				<WaitingPaymentConfirmation update={update} dealInfo={dealInfo} />
			)}
			{!isWaitingPaymentConfirmation && (
				<>
					<Stack
						direction={"column"}
						spacing={2}
						alignItems={"center"}
						textAlign={"center"}
					>
						<Stack alignItems={"center"} direction={"row"} spacing={2}>
							<Avatar
								size={"sm"}
								name={(isDealer ? dealInfo.user : dealInfo.dealer).name}
							/>
							<Text fontSize={"md"}>
								{HTMLReactParser(
									context
										.getTranslation(
											isBuy
												? "You are selling to <b>%user%</b>"
												: "You are buying from <b>%user%</b>"
										)
										.replaceAll(
											"%user%",
											(isDealer ? dealInfo.user : dealInfo.dealer).name
										)
								)}
							</Text>
							{(isDealer ? dealInfo.user : dealInfo.dealer).is_premium && (
								<FaStar size={"18px"} />
							)}
						</Stack>

						<Heading>
							{formatBigint(dealInfo.deal.amount, getContract()?.decimals || 1)}{" "}
							{getContract()?.symbol}
						</Heading>

						<Text
							onClick={() => {
								window.navigator.clipboard.writeText(`#D${dealInfo.deal.id}`);
								toast({ title: context.getTranslation("Copied to clipboard") });
							}}
							fontFamily={'"Fira Code", monospace'}
							cursor={"pointer"}
						>
							<span style={{ color: getTelegram().themeParams.hint_color }}>
								#
							</span>
							D{dealInfo.deal.id}
						</Text>
					</Stack>

					{isDealer && dealInfo.deal.status === "waiting" && (
						<DealerWaiting dealInfo={dealInfo} update={update} />
					)}

					{isUser || dealInfo.deal.status !== "waiting" ? (
						<Stack direction={"column"} spacing={2}>
							{dealInfo.deal.is_dispute_opened && (
								<>
									<InfoCell
										title={context.getTranslation("Dispute Opened")}
										value={context.getTranslation(
											"Send evidence of your case to support"
										)}
										isLink
										icon={
											<Box
												color={getTelegram().themeParams.destructive_text_color}
											>
												<IoWarning size={"20px"} />
											</Box>
										}
										onClick={() => {
											getTelegram().openTelegramLink(
												"https://t.me/AitherColSupport"
											);
										}}
									/>
								</>
							)}
							<InfoCell
								title={context.getTranslation("Status")}
								value={
									dealInfo.deal.status === "waiting"
										? context.getTranslation("Waiting for confirmation")
										: getDealStatuses(context)[dealInfo.deal.status].text
								}
								icon={getDealStatuses(context)[dealInfo.deal.status].icon}
							/>

							{dealInfo.deal.status === "payment_sent" &&
								!isWaitingPaymentConfirmationWithoutDispute && (
									<>
										<InfoCell
											title={context.getTranslation("Warning")}
											value={context.getTranslation(
												"Check if you received the payment"
											)}
											icon={
												<Box color={"yellow.500"}>
													<IoWarning size={"20px"} />
												</Box>
											}
										/>

										<Countdown
											date={moment(dealInfo.deal.expired_at).valueOf()}
											renderer={({ minutes, seconds, completed }) => {
												if (completed) {
													return dealInfo.deal.is_dispute_opened ? null : (
														<Box>
															<Button
																variant="link"
																colorScheme="button"
																onClick={async () => {
																	try {
																		await api.custom.post(
																			"wallet/market/deals/handle",
																			context.props.auth?.token,
																			{
																				id: dealInfo.deal.id,
																				action: "open_dispute",
																			}
																		);
																		await update(true);
																		notificationOccurred("success");
																	} catch (error) {
																		notificationOccurred("error");
																		errorHandler(error, toast);
																	}
																}}
															>
																{context.getTranslation("Open Dispute")}
															</Button>
														</Box>
													);
												}
												const formatTime = (time: number) => {
													if (time.toString().length === 2) {
														return time.toString();
													}
													return `0${time}`;
												};
												return (
													<Text
														fontSize={"md"}
														color={getTelegram().themeParams.hint_color}
													>
														{context.getTranslation("Complete this operation")}{" "}
														{context.getTranslation("within")} {minutes}:
														{formatTime(seconds)}
													</Text>
												);
											}}
										/>

										<MainButton
											text={context.getTranslation("Confirm Payment (action)")}
											onClick={async () => {
												try {
													getTelegram().MainButton.showProgress();
													await api.custom.post(
														"wallet/market/deals/handle",
														context.props.auth?.token,
														{ id: dealInfo.deal.id, action: "payment_received" }
													);
													await update(true);
													notificationOccurred("success");
												} catch (error) {
													notificationOccurred("error");
													errorHandler(error, toast);
												} finally {
													getTelegram().MainButton.hideProgress();
												}
											}}
										/>
									</>
								)}

							{isUser && dealInfo.deal.status === "waiting_method" && (
								<SendMethod dealInfo={dealInfo} update={update} />
							)}
						</Stack>
					) : null}

					{isSendPaymentStatus && (
						<SendPayment dealInfo={dealInfo} update={update} />
					)}

					<Stack direction={"column"} spacing={2}>
						<InfoRawCell
							title={context.getTranslation("amount")}
							value={
								isBuy
									? `${dealInfo.deal.amount_fiat} ${dealInfo.deal.currency}`
									: `${formatBigint(
											dealInfo.deal.amount,
											getContract()?.decimals || 1
									  )} ${getContract()?.symbol}`
							}
						/>
						<InfoRawCell
							title={context
								.getTranslation("Price per %amount%")
								.replaceAll("%amount%", `1 ${getContract()?.symbol}`)}
							value={`${(
								dealInfo.deal.amount_fiat /
								Number(
									formatBigint(
										dealInfo.deal.amount,
										getContract()?.decimals || 1
									)
								)
							).toFixed(2)} ${dealInfo.deal.currency}`}
						/>
						<InfoRawCell
							title={context.getTranslation("Payment Method")}
							value={`${
								context.props.auth?.profile.language === "ru"
									? getMethod(dealInfo.deal.method_type)?.name_ru ||
									  getMethod(dealInfo.deal.method_type)?.name_en
									: getMethod(dealInfo.deal.method_type)?.name_en
							}`}
						/>
					</Stack>

					{isUser && dealInfo.offer && dealInfo.offer.description && (
						<Stack direction={"column"} spacing={2}>
							<InfoCell
								alignItems="start"
								icon={
									<Center
										w={"40px"}
										h="40px"
										minW="40px"
										minH="40px"
										maxW="40px"
										maxH="40px"
										borderRadius={"999px"}
										overflow={"hidden"}
										bgColor={getTelegram().themeParams.accent_text_color}
										color={getTelegram().themeParams.button_text_color}
									>
										<FaComment size={"20px"} />
									</Center>
								}
								title="Description"
								value={dealInfo.offer.description}
							/>
							<Text
								fontSize={"sm"}
								color={getTelegram().themeParams.hint_color}
							>
								⚠️{" "}
								{context.getTranslation(
									"Only scammers offer communication and deals outside the P2P Market"
								)}
							</Text>
						</Stack>
					)}

					<Stack direction={"column"} spacing={2}>
						<Heading
							size={"sm"}
							color={getTelegram().themeParams.hint_color}
							textTransform={"uppercase"}
						>
							{context.getTranslation(isBuy ? "Buyer Info" : "Seller Info")}
						</Heading>
						<InfoRawCell
							title={context.getTranslation("Name")}
							value={`${(isDealer ? dealInfo.user : dealInfo.dealer).name}`}
						/>
						<InfoRawCell
							title={context.getTranslation("Stats")}
							value={`${
								(isDealer ? dealInfo.user : dealInfo.dealer).deals
							} ${context.getTranslation("deals")} • ${
								(isDealer ? dealInfo.user : dealInfo.dealer).deals !== 0
									? (
											(((isDealer ? dealInfo.user : dealInfo.dealer)
												.completed_deals || 0) /
												((isDealer ? dealInfo.user : dealInfo.dealer).deals ||
													0)) *
											100
									  ).toFixed(0)
									: "0"
							}%`}
						/>

						{canCancel && (
							<MainButton
								text={context.getTranslation("Cancel")}
								textColor={getTelegram().themeParams.button_text_color}
								color={getTelegram().themeParams.destructive_text_color}
								onClick={async () => {
									try {
										getTelegram().MainButton.showProgress();
										await api.custom.post(
											"wallet/market/deals/cancel",
											context.props.auth?.token,
											{ id: dealInfo.deal.id }
										);
										await market.update();
										notificationOccurred("success");
										router.push("/market", false, "/");
									} catch (error) {
										errorHandler(error, toast);
										notificationOccurred("error");
									} finally {
										getTelegram().MainButton.hideProgress();
									}
								}}
							/>
						)}
					</Stack>
				</>
			)}
		</Stack>
	);
}
