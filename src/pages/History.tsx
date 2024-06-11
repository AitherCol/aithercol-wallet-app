import { Center, Heading, Stack, useToast } from "@chakra-ui/react";
import { BackButton } from "@vkruglikov/react-telegram-web-app";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import Balance from "../api/types/Balance";
import { PaginationMeta } from "../api/types/BasicResponse";
import Rate from "../api/types/Rate";
import Transaction from "../api/types/Transaction";
import Cell from "../components/Cell";
import { AppContext } from "../providers/AppProvider";
import { getTelegram } from "../utils";
import { getCacheItemJSON, setCacheItem } from "../utils/cache";
import errorHandler, { formatBigint } from "../utils/utils";

function History({ hideBackButton }: { hideBackButton?: boolean }) {
	const context = useContext(AppContext);
	const toast = useToast();
	const navigate = useNavigate();
	const params = useParams();

	const [balances, setBalances] = useState<Balance[]>(
		getCacheItemJSON("balances") || []
	);
	const [rates, setRates] = useState<Rate[]>(getCacheItemJSON("rates") || []);
	const [transactions, setTransactions] = useState<Transaction[]>(
		getCacheItemJSON(`transactions:${params.balance}`) || []
	);
	const [meta, setMeta] = useState<PaginationMeta>({
		total: 0,
		per_page: 50,
		current_page: 1,
		last_page: null,
	});

	useEffect(() => {
		const getBalances = async () => {
			try {
				const data = await api.wallet.balances.list(
					context.props.auth?.token || ""
				);
				setBalances(data.balances);
				setCacheItem("balances", JSON.stringify(data.balances));
				try {
					const rates = await api.wallet.getRates(
						data.balances.map(e => e.contract),
						context.props.auth?.token || ""
					);
					setRates(rates.rates);
					setCacheItem("rates", JSON.stringify(rates.rates));
				} catch (error) {
					errorHandler(error, toast);
				}
				try {
					const transactions = await api.wallet.getTransactions(
						{
							balance_id:
								params?.balance !== "all" ? Number(params.balance) : undefined,
							page: 1,
							limit: 50,
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
				}
			} catch (error) {
				errorHandler(error, toast);
			}
		};

		getBalances();
	}, []);

	const getBalance = (id: number) => {
		const balance = balances.find(e => e.id === id);
		if (!balance) {
			return null;
		}
		const rate = rates.find(e => e.contract === balance.contract);
		return { ...balance, rate };
	};

	return (
		<Stack direction={"column"} spacing={2}>
			{hideBackButton && (
				<BackButton
					onClick={() => {
						navigate(`/`);
					}}
				/>
			)}
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				History
			</Heading>

			{transactions.map(e => (
				<Cell
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
						>
							{e.type === "increase" ? (
								<FaArrowUp size={"20px"} />
							) : (
								<FaArrowDown size={"20px"} />
							)}
						</Center>
					}
					title={
						e.description || e.type === "increase" ? "Deposit" : "Withdrawal"
					}
					subTitle={moment(e.created_at).format("DD MMMM HH:mm")}
					additional={{
						title: `${formatBigint(
							e.amount,
							getBalance(e.balance_id)?.decimals || 1
						)} ${getBalance(e.balance_id)?.symbol}`,
						subTitle: `$${(
							(getBalance(e.balance_id)?.rate?.price || 0) *
							Number(
								formatBigint(e.amount, getBalance(e.balance_id)?.decimals || 1)
							)
						).toFixed(2)}`,
					}}
				/>
			))}
		</Stack>
	);
}

export default History;
