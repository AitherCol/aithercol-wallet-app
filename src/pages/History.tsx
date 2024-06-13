import {
	Button,
	Center,
	Heading,
	Stack,
	Text,
	useBoolean,
	useToast,
} from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { PaginationMeta } from "../api/types/BasicResponse";
import Transaction from "../api/types/Transaction";
import Cell from "../components/Cell";
import CustomBackButton from "../components/CustomBackButton";
import { AppContext } from "../providers/AppProvider";
import { HistoryContext } from "../providers/HistoryProviders";
import { getTelegram } from "../utils";
import { getCacheItemJSON, setCacheItem } from "../utils/cache";
import errorHandler, { formatBigint } from "../utils/utils";

function History({ hideBackButton }: { hideBackButton?: boolean }) {
	const context = useContext(AppContext);
	const toast = useToast();
	const router = useContext(HistoryContext);
	const navigate = router.push;
	const params = useParams();
	const [loading, setLoading] = useBoolean();
	const [impactOccurred, notificationOccurred, selectionChanged] =
		useHapticFeedback();

	const [transactions, setTransactions] = useState<Transaction[]>(
		getCacheItemJSON(`transactions:${params.balance}`) || []
	);
	const [meta, setMeta] = useState<PaginationMeta>();

	useEffect(() => {
		const getBalances = async () => {
			try {
				const transactions = await api.wallet.getTransactions(
					{
						balance_id:
							params?.balance !== "all" ? Number(params.balance) : undefined,
						page: 1,
						limit: 25,
					},
					context.props.auth?.token || ""
				);
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
		};

		getBalances();
	}, []);

	const getBalance = (id: number) => {
		const balance = context.balances.find(e => e.id === id);
		if (!balance) {
			return null;
		}
		const rate = context.rates.find(e => e.contract === balance.contract);
		return { ...balance, rate };
	};

	return (
		<Stack direction={"column"} spacing={2}>
			{!hideBackButton && <CustomBackButton />}
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("history")}
			</Heading>

			{transactions.map((e, key) => (
				<Cell
					key={key}
					icon={
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
					}
					title={
						e.description
							? context.getTranslation(e.description.toLowerCase())
							: e.type === "increase"
							? context.getTranslation("received")
							: context.getTranslation("sent")
					}
					subTitle={moment(e.created_at).format("DD MMMM HH:mm")}
					additional={{
						title: `${e.type === "increase" ? "+" : "–"}${Number(
							formatBigint(e.amount, getBalance(e.balance_id)?.decimals || 1)
						).toFixed(2)} ${getBalance(e.balance_id)?.symbol}`,
						subTitle: `$${(
							(getBalance(e.balance_id)?.rate?.price || 0) *
							Number(
								formatBigint(e.amount, getBalance(e.balance_id)?.decimals || 1)
							)
						).toFixed(2)}`,
					}}
					onClick={() => navigate(`/transaction/${e.id}`)}
				/>
			))}

			{meta && (
				<>
					{transactions.length === 0 && (
						<Center>
							<Stack
								alignItems={"center"}
								textAlign={"center"}
								direction={"column"}
								spacing={2}
							>
								<Heading>{context.getTranslation("No History Yet")}</Heading>
								<Text>
									{context.getTranslation(
										"Once you start making transactions, they will appear here"
									)}
								</Text>
							</Stack>
						</Center>
					)}
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

export default History;
