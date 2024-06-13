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
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import { useContext } from "react";
import { FaArrowDown, FaArrowRightArrowLeft, FaArrowUp } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import CustomBackButton from "../components/CustomBackButton";
import Loader from "../components/Loader";
import DepositModal from "../components/modals/DepositModal";
import { AppContext } from "../providers/AppProvider";
import { HistoryContext } from "../providers/HistoryProviders";
import { getTelegram } from "../utils";
import { formatBalance, formatBigint } from "../utils/utils";
import History from "./History";

function Balance() {
	const context = useContext(AppContext);
	const toast = useToast();
	const router = useContext(HistoryContext);
	const navigate = router.push;
	const params = useParams();
	const [impactOccurred, notificationOccurred, selectionChanged] =
		useHapticFeedback();

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
								Send
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
								Recieve
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
									Swap
								</Heading>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Center>

			<History hideBackButton />

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
