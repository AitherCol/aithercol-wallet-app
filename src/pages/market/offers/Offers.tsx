import {
	Box,
	Button,
	Heading,
	IconButton,
	Skeleton,
	SkeletonText,
	Stack,
	Text,
	useBoolean,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import { useContext, useEffect, useState } from "react";
import { FaShare } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import api from "../../../api/api";
import { PaginationMeta } from "../../../api/types/BasicResponse";
import Offer from "../../../api/types/Offer";
import AmountInput from "../../../components/AmountInput";
import CustomBackButton from "../../../components/CustomBackButton";
import SelectScreen from "../../../components/SelectScreen";
import "../../../css/text.css";
import { AppContext } from "../../../providers/AppProvider";
import { HistoryContext } from "../../../providers/HistoryProviders";
import { MarketContext } from "../../../providers/MarketProvider";
import { getColorMap, getTelegram } from "../../../utils";
import errorHandler, {
	arrayToString,
	formatBigint,
} from "../../../utils/utils";
import OfferPageComponent from "./Offer";

export default function Offers() {
	const colors = getColorMap(getTelegram().themeParams.bg_color);
	const context = useContext(AppContext);
	const market = useContext(MarketContext);
	const router = useContext(HistoryContext);
	const toast = useToast();
	const { type } = useParams();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [loading, setLoading] = useBoolean();

	const [contract, setContract] = useState<string>(
		market?.tokens ? market.tokens[0].contract || "" : ""
	);
	const [offers, setOffers] = useState<Offer[]>([]);
	const [meta, setMeta] = useState<PaginationMeta | null>();
	const [method, setMethod] = useState<number | null>();
	const [amount, setAmount] = useState<string | null>();
	const [amountInput, setAmountInput] = useState<string>("");

	const [selectedOffer, setSelectedOffer] = useState<number | null>(null);

	useEffect(() => {
		(async () => {
			try {
				setMeta(null);
				const data = await api.custom.get(
					`wallet/market/offers?type=${type}&contract=${contract}&page=1&limit=25&method=${
						method || ""
					}&amount=${amount || ""}`,
					context.props.auth?.token
				);

				setOffers(data.offers.data);
				setMeta(data.offers.meta);
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
			}
		})();
	}, [contract, method, amount]);

	useEffect(() => {
		if (meta) {
			const delayDebounceFn = setTimeout(() => {
				if (amountInput.trim() !== "") {
					setAmount(amountInput);
				} else {
					setAmount(null);
				}
			}, 500);

			return () => clearTimeout(delayDebounceFn);
		}
	}, [amountInput]);

	const selectMethod = useDisclosure();
	const selectToken = useDisclosure();

	if (selectToken.isOpen) {
		return (
			<SelectScreen
				options={
					market.tokens?.map(e => {
						return { name: e.name, value: e.contract, image: e.image };
					}) || []
				}
				onChange={e => setContract(e)}
				onClose={selectToken.onClose}
			/>
		);
	}

	if (selectMethod.isOpen) {
		return (
			<SelectScreen
				options={[
					{ name: context.getTranslation("All Methods"), value: "all" },
					...(market.methods?.map(e => {
						return {
							name:
								context.props.auth?.profile.language === "ru"
									? e.name_ru || e.name_en
									: e.name_en,
							value: e.id.toString(),
							image: e.logo,
						};
					}) || []),
				]}
				onChange={e => {
					if (e === "all") {
						setMethod(null);
						return;
					}
					setMethod(Number(e));
				}}
				onClose={selectMethod.onClose}
			/>
		);
	}

	const getContract = (contract: string) => {
		return market.tokens?.find(e => e.contract === contract);
	};
	const getMethod = (method: number) => {
		return market.methods?.find(e => e.id === method);
	};

	if (selectedOffer !== null) {
		return (
			<OfferPageComponent
				id={selectedOffer}
				onClose={() => setSelectedOffer(null)}
			/>
		);
	}

	return (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />

			<Stack direction={"row"} spacing={2}>
				<Stack
					h="40px"
					bgColor={getTelegram().themeParams.bg_color}
					w="full"
					borderRadius={"lg"}
					paddingInlineStart={4}
					paddingInlineEnd={4}
					direction={"row"}
					alignItems={"center"}
					cursor={"pointer"}
					border="1px solid"
					borderColor={"transparent"}
					_active={{
						bgColor:
							colors[getTelegram().colorScheme === "dark" ? "700" : "200"],
					}}
					transitionProperty={"var(--aithercol-transition-property-common)"}
					transitionDuration={"var(--aithercol-transition-duration-normal)"}
					onClick={selectToken.onOpen}
					overflow={"hidden"}
				>
					<Text className="text-nowrap">{getContract(contract)?.symbol}</Text>
				</Stack>
				<Stack
					h="40px"
					bgColor={getTelegram().themeParams.bg_color}
					w="full"
					overflow={"hidden"}
					borderRadius={"lg"}
					paddingInlineStart={4}
					paddingInlineEnd={4}
					direction={"row"}
					alignItems={"center"}
					cursor={"pointer"}
					border="1px solid"
					borderColor={"transparent"}
					_active={{
						bgColor:
							colors[getTelegram().colorScheme === "dark" ? "700" : "200"],
					}}
					transitionProperty={"var(--aithercol-transition-property-common)"}
					transitionDuration={"var(--aithercol-transition-duration-normal)"}
					onClick={selectMethod.onOpen}
				>
					<Text
						className="text-nowrap"
						color={
							!method
								? getTelegram().themeParams.hint_color
								: getTelegram().themeParams.text_color
						}
					>
						{!method
							? context.getTranslation("Method")
							: context.props.auth?.profile.language === "ru"
							? getMethod(method)?.name_ru || getMethod(method)?.name_en
							: getMethod(method)?.name_en}
					</Text>
				</Stack>
				<AmountInput
					value={amountInput}
					placeholder={context.getTranslation("amount")}
					onChange={setAmountInput}
				></AmountInput>
			</Stack>

			{(meta && (
				<>
					{offers.map(e => (
						<OfferComponent offer={e} setOffer={setSelectedOffer} />
					))}

					{meta?.current_page !== meta?.last_page && (
						<Button
							isDisabled={loading}
							onClick={async () => {
								try {
									setLoading.on();
									const data = await api.custom.get(
										`wallet/market/offers?type=${type}&contract=${contract}&page=${
											meta.current_page + 1
										}&limit=25`,
										context.props.auth?.token
									);

									setOffers([...offers, ...data.offers.data]);
									setMeta(data.offers.meta);
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
			)) || (
				<>
					<OfferComponent offer={{} as any} isLoading />
					<OfferComponent offer={{} as any} isLoading />
					<OfferComponent offer={{} as any} isLoading />
					<OfferComponent offer={{} as any} isLoading />
					<OfferComponent offer={{} as any} isLoading />
					<OfferComponent offer={{} as any} isLoading />
					<OfferComponent offer={{} as any} isLoading />
					<OfferComponent offer={{} as any} isLoading />
				</>
			)}
		</Stack>
	);
}

function OfferComponent({
	offer,
	isLoading,
	setOffer,
}: {
	offer: Offer;
	isLoading?: boolean;
	setOffer?: (id: number) => void;
}) {
	const context = useContext(AppContext);
	const market = useContext(MarketContext);
	const { 1: notificationOccurred } = useHapticFeedback();
	const toast = useToast();

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
					{(isLoading && (
						<Stack direction={"column"} spacing={1} w="120px">
							<SkeletonText
								noOfLines={1}
								skeletonHeight={"20px"}
							></SkeletonText>
							<SkeletonText
								noOfLines={1}
								skeletonHeight={"14.5px"}
							></SkeletonText>
						</Stack>
					)) || (
						<>
							<Heading size={"md"}>
								{offer.price} {offer.currency}
							</Heading>
							<Text
								fontSize={"sm"}
								color={getTelegram().themeParams.hint_color}
							>
								{context
									.getTranslation("Price per %amount%")
									.replaceAll(
										"%amount%",
										`1 ${getContract(offer.contract)?.symbol}`
									)}
							</Text>
						</>
					)}
				</Stack>

				<Stack alignItems={"center"} direction={"row"} spacing={2}>
					<Skeleton borderRadius={"md"} isLoaded={!isLoading}>
						<IconButton
							aria-label="share"
							icon={<FaShare />}
							size={"xs"}
							color={"button.500"}
							variant={"ghost"}
							colorScheme="button"
						/>
					</Skeleton>
					<Skeleton borderRadius={"md"} isLoaded={!isLoading}>
						<Button
							onClick={() => {
								if (setOffer) {
									setOffer(offer.id);
								}
							}}
							colorScheme="button"
							size="xs"
						>
							{offer.type === "sell"
								? context.getTranslation("buy")
								: context.getTranslation("sell")}
						</Button>
					</Skeleton>
				</Stack>
			</Stack>

			{!isLoading && (
				<Stack direction={"column"} spacing={1}>
					<Stack direction={"row"} spacing={4}>
						<Box minW="110px">
							<Text
								fontSize={"sm"}
								color={getTelegram().themeParams.hint_color}
							>
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
							<Text
								fontSize={"sm"}
								color={getTelegram().themeParams.hint_color}
							>
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
							<Text
								fontSize={"sm"}
								color={getTelegram().themeParams.hint_color}
							>
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
			)}

			{isLoading && (
				<Stack alignItems={"center"} direction={"row"} spacing={4}>
					<Stack minW="110px" direction={"column"} spacing={1}>
						<Stack direction={"column"} spacing={1} w="110px">
							<SkeletonText
								noOfLines={1}
								skeletonHeight={"14.5px"}
							></SkeletonText>
							<SkeletonText
								noOfLines={1}
								skeletonHeight={"14.5px"}
							></SkeletonText>
							<SkeletonText
								noOfLines={1}
								skeletonHeight={"14.5px"}
							></SkeletonText>
						</Stack>
					</Stack>
					<Stack direction={"column"} spacing={1}>
						<Stack direction={"column"} spacing={1} w="110px">
							<SkeletonText
								noOfLines={1}
								skeletonHeight={"14.5px"}
							></SkeletonText>
							<SkeletonText
								noOfLines={1}
								skeletonHeight={"14.5px"}
							></SkeletonText>
							<SkeletonText
								noOfLines={1}
								skeletonHeight={"14.5px"}
							></SkeletonText>
						</Stack>
					</Stack>
				</Stack>
			)}
		</Stack>
	);
}
