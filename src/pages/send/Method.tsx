import {
	Avatar,
	Box,
	Center,
	Heading,
	IconButton,
	Input,
	InputGroup,
	InputRightElement,
	Stack,
	Text,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import {
	BackButton,
	useHapticFeedback,
	useScanQrPopup,
} from "@vkruglikov/react-telegram-web-app";
import { useContext, useEffect, useState } from "react";
import { FaMessage, FaMoneyBillWave } from "react-icons/fa6";
import { LuScanLine } from "react-icons/lu";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import Cell from "../../components/Cell";
import CellButton from "../../components/CellButton";
import CustomBackButton from "../../components/CustomBackButton";
import config from "../../config";
import useContacts from "../../hooks/useContacts";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";
import { getCacheItemJSON, setCacheItem } from "../../utils/cache";
import errorHandler, { getTonViewer, reduceString } from "../../utils/utils";

function Method() {
	const router = useContext(HistoryContext);
	const params = useParams();
	const toast = useToast();
	const context = useContext(AppContext);
	const { 1: notificationOccurred } = useHapticFeedback();
	const { contacts } = useContacts();
	const { telegramContacts } = useContacts(true);

	const [showQrPopup, closeQrPopup] = useScanQrPopup();

	const telegramSearch = useDisclosure();
	const addressSearch = useDisclosure();

	const getBalance = () => {
		return context.balances.find(e => e.contract === params.contract);
	};

	if (addressSearch.isOpen) {
		return (
			<ContactSearch
				contacts={
					contacts?.map(e => {
						return {
							name: e.title,
							address: e.address,
							onClick() {
								router.push(
									`/withdraw/${params.contract}/address/${e.address}`
								);
							},
						};
					}) || []
				}
				onClose={addressSearch.onClose}
				placeholder={context.getTranslation("Enter name or address")}
				customClick={e => {
					router.push(`/withdraw/${params.contract}/address/${e}`);
				}}
			/>
		);
	}

	if (telegramSearch.isOpen) {
		return (
			<ContactSearch
				contacts={
					telegramContacts?.map(e => {
						return {
							name: e.telegram_id,
							onClick() {
								router.push(
									`/withdraw/${params.contract}/telegram/${e.telegram_id}`
								);
							},
							isTelegram: true,
						};
					}) || []
				}
				pinned={{
					name: context.getTranslation("Select from chats"),
					avatarComponent: (
						<Center
							w={"40px"}
							h="40px"
							borderRadius={"999px"}
							overflow={"hidden"}
							bgColor={getTelegram().themeParams.accent_text_color}
							color={getTelegram().themeParams.button_text_color}
						>
							<FaMessage size={"20px"} />
						</Center>
					),
					async onClick() {
						try {
							await api.custom.post(
								"wallet/balances/transfer/select_telegram_user",
								context.props.auth?.token,
								{ contract: params.contract }
							);
							getTelegram().openTelegramLink(`https://t.me/${config.username}`);
							getTelegram().close();
						} catch (error) {
							notificationOccurred("error");
							errorHandler(error, toast);
						}
					},
				}}
				onClose={telegramSearch.onClose}
				placeholder={context.getTranslation("Enter name, @username or ID")}
				customClick={e => {
					router.push(`/withdraw/${params.contract}/telegram/${e}`);
				}}
				isTelegram
			/>
		);
	}

	return (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("send")} {getBalance()?.symbol}
			</Heading>

			<Stack
				direction={"column"}
				spacing={2}
				pt={3}
				pb={3}
				borderRadius={"lg"}
				bgColor={getTelegram().themeParams.bg_color}
				w="full"
			>
				<Box paddingInlineStart={3} paddingInlineEnd={3}>
					<Heading size={"sm"}>
						{context.getTranslation("Send by Telegram")}
					</Heading>
				</Box>
				<Box w="full" paddingInlineStart={3} paddingInlineEnd={3}>
					<Input
						borderColor={getTelegram().themeParams.hint_color + "10"}
						bgColor={getTelegram().themeParams.bg_color}
						_hover={{
							borderColor: getTelegram().themeParams.hint_color,
						}}
						_focus={{
							borderColor: getTelegram().themeParams.accent_text_color,
							boxShadow: "none",
						}}
						_placeholder={{ color: getTelegram().themeParams.hint_color }}
						placeholder={context.getTranslation("Enter name, @username or ID")}
						isReadOnly
						onClick={telegramSearch.onOpen}
					></Input>
				</Box>
				<Stack
					className="no-scrollbar"
					overflowY={"hidden"}
					direction={"row"}
					spacing={"6px"}
				>
					<Box minW={"calc(var(--aithercol-sizes-3) - 6px)"} />
					{telegramContacts?.map(contact => (
						<Contact
							name={contact.telegram_id}
							isTelegram
							onClick={() =>
								router.push(
									`/withdraw/${params.contract}/telegram/${contact.telegram_id}`
								)
							}
						/>
					))}
					<Contact
						name={context.getTranslation("Chats")}
						avatarComponent={
							<Center
								w={"56px"}
								h="56px"
								borderRadius={"999px"}
								overflow={"hidden"}
								bgColor={getTelegram().themeParams.accent_text_color}
								color={getTelegram().themeParams.button_text_color}
							>
								<FaMessage size={"28px"} />
							</Center>
						}
						onClick={async () => {
							try {
								await api.custom.post(
									"wallet/balances/transfer/select_telegram_user",
									context.props.auth?.token,
									{ contract: params.contract }
								);
								getTelegram().openTelegramLink(
									`https://t.me/${config.username}`
								);
								getTelegram().close();
							} catch (error) {
								notificationOccurred("error");
								errorHandler(error, toast);
							}
						}}
					/>
					<Box minW={"calc(var(--aithercol-sizes-3) - 6px)"} />
				</Stack>
			</Stack>

			<Stack
				direction={"column"}
				spacing={2}
				pt={3}
				pb={3}
				borderRadius={"lg"}
				bgColor={getTelegram().themeParams.bg_color}
				w="full"
			>
				<Box paddingInlineStart={3} paddingInlineEnd={3}>
					<Heading size={"sm"}>
						{context.getTranslation("Send by address")}
					</Heading>
				</Box>
				<Box w="full" paddingInlineStart={3} paddingInlineEnd={3}>
					<Input
						borderColor={getTelegram().themeParams.hint_color + "10"}
						bgColor={getTelegram().themeParams.bg_color}
						_hover={{
							borderColor: getTelegram().themeParams.hint_color,
						}}
						_focus={{
							borderColor: getTelegram().themeParams.accent_text_color,
							boxShadow: "none",
						}}
						_placeholder={{ color: getTelegram().themeParams.hint_color }}
						placeholder={context.getTranslation("Enter name or address")}
						isReadOnly
						onClick={addressSearch.onOpen}
					></Input>
				</Box>
				<Stack
					className="no-scrollbar"
					overflowY={"hidden"}
					direction={"row"}
					spacing={"6px"}
				>
					<Box minW={"calc(var(--aithercol-sizes-3) - 6px)"} />
					{contacts?.map(contact => (
						<Contact
							name={contact.title}
							onClick={() =>
								router.push(
									`/withdraw/${params.contract}/address/${contact.address}`
								)
							}
						/>
					))}
					<Box minW={"calc(var(--aithercol-sizes-3) - 6px)"} />
				</Stack>
			</Stack>

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
						<FaMoneyBillWave size={"14px"} />
					</Center>
				}
				title={context.getTranslation("Create Check")}
				onClick={() => router.push(`/withdraw/${params.contract}/check`)}
			/>
		</Stack>
	);
}

