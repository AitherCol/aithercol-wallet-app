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
import { useContext, useEffect } from "react";
import {
	FaArrowDown,
	FaArrowRightArrowLeft,
	FaArrowUp,
	FaMoneyBillTransfer,
} from "react-icons/fa6";
import Rate from "../api/types/Rate";
import Cell from "../components/Cell";
import DepositModal from "../components/modals/DepositModal";
import { AppContext } from "../providers/AppProvider";
import { HistoryContext } from "../providers/HistoryProviders";
import { getTelegram } from "../utils";
import { formatBigint } from "../utils/utils";

function Wallet() {
	const context = useContext(AppContext);
	const toast = useToast();
	const router = useContext(HistoryContext);
	const navigate = router.push;

	useEffect(() => {
		context.update();
	}, []);

	const getRate = (contract: string): Rate => {
		const rate = context.rates.find(e => e.contract === contract);
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
		for (const balance of context.balances) {
			total +=
				getRate(balance.contract).price *
				Number(formatBigint(balance.amount, balance.decimals));
		}

		return total;
	};

	const depositModal = useDisclosure();

	return (
		<>
			<Center mt="36px" mb="36px">
				<Stack direction={"column"} spacing={6} alignItems={"center"}>
					<Heading size={"2xl"}>${getTotalBalance().toFixed(2)}</Heading>
					<Stack direction={"row"} spacing={6}>
						<Stack
							onClick={() => navigate("/withdraw")}
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
								Send
							</Heading>
						</Stack>
						<Stack
							alignItems={"center"}
							direction={"column"}
							spacing={2}
							cursor={"pointer"}
							onClick={depositModal.onOpen}
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
								Recieve
							</Heading>
						</Stack>
						<Stack
							onClick={() => navigate("/exchange")}
							alignItems={"center"}
							direction={"column"}
							spacing={2}
							cursor={"pointer"}
						>
							<Box>
								<IconButton
									aria-label="deposit"
									borderRadius={"999px"}
									icon={<FaArrowRightArrowLeft size={"20px"} />}
									colorScheme="button"
								></IconButton>
							</Box>
							<Heading color={"button.500"} size={"sm"}>
								Swap
							</Heading>
						</Stack>
					</Stack>
				</Stack>
			</Center>

			<Stack direction={"column"} spacing={2}>
				{context.balances.map((e, key) => (
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
							title: `${Number(formatBigint(e.amount, e.decimals)).toFixed(
								2
							)} ${e.symbol}`,
							subTitle: `$${(
								getRate(e.contract).price *
								Number(formatBigint(e.amount, e.decimals))
							).toFixed(2)}`,
						}}
						onClick={() => navigate(`/balance/${e.id}`)}
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
							color={getTelegram().themeParams.button_text_color}
						>
							<FaMoneyBillTransfer size={"20px"} />
						</Center>
					}
					title={"History"}
					onClick={() => navigate("/history/all")}
				/>
			</Box>

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

export default Wallet;
