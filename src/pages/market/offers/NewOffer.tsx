import {
	Box,
	Center,
	FormControl,
	FormHelperText,
	FormLabel,
	Heading,
	Image,
	Stack,
	Text,
	Textarea,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import {
	BackButton,
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { BsChevronExpand } from "react-icons/bs";
import { FaCheck } from "react-icons/fa6";
import api from "../../../api/api";
import Rate from "../../../api/types/Rate";
import AmountInput from "../../../components/AmountInput";
import CellButton from "../../../components/CellButton";
import CustomBackButton from "../../../components/CustomBackButton";
import MenuSelect from "../../../components/MenuSelect";
import useInterval from "../../../hooks/useInterval";
import { AppContext } from "../../../providers/AppProvider";
import { HistoryContext } from "../../../providers/HistoryProviders";
import { MarketContext } from "../../../providers/MarketProvider";
import { getTelegram } from "../../../utils";
import errorHandler, {
	formatBalance,
	formatBigint,
	withoutDecimals,
} from "../../../utils/utils";

export default function NewOffer() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const market = useContext(MarketContext);
	const { 1: notificationOccurred } = useHapticFeedback();
	const toast = useToast();
	const selectCurrency = useDisclosure();

	// Inputs
	const [step, setStep] = useState<1 | 2>(1);

	const [methods, setMethods] = useState<number[]>([]);
	const [type, setType] = useState<"buy" | "sell">("buy");
	const [contract, setContract] = useState<string>("");
	const [currency, setCurrency] = useState<string>(
		context.props.auth?.profile.market_currency || "USD"
	);
	const [description, setDescription] = useState<string>("");
	const [volume, setVolume] = useState<string>("");
	const [priceType, setPriceType] = useState<"floating" | "fixed">("floating");
	const [price, setPrice] = useState<string>("");
	const [percent, setPercent] = useState<string>("");
	const [minAmount, setMinAmount] = useState<string>("");
	const [maxAmount, setMaxAmount] = useState<string>("");
	const [rate, setRate] = useState<Rate | null>();
	const [fiat, setFiat] = useState<any | null>();

	const updateRate = async () => {
		try {
			const { data } = await axios.get("https://cache.aithercol.com/rate.json");
			setFiat(data);
			if (!contract) {
				return;
			}
			const rate = await api.wallet.getRates(
				[contract],
				context.props.auth?.token || ""
			);
			setRate(rate.rates[0]);
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		}
	};

	useInterval(updateRate, 5000);
	useEffect(() => {
		updateRate();
	}, [contract, currency]);

	const getContract = (contract: string) => {
		const values = type === "sell" ? context.balances : market.tokens || [];

		return values.find(e => e.contract === contract);
	};

	if (selectCurrency.isOpen) {
		const options =
			type === "sell"
				? context.balances.map(e => {
						return { name: e.name, value: e.contract, image: e.image };
				  })
				: (market.tokens || []).map(e => {
						return { name: e.name, value: e.contract, image: e.image };
				  });
		return (
			<Stack direction={"column"} spacing={2}>
				<BackButton onClick={() => selectCurrency.onClose()} />

				<Heading
					size={"sm"}
					color={getTelegram().themeParams.hint_color}
					textTransform={"uppercase"}
				>
					{context.getTranslation("Select Currency")}
				</Heading>

				{options.map(e => (
					<CellButton
						title={e.name}
						icon={
							e.image ? (
								<Image w={"24px"} h="24px" src={e.image} borderRadius="999px" />
							) : undefined
						}
						hideRight
						onClick={() => {
							setContract(e.value);
							selectCurrency.onClose();
						}}
					/>
				))}
			</Stack>
		);
	}

	const isOkStep1 =
		contract.trim() !== "" &&
		volume.trim() !== "" &&
		(priceType === "floating" ? percent.trim() !== "" : price.trim() !== "") &&
		minAmount.trim() !== "";

	const create = async () => {
		try {
			getTelegram().MainButton.showProgress();
			await api.custom.post(
				"wallet/market/offers/create",
				context.props.auth?.token,
				{
					methods,
					type,
					contract,
					currency,
					description,
					volume: withoutDecimals(
						Number(volume),
						getContract(contract)?.decimals || 1
					).toString(),
					percent: priceType === "floating" ? percent : null,
					price: priceType === "floating" ? 1 : price,
					min_amount: minAmount,
					max_amount: maxAmount,
				}
			);

			await market.update();
			notificationOccurred("success");
			router.back();
		} catch (error) {
			errorHandler(error, toast);
			notificationOccurred("error");
		} finally {
			getTelegram().MainButton.hideProgress();
		}
	};

	if (step === 2) {
		const isOk = isOkStep1 && methods.length !== 0;

		return (
			<Stack direction={"column"} spacing={2}>
				{isOk && (
					<MainButton
						text={context.getTranslation("Create")}
						onClick={create}
					/>
				)}

				<BackButton onClick={() => setStep(1)} />

				<Heading
					size={"sm"}
					color={getTelegram().themeParams.hint_color}
					textTransform={"uppercase"}
				>
					{context.getTranslation("Create Offer")}
				</Heading>

				{(market.methods || []).map(e => (
					<CellButton
						title={
							context.props.auth?.profile.language === "ru"
								? e.name_ru || e.name_en
								: e.name_en
						}
						icon={
							methods.includes(e.id) ? (
								<Center
									borderRadius={"999px"}
									border={`1px solid ${
										getTelegram().themeParams.accent_text_color
									}`}
									w="20px"
									h="20px"
									bgColor={getTelegram().themeParams.accent_text_color}
									overflow={"hidden"}
								>
									<FaCheck
										color={getTelegram().themeParams.button_text_color}
										size={"12px"}
									/>
								</Center>
							) : (
								<Box
									borderRadius={"999px"}
									border={`1px solid ${getTelegram().themeParams.hint_color}`}
									w="20px"
									h="20px"
								/>
							)
						}
						hideRight
						onClick={() => {
							if (methods.includes(e.id)) {
								setMethods(methods.filter(method => method !== e.id));
							} else {
								setMethods([...methods, e.id]);
							}
						}}
					/>
				))}
			</Stack>
		);
	}

	return (
		<Stack direction={"column"} spacing={2}>
			{isOkStep1 && (
				<MainButton
					text={context.getTranslation("Continue")}
					onClick={() => setStep(2)}
				/>
			)}

			<CustomBackButton />

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("Create Offer")}
			</Heading>

			<MenuSelect
				options={[
					{ value: "buy", placeholder: context.getTranslation("buy") },
					{ value: "sell", placeholder: context.getTranslation("sell") },
				]}
				value={type}
				onChange={e => {
					setType(e as any);
					setContract("");
					setVolume("");
				}}
			>
				<CellButton
					title={context.getTranslation("I want to")}
					rightItem={
						<Stack
							color={getTelegram().themeParams.link_color}
							direction={"row"}
							spacing={1}
							alignItems={"center"}
						>
							<Text>
								{type === "buy"
									? context.getTranslation("buy")
									: context.getTranslation("sell")}
							</Text>
							<BsChevronExpand size={"16px"} />
						</Stack>
					}
				/>
			</MenuSelect>

			<CellButton
				title={context.getTranslation(
					`${type === "sell" ? "Sell" : "Buy"} Crypto`
				)}
				rightItem={
					<Stack
						color={getTelegram().themeParams.link_color}
						direction={"row"}
						spacing={1}
						alignItems={"center"}
					>
						<Text>{getContract(contract)?.symbol || "None"}</Text>
						<BsChevronExpand size={"16px"} />
					</Stack>
				}
				onClick={selectCurrency.onOpen}
			/>

			<MenuSelect
				options={(market.currencies || []).map(e => {
					return { value: e, placeholder: e };
				})}
				value={currency}
				onChange={setCurrency}
			>
				<CellButton
					title={context.getTranslation("Fiat Currency")}
					rightItem={
						<Stack
							color={getTelegram().themeParams.link_color}
							direction={"row"}
							spacing={1}
							alignItems={"center"}
						>
							<Text>{currency}</Text>
							<BsChevronExpand size={"16px"} />
						</Stack>
					}
				/>
			</MenuSelect>

			<MenuSelect
				options={[
					{
						value: "floating",
						placeholder: context.getTranslation("Floating"),
					},
					{ value: "fixed", placeholder: context.getTranslation("Fixed") },
				]}
				value={priceType}
				onChange={e => setPriceType(e as any)}
			>
				<CellButton
					title={context.getTranslation("Price Type")}
					rightItem={
						<Stack
							color={getTelegram().themeParams.link_color}
							direction={"row"}
							spacing={1}
							alignItems={"center"}
						>
							<Text>
								{priceType === "floating"
									? context.getTranslation("Floating")
									: context.getTranslation("Fixed")}
							</Text>
							<BsChevronExpand size={"16px"} />
						</Stack>
					}
				/>
			</MenuSelect>

			{contract.trim() !== "" && (
				<>
					{(priceType === "floating" && (
						<FormControl>
							<FormLabel>
								{context.getTranslation("Percentage to Price")}
							</FormLabel>
							<AmountInput
								value={percent}
								onChange={setPercent}
								ignoreInputMode
								placeholder="1% ~ 10%"
							></AmountInput>
							<FormHelperText color={getTelegram().themeParams.hint_color}>
								{context.getTranslation("Price")}:{" "}
								{((rate?.price || 1) / (fiat ? fiat[currency] : 1)).toFixed(2)}
								<br />
								{context.getTranslation("Your price")}:{" "}
								{(
									((rate?.price || 1) +
										(rate?.price || 1) * ((Number(percent) || 0) / 100)) /
									(fiat ? fiat[currency] : 1)
								).toFixed(2)}
							</FormHelperText>
						</FormControl>
					)) || (
						<FormControl>
							<FormLabel>
								{context
									.getTranslation("Price per %amount%")
									.replaceAll("%amount%", `1 ${getContract(contract)?.symbol}`)}
							</FormLabel>
							<AmountInput
								placeholder={`0 ${currency}`}
								value={price}
								onChange={setPrice}
							></AmountInput>
							<FormHelperText color={getTelegram().themeParams.hint_color}>
								{context.getTranslation("Price")}:{" "}
								{((rate?.price || 1) / (fiat ? fiat[currency] : 1)).toFixed(2)}
							</FormHelperText>
						</FormControl>
					)}

					<FormControl>
						<FormLabel>{context.getTranslation("Volume")}</FormLabel>
						<AmountInput
							maxValue={
								type === "sell"
									? formatBigint(
											formatBalance(getContract(contract) as any),
											getContract(contract)?.decimals || 1
									  )
									: undefined
							}
							placeholder={`0 ${getContract(contract)?.symbol}`}
							value={volume}
							onChange={setVolume}
						></AmountInput>
						{type === "sell" && (
							<FormHelperText color={getTelegram().themeParams.hint_color}>
								{context.getTranslation("Your balance")}:{" "}
								{formatBigint(
									formatBalance(getContract(contract) as any),
									getContract(contract)?.decimals || 1
								)}{" "}
								{getContract(contract)?.symbol}
							</FormHelperText>
						)}
					</FormControl>

					<FormControl>
						<FormLabel>
							{context.getTranslation("Min amount of deal")}
						</FormLabel>
						<AmountInput
							placeholder={`Min ${
								market.minAmount[currency] ? market.minAmount[currency] : 0
							} ${currency}`}
							value={minAmount}
							onChange={setMinAmount}
						></AmountInput>
					</FormControl>

					<FormControl>
						<FormLabel>
							{context.getTranslation("Max amount of deal")} (
							{context.getTranslation("optional")})
						</FormLabel>
						<AmountInput
							placeholder={`Max`}
							value={maxAmount}
							onChange={setMaxAmount}
						></AmountInput>
					</FormControl>

					<FormControl>
						<FormLabel>
							{context.getTranslation("Description")} (
							{context.getTranslation("optional")})
						</FormLabel>
						<Textarea
							borderColor={"transparent"}
							bgColor={getTelegram().themeParams.bg_color}
							_hover={{
								borderColor: getTelegram().themeParams.hint_color,
							}}
							_focus={{
								borderColor: getTelegram().themeParams.accent_text_color,
								boxShadow: "none",
							}}
							_placeholder={{ color: getTelegram().themeParams.hint_color }}
							value={description}
							onChange={e => setDescription(e.currentTarget.value)}
						></Textarea>
					</FormControl>
				</>
			)}
		</Stack>
	);
}