interface ContactComponent {
	avatar?: string;
	avatarComponent?: React.ReactElement;
	name: string;
	address?: string;
	onClick: () => void;
	isTelegram?: boolean;
}

function ContactSearch({
	contacts,
	pinned,
	isTelegram,
	onClose,
	placeholder,
	customClick,
}: {
	contacts: ContactComponent[];
	pinned?: ContactComponent;
	isTelegram?: boolean;
	onClose: () => void;
	placeholder: string;
	customClick: (value: string) => void;
}) {
	const [value, setValue] = useState<string>("");

	const toast = useToast();
	const context = useContext(AppContext);

	const [showQrPopup, closeQrPopup] = useScanQrPopup();

	const Contact = (contact: ContactComponent) => {
		const toast = useToast();
		const context = useContext(AppContext);
		const { 1: notificationOccurred } = useHapticFeedback();
		const [user, setUser] = useState<any>(
			getCacheItemJSON(`telegram:${contact.name}`)
		);

		useEffect(() => {
			(async () => {
				if (contact.isTelegram) {
					try {
						const res = await api.custom.get(
							`get_telegram_profile?id=${contact.name}`,
							context.props.auth?.token
						);
						setUser(res.profile);
						setCacheItem(
							`telegram:${contact.name}`,
							JSON.stringify(res.profile)
						);
					} catch (error) {
						notificationOccurred("error");
						errorHandler(error, toast);
					}
				}
			})();
		}, []);

		return (
			<Cell
				onClick={contact.onClick}
				title={contact.isTelegram ? user?.first_name || "..." : contact.name}
				subTitle={
					!contact.isTelegram
						? contact.address
							? reduceString(contact.address, 20)
							: undefined
						: user?.username
						? `@${user.username}`
						: undefined
				}
				subTitleLink={
					!contact.isTelegram
						? `${getTonViewer(context)}/${contact.address}`
						: user?.username
						? `https://t.me/${user.username}`
						: undefined
				}
				icon={
					contact.avatarComponent ? (
						contact.avatarComponent
					) : (
						<Avatar
							name={
								contact.isTelegram ? user?.first_name || "..." : contact.name
							}
							src={contact.isTelegram ? user?.photo : contact.avatar}
							w="40px"
							h="40px"
							size={"lg"}
						/>
					)
				}
			/>
		);
	};

	const FindingContact = () => {
		const [user, setUser] = useState<any | null>();

		useEffect(() => {
			const delayDebounceFn = setTimeout(() => {
				if (value.trim() !== "") {
					(async () => {
						try {
							const res = await api.custom.get(
								`get_telegram_profile?id=${value}`,
								context.props.auth?.token
							);
							setUser(res.profile);
						} catch (error) {
							setUser(null);
						}
					})();
				}
			}, 500);

			return () => clearTimeout(delayDebounceFn);
		}, [value]);

		return (
			<>
				{user && (
					<Cell
						onClick={() => customClick(user.id)}
						title={user.first_name}
						subTitle={user?.username ? `@${user.username}` : undefined}
						subTitleLink={
							user?.username ? `https://t.me/${user.username}` : undefined
						}
						icon={
							<Avatar
								name={user?.first_name}
								src={user?.photo}
								w="40px"
								h="40px"
								size={"lg"}
							/>
						}
					/>
				)}
			</>
		);
	};

	const results = contacts.filter(e => {
		const telegramUser = isTelegram
			? getCacheItemJSON(`telegram:${e.name}`)
			: null;
		return (
			value.trim() === "" ||
			e.name.toLowerCase().includes(value.trim().toLowerCase()) ||
			e.address?.toLowerCase().includes(value.trim().toLowerCase()) ||
			(telegramUser
				? telegramUser.first_name
						.toLowerCase()
						.includes(value.trim().toLowerCase())
				: false) ||
			(telegramUser?.username
				? telegramUser.username
						.toLowerCase()
						.includes(value.trim().toLowerCase())
				: false)
		);
	});

	return (
		<Stack direction={"column"} spacing={2}>
			<BackButton onClick={onClose} />
			<InputGroup>
				<Input
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
					placeholder={placeholder}
					value={value}
					onChange={e => setValue(e.currentTarget.value)}
				></Input>
				{!isTelegram && (
					<InputRightElement width="3rem">
						<IconButton
							variant={"ghost"}
							colorScheme="button"
							color="button.500"
							size={"sm"}
							aria-label="scan"
							icon={<LuScanLine size={"20px"} />}
							onClick={() => {
								showQrPopup(
									{
										text: context.getTranslation(
											"Find QR that contains wallet address"
										),
									},
									text => {
										closeQrPopup();
										customClick(text);
									}
								);
							}}
						/>
					</InputRightElement>
				)}
			</InputGroup>

			{pinned && <Contact {...pinned} />}
			{results.length === 0 && value.trim() !== "" && (
				<>
					{!isTelegram && (
						<Cell
							onClick={() => customClick(value || "")}
							icon={<Avatar w="40px" h="40px" size={"lg"} />}
							title={reduceString(value, 20)}
						/>
					)}
					{isTelegram && <FindingContact />}
				</>
			)}

			{results.map(e => (
				<Contact {...e} />
			))}
		</Stack>
	);
}

