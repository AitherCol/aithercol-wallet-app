import {
	Button,
	Heading,
	Image,
	Stack,
	useBoolean,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import {
	MainButton,
	useHapticFeedback,
	useShowPopup,
} from "@vkruglikov/react-telegram-web-app";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import api from "../../api/api";
import Balance from "../../api/types/Balance";
import Cell from "../../components/Cell";
import CustomBackButton from "../../components/CustomBackButton";
import Loader from "../../components/Loader";
import NotFoundBadge from "../../components/NotFoundBadge";
import { AppContext } from "../../providers/AppProvider";
import { getTelegram } from "../../utils";
import errorHandler, { formatBalance, formatBigint } from "../../utils/utils";
import TakeCredit from "./TakeCredit";

export interface CreditPageProps {
	credits: any[];
	update: () => void;
	onClose: () => void;
	getBalance: (contract: string) => Balance | undefined;
}

export default function Credits() {
	const context = useContext(AppContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();
	const showPopup = useShowPopup();

	const [credits, setCredits] = useState<any[]>();

	const update = async () => {
		try {
			const { credits } = await api.custom.get(
				"wallet/credits",
				context.props.auth?.token
			);
			setCredits(credits);
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		}
	};

	useEffect(() => {
		update();
	}, []);

	const [loading, setLoading] = useBoolean();

	const getBalance = (contract: string) => {
		return context.balances?.find(e => e.contract === contract);
	};

	const takeCreditPage = useDisclosure();
	if (takeCreditPage.isOpen && credits) {
		return (
			<TakeCredit
				onClose={takeCreditPage.onClose}
				update={update}
				credits={credits}
				getBalance={getBalance}
			/>
		);
	}

	return !credits ? (
		<Loader />
	) : (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context.getTranslation("Loans")}
			</Heading>

			{credits.length === 0 && (
				<NotFoundBadge text={context.getTranslation("Nothing Found")} />
			)}

			{credits.map(e => (
				<Cell
					icon={
						<Image
							src={getBalance(e.contract)?.image}
							w="40px"
							h="40px"
							borderRadius={"999px"}
						/>
					}
					title={`${formatBigint(
						e.amount,
						getBalance(e.contract)?.decimals || 1
					)} ${getBalance(e.contract)?.symbol}`}
					subTitle={
						e.is_returned
							? "Returned"
							: `Need to return ${formatBigint(
									(BigInt(e.to_returned) - BigInt(e.returned)).toString(),
									getBalance(e.contract)?.decimals || 1
							  )} ${getBalance(e.contract)?.symbol} before ${moment(
									e.returned_at
							  ).format("DD MMMM")}`
					}
					additionalComponent={
						!e.is_returned ? (
							<Button
								onClick={async () => {
									try {
										setLoading.on();
										await api.custom.post(
											"wallet/credits/return",
											context.props.auth?.token,
											{
												credit_id: e.id,
												amount: formatBalance(getBalance(e.contract)),
											}
										);
										await update();
										notificationOccurred("success");
									} catch (error) {
										notificationOccurred("error");
										errorHandler(error, toast);
									} finally {
										setLoading.off();
									}
								}}
								size={"sm"}
								colorScheme="button"
								isDisabled={loading}
							>
								{context.getTranslation("Return (action)")}
							</Button>
						) : (
							<></>
						)
					}
				/>
			))}

			<MainButton
				text={context.getTranslation("Take a loan")}
				onClick={takeCreditPage.onOpen}
			/>
		</Stack>
	);
}
