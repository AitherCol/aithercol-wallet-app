import {
	Button,
	Heading,
	Image,
	Stack,
	Text,
	useToast,
} from "@chakra-ui/react";
import {
	useHapticFeedback,
	useShowPopup,
} from "@vkruglikov/react-telegram-web-app";
import Lottie from "lottie-react";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import api from "../../api/api";
import StakingToken from "../../api/types/StakingToken";
import Transaction from "../../api/types/Transaction";
import CustomBackButton from "../../components/CustomBackButton";
import Loader from "../../components/Loader";
import TransactionScreen from "../../components/TransactionScreen";
import { AppContext } from "../../providers/AppProvider";
import light from "../../stickers/light.json";
import { getTelegram } from "../../utils";
import errorHandler, { formatBigint } from "../../utils/utils";
import Stake from "./Stake";

export interface StakingPageProps {
	available: StakingToken[];
	balances: any[];
	update: () => void;
	onClose: () => void;
	getStakingBalance: (contract: string) => any;
}

export default function Staking() {
	const context = useContext(AppContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();
	const showPopup = useShowPopup();

	const [available, setAvailable] = useState<StakingToken[]>();
	const [balances, setBalances] = useState<any[]>();

	const update = async () => {
		try {
			const { contracts } = await api.custom.get(
				"wallet/staking/available",
				context.props.auth?.token
			);
			setAvailable(contracts);

			const { balances } = await api.custom.get(
				"wallet/staking/balances",
				context.props.auth?.token
			);
			setBalances(balances);
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		}
	};

	useEffect(() => {
		update();
	}, []);

	const getStakingBalance = (contract: string) => {
		return balances?.find(e => e.contract === contract);
	};

	const [selectedToken, setSelectedToken] = useState<StakingToken | null>(null);
	const [transaction, setTransaction] = useState<Transaction | null>(null);

	if (selectedToken && available && balances) {
		return (
			<Stake
				token={selectedToken}
				available={available}
				balances={balances}
				onClose={() => setSelectedToken(null)}
				getStakingBalance={getStakingBalance}
				update={update}
			/>
		);
	}

	if (transaction) {
		return <TransactionScreen transaction={transaction} />;
	}

	return !balances || !available ? (
		<Loader></Loader>
	) : (
		<Stack direction={"column"} spacing={4}>
			<CustomBackButton />
			<Stack
				alignItems={"center"}
				textAlign={"center"}
				direction={"column"}
				spacing={2}
			>
				<Lottie
					style={{ width: 120, height: 120 }}
					animationData={light}
					loop={true}
				/>

				<Heading size={"md"}>{context.getTranslation("Staking")}</Heading>

				<Text textAlign={"center"}>
					{context.getTranslation("Earn by storing coins in AitherCol Wallet.")}
				</Text>
			</Stack>

			<Stack direction={"column"} spacing={2}>
				{available.map(e => (
					<Stack
						direction={"column"}
						spacing={2}
						p={3}
						bgColor={getTelegram().themeParams.bg_color}
						borderRadius={"lg"}
					>
						<Stack
							alignItems={"center"}
							direction={"row"}
							justifyContent={"space-between"}
						>
							<Stack alignItems={"center"} direction={"row"} spacing={2}>
								<Image src={e.image} w="40px" h="40px" borderRadius={"999px"} />
								<Stack direction={"column"} spacing={0}>
									<Heading size={"sm"}>{e.name}</Heading>
									{!e.bonus_percent ? (
										<Text
											color={getTelegram().themeParams.hint_color}
											fontSize={"sm"}
										>
											{context
												.getTranslation("%percent% APY")
												.replaceAll("%percent%", e.percent.toString())}
										</Text>
									) : (
										<Text
											fontSize={"sm"}
											color={getTelegram().themeParams.hint_color}
										>
											<span
												style={{
													color: getTelegram().themeParams.accent_text_color,
													fontWeight: "bold",
												}}
											>
												{context
													.getTranslation("%percent% APY")
													.replaceAll("%percent%", e.bonus_percent.toString())}
											</span>{" "}
											{context
												.getTranslation("until %date%")
												.replaceAll(
													"%date%",
													moment(e.bonus_expires_at).format("LL")
												)}
										</Text>
									)}
								</Stack>
							</Stack>

							<Button
								onClick={() => setSelectedToken(e)}
								size={"sm"}
								colorScheme="button"
							>
								{context.getTranslation("Stake")}
							</Button>
						</Stack>

						{getStakingBalance(e.contract) ? (
							<Stack
								direction={"row"}
								justifyContent={"space-between"}
								alignItems={"start"}
							>
								<Stack direction={"column"} spacing={0}>
									<Text fontSize={"md"}>
										{context.getTranslation("In staking")}:{" "}
										<b>
											{formatBigint(
												getStakingBalance(e.contract).amount,
												e.decimals
											)}{" "}
											{e.symbol}
										</b>
									</Text>
									<Text fontSize={"md"}>
										{context.getTranslation("Reward")}:{" "}
										<b>
											{formatBigint(
												getStakingBalance(e.contract).reward_amount,
												e.decimals
											)}{" "}
											{e.symbol}
										</b>
									</Text>
									{!getStakingBalance(e.contract).is_unlocked && (
										<Text fontSize={"md"}>
											{context.getTranslation("Will be unlocked")}:{" "}
											<b>
												{moment(
													getStakingBalance(e.contract).unlocked_at
												).format("LLL")}
											</b>
										</Text>
									)}
								</Stack>
								{getStakingBalance(e.contract).is_unlocked && (
									<Button
										colorScheme="button"
										size={"sm"}
										onClick={async () => {
											const button = await showPopup({
												title: context
													.getTranslation("Withdraw %symbol% ​​from staking")
													.replaceAll("%symbol%", e.symbol),
												message: context
													.getTranslation(
														"Are you sure you want to withdraw all coins from staking? You will receive %amount%."
													)
													.replaceAll(
														"%amount%",
														formatBigint(
															(
																BigInt(getStakingBalance(e.contract).amount) +
																BigInt(
																	getStakingBalance(e.contract).reward_amount
																)
															).toString(),
															e.decimals
														)
													),
												buttons: [
													{
														id: "confirm",
														type: "default",
														text: context.getTranslation("Confirm"),
													},
													{ type: "cancel" },
												],
											});

											if (button === "confirm") {
												try {
													const data = await api.custom.post(
														"wallet/staking/withdraw",
														context.props.auth?.token,
														{
															id: getStakingBalance(e.contract)?.id,
														}
													);
													await context.update();
													await update();
													notificationOccurred("success");
													setTransaction(data.transaction);
												} catch (error) {
													notificationOccurred("error");
													errorHandler(error, toast);
												}
											}
										}}
									>
										{context.getTranslation("Withdraw (action)")}
									</Button>
								)}
							</Stack>
						) : (
							<></>
						)}
					</Stack>
				))}
			</Stack>
		</Stack>
	);
}
