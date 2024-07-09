import {
	Avatar,
	Center,
	FormControl,
	FormHelperText,
	FormLabel,
	Heading,
	IconButton,
	Input,
	Stack,
	Switch,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import {
	BackButton,
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { FaPlus, FaXmark } from "react-icons/fa6";
import api from "../../api/api";
import AmountInput from "../../components/AmountInput";
import CellButton from "../../components/CellButton";
import CustomBackButton from "../../components/CustomBackButton";
import SelectScreen from "../../components/SelectScreen";
import config from "../../config";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getColorMap, getTelegram } from "../../utils";
import errorHandler, {
	formatBalance,
	formatBigint,
	withoutDecimals,
} from "../../utils/utils";

export default function CreateGiveaway() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [contract, setContract] = useState<string | null>();
	const [amountString, setAmountString] = useState<string>("");
	const [winnersCount, setWinnersCount] = useState<string>("1");
	const [showWinners, setShowWinners] = useState<boolean>(true);
	const [endAt, setEndAt] = useState<string>("");
	const [channelsRow, setChannelsRow] = useState<number[]>([]);

	const connectChannel = useDisclosure();
	const [channels, setChannels] = useState<any[]>([]);

	const getBalance = () => {
		return context.balances.find(e => e.contract === contract);
	};

	useEffect(() => {
		(async () => {
			try {
				const data = await api.custom.get(
					"wallet/channels",
					context.props.auth?.token
				);
				setChannels(data.channels);
			} catch (error) {
				notificationOccurred("error");
				errorHandler(error, toast);
				router.back();
			}
		})();
	}, []);

	if (!contract) {
		return (
			<>
				<CustomBackButton />
				<SelectScreen
					title={context.getTranslation("choose_token")}
					options={(context.balances || []).map(e => {
						return { name: e.name, value: e.contract, image: e.image };
					})}
					onChange={e => setContract(e)}
					onClose={() => {}}
				/>
			</>
		);
	}

	if (connectChannel.isOpen) {
		return (
			<>
				<BackButton onClick={connectChannel.onClose} />
				<SelectScreen
					title={context.getTranslation("Choose channel")}
					options={[
						{ name: context.getTranslation("Add New Channel"), value: "new" },
						...(channels || [])
							.filter(e => !channelsRow.includes(e.id))
							.map(e => {
								return {
									name: e.title,
									value: e.id.toString(),
									image: e.avatar,
								};
							}),
					]}
					onChange={e => {
						if (e === "new") {
							getTelegram().openTelegramLink(
								`https://t.me/${config.username}?start=add-channel-giveaway`
							);
							getTelegram().close();
							return;
						}
						setChannelsRow([...channelsRow, Number(e)]);
					}}
					onClose={connectChannel.onClose}
				/>
			</>
		);
	}

	const isOk =
		amountString !== "" &&
		Number(winnersCount) >= 1 &&
		endAt.trim() !== "" &&
		channelsRow.length >= 1;

	const createGiveaway = async () => {
		try {
			getTelegram().MainButton.showProgress();
			await api.custom.post(
				"wallet/giveaways/create",
				context.props.auth?.token,
				{
					balance_id: getBalance()?.id,
					amount: withoutDecimals(
						Number(amountString),
						getBalance()?.decimals || 1
					).toString(),
					winners_count: Number(winnersCount),
					end_at: moment(endAt).utc().toISOString(),
					сhannels: channelsRow,
					show_winners: showWinners,
				}
			);
			notificationOccurred("success");
			router.back();
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		} finally {
			getTelegram().MainButton.hideProgress();
		}
	};

	return (
		<Stack direction={"column"} spacing={2}>
			<BackButton onClick={() => setContract(null)} />
			{isOk && (
				<MainButton
					text={context.getTranslation("Create")}
					onClick={createGiveaway}
				/>
			)}

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context
					.getTranslation("Create %symbol% Giveaway")
					.replaceAll("%symbol%", getBalance()?.symbol || "")}
			</Heading>

			<FormControl>
				<FormLabel>{context.getTranslation("amount")}</FormLabel>
				<AmountInput
					maxValue={formatBigint(
						formatBalance(getBalance()),
						getBalance()?.decimals || 1
					)}
					value={amountString}
					onChange={e => setAmountString(e)}
				/>

				<FormHelperText color={getTelegram().themeParams.hint_color}>
					{context.getTranslation("Your balance")}:{" "}
					{formatBigint(
						formatBalance(getBalance()),
						getBalance()?.decimals || 1
					)}
				</FormHelperText>
			</FormControl>
			<FormControl>
				<FormLabel>{context.getTranslation("Winners")}</FormLabel>
				<Input
					type="number"
					inputMode="decimal"
					borderColor={"transparent"}
					bgColor={getTelegram().themeParams.bg_color}
					_hover={{
						borderColor: getTelegram().themeParams.hint_color,
					}}
					_focus={{
						borderColor: getTelegram().themeParams.accent_text_color,
						boxShadow: "none",
					}}
					value={winnersCount.toString()}
					onChange={e => {
						if (!e.currentTarget.value) {
							setWinnersCount("");
						} else {
							setWinnersCount(e.currentTarget.value);
						}
					}}
				/>

				{amountString.trim() !== "" && (
					<FormHelperText color={getTelegram().themeParams.hint_color}>
						{context
							.getTranslation("Each winner will receive %amount%")
							.replaceAll(
								"%amount%",
								`${formatBigint(
									(
										BigInt(
											withoutDecimals(
												Number(amountString),
												getBalance()?.decimals || 1
											).toString()
										) / BigInt(Number(winnersCount) || 1)
									).toString(),
									getBalance()?.decimals || 1
								)} ${getBalance()?.symbol}`
							)}
					</FormHelperText>
				)}
			</FormControl>
			<CellButton
				title={context.getTranslation("Show Winners")}
				rightItem={
					<Switch
						isChecked={showWinners}
						size={"md"}
						colorScheme="button"
						onClick={() => setShowWinners(!showWinners)}
						onChange={() => setShowWinners(!showWinners)}
					/>
				}
			/>
			<FormControl>
				<FormLabel>{context.getTranslation("Giveaway Ends")}</FormLabel>
				<Input
					type="datetime-local"
					borderColor={"transparent"}
					bgColor={getTelegram().themeParams.bg_color}
					_hover={{
						borderColor: getTelegram().themeParams.hint_color,
					}}
					_placeholder={{ color: getTelegram().themeParams.hint_color }}
					_focus={{
						borderColor: getTelegram().themeParams.accent_text_color,
						boxShadow: "none",
					}}
					value={endAt}
					onChange={e => {
						setEndAt(e.currentTarget.value);
					}}
				/>
			</FormControl>
			<FormControl>
				<FormLabel>{context.getTranslation("Connected Channels")}</FormLabel>
				<Stack direction={"column"} spacing={2}>
					<CellButton
						title={context.getTranslation("Connect Channel")}
						onClick={connectChannel.onOpen}
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
					/>
					{channelsRow.map(e => (
						<CellButton
							title={channels.find(channel => channel.id === e).title}
							onClick={() => {
								setChannelsRow(channelsRow.filter(channel => channel !== e));
							}}
							rightItem={
								<IconButton
									aria-label="remove"
									size={"sm"}
									variant={"ghost"}
									bgColor={
										getColorMap(
											getTelegram().themeParams.destructive_text_color
										)["500"] + "10"
									}
									colorScheme="destructive"
									icon={<FaXmark size={"20px"} />}
								/>
							}
							icon={
								<Avatar
									w={"24px"}
									h="24px"
									borderRadius={"999px"}
									name={channels.find(channel => channel.id === e).title}
									src={
										channels.find(channel => channel.id === e).avatar ||
										undefined
									}
								>
									<FaPlus size={"14px"} />
								</Avatar>
							}
						/>
					))}
				</Stack>
			</FormControl>
		</Stack>
	);
}
