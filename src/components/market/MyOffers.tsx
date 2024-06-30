import {
	Box,
	Center,
	Heading,
	IconButton,
	Stack,
	Switch,
	Text,
	useBoolean,
	useToast,
} from "@chakra-ui/react";
import {
	useHapticFeedback,
	useShowPopup,
} from "@vkruglikov/react-telegram-web-app";
import { useContext, useEffect, useState } from "react";
import { FaPlus, FaShare, FaTrash } from "react-icons/fa6";
import api from "../../api/api";
import Offer from "../../api/types/Offer";
import config from "../../config";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { MarketContext } from "../../providers/MarketProvider";
import { getTelegram } from "../../utils";
import errorHandler, { arrayToString, formatBigint } from "../../utils/utils";
import CellButton from "../CellButton";

export default function MyOffers() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const market = useContext(MarketContext);
	const { 1: notificationOccurred } = useHapticFeedback();
	const toast = useToast();

	const [offers, setOffers] = useState<Offer[]>([]);

	const getData = async () => {
		try {
			const data = await api.custom.get(
				`wallet/market/offers/my`,
				context.props.auth?.token
			);
			setOffers(data.offers);
		} catch (error) {
			errorHandler(error, toast);
			notificationOccurred("error");
		}
	};

	useEffect(() => {
		getData();
	}, []);

	return (
		<Stack direction={"column"} spacing={2}>
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("My Offers")}
			</Heading>

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
						<FaPlus size={"14px"} />
					</Center>
				}
				title={context.getTranslation("Create Offer")}
				onClick={() => router.push("/market/profile/offers/new")}
			/>

			{offers.map(offer => (
				<OfferComponent refreshData={getData} offer={offer} />
			))}
		</Stack>
	);
}

function OfferComponent({
	offer,
	refreshData,
}: {
	offer: Offer;
	refreshData: () => void;
}) {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const market = useContext(MarketContext);
	const { 1: notificationOccurred } = useHapticFeedback();
	const toast = useToast();
	const showPopup = useShowPopup();

	const [loading, setLoading] = useBoolean();

	const getContract = (contract: string) => {
		return market.tokens?.find(e => e.contract === contract);
	};

	const getMethod = (id: number) => {
		return market.methods?.find(e => e.id === id);
	};

	return (
		<Stack
			direction={"column"}
			spacing={2}
			bgColor={getTelegram().themeParams.bg_color}
			p={3}
			borderRadius={"lg"}
		>
			<Stack
				direction={"row"}
				justifyContent={"space-between"}
				alignItems={"center"}
			>
				<Stack direction={"column"} spacing={0}>
					<Heading size={"md"}>
						{offer.price} {offer.currency}
					</Heading>
					<Text fontSize={"sm"} color={getTelegram().themeParams.hint_color}>
						{context
							.getTranslation("Price per %amount%")
							.replaceAll(
								"%amount%",
								`1 ${getContract(offer.contract)?.symbol}`
							)}
					</Text>
				</Stack>

				<Stack alignItems={"center"} direction={"row"} spacing={1}>
					<IconButton
						aria-label="share"
						icon={<FaShare />}
						size={"xs"}
						borderRadius={"999px"}
						onClick={() => {
							window.navigator.clipboard.writeText(
								`https://t.me/${config.username}/app?startapp=O${offer.id}`
							);
							toast({ title: context.getTranslation("link_copied") });
						}}
						colorScheme="button"
					/>
					<IconButton
						aria-label="delete"
						icon={<FaTrash size={"14px"} />}
						size={"xs"}
						borderRadius={"999px"}
						isDisabled={loading}
						onClick={async () => {
							try {
								const button = await showPopup({
									title: context.getTranslation("Delete offer"),
									message: context.getTranslation(
										"Do you confirm the deletion of the offer?"
									),
									buttons: [
										{
											id: "confirm",
											type: "destructive",
											text: context.getTranslation("Confirm"),
										},
										{ type: "cancel" },
									],
								});

								if (button === "confirm") {
									setLoading.on();
									await api.custom.post(
										"wallet/market/offers/delete",
										context.props.auth?.token,
										{ id: offer.id }
									);
									await refreshData();
									notificationOccurred("success");
								}
							} catch (error) {
								errorHandler(error, toast);
								notificationOccurred("error");
							} finally {
								setLoading.off();
							}
						}}
						colorScheme="button"
					/>
					<Switch
						aria-label="share"
						size={"md"}
						onChange={async () => {
							try {
								setLoading.on();
								await api.custom.post(
									"wallet/market/offers/toggle",
									context.props.auth?.token,
									{ id: offer.id }
								);
								await refreshData();
								notificationOccurred("success");
							} catch (error) {
								errorHandler(error, toast);
								notificationOccurred("error");
							} finally {
								setLoading.off();
							}
						}}
						colorScheme="button"
						isDisabled={loading}
						isChecked={offer.is_active}
					/>
				</Stack>
			</Stack>

			<Stack direction={"column"} spacing={1}>
				<Stack direction={"row"} spacing={4}>
					<Box minW="110px">
						<Text fontSize={"sm"} color={getTelegram().themeParams.hint_color}>
							{context.getTranslation("Type")}
						</Text>
					</Box>
					<Text fontSize={"sm"}>{context.getTranslation(offer.type)}</Text>
				</Stack>
				<Stack direction={"row"} spacing={4}>
					<Box minW="110px">
						<Text fontSize={"sm"} color={getTelegram().themeParams.hint_color}>
							{context.getTranslation("Available")}
						</Text>
					</Box>
					<Text fontSize={"sm"}>
						{formatBigint(
							offer.volume,
							getContract(offer.contract)?.decimals || 1
						)}{" "}
						{getContract(offer.contract)?.symbol}
					</Text>
				</Stack>
				<Stack direction={"row"} spacing={4}>
					<Box minW="110px">
						<Text fontSize={"sm"} color={getTelegram().themeParams.hint_color}>
							{context.getTranslation("Limits")}
						</Text>
					</Box>
					<Text fontSize={"sm"}>
						{offer.min_amount} –{" "}
						{offer.max_amount
							? offer.max_amount
							: `${(
									Number(
										formatBigint(
											offer.volume,
											getContract(offer.contract)?.decimals || 1
										)
									) * offer.price
							  ).toFixed(2)}`}{" "}
						{offer.currency}
					</Text>
				</Stack>
				<Stack direction={"row"} spacing={4}>
					<Box minW="110px">
						<Text fontSize={"sm"} color={getTelegram().themeParams.hint_color}>
							{context.getTranslation("Payment Methods")}
						</Text>
					</Box>
					<Text fontSize={"sm"}>
						{arrayToString(
							offer.methods.map(e => {
								return (
									(context.props.auth?.profile.language === "ru"
										? getMethod(e)?.name_ru || getMethod(e)?.name_en
										: getMethod(e)?.name_en) || ""
								);
							})
						)}
					</Text>
				</Stack>
			</Stack>
		</Stack>
	);
}
