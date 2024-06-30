import {
	Box,
	Button,
	Center,
	Heading,
	IconButton,
	Spinner,
	Stack,
	Text,
	useBoolean,
	useToast,
} from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import Lottie from "lottie-react";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { BsChevronExpand } from "react-icons/bs";
import {
	FaArrowDown,
	FaArrowUp,
	FaCheck,
	FaClock,
	FaUser,
	FaXmark,
} from "react-icons/fa6";
import api from "../../api/api";
import { PaginationMeta } from "../../api/types/BasicResponse";
import Deal from "../../api/types/Deal";
import Cell from "../../components/Cell";
import CustomBackButton from "../../components/CustomBackButton";
import MenuSelect from "../../components/MenuSelect";
import { AppContext, AppContextType } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { MarketContext } from "../../providers/MarketProvider";
import exchange from "../../stickers/exchange.json";
import { getColorMap, getTelegram } from "../../utils";
import errorHandler, { formatBigint } from "../../utils/utils";
import RegisterMarket from "./RegisterMarket";

function MarketMain() {
	const [loading, setLoading] = useBoolean();

	const context = useContext(AppContext);
	const market = useContext(MarketContext);
	const router = useContext(HistoryContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [deals, setDeals] = useState<Deal[] | null>(null);
	const [type, setType] = useState<"active" | "completed">("active");
	const [meta, setMeta] = useState<PaginationMeta | null>(null);

	useEffect(() => {
		(async () => {
			if (context.props.auth?.profile.is_market_registred) {
				try {
					setDeals(null);
					const data = await api.custom.get(
						`wallet/market/deals?active=${type === "active"}&page=1&limit=25`,
						context.props.auth?.token
					);
					setMeta(data.deals.meta);
					setDeals(data.deals.data);
				} catch (error) {
					errorHandler(error, toast);
					notificationOccurred("error");
				}
			}
		})();
	}, [type]);

	return !context.props.auth?.profile.is_market_registred ? (
		<RegisterMarket />
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
						<Lottie
							style={{ width: 80, height: 80 }}
							animationData={exchange}
							loop={true}
						/>

						<Heading size={"md"}>
							{context.getTranslation("P2P Market")}
						</Heading>
					</Stack>

					<Stack direction={"row"} spacing={6}>
						<Stack
							alignItems={"center"}
							direction={"column"}
							spacing={2}
							cursor={"pointer"}
							onClick={() => router.push("/market/offers/buy")}
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
								{context.getTranslation("buy")}
							</Heading>
						</Stack>
						<Stack
							alignItems={"center"}
							direction={"column"}
							spacing={2}
							cursor={"pointer"}
							onClick={() => router.push("/market/offers/sell")}
						>
							<Box>
								<IconButton
									aria-label="withdraw"
									borderRadius={"999px"}
									icon={<FaArrowUp size={"20px"} />}
									colorScheme="button"
								></IconButton>
							</Box>
							<Heading color={"button.500"} size={"sm"}>
								{context.getTranslation("sell")}
							</Heading>
						</Stack>
					</Stack>
				</Stack>
			</Center>

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
							<FaUser size={"20px"} />
						</Center>
					}
					title={context.getTranslation("My Offers")}
					subTitle={context.getTranslation(
						"Manage offers and payment settings"
					)}
					onClick={() => router.push("/market/profile")}
				/>
			</Box>

			<Stack direction={"column"} spacing={2}>
				<Stack
					direction={"row"}
					justifyContent={"space-between"}
					alignItems={"center"}
				>
					<Heading
						size={"sm"}
						color={getTelegram().themeParams.hint_color}
						textTransform={"uppercase"}
					>
						{context.getTranslation("My Deals")}
					</Heading>
					<MenuSelect
						value={type}
						onChange={e => setType(e as any)}
						options={[
							{
								value: "active",
								placeholder: context.getTranslation("Active"),
							},
							{
								value: "completed",
								placeholder: context.getTranslation("Completed"),
							},
						]}
					>
						<Button
							textTransform={"uppercase"}
							variant={"link"}
							colorScheme="button"
							_hover={{ textDecoration: "none" }}
						>
							<Stack direction={"row"} spacing={1} alignItems={"center"}>
								<Text>
									{type === "active"
										? context.getTranslation("Active")
										: context.getTranslation("Completed")}
								</Text>
								<BsChevronExpand size={"16px"} />
							</Stack>
						</Button>
					</MenuSelect>
				</Stack>
				{deals ? (
					<>
						{deals.length === 0 && (
							<Center
								borderRadius={"lg"}
								bgColor={getTelegram().themeParams.bg_color}
								h="160px"
								color={getTelegram().themeParams.hint_color}
							>
								<Text>
									{context.getTranslation("Your deals will appear here")}
								</Text>
							</Center>
						)}
						{deals.map(deal => (
							<DealComponent deal={deal} />
						))}
						{meta?.current_page !== meta?.last_page && (
							<Button
								isDisabled={loading}
								onClick={async () => {
									try {
										setLoading.on();
										const data = await api.custom.get(
											`wallet/market/deals?active=${type === "active"}&page=${
												(meta?.current_page || 1) + 1
											}&limit=25`,
											context.props.auth?.token
										);
										setMeta(data.deals.meta);
										setDeals([...deals, ...data.deals.data]);
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
				) : (
					<Center
						borderRadius={"lg"}
						bgColor={getTelegram().themeParams.bg_color}
						h="160px"
						color={getTelegram().themeParams.hint_color}
					>
						<Spinner size={"xl"} color={getTelegram().themeParams.hint_color} />
					</Center>
				)}
			</Stack>
		</>
	);
}

export function getDealStatuses(context: AppContextType) {
	return {
		waiting: {
			icon: (
				<FaClock size={"20px"} color={getTelegram().themeParams.link_color} />
			),
			text: context.getTranslation("New"),
			color: getTelegram().themeParams.link_color,
		},
		rejected: {
			icon: (
				<Center
					w="20px"
					h="20px"
					borderRadius={"999px"}
					bgColor={getTelegram().themeParams.destructive_text_color}
				>
					<FaXmark size={"14px"} />
				</Center>
			),
			text: context.getTranslation("Rejected"),
			color: getTelegram().themeParams.destructive_text_color,
		},
		canceled: {
			icon: (
				<Center
					w="20px"
					h="20px"
					borderRadius={"999px"}
					bgColor={getTelegram().themeParams.destructive_text_color}
				>
					<FaXmark size={"14px"} />
				</Center>
			),
			text: context.getTranslation("Canceled"),
			color: getTelegram().themeParams.destructive_text_color,
		},
		waiting_payment: {
			icon: (
				<Box color={"yellow.500"}>
					<FaClock size={"20px"} />
				</Box>
			),
			text: context.getTranslation("Waiting Payment"),
			color: "yellow.500",
		},
		waiting_method: {
			icon: (
				<Box color={"yellow.500"}>
					<FaClock size={"20px"} />
				</Box>
			),
			text: context.getTranslation("Waiting Payment Method"),
			color: "yellow.500",
		},
		payment_sent: {
			icon: (
				<Box color={"yellow.500"}>
					<FaClock size={"20px"} />
				</Box>
			),
			text: context.getTranslation("Payment Sent"),
			color: "yellow.500",
		},
		success: {
			icon: (
				<Center w="20px" h="20px" borderRadius={"999px"} bgColor={"green.500"}>
					<FaCheck size={"14px"} />
				</Center>
			),
			text: context.getTranslation("Completed (one)"),
			color: "green.500",
		},
	};
}

export function DealComponent({ deal }: { deal: Deal }) {
	const context = useContext(AppContext);
	const market = useContext(MarketContext);
	const router = useContext(HistoryContext);
	const colors = getColorMap(getTelegram().themeParams.bg_color);

	const isBuy =
		(context.props.auth?.profile.id === deal.dealer_id &&
			deal.type === "buy") ||
		(context.props.auth?.profile.id !== deal.dealer_id && deal.type === "sell");

	const getContract = (contract: string) => {
		return market.tokens?.find(e => e.contract === contract);
	};

	const getMethod = (id: number) => {
		return market.methods?.find(e => e.id === id);
	};

	return (
		<Stack
			direction={"column"}
			spacing={0}
			cursor={"pointer"}
			borderRadius={"lg"}
			bgColor={getTelegram().themeParams.bg_color}
			p={3}
			onClick={() => router.push(`/market/deal/${deal.id}`)}
			_active={{
				bgColor: colors[getTelegram().colorScheme === "dark" ? "700" : "200"],
			}}
			transitionProperty={"var(--aithercol-transition-property-common)"}
			transitionDuration={"var(--aithercol-transition-duration-normal)"}
		>
			<Text
				textTransform={"uppercase"}
				fontSize={"md"}
				color={getDealStatuses(context)[deal.status].color}
			>
				{getDealStatuses(context)[deal.status].text}
			</Text>
			<Heading size={"sm"}>
				{isBuy
					? context
							.getTranslation("Buying %amount% for %currency%")
							.replaceAll(
								"%amount%",
								`${formatBigint(
									deal.amount,
									getContract(deal.contract)?.decimals || 1
								)} ${getContract(deal.contract)?.symbol}`
							)
							.replaceAll("%currency%", `${deal.amount_fiat} ${deal.currency}`)
					: context
							.getTranslation("Selling %amount% for %currency%")
							.replaceAll(
								"%amount%",
								`${formatBigint(
									deal.amount,
									getContract(deal.contract)?.decimals || 1
								)} ${getContract(deal.contract)?.symbol}`
							)
							.replaceAll("%currency%", `${deal.amount_fiat} ${deal.currency}`)}
			</Heading>
			<Text fontSize={"md"} color={getTelegram().themeParams.hint_color}>
				{context.getTranslation("Payment Method")}:{" "}
				{context.props.auth?.profile.language === "ru"
					? getMethod(deal.method_type)?.name_ru ||
					  getMethod(deal.method_type)?.name_en
					: getMethod(deal.method_type)?.name_en}
			</Text>
			<Text fontSize={"md"} color={getTelegram().themeParams.hint_color}>
				{moment(deal.created_at).format("LLL")} • #D{deal.id}
			</Text>
		</Stack>
	);
}

export default MarketMain;
