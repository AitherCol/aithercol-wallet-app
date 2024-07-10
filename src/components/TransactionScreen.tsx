import {
	Button,
	Center,
	Heading,
	Image,
	Stack,
	Text,
	useInterval,
	useToast,
} from "@chakra-ui/react";
import {
	BackButton,
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import Lottie from "lottie-react";
import { useContext, useEffect, useState } from "react";

import api from "../api/api";
import Transaction from "../api/types/Transaction";
import useContacts from "../hooks/useContacts";
import { AppContext } from "../providers/AppProvider";
import { HistoryContext } from "../providers/HistoryProviders";
import loopmoney from "../stickers/loopmoney.json";
import errorHandler, { formatBigint, reduceString } from "../utils/utils";

export default function TransactionScreen(props: { transaction: Transaction }) {
	const [transaction, setTransaction] = useState<Transaction>(
		props.transaction
	);
	const context = useContext(AppContext);
	const { 1: notificationOccurred } = useHapticFeedback();
	const toast = useToast();
	const { getAddressName, contacts } = useContacts();
	const router = useContext(HistoryContext);
	const [user, setUser] = useState<any>();

	const getBalance = () => {
		return context.balances.find(e => e.id === transaction.balance_id);
	};

	useInterval(async () => {
		try {
			const data = await api.wallet.getTransaction(
				transaction.id,
				context.props.auth?.token || ""
			);
			setTransaction(data.transaction);
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		}
	}, 5000);

	useEffect(() => {
		(async () => {
			if (transaction.description === "Transfer") {
				try {
					const res = await api.custom.get(
						`get_telegram_profile?id=${transaction.to || transaction.from}`,
						context.props.auth?.token
					);
					setUser(res.profile);
				} catch (error) {
					notificationOccurred("error");
					errorHandler(error, toast);
				}
			}
		})();
	});

	return (
		<Center
			h={"var(--tg-viewport-stable-height)"}
			transition={"height 0.3s linear"}
		>
			<BackButton onClick={() => router.push("/")} />
			<Stack
				direction={"column"}
				spacing={4}
				alignItems={"center"}
				textAlign={"center"}
			>
				<Stack direction="column" spacing={2} alignItems={"center"}>
					<Lottie
						animationData={loopmoney}
						loop
						style={{ width: 100, height: 100 }}
					/>

					<Heading size={"lg"}>
						<Stack alignItems={"center"} direction={"row"} spacing={1}>
							<Image
								src={getBalance()?.image}
								borderRadius={"999px"}
								w="25px"
								h="25px"
							/>
							<span>
								{formatBigint(
									transaction.original_amount || transaction.amount,
									getBalance()?.decimals || 1
								)}{" "}
								{getBalance()?.symbol}
							</span>
						</Stack>
					</Heading>

					<Text fontSize={"md"}>
						{context
							.getTranslation(
								transaction.status === "waiting"
									? "Coins will be sent to %to% shortly"
									: "Coins were successfully sent to %to%"
							)
							.replaceAll(
								"%to%",
								reduceString(
									transaction.is_address
										? getAddressName(transaction.to || "")
										: user?.first_name || "...",
									16
								)
							)}
					</Text>
				</Stack>

				{transaction.is_address &&
					!contacts?.find(e => e.address === transaction.to) && (
						<Button
							variant="link"
							colorScheme="button"
							onClick={async () => {
								router.push(`/contacts/add/${transaction.to}`);
							}}
						>
							{context.getTranslation("Save Address")}
						</Button>
					)}
			</Stack>

			<MainButton
				text={context.getTranslation("Open Wallet")}
				onClick={() => router.push("/")}
			/>
		</Center>
	);
}
