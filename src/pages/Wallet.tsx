import {
	Badge,
	Box,
	Center,
	Heading,
	IconButton,
	Stack,
	useDisclosure,
} from "@chakra-ui/react";
import { useShowPopup } from "@vkruglikov/react-telegram-web-app";
import { useContext } from "react";
import {
	FaArrowDown,
	FaArrowRightArrowLeft,
	FaArrowUp,
	FaGift,
	FaKey,
	FaMoneyBillTransfer,
	FaMoneyBills,
	FaStore,
} from "react-icons/fa6";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Rate from "../api/types/Rate";
import Cell from "../components/Cell";
import CellButton from "../components/CellButton";
import Loader from "../components/Loader";
import DepositModal from "../components/modals/DepositModal";
import config from "../config";
import { AppContext } from "../providers/AppProvider";
import { HistoryContext } from "../providers/HistoryProviders";
import { getTelegram } from "../utils";
import { formatBalance, formatBigint } from "../utils/utils";

function Wallet() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const navigate = router.push;

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
				Number(formatBigint(formatBalance(balance), balance.decimals));
		}

		return total;
	};

	const depositModal = useDisclosure();
	const showPopup = useShowPopup();

	return !context.balances ? (
		<Loader />
	) : (
		<>
			<Center mt="36px" mb="36px">
				<Stack direction={"column"} spacing={6} alignItems={"center"}>
					<Stack alignItems={"center"} direction={"row"} spacing={1}>
						<Heading alignItems={"center"} size={"2xl"}>
							${getTotalBalance().toFixed(2)}{" "}
						</Heading>
						{context.props.network === "testnet" && (
							<Badge colorScheme="orange">TEST</Badge>
						)}
					</Stack>
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
								{context.getTranslation("send")}
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
								{context.getTranslation("receive")}
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
								{context.getTranslation("swap")}
							</Heading>
						</Stack>
						{config.isMarketEnabled && (
							<Stack
								onClick={() => navigate("/market")}
								alignItems={"center"}
								direction={"column"}
								spacing={2}
								cursor={"pointer"}
							>
								<Box>
									<IconButton
										aria-label="deposit"
										borderRadius={"999px"}
										icon={<FaStore size={"20px"} />}
										colorScheme="button"
									></IconButton>
								</Box>
								<Heading color={"button.500"} size={"sm"}>
									{context.getTranslation("market")}
								</Heading>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Center>

			{!context.props.auth?.profile.seed_phrase && (
				<Box mb={4}>
					<CellButton
						icon={
							<Center
								w={"24px"}
								h="24px"
								borderRadius={"999px"}
								overflow={"hidden"}
								bgColor={getTelegram().themeParams.accent_text_color}
								color={getTelegram().themeParams.button_text_color}
							>
								<FaKey size={"14px"} />
							</Center>
						}
						title={context.getTranslation("Back up the wallet recovery phrase")}
						onClick={async () => {
							const button = await showPopup({
								title: context.getTranslation("Attention"),
								message: context.getTranslation(
									"Never enter or share this phrase with anyone. This phrase is only needed if you have lost access to your Telegram account."
								),
								buttons: [
									{
										id: "confirm",
										type: "default",
										text: context.getTranslation("Continue"),
									},
									{ type: "cancel" },
								],
							});

							if (button === "confirm") {
								router.push("/settings/recovery/phrase");
							}
						}}
					/>
				</Box>
			)}

			{context.checks.length !== 0 && (
				<Box mb={4}>
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
								<FaMoneyBills size={"20px"} />
							</Center>
						}
						title={context.getTranslation("checks")}
						onClick={() => navigate("/checks")}
					/>
				</Box>
			)}

			<Stack direction={"column"} spacing={2}>
				{context.balances.map((e, key) => (
					<Cell
						icon={
							<LazyLoadImage
								style={{ borderRadius: "999px" }}
								width={"40px"}
								height={"40px"}
								src={e.image}
							/>
						}
						title={e.name}
						subTitle={`$${getRate(e.contract).price.toFixed(2)}`}
						additional={{
							title: `${Number(
								formatBigint(formatBalance(e), e.decimals)
							).toFixed(2)} ${e.symbol}`,
							subTitle: `$${(
								getRate(e.contract).price *
								Number(formatBigint(formatBalance(e), e.decimals))
							).toFixed(2)}`,
						}}
						onClick={() => navigate(`/balance/${e.id}`)}
					/>
				))}
			</Stack>

			<Stack direction={"column"} spacing={4} mt={4}>
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
					title={context.getTranslation("history")}
					onClick={() => navigate("/history/all")}
				/>
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
							<FaGift size={"20px"} />
						</Center>
					}
					title={context.getTranslation("Giveaways")}
					onClick={() => navigate("/giveaways")}
				/>
			</Stack>

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
