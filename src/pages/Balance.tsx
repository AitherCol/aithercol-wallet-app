import {
	Badge,
	Box,
	Button,
	Center,
	Heading,
	IconButton,
	Image,
	SimpleGrid,
	Spinner,
	Stack,
	Text,
	useDisclosure,
	useToast,
	Wrap,
	WrapItem,
} from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import axios from "axios";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { FaArrowDown, FaArrowRightArrowLeft, FaArrowUp } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import api from "../api/api";
import TransactionStats from "../api/types/Stats";
import BoxCell from "../components/BoxCell";
import CustomBackButton from "../components/CustomBackButton";
import LineBar from "../components/LineBar";
import Loader from "../components/Loader";
import DepositModal from "../components/modals/DepositModal";
import { AppContext } from "../providers/AppProvider";
import { HistoryContext } from "../providers/HistoryProviders";
import { getTelegram } from "../utils";
import errorHandler, {
	formatBalance,
	formatBigint,
	getCategoryColor,
	getTonApi,
} from "../utils/utils";

function Balance() {
	const context = useContext(AppContext);
	const toast = useToast();
	const router = useContext(HistoryContext);
	const navigate = router.push;
	const params = useParams();
	const [impactOccurred, notificationOccurred, selectionChanged] =
		useHapticFeedback();
	const [decreaseStats, setDecreaseStats] = useState<TransactionStats>();

	const [type, setType] = useState<
		"day" | "week" | "month" | "6-months" | "year"
	>("month");
	const [rate, setRate] = useState<number[][] | null>(null);

	const getBalance = () => {
		const balance = context.balances.find(
			e => e.id === (Number(params.balance) as any)
		);
		if (!balance) {
			return null;
		}
		const rate = context.rates.find(e => e.contract === balance.contract);
		return { ...balance, rate };
	};

	const depositModal = useDisclosure();

	useEffect(() => {
		(async () => {
			try {
				const data = await api.custom.get(
					`wallet/stats?type=decrease&month=${
						new Date().getMonth() + 1
					}&year=${new Date().getFullYear()}&balance_id=${getBalance()?.id}`,
					context.props.auth?.token
				);
				setDecreaseStats(data.stats);
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
			}
		})();
	}, []);

	useEffect(() => {
		(async () => {
			try {
				setRate(null);
				let start_date = "";
				const end_date = moment().unix().toString();
				if (type === "day") {
					start_date = moment().add({ days: -1 }).unix().toString();
				}
				if (type === "week") {
					start_date = moment().add({ days: -7 }).unix().toString();
				}
				if (type === "month") {
					start_date = moment().add({ months: -1 }).unix().toString();
				}
				if (type === "6-months") {
					start_date = moment().add({ months: -6 }).unix().toString();
				}
				if (type === "year") {
					start_date = moment().add({ years: -1 }).unix().toString();
				}
				const { data } = await axios.get(
					`${getTonApi(context)}/v2/rates/chart?token=${
						getBalance()?.contract
					}&currency=usd&start_date=${start_date}&end_date=${end_date}&points_count=200`
				);
				data.points.reverse();
				setRate(data.points);
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
			}
		})();
	}, [type]);

	const getDiff = () => {
		if (!rate || rate.length === 0) {
			return { color: undefined, text: "0%" };
		}

		const start = rate[0][1];
		const end = rate[rate.length - 1][1];

		let lower = start > end ? end : start;
		let bigger = start > end ? start : end;
		let percentageDifference = (100 * (bigger - lower)) / lower;
		if (percentageDifference === 0) {
			return { color: undefined, text: "0%" };
		}

		return {
			color:
				start > end
					? "var(--aithercol-colors-red-500)"
					: "var(--aithercol-colors-green-500)",
			text: (start > end ? "-" : "+") + `${percentageDifference.toFixed(2)}%`,
		};
	};

	return !getBalance() ? (
		<Loader />
	) : (
		<>
			<CustomBackButton />
			<Center mt="36px" mb="36px">
				<Stack direction={"column"} spacing={6} alignItems={"center"}>
					<Stack
						alignItems={"center"}
						textAlign={"center"}
						direction={"column"}
						spacing={2}
					>
						<Image
							src={getBalance()?.image}
							w={"80px"}
							h="80px"
							borderRadius={"999px"}
						/>
						<Heading size={"2xl"}>
							{formatBigint(
								formatBalance(getBalance() as any),
								getBalance()?.decimals || 1
							)}{" "}
							{getBalance()?.symbol}
						</Heading>
						<Text color={getTelegram().themeParams.subtitle_text_color}>
							$
							{(
								(getBalance()?.rate?.price || 0) *
								Number(
									formatBigint(
										formatBalance(getBalance() as any),
										getBalance()?.decimals || 1
									)
								)
							).toFixed(2)}
						</Text>
					</Stack>
					<Stack direction={"row"} spacing={6}>
						<Stack
							onClick={() => navigate(`/withdraw/${getBalance()?.contract}`)}
							alignItems={"center"}
							direction={"column"}
							spacing={2}
							cursor={"pointer"}
						>
							<Box>
								<IconButton
									aria-label="deposit"
									borderRadius={"999px"}
									icon={<FaArrowUp size={"20px"} />}
									colorScheme="button"
								></IconButton>
							</Box>
							<Heading color={"button.500"} size={"sm"}>
								{context.getTranslation("send")}
							</Heading>
						</Stack>
						<Stack
							onClick={depositModal.onToggle}
							alignItems={"center"}
							direction={"column"}
							spacing={2}
							cursor={"pointer"}
						>
							<Box>
								<IconButton
									aria-label="withdraw"
									borderRadius={"999px"}
									icon={<FaArrowDown size={"20px"} />}
									colorScheme="button"
								></IconButton>
							</Box>
							<Heading color={"button.500"} size={"sm"}>
								{context.getTranslation("receive")}
							</Heading>
						</Stack>
						{(getBalance()?.rate?.price || 0) > 0 && (
							<Stack
								onClick={() =>
									navigate(`/exchange/pool/${getBalance()?.contract}`)
								}
								alignItems={"center"}
								direction={"column"}
								spacing={2}
								cursor={"pointer"}
							>
								<Box>
									<IconButton
										aria-label="withdraw"
										borderRadius={"999px"}
										icon={<FaArrowRightArrowLeft size={"20px"} />}
										colorScheme="button"
									></IconButton>
								</Box>
								<Heading color={"button.500"} size={"sm"}>
									{context.getTranslation("swap")}
								</Heading>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Center>

			<SimpleGrid columns={2} spacing={2} mb={2}>
				<BoxCell
					title={context.getTranslation("Transactions")}
					description={
						!decreaseStats
							? "Loading..."
							: context
									.getTranslation("%amount% spent in %month%")
									.replaceAll(
										"%amount%",
										Number(
											formatBigint(decreaseStats.total, decreaseStats.decimals)
										).toFixed(2) +
											" " +
											getBalance()?.symbol
									)
									.replaceAll("%month%", moment().format("MMMM"))
					}
					onClick={() => router.push(`/history/${getBalance()?.id}`)}
					spacing={"auto"}
					customComponent={
						decreaseStats ? (
							<LineBar
								data={decreaseStats.categories.map(e => {
									return {
										percent: e.percent,
										color: getCategoryColor(e.type),
									};
								})}
							/>
						) : (
							<Box h="12px" />
						)
					}
				/>
				<BoxCell
					title={context.getTranslation("cashback")}
					description={context
						.getTranslation(`To be credited on %date%`)
						.replaceAll(
							"%date%",
							moment().add({ months: 1 }).startOf("month").format("D MMMM")
						)}
					spacing={"auto"}
					customComponent={
						<Badge
							bgColor={getTelegram().themeParams.accent_text_color}
							color={getTelegram().themeParams.button_text_color}
							borderRadius={"md"}
						>
							{formatBigint(
								getBalance()?.cashback_amount || "0",
								getBalance()?.decimals || 1
							)}{" "}
							{getBalance()?.symbol}
						</Badge>
					}
				/>
			</SimpleGrid>

			<BoxCell
				title={context
					.getTranslation("%symbol% Rate")
					.replaceAll("%symbol%", getBalance()?.symbol || "")}
				customComponent={
					!rate ? (
						<Center>
							<Spinner
								color={getTelegram().themeParams.accent_text_color}
								size={"xl"}
							/>
						</Center>
					) : (
						<Stack direction={"column"} spacing={1}>
							<Stack
								direction={"row"}
								justifyContent={"space-between"}
								alignItems={"end"}
							>
								<Stack direction={"column"} spacing={0}>
									<Heading size={"sm"}>
										${getBalance()?.rate?.price.toFixed(4)}
									</Heading>
									<Text fontSize={"sm"} color={getDiff().color}>
										{getDiff().text}
									</Text>
								</Stack>
								{rate.length !== 0 && (
									<Text
										fontSize={"xs"}
										color={getTelegram().themeParams.hint_color}
									>
										${Math.max(...rate.map(o => o[1])).toFixed(4)}
									</Text>
								)}
							</Stack>
							{rate.length !== 0 && (
								<>
									<Stack direction={"column"} spacing={0} h="300px">
										<ResponsiveContainer width="100%" height="100%">
											<AreaChart
												height={300}
												data={rate.map(e => {
													return {
														name: e[0],
														date: moment.unix(e[0]).format("L"),
														price: e[1].toFixed(4),
													};
												})}
											>
												<XAxis fontSize={"12px"} dataKey="date" />
												{/* <YAxis /> */}
												<Tooltip
													content={({ active, payload }) => {
														if (active && payload && payload.length) {
															return (
																<Stack
																	direction={"column"}
																	spacing={0}
																	bgColor={getTelegram().themeParams.bg_color}
																	borderRadius={"md"}
																	p={2}
																>
																	<Text
																		fontSize={"xs"}
																		color={getTelegram().themeParams.hint_color}
																	>
																		{moment
																			.unix(payload[0].payload.name)
																			.format("DD MMM YYYY, HH:mm")}
																	</Text>
																	<Heading size={"sm"}>
																		${payload[0].value}
																	</Heading>
																</Stack>
															);
														}

														return null;
													}}
												/>
												<Area
													type="monotone"
													dataKey="price"
													stroke={
														getDiff().color ||
														getTelegram().themeParams.text_color
													}
													fill={
														getDiff().color ||
														getTelegram().themeParams.text_color
													}
												/>
											</AreaChart>
										</ResponsiveContainer>
										<Stack
											direction={"row"}
											justifyContent={"space-between"}
											alignItems={"top"}
										>
											<Box />
											<Text
												fontSize={"xs"}
												color={getTelegram().themeParams.hint_color}
											>
												${Math.min(...rate.map(o => o[1])).toFixed(4)}
											</Text>
										</Stack>
									</Stack>
									<Wrap justify={"center"} spacing={1}>
										<WrapItem>
											<Button
												colorScheme="button"
												variant={type === "day" ? "solid" : "ghost"}
												size={"sm"}
												onClick={() => setType("day")}
											>
												{context.getTranslation("Day")}
											</Button>
										</WrapItem>
										<WrapItem>
											<Button
												colorScheme="button"
												variant={type === "week" ? "solid" : "ghost"}
												size={"sm"}
												onClick={() => setType("week")}
											>
												{context.getTranslation("Week")}
											</Button>
										</WrapItem>
										<WrapItem>
											<Button
												colorScheme="button"
												variant={type === "month" ? "solid" : "ghost"}
												size={"sm"}
												onClick={() => setType("month")}
											>
												{context.getTranslation("Month")}
											</Button>
										</WrapItem>
										<WrapItem>
											<Button
												colorScheme="button"
												variant={type === "6-months" ? "solid" : "ghost"}
												size={"sm"}
												onClick={() => setType("6-months")}
											>
												{context.getTranslation("6 Months")}
											</Button>
										</WrapItem>
										<WrapItem>
											<Button
												colorScheme="button"
												variant={type === "year" ? "solid" : "ghost"}
												size={"sm"}
												onClick={() => setType("year")}
											>
												{context.getTranslation("Year")}
											</Button>
										</WrapItem>
									</Wrap>
								</>
							)}
						</Stack>
					)
				}
			></BoxCell>

			{context.wallet && (
				<DepositModal
					isOpen={depositModal.isOpen}
					onClose={depositModal.onClose}
					wallet={context.wallet}
				/>
			)}
		</>
	);
}

export default Balance;
