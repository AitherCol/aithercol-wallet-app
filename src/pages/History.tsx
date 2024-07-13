import {
	Avatar,
	Button,
	Center,
	Heading,
	Stack,
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
import NotFoundBadge from "../components/NotFoundBadge";
import useContacts from "../hooks/useContacts";
import { AppContext } from "../providers/AppProvider";
import { HistoryContext } from "../providers/HistoryProviders";
import { getTelegram } from "../utils";
import { getCacheItemJSON, setCacheItem } from "../utils/cache";
import errorHandler, { formatBigint, reduceString } from "../utils/utils";

function History({ hideBackButton }: { hideBackButton?: boolean }) {
	const context = useContext(AppContext);
	const toast = useToast();
	const params = useParams();
	const [loading, setLoading] = useBoolean();
	const { 1: notificationOccurred } = useHapticFeedback();

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

			{transactions.map(e => (
				<TransactionComponent e={e} />
			))}

			{meta && (
				<>
					{transactions.length === 0 && (
						<NotFoundBadge text={context.getTranslation("No History Yet")} />
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

export function TransactionComponent({ e }: { e: Transaction }) {
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
	const { getAddressName } = useContacts();

	useEffect(() => {
		(async () => {
			setUser(null);
			setMerchant(null);
			if (e.description === "Pay" || e.description === "Payout") {
				try {
					const data = await api.custom.get(
						`pay/internal/merchants/cached?id=${
							e.description === "Pay"
								? JSON.parse(e.to || "{}").merchant
								: e.from
						}`,
						context.props.auth?.token
					);
					setMerchant(data.merchant);
				} catch (error) {
					notificationOccurred("error");
					errorHandler(error, toast);
				}
			}
			if (e.description === "Transfer") {
				try {
					const data = await api.custom.get(
						`get_telegram_profile?id=${e.to || e.from}`,
						context.props.auth?.token
					);
					setUser(data.profile);
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
			title={reduceString(getTitle(), 16)}
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
			onClick={() => navigate(`/transaction/${e.id}`)}
		/>
	);
}

export default History;
