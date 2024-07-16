import {
	FormControl,
	FormHelperText,
	FormLabel,
	Heading,
	Image,
	Stack,
	useToast,
} from "@chakra-ui/react";
import {
	BackButton,
	MainButton,
	useHapticFeedback,
	useShowPopup,
} from "@vkruglikov/react-telegram-web-app";
import moment from "moment";
import { useContext, useState } from "react";
import { StakingPageProps } from ".";
import api from "../../api/api";
import StakingToken from "../../api/types/StakingToken";
import Transaction from "../../api/types/Transaction";
import AmountInput from "../../components/AmountInput";
import Cell from "../../components/Cell";
import TransactionScreen from "../../components/TransactionScreen";
import { AppContext } from "../../providers/AppProvider";
import { getTelegram } from "../../utils";
import errorHandler, {
	formatBalance,
	formatBigint,
	withoutDecimals,
} from "../../utils/utils";

export default function Stake(
	props: StakingPageProps & { token: StakingToken }
) {
	const context = useContext(AppContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();
	const showPopup = useShowPopup();

	const getBalance = () => {
		const balance = context.balances.find(
			e => e.contract === props.token.contract
		);
		const rate = context.rates.find(e => e.contract === props.token.contract);
		if (!balance) {
			return null;
		}
		return { ...balance, rate };
	};

	const [amountString, setAmountString] = useState<string>("");

	const isOk = amountString.trim() !== "";
	const [transaction, setTransaction] = useState<Transaction | null>();

	const stake = async () => {
		try {
			getTelegram().MainButton.showProgress();
			const data = await api.custom.post(
				"wallet/staking/stake",
				context.props.auth?.token,
				{
					balance_id: getBalance()?.id,
					amount: withoutDecimals(
						Number(amountString),
						props.token.decimals
					).toString(),
				}
			);
			await context.update();
			await props.update();
			notificationOccurred("success");
			setTransaction(data.transaction);
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		} finally {
			getTelegram().MainButton.hideProgress();
		}
	};

	if (transaction) {
		return (
			<TransactionScreen transaction={transaction} onClose={props.onClose} />
		);
	}

	return (
		<Stack direction={"column"} spacing={2}>
			<BackButton onClick={props.onClose} />

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				{context
					.getTranslation("%symbol% Staking")
					.replaceAll("%symbol%", props.token.symbol)}
			</Heading>

			<Cell
				icon={
					<Image
						borderRadius={"999px"}
						width={"40px"}
						height={"40px"}
						src={getBalance()?.image}
					/>
				}
				title={getBalance()?.name || ""}
				subTitle={context.getTranslation("change_token")}
				additional={{
					title: `${formatBigint(
						formatBalance(getBalance() as any),
						getBalance()?.decimals || 1
					)} ${getBalance()?.symbol}`,
				}}
				onClick={props.onClose}
			/>

			<FormControl>
				<FormLabel>{context.getTranslation("amount")}</FormLabel>
				<AmountInput
					maxValue={formatBigint(
						formatBalance(getBalance() as any),
						getBalance()?.decimals || 1
					)}
					value={amountString}
					onChange={e => setAmountString(e)}
				/>

				<FormHelperText color={getTelegram().themeParams.hint_color}>
					{context
						.getTranslation("APY: %percent%%")
						.replaceAll(
							"%percent%",
							(props.token.bonus_percent || props.token.percent).toString()
						)}{" "}
					{props.token.bonus_percent
						? `${context
								.getTranslation("until %date%")
								.replaceAll(
									"%date%",
									moment(props.token.bonus_expires_at).format("LL")
								)}`
						: ``}
					{amountString.trim() !== "" && (
						<>
							<br />
							{context.getTranslation("Income per month")}:{" "}
							{formatBigint(
								withoutDecimals(
									Number(amountString) *
										((props.token.bonus_percent || props.token.percent) /
											12 /
											100),
									props.token.decimals
								).toString(),
								props.token.decimals
							)}{" "}
							{props.token.symbol}
							<br />
							{context.getTranslation("Income per year")}:{" "}
							{formatBigint(
								withoutDecimals(
									Number(amountString) *
										((props.token.bonus_percent || props.token.percent) / 100),
									props.token.decimals
								).toString(),
								props.token.decimals
							)}{" "}
							{props.token.symbol}
						</>
					)}
				</FormHelperText>
			</FormControl>

			{isOk && (
				<MainButton
					text={context.getTranslation("Stake")}
					onClick={async () => {
						try {
							let unlockDate = moment().add({ days: 14 });
							if (props.getStakingBalance(props.token.contract)) {
								unlockDate = moment(
									!props.getStakingBalance(props.token.contract).is_unlocked
										? props.getStakingBalance(props.token.contract).unlocked_at
										: undefined
								).add({ days: 7 });
							}
							const button = await showPopup({
								title: context
									.getTranslation("Stake %symbol%")
									.replaceAll("%symbol%", props.token.symbol),
								message: context
									.getTranslation(
										"Are you sure you want to stake %amount%? Your staked coins will be frozen until %date%."
									)
									.replaceAll(
										"%amount%",
										amountString + ` ${props.token.symbol}`
									)
									.replaceAll("%date%", unlockDate.format("LLL")),
								buttons: [
									{
										id: "confirm",
										type: "default",
										text: context.getTranslation("Confirm"),
									},
									{ type: "cancel" },
								],
							});
							if (button === "confirm") {
								await stake();
							}
						} catch (error) {}
					}}
				/>
			)}
		</Stack>
	);
}
