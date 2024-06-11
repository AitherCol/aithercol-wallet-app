import {
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
import { FaArrowUp, FaCalendar } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import Balance from "../api/types/Balance";
import { BasicResponse } from "../api/types/BasicResponse";
import Rate from "../api/types/Rate";
import TransactionType from "../api/types/Transaction";
import InfoCell from "../components/InfoCell";
import LinkedItem from "../components/LinkedItem";
import Loader from "../components/Loader";
import { AppContext } from "../providers/AppProvider";
import { getTelegram } from "../utils";
import errorHandler, {
	formatBigint,
	getTonViewer,
	reduceString,
} from "../utils/utils";

function Transaction() {
	const params = useParams();
	const toast = useToast();
	const navigate = useNavigate();
	const context = useContext(AppContext);
	const [impactOccurred, notificationOccurred] = useHapticFeedback();

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
			<BackButton onClick={() => navigate("/history/all")} />
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
								<Heading size={"2xl"}>
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
							title="Date"
							value={moment(data.transaction.created_at).format(
								"DD MMMM HH:mm"
							)}
						/>
						{data.transaction.to && (
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
										<FaArrowUp size={"20px"} />
									</Center>
								}
								title="To"
								value={
									data.transaction.is_address
										? reduceString(data.transaction.to, 20)
										: data.transaction.to
								}
								isLink={data.transaction.is_address}
								onClick={
									data.transaction.is_address
										? () =>
												getTelegram().openLink(
													`${getTonViewer(context)}/${data.transaction.to}`
												)
										: undefined
								}
							/>
						)}
						{data.transaction.from && (
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
										<FaArrowUp size={"20px"} />
									</Center>
								}
								title="From"
								value={
									data.transaction.is_address
										? reduceString(data.transaction.from, 20)
										: data.transaction.from
								}
								isLink={data.transaction.is_address}
								onClick={
									data.transaction.is_address
										? () =>
												getTelegram().openLink(
													`${getTonViewer(context)}/${data.transaction.from}`
												)
										: undefined
								}
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
							title="Total amount"
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
									title="You sent"
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
									title="Fee"
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
					</Stack>
				</>
			)}
		</>
	);
}

export default Transaction;
