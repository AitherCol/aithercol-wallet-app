import {
	Avatar,
	Box,
	Button,
	Center,
	Heading,
	Select,
	SimpleGrid,
	Stack,
	Text,
	useBoolean,
	useToast,
	Wrap,
	WrapItem,
} from "@chakra-ui/react";
import {
	BackButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { Cell as ChartCell, Pie, PieChart, Tooltip } from "recharts";
import api from "../api/api";
import { PaginationMeta } from "../api/types/BasicResponse";
import TransactionStats from "../api/types/Stats";
import Transaction from "../api/types/Transaction";
import BoxCell from "../components/BoxCell";
import Cell from "../components/Cell";
import LineBar from "../components/LineBar";
import NotFoundBadge from "../components/NotFoundBadge";
import useContacts from "../hooks/useContacts";
import { AppContext } from "../providers/AppProvider";
import { HistoryContext } from "../providers/HistoryProviders";
import { getTelegram } from "../utils";
import { getCacheItemJSON, setCacheItem } from "../utils/cache";
import errorHandler, {
	formatBigint,
	getCategoryColor,
	reduceString,
} from "../utils/utils";
import TransactionPage from "./Transaction";

function History({ hideBackButton }: { hideBackButton?: boolean }) {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const toast = useToast();
	const params = useParams();
	const [loading, setLoading] = useBoolean();
	const { 1: notificationOccurred } = useHapticFeedback();
	const [type, setType] = useState<"increase" | "decrease" | undefined>(
		undefined
	);
	const [category, setCategory] = useState<string | undefined>(undefined);
	const [month, setMonth] = useState<number | undefined>(
		new Date().getMonth() + 1
	);
	const [year, setYear] = useState<number | undefined>(
		new Date().getFullYear()
	);

	const [transactions, setTransactions] = useState<Transaction[]>(
		getCacheItemJSON(`transactions:${params.balance}`) || []
	);
	const { getAddressName } = useContacts();
	const [meta, setMeta] = useState<PaginationMeta>();
	const [transaction, setTransaction] = useState<Transaction | null>(null);

	const [decreaseStats, setDecreaseStats] = useState<TransactionStats>(
		getCacheItemJSON(`transactions:${params.balance}:stats:decrease`)
	);
	const [increaseStats, setIncreaseStats] = useState<TransactionStats>(
		getCacheItemJSON(`transactions:${params.balance}:stats:increase`)
	);

	const getBalance = (id: number) => {
		const balance = context.balances.find(e => e.id === id);
		if (!balance) {
			return null;
		}
		const rate = context.rates.find(e => e.contract === balance.contract);
		return { ...balance, rate };
	};

	useEffect(() => {
		const getBalances = async () => {
			try {
				const transactions = await api.wallet.getTransactions(
					{
						balance_id:
							params?.balance !== "all" ? Number(params.balance) : undefined,
						page: 1,
						limit: 25,
						type,
						category,
						month,
						year,
					},
					context.props.auth?.token || ""
				);

				try {
					const data = await api.custom.get(
						`wallet/stats?type=decrease&month=${month}&year=${year}&balance_id=${
							params.balance !== "all" ? params.balance : ""
						}`,
						context.props.auth?.token
					);
					setDecreaseStats(data.stats);
					setCacheItem(
						`transactions:${params.balance}:stats:decrease`,
						JSON.stringify(data.stats)
					);
				} catch (error) {
					errorHandler(error, toast);
					notificationOccurred("error");
				}

				try {
					const data = await api.custom.get(
						`wallet/stats?type=increase&month=${month}&year=${year}&balance_id=${
							params.balance !== "all" ? params.balance : ""
						}`,
						context.props.auth?.token
					);
					setIncreaseStats(data.stats);
					setCacheItem(
						`transactions:${params.balance}:stats:increase`,
						JSON.stringify(data.stats)
					);
				} catch (error) {
					errorHandler(error, toast);
					notificationOccurred("error");
				}

				setMeta(transactions.transactions.meta);
				setTransactions(transactions.transactions.data);
				setCacheItem(
					`transactions:${params.balance}`,
					JSON.stringify(transactions.transactions.data)
				);
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
			}
			window.scrollTo(0, 0);
		};

		getBalances();
	}, [type, category, year, month]);

	const Chart = ({ stats }: { stats: TransactionStats }) => {
		const getAmount = (categoryOverride?: string) => {
			if (!categoryOverride) {
				categoryOverride = category;
			}
			if (categoryOverride) {
				return (
					(params?.balance !== "all" ? "" : "$") +
					formatBigint(
						stats.categories.find(e => e.type === categoryOverride)?.amount ||
							"0",
						stats.decimals
					) +
					" " +
					(params?.balance !== "all"
						? getBalance(Number(params.balance))?.symbol || ""
						: "")
				);
			}
			return (
				(params?.balance !== "all" ? "" : "$") +
				Number(formatBigint(stats.total, stats.decimals)).toFixed(
					params?.balance !== "all" ? stats.decimals : 2
				) +
				" " +
				(params?.balance !== "all"
					? getBalance(Number(params.balance))?.symbol || ""
					: "")
			);
		};
		const data = stats.categories.map(e => {
			return {
				name: context.getTranslation(`stats.${e.type}`),
				value: e.percent,
				amount: getAmount(e.type),
			};
		});

		if (category) {
			return (
				<Box w="full">
					<Cell
						title={context.getTranslation(`stats.${category}`)}
						subTitle={context.getTranslation(
							type === "increase" ? "Income" : "Spending"
						)}
						additional={{ title: getAmount() }}
					/>
				</Box>
			);
		}

		if (stats.total === "0") {
			return <></>;
		}

		return (
			<Stack direction={"column"} spacing={2}>
				<Center>
					<Center w="100px" h="170px" position={"absolute"}>
						<Heading textAlign={"center"} size={"sm"}>
							{(params?.balance !== "all" ? "" : "$") +
								Number(formatBigint(stats.total, stats.decimals)).toFixed(
									params?.balance !== "all" ? stats.decimals : 2
								) +
								" " +
								(params?.balance !== "all"
									? getBalance(Number(params.balance))?.symbol || ""
									: "")}
						</Heading>
					</Center>
					<PieChart width={170} height={170}>
						<Tooltip
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									return (
										<Stack
											cursor={"pointer"}
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
												{payload[0].name} | {payload[0].value}%
											</Text>
											<Heading size={"sm"}>{payload[0].payload.amount}</Heading>
										</Stack>
									);
								}

								return null;
							}}
						/>
						<Pie
							data={data}
							innerRadius={60}
							outerRadius={80}
							isAnimationActive={false}
							paddingAngle={5}
							dataKey="value"
						>
							{stats.categories.map((entry, index) => (
								<ChartCell
									key={`cell-${index}`}
									fill={getCategoryColor(entry.type)}
									stroke={getCategoryColor(entry.type)}
									className="chart-no-outline"
								/>
							))}
						</Pie>
					</PieChart>
				</Center>

				<Wrap justify={"center"}>
					{stats.categories.map(entry => (
						<WrapItem onClick={() => setCategory(entry.type)}>
							<Stack
								borderRadius={"md"}
								p={1}
								direction={"row"}
								alignItems={"center"}
								paddingInlineStart={2}
								paddingInlineEnd={2}
								fontSize={"xs"}
								spacing={2}
								cursor={"pointer"}
								bg={getCategoryColor(entry.type) + "20"}
							>
								<Box
									bg={getCategoryColor(entry.type)}
									w="14px"
									h="14px"
									borderRadius={"999px"}
								></Box>
								<span>{context.getTranslation(`stats.${entry.type}`)}</span>
							</Stack>
						</WrapItem>
					))}
				</Wrap>
			</Stack>
		);
	};

	if (transaction) {
		return (
			<TransactionPage
				id={transaction.id}
				onClose={() => {
					setTransaction(null);
				}}
			/>
		);
	}

	return (
		<Stack direction={"column"} spacing={2}>
			<BackButton
				onClick={() => {
					if (type) {
						if (category) {
							setCategory(undefined);
							return;
						}
						setType(undefined);
						return;
					}
					router.back();
				}}
			/>

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("history")}{" "}
				{params.balance !== "all"
					? getBalance(Number(params.balance))?.symbol
					: ""}
			</Heading>

			<Stack direction={"row"} spacing={2}>
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
					value={month?.toString()}
					onChange={e => {
						setCategory(undefined);
						setMonth(Number(e.currentTarget.value));
					}}
				>
					{Array.from(new Array(12), (x, i) => i).map(e => (
						<option value={e + 1}>{moment().month(e).format("MMMM")}</option>
					))}
				</Select>
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
					value={year?.toString()}
					onChange={e => {
						setCategory(undefined);
						setYear(Number(e.currentTarget.value));
					}}
				>
					<option value={"2024"}>2024</option>
				</Select>
			</Stack>

			{/* <Tabs colorScheme="button">
				<Center>
					<TabList>
						<Tab>{context.getTranslation("Spending")}</Tab>
						<Tab>{context.getTranslation("Income")}</Tab>
					</TabList>
				</Center>

				<TabPanels>
					<TabPanel>
						<Center>
							{!decreaseStats && (
								<Spinner
									color={getTelegram().themeParams.accent_text_color}
									size={"xl"}
								/>
							)}
							{decreaseStats && <Chart stats={decreaseStats} />}
						</Center>
					</TabPanel>
					<TabPanel>
						<Center>
							{!increaseStats && (
								<Spinner
									color={getTelegram().themeParams.accent_text_color}
									size={"xl"}
								/>
							)}
							{increaseStats && <Chart stats={increaseStats} />}
						</Center>
					</TabPanel>
				</TabPanels>
			</Tabs> */}

			{meta && (
				<>
					{transactions.length !== 0 || type ? (
						<>
							{(!type && (
								<>
									{decreaseStats && increaseStats ? (
										<SimpleGrid columns={2} spacing={2}>
											<BoxCell
												title={
													params.balance !== "all"
														? `${formatBigint(
																decreaseStats.total,
																decreaseStats.decimals
														  )} ${getBalance(Number(params.balance))?.symbol}`
														: `$${Number(
																formatBigint(
																	decreaseStats.total,
																	decreaseStats.decimals
																)
														  ).toFixed(2)}`
												}
												description={context.getTranslation("Spending")}
												onClick={() => setType("decrease")}
												customComponent={
													<LineBar
														data={decreaseStats.categories.map(e => {
															return {
																percent: e.percent,
																color: getCategoryColor(e.type),
															};
														})}
													/>
												}
											/>
											<BoxCell
												title={
													params.balance !== "all"
														? `${formatBigint(
																increaseStats.total,
																increaseStats.decimals
														  )} ${getBalance(Number(params.balance))?.symbol}`
														: `$${Number(
																formatBigint(
																	increaseStats.total,
																	increaseStats.decimals
																)
														  ).toFixed(2)}`
												}
												description={context.getTranslation("Income")}
												onClick={() => setType("increase")}
												customComponent={
													<LineBar
														data={increaseStats.categories.map(e => {
															return {
																percent: e.percent,
																color: getCategoryColor(e.type),
															};
														})}
													/>
												}
											/>
										</SimpleGrid>
									) : (
										<></>
									)}
								</>
							)) || (
								<Center>
									<Chart
										stats={type === "increase" ? increaseStats : decreaseStats}
									/>
								</Center>
							)}
						</>
					) : (
						<></>
					)}

					{transactions.length === 0 && (
						<NotFoundBadge text={context.getTranslation("No History Yet")} />
					)}
					{transactions.map(e => (
						<TransactionComponent
							getAddressName={getAddressName}
							e={e}
							setTransaction={setTransaction}
						/>
					))}
					{meta?.current_page !== meta?.last_page && (
						<Button
							isDisabled={loading}
							onClick={async () => {
								try {
									setLoading.on();
									const data = await api.wallet.getTransactions(
										{
											balance_id:
												params?.balance !== "all"
													? Number(params.balance)
													: undefined,
											page: meta.current_page + 1,
											limit: 25,
											type,
											month,
											year,
											category,
										},
										context.props.auth?.token || ""
									);

									setTransactions([...transactions, ...data.transactions.data]);
									setMeta(data.transactions.meta);
								} catch (error) {
									errorHandler(error, toast);
									notificationOccurred("error");
								} finally {
									setLoading.off();
								}
							}}
							colorScheme="button"
						>
							{context.getTranslation("show_more")}
						</Button>
					)}
				</>
			)}
		</Stack>
	);
}

