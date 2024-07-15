import {
	Avatar,
	Center,
	Heading,
	Image,
	Stack,
	Text,
	useToast,
} from "@chakra-ui/react";
import {
	BackButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaCalendar, FaPercent } from "react-icons/fa6";
import api from "../api/api";
import Balance from "../api/types/Balance";
import { BasicResponse } from "../api/types/BasicResponse";
import Rate from "../api/types/Rate";
import TransactionType from "../api/types/Transaction";
import InfoCell from "../components/InfoCell";
import LinkedItem from "../components/LinkedItem";
import Loader from "../components/Loader";
import useContacts from "../hooks/useContacts";
import { AppContext } from "../providers/AppProvider";
import { HistoryContext } from "../providers/HistoryProviders";
import { getTelegram } from "../utils";
import errorHandler, {
	formatBigint,
	getTonViewer,
	reduceString,
} from "../utils/utils";

function TransactionPage(params: { id: number; onClose: () => void }) {
	const toast = useToast();
	const router = useContext(HistoryContext);
	const navigate = router.push;
	const context = useContext(AppContext);
	const [impactOccurred, notificationOccurred] = useHapticFeedback();
	const [user, setUser] = useState<any>();
	const [merchant, setMerchant] = useState<any>();
	const { getAddressName } = useContacts();

	const [data, setData] = useState<
		BasicResponse & {
			transaction: TransactionType;
			balance: Balance;
			rate: Rate;
		}
	>();

	useEffect(() => {
		const getData = async () => {
			try {
				const data = await api.wallet.getTransaction(
					params.id as any,
					context.props.auth?.token || ""
				);
				setData(data);

				if (
					data.transaction.description === "Pay" ||
					data.transaction.description === "Payout"
				) {
					try {
						setMerchant(
							await context.getMerchant(
								data.transaction.description === "Pay"
									? JSON.parse(data.transaction.to || "{}").merchant
									: data.transaction.from
							)
						);
					} catch (error) {
						setMerchant({ title: "Unknown Merchant" });
					}
				}

				if (data.transaction.description === "Transfer") {
					try {
						setUser(
							await context.getTelegramUser(
								data.transaction.to || data.transaction.from || ""
							)
						);
					} catch (error) {
						notificationOccurred("error");
						errorHandler(error, toast);
					}
				}
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
				navigate("/");
			}
		};

		getData();
	}, []);

	return (
		<>
			<BackButton onClick={params.onClose} />
			{!data ? (
				<Loader />
			) : (
				<>
					<Center mt="36px" mb="36px">
						<Stack direction={"column"} spacing={6} alignItems={"center"}>
							<Stack
								alignItems={"center"}
								textAlign={"center"}
								direction={"column"}
								spacing={2}
							>
								<Image
									src={data.balance.image}
									w={"80px"}
									h="80px"
									borderRadius={"999px"}
								/>
								<Heading
									color={
										data.transaction.status === "error"
											? getTelegram().themeParams.destructive_text_color
											: data.transaction.status === "waiting"
											? "yellow.500"
											: data.transaction.type === "increase"
											? "green.500"
											: undefined
									}
									size={"2xl"}
								>
									{data.transaction.type === "increase" ? "+" : "–"}
									{formatBigint(
										data.transaction.amount,
										data.balance.decimals
									)}{" "}
									{data.balance.symbol}
								</Heading>
								<Text color={getTelegram().themeParams.subtitle_text_color}>
									$
									{(
										data.rate.price *
										Number(
											formatBigint(
												data.transaction.amount,
												data.balance.decimals
											)
										)
									).toFixed(2)}
								</Text>
							</Stack>
						</Stack>
					</Center>

					<Stack direction={"column"} spacing={2}>
						<InfoCell
							icon={
								<Center
									w={"40px"}
									h="40px"
									borderRadius={"999px"}
									overflow={"hidden"}
									bgColor={getTelegram().themeParams.accent_text_color}
									color={getTelegram().themeParams.button_text_color}
								>
									<FaCalendar size={"20px"} />
								</Center>
							}
							title={context.getTranslation("date")}
							value={moment(data.transaction.created_at).format(
								"DD MMMM HH:mm"
							)}
						/>
						{data.transaction.to && (
							<InfoCell
								icon={
									user ? (
										<Avatar
											w={"40px"}
											h="40px"
											borderRadius={"999px"}
											src={user.photo || undefined}
											name={user.first_name || "unknown"}
										/>
									) : merchant ? (
										<Avatar
											w={"40px"}
											h="40px"
											borderRadius={"999px"}
											src={merchant.photo || undefined}
											name={merchant.title || "unknown"}
										/>
									) : (
										<Center
											w={"40px"}
											h="40px"
											borderRadius={"999px"}
											overflow={"hidden"}
											bgColor={getTelegram().themeParams.accent_text_color}
											color={getTelegram().themeParams.button_text_color}
										>
											<FaArrowUp size={"20px"} />
										</Center>
									)
								}
								title={context.getTranslation("to")}
								value={
									data.transaction.is_address
										? reduceString(getAddressName(data.transaction.to), 20)
										: user
										? reduceString(user.first_name || "Unknown", 20)
										: merchant
										? `<span>${reduceString(
												merchant.title || "Unknown",
												20
										  )}</span> ${
												merchant.is_verified
													? '<i className="verified-icon"></i>'
													: ""
										  }`
										: data.transaction.to
								}
								isLink={data.transaction.is_address || user?.username}
								onClick={
									data.transaction.is_address || user?.username
										? () => {
												if (!user) {
													getTelegram().openLink(
														`${getTonViewer(context)}/${data.transaction.to}`
													);
													return;
												}
												getTelegram().openTelegramLink(
													`https://t.me/${user.username}`
												);
										  }
										: undefined
								}
							/>
						)}
						{data.transaction.from && (
							<InfoCell
								icon={
									user ? (
										<Avatar
											w={"40px"}
											h="40px"
											borderRadius={"999px"}
											src={user.photo || undefined}
											name={user.first_name || "unknown"}
										/>
									) : merchant ? (
										<Avatar
											w={"40px"}
											h="40px"
											borderRadius={"999px"}
											src={merchant.photo || undefined}
											name={merchant.title || "unknown"}
										/>
									) : (
										<Center
											w={"40px"}
											h="40px"
											borderRadius={"999px"}
											overflow={"hidden"}
											bgColor={getTelegram().themeParams.accent_text_color}
											color={getTelegram().themeParams.button_text_color}
										>
											<FaArrowDown size={"20px"} />
										</Center>
									)
								}
								title={context.getTranslation("from")}
								value={
									data.transaction.is_address
										? reduceString(getAddressName(data.transaction.from), 20)
										: user
										? reduceString(user.first_name || "Unknown", 20)
										: merchant
										? `<span>${reduceString(
												merchant.title || "Unknown",
												20
										  )}</span> ${
												merchant.is_verified
													? '<i className="verified-icon"></i>'
													: ""
										  }`
										: data.transaction.from
								}
								isLink={data.transaction.is_address || user?.username}
								onClick={
									data.transaction.is_address || user?.username
										? () => {
												if (!user) {
													getTelegram().openLink(
														`${getTonViewer(context)}/${data.transaction.from}`
													);
													return;
												}
												getTelegram().openTelegramLink(
													`https://t.me/${user.username}`
												);
										  }
										: undefined
								}
							/>
						)}
						{data.transaction.comment && (
							<InfoCell
								alignItems="start"
								icon={<LinkedItem />}
								title={context.getTranslation("comment")}
								value={data.transaction.comment}
							/>
						)}
						<InfoCell
							icon={
								<Image
									borderRadius={"999px"}
									width={"40px"}
									height={"40px"}
									src={data.balance.image}
								/>
							}
							title={context.getTranslation("total_amount")}
							value={`${formatBigint(
								data.transaction.amount,
								data.balance.decimals
							)} ${data.balance.symbol} ($${(
								data.rate.price *
								Number(
									formatBigint(data.transaction.amount, data.balance.decimals)
								)
							).toFixed(2)})`}
						/>
						{data.transaction.type === "decrease" && (
							<>
								<InfoCell
									icon={<LinkedItem />}
									title={context.getTranslation("you_sent")}
									value={`${formatBigint(
										data.transaction.original_amount || data.transaction.amount,
										data.balance.decimals
									)} ${data.balance.symbol} ($${(
										data.rate.price *
										Number(
											formatBigint(
												data.transaction.original_amount ||
													data.transaction.amount,
												data.balance.decimals
											)
										)
									).toFixed(2)})`}
								/>
								<InfoCell
									icon={<LinkedItem />}
									title={context.getTranslation("fee")}
									value={`${formatBigint(
										(
											BigInt(data.transaction.amount) -
											BigInt(
												data.transaction.original_amount ||
													data.transaction.amount
											)
										).toString(),
										data.balance.decimals
									)} ${data.balance.symbol} ($${(
										data.rate.price *
										Number(
											formatBigint(
												(
													BigInt(data.transaction.amount) -
													BigInt(
														data.transaction.original_amount ||
															data.transaction.amount
													)
												).toString(),
												data.balance.decimals
											)
										)
									).toFixed(2)})`}
								/>
							</>
						)}
						{data.transaction.cashback ? (
							<InfoCell
								icon={
									<Center
										w={"40px"}
										h="40px"
										borderRadius={"999px"}
										overflow={"hidden"}
										bgColor={getTelegram().themeParams.accent_text_color}
										color={getTelegram().themeParams.button_text_color}
									>
										<FaPercent size={"20px"} />
									</Center>
								}
								title={context.getTranslation("cashback")}
								value={`${formatBigint(
									data.transaction.cashback,
									data.balance.decimals
								)} ${data.balance.symbol}`}
							/>
						) : (
							<></>
						)}
					</Stack>
				</>
			)}
		</>
	);
}

export default TransactionPage;
