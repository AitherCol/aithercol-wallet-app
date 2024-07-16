import {
	Avatar,
	Badge,
	Button,
	Center,
	Heading,
	Image,
	Spinner,
	Stack,
	Text,
	useBoolean,
	useToast,
} from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import {
	FaArrowUp,
	FaBusinessTime,
	FaChevronRight,
	FaDice,
	FaEarthEurope,
	FaGamepad,
	FaToolbox,
} from "react-icons/fa6";
import api from "../api/api";
import { PaginationMeta } from "../api/types/BasicResponse";
import Merchant from "../api/types/Merchant";
import Rate from "../api/types/Rate";
import BoxCell from "../components/BoxCell";
import Cell from "../components/Cell";
import CustomBackButton from "../components/CustomBackButton";
import NotFoundBadge from "../components/NotFoundBadge";
import { AppContext } from "../providers/AppProvider";
import { HistoryContext } from "../providers/HistoryProviders";
import { getTelegram } from "../utils";
import errorHandler, { formatBigint, reduceString } from "../utils/utils";

const categoriesMeta = {
	games: {
		name: "Games",
		icon: <FaGamepad />,
	},
	web3: {
		name: "Web3",
		icon: <FaEarthEurope />,
	},
	utilities: {
		name: "Utilities",
		icon: <FaToolbox />,
	},
	management: {
		name: "Management",
		icon: <FaBusinessTime />,
	},
	casino: {
		name: "Casino",
		icon: <FaDice />,
	},
};

export default function Bonuses() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	const [loading, setLoading] = useBoolean();
	const [paginationLoading, setPaginationLoading] = useBoolean();

	const [bonuses, setBonuses] = useState<any[]>([]);
	const [merchants, setMerchants] = useState<Merchant[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [meta, setMeta] = useState<PaginationMeta>();

	useEffect(() => {
		(async () => {
			setLoading.on();
			try {
				const bonuses = await api.custom.get(
					"wallet/bonuses",
					context.props.auth?.token
				);
				setBonuses(bonuses.bonuses);
			} catch (error) {
				notificationOccurred("error");
				errorHandler(error, toast);
			}
			try {
				const categories = await api.custom.get(
					"wallet/bonuses/merchants/categories",
					context.props.auth?.token
				);
				setCategories(categories.categories);
			} catch (error) {
				notificationOccurred("error");
				errorHandler(error, toast);
			}
			try {
				const merchants = await api.custom.get(
					`wallet/bonuses/merchants?page=1&limit=25&category=${
						selectedCategory || ""
					}`,
					context.props.auth?.token
				);
				setMeta(merchants.merchants.meta);
				setMerchants(merchants.merchants.data);
			} catch (error) {
				notificationOccurred("error");
				errorHandler(error, toast);
			}
			setLoading.off();
		})();
	}, [selectedCategory]);

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

	const getTotalCashback = (): string => {
		let total = 0;
		for (const balance of context.balances) {
			total +=
				getRate(balance.contract).price *
				Number(formatBigint(balance.cashback_amount, balance.decimals));
		}

		return total.toFixed(2);
	};

	return (
		<Stack direction={"column"} spacing={4}>
			<CustomBackButton />

			<BoxCell
				title={context.getTranslation("cashback")}
				description={context
					.getTranslation(`To be credited on %date%`)
					.replaceAll(
						"%date%",
						moment().add({ months: 1 }).startOf("month").format("D MMMM")
					)}
				spacing={"auto"}
				customComponent={
					<Badge
						bgColor={getTelegram().themeParams.accent_text_color}
						color={getTelegram().themeParams.button_text_color}
						borderRadius={"md"}
					>
						${getTotalCashback()}
					</Badge>
				}
			/>

			{bonuses.length !== 0 && (
				<Stack direction={"column"} spacing={2}>
					{bonuses.map(e => (
						<Cell
							icon={
								<Image w="40px" h="40px" src={e.photo} borderRadius="999px" />
							}
							title={e.title}
							subTitle={e.description}
							additionalComponent={
								e.link.type === "external" ? (
									<FaArrowUp
										color={getTelegram().themeParams.hint_color}
										style={{ transform: "rotate(45deg)" }}
									/>
								) : (
									<FaChevronRight
										color={getTelegram().themeParams.hint_color}
									/>
								)
							}
							onClick={() => {
								if (e.link.type === "internal") {
									router.push(e.link.href);
								} else {
									if (e.link.href.startsWith("https://t.me")) {
										getTelegram().openTelegramLink(e.link.href);
									} else {
										getTelegram().openLink(e.link.href);
									}
								}
							}}
						/>
					))}
				</Stack>
			)}

			<Stack direction={"column"} spacing={3}>
				<Center>
					<Heading textAlign={"center"} size={"md"}>
						{context.getTranslation("Shopping with cashback")}
					</Heading>
				</Center>
				<Stack
					overflowY={"auto"}
					direction={"row"}
					spacing={1}
					className="no-scrollbar"
				>
					{categories.map(e => (
						<Stack
							direction={"row"}
							alignItems={"center"}
							p={1}
							paddingInlineStart={2}
							paddingInlineEnd={2}
							cursor={"pointer"}
							bgColor={
								selectedCategory === e
									? "button.500"
									: getTelegram().themeParams.bg_color
							}
							borderRadius={"lg"}
							color={
								selectedCategory === e
									? getTelegram().themeParams.button_text_color
									: getTelegram().themeParams.text_color
							}
							onClick={() => {
								if (selectedCategory === e) {
									setSelectedCategory(null);
								} else {
									setSelectedCategory(e);
								}
							}}
						>
							{categoriesMeta[e as "games"].icon}
							<Text>
								{context.getTranslation(categoriesMeta[e as "games"].name)}
							</Text>
						</Stack>
					))}
				</Stack>

				{(!loading && (
					<Stack direction={"column"} spacing={2}>
						{merchants.length === 0 && (
							<NotFoundBadge text={context.getTranslation("Nothing Found")} />
						)}
						{merchants.map(e => (
							<Cell
								icon={
									<Avatar
										w="40px"
										h="40px"
										name={e.title}
										src={e.photo || ""}
									/>
								}
								title={e.title}
								subTitle={reduceString(e.description || "", 36, true) || ""}
								additionalComponent={
									<FaArrowUp
										color={getTelegram().themeParams.hint_color}
										style={{ transform: "rotate(45deg)" }}
									/>
								}
								onClick={() => {
									if (e.url) {
										if (e.url.startsWith("https://t.me")) {
											getTelegram().openTelegramLink(e.url);
										} else {
											getTelegram().openLink(e.url);
										}
									}
								}}
							></Cell>
						))}
						{meta?.current_page !== meta?.last_page && (
							<Button
								isDisabled={paginationLoading}
								onClick={async () => {
									try {
										setPaginationLoading.on();
										const data = await api.custom.get(
											`wallet/bonuses/merchants?page=${
												(meta?.current_page || 0) + 1
											}&limit=25&category=${selectedCategory || ""}`,
											context.props.auth?.token
										);

										setMerchants([...merchants, ...data.merchants.data]);
										setMeta(data.merchants.meta);
									} catch (error) {
										errorHandler(error, toast);
										notificationOccurred("error");
									} finally {
										setPaginationLoading.off();
									}
								}}
								colorScheme="button"
							>
								{context.getTranslation("show_more")}
							</Button>
						)}
					</Stack>
				)) || (
					<Center>
						<Spinner
							size={"xl"}
							color={getTelegram().themeParams.accent_text_color}
						/>
					</Center>
				)}
			</Stack>
		</Stack>
	);
}
