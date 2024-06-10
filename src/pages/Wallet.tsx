import {
	Box,
	Center,
	Divider,
	Heading,
	IconButton,
	Image,
	Stack,
	Text,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import api from "../api/api";
import Balance from "../api/types/Balance";
import WalletType from "../api/types/Wallet";
import DepositModal from "../components/modals/DepositModal";
import { AppContext } from "../providers/AppProvider";
import { getTelegram } from "../utils";
import { getCacheItemJSON } from "../utils/cache";
import errorHandler, { formatBigint } from "../utils/utils";

function Wallet() {
	const context = useContext(AppContext);
	const toast = useToast();

	const [wallet, setWallet] = useState<WalletType>(getCacheItemJSON("wallet"));
	const [balances, setBalances] = useState<Balance[]>(
		getCacheItemJSON("balances") || []
	);

	useEffect(() => {
		const getBalances = async () => {
			try {
				const data = await api.wallet.get(context.props.auth?.token || "");
				setWallet(data.wallet);
			} catch (error) {
				errorHandler(error, toast);
			}
			try {
				const data = await api.wallet.balances.list(
					context.props.auth?.token || ""
				);
				setBalances(data.balances);
			} catch (error) {
				errorHandler(error, toast);
			}
		};

		getBalances();
	}, []);

	const depositModal = useDisclosure();

	return (
		<>
			<Center h="20vh">
				<Stack direction={"column"} spacing={6} alignItems={"center"}>
					<Heading size={"2xl"}>0.00$</Heading>
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
						<Stack alignItems={"center"} direction={"column"} spacing={2}>
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

			<Stack direction={"column"} spacing={0} mt={4}>
				{balances.map((e, key) => (
					<>
						{key !== 0 && (
							<Divider borderColor={getTelegram().themeParams.hint_color} />
						)}
						<Stack
							p={3}
							direction={"row"}
							justifyContent={"space-between"}
							alignItems={"center"}
							borderRadius={"lg"}
						>
							<Stack alignItems={"center"} direction={"row"} spacing={3}>
								<Image
									borderRadius={"999px"}
									width={"40px"}
									height={"40px"}
									src={e.image}
								/>
								<Stack direction={"column"} spacing={0}>
									<Heading size={"sm"}>{e.name}</Heading>
									<Text
										fontSize={"sm"}
										color={getTelegram().themeParams.subtitle_text_color}
									>
										$0
									</Text>
								</Stack>
							</Stack>
							<Stack alignItems={"end"} direction={"column"} spacing={0}>
								<Heading size={"sm"}>
									{formatBigint(e.amount, e.decimals)} {e.symbol}
								</Heading>
								<Text
									fontSize={"sm"}
									color={getTelegram().themeParams.subtitle_text_color}
								>
									$0
								</Text>
							</Stack>
						</Stack>
					</>
				))}
			</Stack>

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
