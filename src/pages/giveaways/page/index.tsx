import {
	Avatar,
	Box,
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
import {
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import HTMLReactParser from "html-react-parser";
import Lottie from "lottie-react";
import moment from "moment";
import { useContext, useState } from "react";
import { FaCheck, FaTrophy, FaXmark } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import Turnstile from "react-turnstile";
import api from "../../../api/api";
import Cell from "../../../components/Cell";
import Loader from "../../../components/Loader";
import config from "../../../config";
import useInterval from "../../../hooks/useInterval";
import { AppContext } from "../../../providers/AppProvider";
import boomstick from "../../../stickers/boomstick.json";
import clock from "../../../stickers/clock.json";
import gift from "../../../stickers/gift.json";
import Comp from "../../../stickers/troph.json";
import { getColorMap, getTelegram } from "../../../utils";
import errorHandler, { formatBigint } from "../../../utils/utils";

function GiveawayPage() {
	const context = useContext(AppContext);
	const params = useParams();
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [data, setData] = useState<any>();

	useInterval(async () => {
		try {
			const response = await api.custom.get(
				`wallet/giveaways/get?key=${params.key}`,
				context.props.auth?.token
			);
			setData(response);
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		}
	}, 5000);

	const [checking, setChecking] = useBoolean();

	const getStatus = () => {
		if (data.giveaway.status === "ended") {
			return {
				icon: <FaCheck />,
				title: context.getTranslation("Giveaway finished"),
				color: "green.500",
			};
		}

		if (data.giveaway.status === "active") {
			if (data.status === "creator") {
				return {
					icon: null,
					title: context.getTranslation("You are giveaway creator"),
					color: "button.500",
				};
			}
			if (data.status === "member") {
				return {
					icon: <FaCheck />,
					title: context.getTranslation("You are already participating"),
					color: "button.500",
				};
			}
			if (data.status === "winner") {
				return {
					icon: <FaTrophy />,
					title: context.getTranslation("You are giveaway winner!"),
					color: "button.500",
				};
			}
			if (checking) {
				return {
					icon: <Spinner size={"sm"} />,
					title: context.getTranslation("Loading"),
					color: "button.500",
				};
			}
			return null;
		}

		return {
			icon: <FaXmark />,
			title: context.getTranslation("Giveaway canceled"),
			color: getTelegram().themeParams.destructive_text_color,
		};
	};

	const [captcha, setCaptcha] = useBoolean();
	const [winnersOpened, setWinnersOpened] = useBoolean();

	const joinGiveaway = async (token: string) => {
		try {
			setChecking.on();
			await api.custom.post(
				"wallet/giveaways/join",
				context.props.auth?.token,
				{
					key: data.giveaway.key,
					retoken: token,
				}
			);
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
			setChecking.off();
			setCaptcha.off();
		}
	};

	if (data && checking && data.status === "member") {
		return (
			<Center
				minH={"var(--tg-viewport-stable-height)"}
				transition={"min-height 0.3s linear"}
			>
				<Stack alignItems={"center"} direction={"column"} spacing={2}>
					<Lottie
						style={{ width: 120, height: 120 }}
						animationData={boomstick}
						loop={true}
					/>

					<Heading size={"lg"}>
						{context.getTranslation("You are participating")}
					</Heading>

					<Text textAlign={"center"}>
						{context
							.getTranslation(
								data.giveaway.winners_count > 1
									? "On %date% AitherCol Wallet will randomly choose winners."
									: "On %date% AitherCol Wallet will randomly choose winner."
							)
							.replaceAll("%date%", moment(data.giveaway.end_at).format("LLL"))}
					</Text>

					<MainButton
						text={context.getTranslation("Close")}
						onClick={() => getTelegram().close()}
					/>
				</Stack>
			</Center>
		);
	}

	if (data && checking && data.status !== "member") {
		return (
			<Center
				minH={"var(--tg-viewport-stable-height)"}
				transition={"min-height 0.3s linear"}
			>
				<Stack alignItems={"center"} direction={"column"} spacing={2}>
					<Lottie
						style={{ width: 120, height: 120 }}
						animationData={clock}
						loop={true}
					/>

					<Heading size={"lg"}>
						{context.getTranslation("Checking subscriptions")}
					</Heading>

					<Text textAlign={"center"}>
						{context.getTranslation("The result will be sent to")}{" "}
						<b>
							<span
								color={getTelegram().themeParams.button_color}
								onClick={() =>
									getTelegram().openTelegramLink(
										`https://t.me/${config.username}`
									)
								}
							>
								@{config.username}
							</span>
						</b>
					</Text>

					<MainButton
						text={context.getTranslation("Close")}
						onClick={() => getTelegram().close()}
					/>
				</Stack>
			</Center>
		);
	}

	if (
		data &&
		data.giveaway.status === "ended" &&
		data.giveaway.show_winners &&
		data.winners !== null &&
		winnersOpened
	) {
		return (
			<Center
				minH={"var(--tg-viewport-stable-height)"}
				transition={"min-height 0.3s linear"}
			>
				<Stack direction={"column"} spacing={4}>
					<Stack
						alignItems={"center"}
						textAlign={"center"}
						direction={"column"}
						spacing={2}
					>
						<Lottie
							style={{ width: 120, height: 120 }}
							animationData={Comp}
							loop={true}
						/>

						<Heading size={"lg"}>
							{context.getTranslation("Giveaway results")}
						</Heading>

						<Text textAlign={"center"}>
							{HTMLReactParser(
								context
									.getTranslation(
										"AitherCol Wallet selected <b>%winners_count% winners</b> and sent <b>%amount%</b>."
									)
									.replaceAll(
										"%winners_count%",
										data.giveaway.winners_count.toString()
									)
									.replaceAll(
										"%amount%",
										`${formatBigint(
											data.giveaway.amount_per_winner,
											data.info.decimals
										)} ${data.info.symbol}`
									)
							)}
						</Text>
					</Stack>

					<Stack direction={"column"} spacing={2}>
						{data.winners.map((winner: any) => (
							<Cell
								onClick={
									winner.username
										? () =>
												getTelegram().openTelegramLink(
													`https://t.me/${winner.username}`
												)
										: undefined
								}
								icon={
									<Avatar
										w="40px"
										h="40px"
										src={winner.avatar || undefined}
										name={
											winner.is_anonymous
												? context.getTranslation("Anonymous")
												: `${winner.first_name} ${
														winner?.last_name || ""
												  }`.trim()
										}
										borderRadius={"999px"}
									/>
								}
								title={
									winner.is_anonymous
										? context.getTranslation("Anonymous")
										: `${winner.first_name} ${winner?.last_name || ""}`.trim()
								}
								additional={{
									title: `${formatBigint(
										data.giveaway.amount_per_winner,
										data.info.decimals
									)} ${data.info.symbol}`,
								}}
							/>
						))}
					</Stack>
				</Stack>
			</Center>
		);
	}
	return !data ? (
		<Loader />
	) : (
		<Center
			minH={"var(--tg-viewport-stable-height)"}
			transition={"min-height 0.3s linear"}
		>
			<Stack direction={"column"} spacing={4}>
				<Stack
					alignItems={"center"}
					textAlign={"center"}
					direction={"column"}
					spacing={2}
				>
					<Lottie
						style={{ width: 120, height: 120 }}
						animationData={gift}
						loop={true}
					/>

					<Heading size={"lg"}>
						<Stack alignItems={"center"} direction={"row"} spacing={2}>
							<span>{context.getTranslation("Giveaway")}</span>
							<Image
								src={data.info.image}
								borderRadius={"999px"}
								w="25px"
								h="25px"
							/>
							<span>
								{formatBigint(data.giveaway.amount, data.info.decimals)}{" "}
								{data.info.symbol}
							</span>
						</Stack>
					</Heading>

					<Text textAlign={"center"}>
						{HTMLReactParser(
							context
								.getTranslation(
									data.giveaway.winners_count > 1
										? "<b>%winners_count% winners</b> will receive <b>%amount%</b> each."
										: "<b>1 winner</b> will receive <b>%amount%</b>."
								)
								.replaceAll(
									"%winners_count%",
									data.giveaway.winners_count.toString()
								)
								.replaceAll(
									"%amount%",
									`${formatBigint(
										data.giveaway.amount_per_winner,
										data.info.decimals
									)} ${data.info.symbol}`
								)
						)}
					</Text>
				</Stack>

				<Stack alignItems={"center"} direction={"column"} spacing={2}>
					<Text textAlign={"center"}>
						{HTMLReactParser(
							context
								.getTranslation(
									data.giveaway.channels.length === 1
										? "To take part in this giveaway, <b>join 1 channel</b> and <b>click the button below</b>"
										: "To take part in this giveaway, <b>join %channels% channels</b> and <b>click the button below</b>"
								)
								.replaceAll("%channels%", data.giveaway.channels.length)
						)}
						:
					</Text>
					{data.giveaway.channels.map((channel: any) => (
						<Box>
							<Button
								variant={"ghost"}
								colorScheme="button"
								bgColor={
									getColorMap(getTelegram().themeParams.button_color)["500"] +
									"10"
								}
								leftIcon={
									<Avatar
										size={"sm"}
										color={"button.500"}
										name={channel.title}
										src={channel.avatar || undefined}
									/>
								}
								onClick={() => getTelegram().openTelegramLink(channel.link)}
							>
								{channel.title}
							</Button>
						</Box>
					))}
				</Stack>

				{getStatus() && (
					<Center>
						<Text
							textAlign={"center"}
							color={getStatus()?.color}
							fontWeight={"bold"}
						>
							<Stack alignItems={"center"} direction={"row"} spacing={1}>
								{getStatus()?.icon && getStatus()?.icon}
								<span>{getStatus()?.title}</span>
							</Stack>
						</Text>
					</Center>
				)}
				{captcha && !checking && (
					<Center>
						<Turnstile
							sitekey={"0x4AAAAAAAekRwf1cYgH9U2g"}
							onVerify={joinGiveaway}
						/>
					</Center>
				)}
				{!captcha && (
					<>
						{!getStatus() && (
							<MainButton
								text={context.getTranslation("Join Giveaway")}
								onClick={setCaptcha.on}
							/>
						)}
					</>
				)}
				<Text textAlign={"center"}>
					{context
						.getTranslation(
							data.giveaway.winners_count > 1
								? "On %date% AitherCol Wallet will randomly choose winners."
								: "On %date% AitherCol Wallet will randomly choose winner."
						)
						.replaceAll("%date%", moment(data.giveaway.end_at).format("LLL"))}
				</Text>
				{data.giveaway.status === "ended" &&
					data.giveaway.show_winners &&
					data.winners !== null && (
						<MainButton
							text={context.getTranslation("Open Winners")}
							onClick={setWinnersOpened.on}
						/>
					)}
			</Stack>
		</Center>
	);
}

export default GiveawayPage;
