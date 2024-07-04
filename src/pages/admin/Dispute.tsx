import {
	Button,
	SimpleGrid,
	Stack,
	useBoolean,
	useToast,
} from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import { useContext, useState } from "react";
import { FaCopy } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import Deal from "../../api/types/Deal";
import { UserMarketMethod } from "../../api/types/MarketMethod";
import Offer from "../../api/types/Offer";
import Rate from "../../api/types/Rate";
import User from "../../api/types/User";
import CustomBackButton from "../../components/CustomBackButton";
import InfoCell from "../../components/InfoCell";
import InfoRawCell from "../../components/InfoRawCell";
import Loader from "../../components/Loader";
import useInterval from "../../hooks/useInterval";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { MarketContext } from "../../providers/MarketProvider";
import { getColorMap, getTelegram } from "../../utils";
import errorHandler, { formatBigint } from "../../utils/utils";

export default function Dispute() {
	const router = useContext(HistoryContext);
	const context = useContext(AppContext);
	const market = useContext(MarketContext);
	const params = useParams();
	const [dealInfo, setDealInfo] = useState<{
		deal: Deal;
		rate: Rate;
		user: User;
		dealer: User;
		offer: Offer | null;
		method: UserMarketMethod | null;
	} | null>(null);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();
	const [loading, setLoading] = useBoolean();

	const update = async (disableVibration?: boolean) => {
		try {
			const data = await api.custom.get(
				`wallet/market/deals/get?id=${params.id}`,
				context.props.auth?.token
			);

			if (data.deal.status !== dealInfo?.deal.status && !disableVibration) {
				notificationOccurred("warning");
				context.updateProfile();
				context.update();
			}
			setDealInfo(data);
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
			router.push("/");
		}
	};

	useInterval(update, 10000);

	const getContract = () => {
		return market.tokens?.find(e => e.contract === dealInfo?.deal.contract);
	};

	const getMethod = (id: number) => {
		return market.methods?.find(e => e.id === id);
	};

	const handle = async (action: "complete" | "cancel") => {
		try {
			setLoading.on();
			await api.custom.post(
				"admin/disputes/handle",
				context.props.auth?.token,
				{ id: dealInfo?.deal.id, action }
			);
			notificationOccurred("success");
			router.back();
		} catch (error) {
			errorHandler(error, toast);
			notificationOccurred("error");
		} finally {
			setLoading.off();
		}
	};

	return !dealInfo ? (
		<Loader />
	) : (
		<Stack direction={"column"} spacing={4}>
			<CustomBackButton />
			<Stack direction={"column"} spacing={2}>
				<InfoRawCell title="Type" value={dealInfo.deal.type} />
				<InfoRawCell
					title="Amount"
					value={`${formatBigint(
						dealInfo.deal.amount,
						getContract()?.decimals || 1
					)} ${getContract()?.symbol}`}
				/>
				<InfoRawCell
					title="Fiat Amount"
					value={`${dealInfo.deal.amount_fiat} ${dealInfo.deal.currency}`}
				/>
			</Stack>
			<InfoCell
				title="Payment Method"
				value={`${getMethod(dealInfo.deal.method_type)?.name_en} • ${
					dealInfo.method?.value || "None"
				}`}
			/>
			<Stack direction={"column"} spacing={2}>
				<InfoCell
					title="Dealer"
					value={`${dealInfo.dealer.name} • ${dealInfo.dealer.telegram_id}`}
					rightIcon={<FaCopy color={getTelegram().themeParams.link_color} />}
					onClick={() => {
						window.navigator.clipboard.writeText(dealInfo.dealer.telegram_id);
						toast({ title: context.getTranslation("Copied to clipboard") });
					}}
				/>
				<InfoCell
					title="User"
					value={`${dealInfo.user.name} • ${dealInfo.user.telegram_id}`}
					rightIcon={<FaCopy color={getTelegram().themeParams.link_color} />}
					onClick={() => {
						window.navigator.clipboard.writeText(dealInfo.user.telegram_id);
						toast({ title: context.getTranslation("Copied to clipboard") });
					}}
				/>
			</Stack>

			<SimpleGrid columns={2} spacing={2}>
				<Button
					colorScheme="button"
					onClick={() => {
						handle("complete");
					}}
					isDisabled={loading}
				>
					Complete
				</Button>
				<Button
					variant={"ghost"}
					bgColor={
						getColorMap(getTelegram().themeParams.destructive_text_color)[
							"500"
						] + "10"
					}
					isDisabled={loading}
					onClick={async () => {
						handle("cancel");
					}}
					colorScheme="destructive"
				>
					Cancel
				</Button>
			</SimpleGrid>
		</Stack>
	);
}