export function TransactionComponent({
	e,
	getAddressName,
	setTransaction,
}: {
	e: Transaction;
	getAddressName: any;
	setTransaction: any;
}) {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const navigate = router.push;
	const getBalance = (id: number) => {
		const balance = context.balances.find(e => e.id === id);
		if (!balance) {
			return null;
		}
		const rate = context.rates.find(e => e.contract === balance.contract);
		return { ...balance, rate };
	};

	const [user, setUser] = useState<any>();
	const [merchant, setMerchant] = useState<any>();
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	useEffect(() => {
		(async () => {
			setUser(null);
			setMerchant(null);
			if (e.description === "Pay" || e.description === "Payout") {
				try {
					setMerchant(
						await context.getMerchant(
							e.description === "Pay"
								? JSON.parse(e.to || "{}").merchant
								: e.from
						)
					);
				} catch (error) {
					setMerchant({ title: "Unknown Merchant" });
				}
			}
			if (e.description === "Transfer") {
				try {
					setUser(await context.getTelegramUser(e.to || e.from || ""));
				} catch (error) {
					notificationOccurred("error");
					errorHandler(error, toast);
				}
			}
		})();
	}, [e]);

	const getTitle = () => {
		if (e.description) {
			if (e.description === "Transfer") {
				return user ? user.first_name : "...";
			}
			if (e.description === "Pay") {
				return merchant?.title || "Pay";
			}
			if (e.description === "Payout") {
				return merchant ? merchant.title : "...";
			}
			return context.getTranslation(e.description.toLowerCase());
		}
		if (e.from) {
			return getAddressName(e.from);
		}
		if (e.to) {
			return getAddressName(e.to);
		}
		return e.type === "increase"
			? context.getTranslation("received")
			: context.getTranslation("sent");
	};

	return (
		<Cell
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
						bgColor={
							e.type === "increase"
								? getTelegram().themeParams.accent_text_color
								: getTelegram().themeParams.secondary_bg_color
						}
						color={
							e.type === "increase"
								? getTelegram().themeParams.button_text_color
								: getTelegram().themeParams.text_color
						}
					>
						{e.type === "increase" ? (
							<FaArrowDown size={"20px"} />
						) : (
							<FaArrowUp size={"20px"} />
						)}
					</Center>
				)
			}
			title={
				<Stack direction={"row"} spacing={1} alignItems={"center"}>
					<span>{reduceString(getTitle(), 16)}</span>
					{e.cashback ? (
						<Text
							fontSize={"10px"}
							color={getTelegram().themeParams.accent_text_color}
						>
							+
							{formatBigint(
								e.cashback,
								getBalance(e.balance_id)?.decimals || 9
							)}
						</Text>
					) : (
						<></>
					)}
				</Stack>
			}
			subTitle={
				e.status === "ok"
					? moment(e.updated_at).format("DD MMMM HH:mm")
					: e.status === "error"
					? context.getTranslation("error")
					: context.getTranslation("in_progress")
			}
			additional={{
				title: `${e.type === "increase" ? "+" : "–"}${Number(
					formatBigint(e.amount, getBalance(e.balance_id)?.decimals || 1)
				).toFixed(2)} ${getBalance(e.balance_id)?.symbol}`,
				titleColor:
					e.status === "error"
						? getTelegram().themeParams.destructive_text_color
						: e.status === "waiting"
						? "yellow.500"
						: e.type === "increase"
						? "green.500"
						: undefined,
				subTitle: `$${(
					(getBalance(e.balance_id)?.rate?.price || 0) *
					Number(
						formatBigint(e.amount, getBalance(e.balance_id)?.decimals || 1)
					)
				).toFixed(2)}`,
			}}
			onClick={() => setTransaction(e)}
		/>
	);
}

export default History;
