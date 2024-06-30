import {
	Avatar,
	Center,
	FormControl,
	FormHelperText,
	Heading,
	IconButton,
	Stack,
	Text,
	useBoolean,
	useToast,
} from "@chakra-ui/react";
import {
	BackButton,
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import HTMLReactParser from "html-react-parser";
import { useContext, useEffect, useState } from "react";
import { BsChevronExpand } from "react-icons/bs";
import { FaComment, FaStar } from "react-icons/fa6";
import { HiMiniArrowsUpDown } from "react-icons/hi2";

import api from "../../../api/api";
import Offer from "../../../api/types/Offer";
import Rate from "../../../api/types/Rate";
import User from "../../../api/types/User";
import AmountInput from "../../../components/AmountInput";
import CellButton from "../../../components/CellButton";
import InfoCell from "../../../components/InfoCell";
import InfoRawCell from "../../../components/InfoRawCell";
import Loader from "../../../components/Loader";
import MenuSelect from "../../../components/MenuSelect";
import { AppContext } from "../../../providers/AppProvider";
import { HistoryContext } from "../../../providers/HistoryProviders";
import { MarketContext } from "../../../providers/MarketProvider";
import { getTelegram } from "../../../utils";
import errorHandler, {
	formatBigint,
	withoutDecimals,
} from "../../../utils/utils";

export default function OfferPageComponent({
	id,
	onClose,
}: {
	id: number;
	onClose: () => void;
}) {
	const [offerInfo, setOfferInfo] = useState<{
		offer: Offer;
		rate: Rate;
		user: User;
	} | null>();
	const context = useContext(AppContext);
	const market = useContext(MarketContext);
	const router = useContext(HistoryContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [details, setDetails] = useBoolean();

	const [amountInput, setAmountInput] = useState<string>("");
	const [method, setMethod] = useState<number | null>();
	const [currency, setCurrency] = useState<"fiat" | "crypto">("crypto");

	useEffect(() => {
		(async () => {
			try {
				setDetails.off();
				setOfferInfo(null);
				setMethod(null);
				const data = await api.custom.get(
					`wallet/market/offers/get?id=${id}`,
					context.props.auth?.token
				);
				setMethod(data.offer.methods[0]);
				setOfferInfo(data);
			} catch (error) {
				notificationOccurred("error");
				errorHandler(error, toast);
			}
		})();
	}, [id]);

	const getContract = () => {
		return market.tokens?.find(e => e.contract === offerInfo?.offer.contract);
	};
	const getMethod = (id: number) => {
		return market.methods?.find(e => e.id === id);
	};

	if (details && offerInfo) {
		return (
			<Stack direction={"column"} spacing={4}>
				<BackButton onClick={setDetails.off} />

				<Center>
					<Stack alignItems={"center"} direction={"row"} spacing={2}>
						<Avatar size={"sm"} name={offerInfo.user.name} />
						<Text fontSize={"md"}>
							{HTMLReactParser(
								context
									.getTranslation(
										offerInfo.offer.type === "buy"
											? "You are selling to <b>%user%</b>"
											: "You are buying from <b>%user%</b>"
									)
									.replaceAll("%user%", offerInfo.user.name)
							)}
						</Text>
						{offerInfo.user.is_premium && <FaStar size={"18px"} />}
					</Stack>
				</Center>

				<Center>
					<Text
						onClick={() => {
							window.navigator.clipboard.writeText(`#O${offerInfo.offer.id}`);
							toast({ title: context.getTranslation("Copied to clipboard") });
						}}
						fontFamily={'"Fira Code", monospace'}
						cursor={"pointer"}
					>
						<span style={{ color: getTelegram().themeParams.hint_color }}>
							#
						</span>
						O{offerInfo.offer.id}
					</Text>
				</Center>

				<Stack direction={"column"} spacing={2}>
					<InfoRawCell
						title={context
							.getTranslation("Price per %amount%")
							.replaceAll("%amount%", `1 ${getContract()?.symbol}`)}
						value={`${offerInfo.offer.price} ${offerInfo.offer.currency}`}
						variant="transparent"
						divider
					/>
					<InfoRawCell
						title={context.getTranslation("Available")}
						value={`${formatBigint(
							offerInfo.offer.volume,
							getContract()?.decimals || 1
						)} ${getContract()?.symbol}`}
						variant="transparent"
						divider
					/>
					<InfoRawCell
						title={context.getTranslation("Limits")}
						value={`${offerInfo.offer.min_amount} – ${
							offerInfo.offer.max_amount
								? offerInfo.offer.max_amount
								: `${
										Number(
											formatBigint(
												offerInfo.offer.volume,
												getContract()?.decimals || 1
											)
										) * offerInfo.offer.price
								  }`
						} ${offerInfo.offer.currency}`}
						variant="transparent"
						divider
					/>
					<InfoRawCell
						title={context.getTranslation("Payment Method")}
						value={
							method
								? getMethod(method)?.name_en || ""
								: context.getTranslation("None")
						}
						variant="transparent"
					/>
				</Stack>

				{offerInfo.offer.description && (
					<Stack direction={"column"} spacing={2}>
						<InfoCell
							variant="transparent"
							icon={
								<Center
									w={"40px"}
									h="40px"
									borderRadius={"999px"}
									overflow={"hidden"}
									bgColor={getTelegram().themeParams.accent_text_color}
									color={getTelegram().themeParams.button_text_color}
								>
									<FaComment size={"20px"} />
								</Center>
							}
							title="Description"
							value={offerInfo.offer.description}
						/>
						<Text fontSize={"sm"} color={getTelegram().themeParams.hint_color}>
							⚠️{" "}
							{context.getTranslation(
								"Only scammers offer communication and deals outside the P2P Market"
							)}
						</Text>
					</Stack>
				)}

				<Stack direction={"column"} spacing={2}>
					<Heading
						size={"sm"}
						color={getTelegram().themeParams.hint_color}
						textTransform={"uppercase"}
					>
						{context.getTranslation(
							offerInfo.offer.type === "buy" ? "Buyer Info" : "Seller Info"
						)}
					</Heading>
					<InfoRawCell
						title={context.getTranslation("Name")}
						value={`${offerInfo.user.name}`}
						variant="transparent"
						divider
					/>
					<InfoRawCell
						title={context.getTranslation("Stats")}
						value={`${offerInfo.user.deals} ${context.getTranslation(
							"deals"
						)} • ${
							offerInfo.user.deals !== 0
								? (
										((offerInfo.user.completed_deals || 0) /
											(offerInfo.user.deals || 0)) *
										100
								  ).toFixed(0)
								: "0"
						}%`}
						variant="transparent"
					/>
				</Stack>
			</Stack>
		);
	}

	const isOk = amountInput.trim() !== "";

	const createDeal = async () => {
		try {
			getTelegram().MainButton.showProgress();
			const amount =
				currency === "crypto"
					? Number(amountInput)
					: Number(amountInput) / (offerInfo?.offer.price || 1);
			const data = await api.custom.post(
				"wallet/market/deals/create",
				context.props.auth?.token,
				{
					id,
					amount: withoutDecimals(
						amount,
						getContract()?.decimals || 1
					).toString(),
					method,
				}
			);
			notificationOccurred("success");
			router.push(`/market/deal/${data.deal.id}`);
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		} finally {
			getTelegram().MainButton.hideProgress();
		}
	};

	return !offerInfo ? (
		<Loader />
	) : (
		<Stack direction={"column"} spacing={8}>
			<BackButton onClick={onClose} />
			{isOk && (
				<MainButton
					text={context.getTranslation("Continue")}
					onClick={createDeal}
				/>
			)}

			<Stack direction={"column"} spacing={2}>
				<Stack alignItems={"center"} direction={"row"} spacing={2}>
					<Avatar size={"sm"} name={offerInfo.user.name} />
					<Text fontSize={"md"}>
						{HTMLReactParser(
							context
								.getTranslation(
									offerInfo.offer.type === "buy"
										? "You are selling to <b>%user%</b>"
										: "You are buying from <b>%user%</b>"
								)
								.replaceAll("%user%", offerInfo.user.name)
						)}
					</Text>
					{offerInfo.user.is_premium && <FaStar size={"18px"} />}
				</Stack>
				<FormControl>
					<Stack direction={"row"} spacing={2}>
						<AmountInput
							value={amountInput}
							onChange={setAmountInput}
							placeholder={`0 ${
								currency === "crypto"
									? getContract()?.symbol
									: offerInfo.offer.currency
							}`}
							maxValue={(
								Number(
									offerInfo.offer.max_amount
										? offerInfo.offer.max_amount
										: Number(
												formatBigint(
													offerInfo.offer.volume,
													getContract()?.decimals || 1
												)
										  ) * offerInfo.offer.price
								) / (currency === "crypto" ? offerInfo.offer.price : 1)
							).toString()}
						/>
						<IconButton
							colorScheme="button"
							aria-label="swap"
							icon={<HiMiniArrowsUpDown size={"20px"} />}
							onClick={() => {
								if (amountInput.trim() !== "") {
									setAmountInput(
										(currency === "crypto"
											? Number(amountInput) * offerInfo.offer.price
											: Number(amountInput) / offerInfo.offer.price
										).toString()
									);
								}
								setCurrency(currency === "crypto" ? "fiat" : "crypto");
							}}
						></IconButton>
					</Stack>
					<FormHelperText>
						{context
							.getTranslation("Price per %amount%")
							.replaceAll("%amount%", `1 ${getContract()?.symbol}`)}{" "}
						= {offerInfo.offer.price} {offerInfo.offer.currency}
					</FormHelperText>
				</FormControl>
			</Stack>

			<Stack direction={"column"} spacing={2}>
				<MenuSelect
					options={offerInfo.offer.methods.map(e => {
						const method = getMethod(e);
						return {
							placeholder:
								(context.props.auth?.profile.language === "ru"
									? method?.name_ru || method?.name_en
									: method?.name_en) || "",
							value: e.toString(),
						};
					})}
					value={method?.toString()}
					onChange={e => {
						setMethod(Number(e));
					}}
				>
					<InfoRawCell
						title={context.getTranslation("Payment Method")}
						value={
							method
								? getMethod(method)?.name_en || ""
								: context.getTranslation("None")
						}
						onClick={() => {}}
						icon={<BsChevronExpand size={"16px"} />}
					/>
				</MenuSelect>
				<InfoRawCell
					title={context.getTranslation("Limits")}
					value={
						currency === "fiat"
							? `${offerInfo.offer.min_amount} – ${
									offerInfo.offer.max_amount
										? offerInfo.offer.max_amount
										: `${
												Number(
													formatBigint(
														offerInfo.offer.volume,
														getContract()?.decimals || 1
													)
												) * offerInfo.offer.price
										  }`
							  } ${offerInfo.offer.currency}`
							: `${(offerInfo.offer.min_amount / offerInfo.offer.price).toFixed(
									2
							  )} – ${
									offerInfo.offer.max_amount
										? (
												offerInfo.offer.max_amount / offerInfo.offer.price
										  ).toFixed(2)
										: formatBigint(
												offerInfo.offer.volume,
												getContract()?.decimals || 1
										  )
							  } ${getContract()?.symbol}`
					}
				/>
				<CellButton
					title={context.getTranslation("Offer Details")}
					onClick={setDetails.on}
				/>
			</Stack>
		</Stack>
	);
}