function Contact({
	avatar,
	name,
	onClick,
	isTelegram,
	avatarComponent,
}: {
	avatar?: string;
	avatarComponent?: React.ReactElement;
	name: string;
	onClick: () => void;
	isTelegram?: boolean;
}) {
	const toast = useToast();
	const context = useContext(AppContext);
	const { 1: notificationOccurred } = useHapticFeedback();
	const [user, setUser] = useState<any>();

	useEffect(() => {
		(async () => {
			if (isTelegram) {
				try {
					const res = await api.custom.get(
						`get_telegram_profile?id=${name}`,
						context.props.auth?.token
					);
					setUser(res.profile);
				} catch (error) {
					notificationOccurred("error");
					errorHandler(error, toast);
				}
			}
		})();
	}, []);

	return (
		<Stack
			direction={"column"}
			spacing={1}
			alignItems={"center"}
			onClick={onClick}
			cursor={"pointer"}
			w="72px"
			as={"button"}
		>
			{avatarComponent ? (
				avatarComponent
			) : (
				<Avatar
					name={isTelegram ? user?.first_name || "..." : name}
					src={isTelegram ? user?.photo : avatar}
					w="56px"
					h="56px"
					size={"lg"}
				/>
			)}
			<Text
				textAlign={"center"}
				whiteSpace={"nowrap"}
				overflow={"hidden"}
				fontSize={"12px"}
				position={"relative"}
				letterSpacing={"0"}
				maxW="100%"
			>
				{isTelegram ? user?.first_name || "..." : name}
			</Text>
		</Stack>
	);
}

export default Method;
