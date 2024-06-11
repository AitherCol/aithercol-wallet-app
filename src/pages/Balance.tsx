import {
	Box,
	Center,
	Heading,
	IconButton,
	Image,
	Stack,
	Text,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { BackButton } from "@vkruglikov/react-telegram-web-app";
import { useContext, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import BalanceType from "../api/types/Balance";
import Rate from "../api/types/Rate";
import Loader from "../components/Loader";
import DepositModal from "../components/modals/DepositModal";
import useInterval from "../hooks/useInterval";
import { AppContext } from "../providers/AppProvider";
import { getTelegram } from "../utils";
import { getCacheItemJSON, setCacheItem } from "../utils/cache";
import errorHandler, { formatBigint } from "../utils/utils";
import History from "./History";

function Balance() {
	const context = useContext(AppContext);
	const toast = useToast();
	const navigate = useNavigate();
	const params = useParams();

	const [balances, setBalances] = useState<BalanceType[]>(
		getCacheItemJSON("balances") || []
	);
	const [rates, setRates] = useState<Rate[]>(getCacheItemJSON("rates") || []);

	useInterval(() => {
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
			} catch (error) {
				errorHandler(error, toast);
			}
		};

		getBalances();
	}, 10000);

	const getBalance = () => {
		const balance = balances.find(
			e => e.id === (Number(params.balance) as any)
		);
		if (!balance) {
			return null;
		}
		const rate = rates.find(e => e.contract === balance.contract);
		return { ...balance, rate };
	};

	const depositModal = useDisclosure();

	return !getBalance() ? (
		<Loader />
	) : (
		<>
			<BackButton onClick={() => navigate("/")} />
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
								getBalance()?.amount || "0",
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
										getBalance()?.amount || "0",
										getBalance()?.decimals || 1
									)
								)
							).toFixed(2)}
						</Text>
					</Stack>
					<Stack direction={"row"} spacing={6}>
						<Stack
							onClick={depositModal.onToggle}
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
								Deposit
							</Heading>
						</Stack>
						<Stack
							onClick={() => navigate(`/withdraw/${getBalance()?.contract}`)}
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
								Withdraw
							</Heading>
						</Stack>
					</Stack>
				</Stack>
			</Center>

			<History hideBackButton />

			<DepositModal
				isOpen={depositModal.isOpen}
				onClose={depositModal.onClose}
				wallet={getBalance() as any}
			/>
		</>
	);
}

export default Balance;
