import {
	Box,
	Center,
	Heading,
	IconButton,
	Image,
	Stack,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaMoneyBillTransfer } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Balance from "../api/types/Balance";
import Rate from "../api/types/Rate";
import WalletType from "../api/types/Wallet";
import Cell from "../components/Cell";
import DepositModal from "../components/modals/DepositModal";
import { AppContext } from "../providers/AppProvider";
import { getTelegram } from "../utils";
import { getCacheItemJSON, setCacheItem } from "../utils/cache";
import errorHandler, { formatBigint } from "../utils/utils";

function Wallet() {
	const context = useContext(AppContext);
	const toast = useToast();
	const navigate = useNavigate();

	const [wallet, setWallet] = useState<WalletType>(getCacheItemJSON("wallet"));
	const [balances, setBalances] = useState<Balance[]>(
		getCacheItemJSON("balances") || []
	);
	const [rates, setRates] = useState<Rate[]>(getCacheItemJSON("rates") || []);

	useEffect(() => {
		const getBalances = async () => {
			try {
				const data = await api.wallet.get(context.props.auth?.token || "");
				setWallet(data.wallet);
				setCacheItem("wallet", JSON.stringify(data.wallet));
			} catch (error) {
				errorHandler(error, toast);
			}
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
			} catch (error) {
				errorHandler(error, toast);
			}
		};

		getBalances();
	}, []);

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

	const depositModal = useDisclosure();

	return (
		<>
			<Center h="20vh">
				<Stack direction={"column"} spacing={6} alignItems={"center"}>
					<Heading size={"2xl"}>${getTotalBalance().toFixed(2)}</Heading>
					<Stack direction={"row"} spacing={6}>
						<Stack
							onClick={depositModal.onToggle}
							alignItems={"center"}
							direction={"column"}
							spacing={2}
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
								Deposit
							</Heading>
						</Stack>
						<Stack
							onClick={() => navigate("/withdraw")}
							alignItems={"center"}
							direction={"column"}
							spacing={2}
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
								Withdraw
							</Heading>
						</Stack>
					</Stack>
				</Stack>
			</Center>

			<Stack direction={"column"} spacing={2} mt={4}>
				{balances.map((e, key) => (
					<Cell
						icon={
							<Image
								borderRadius={"999px"}
								width={"40px"}
								height={"40px"}
								src={e.image}
							/>
						}
						title={e.name}
						subTitle={`$${getRate(e.contract).price}`}
						additional={{
							title: `${formatBigint(e.amount, e.decimals)} ${e.symbol}`,
							subTitle: `$${(
								getRate(e.contract).price *
								Number(formatBigint(e.amount, e.decimals))
							).toFixed(2)}`,
						}}
					/>
				))}
			</Stack>

			<Box mt={4}>
				<Cell
					icon={
						<Center
							w={"40px"}
							h="40px"
							borderRadius={"999px"}
							overflow={"hidden"}
							bgColor={getTelegram().themeParams.accent_text_color}
						>
							<FaMoneyBillTransfer size={"24px"} />
						</Center>
					}
					title={"History"}
				/>
			</Box>

			{wallet && (
				<DepositModal
					isOpen={depositModal.isOpen}
					onClose={depositModal.onClose}
					wallet={wallet}
				/>
			)}
		</>
	);
}

export default Wallet;
