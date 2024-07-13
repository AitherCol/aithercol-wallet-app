import { Heading, Stack, Text, useToast } from "@chakra-ui/react";
import {
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import Lottie from "lottie-react";
import { useContext, useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import api from "../../api/api";
import Merchant from "../../api/types/Merchant";
import Cell from "../../components/Cell";
import CustomBackButton from "../../components/CustomBackButton";
import Loader from "../../components/Loader";
import NotFoundBadge from "../../components/NotFoundBadge";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import palm from "../../stickers/palm.json";
import { getTelegram } from "../../utils";
import { getCacheItemJSON, setCacheItem } from "../../utils/cache";
import errorHandler from "../../utils/utils";

export default function PayMerchants() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [merchants, setMerchants] = useState<Merchant[]>(
		getCacheItemJSON("merchants")
	);

	useEffect(() => {
		(async () => {
			try {
				const data = await api.custom.get(
					"pay/internal/merchants",
					context.props.auth?.token
				);
				setMerchants(data.merchants);
				setCacheItem("merchants", JSON.stringify(data.merchants));
			} catch (error) {
				notificationOccurred("error");
				errorHandler(error, toast);
				router.push("/");
			}
		})();
	}, []);

	return !merchants ? (
		<Loader />
	) : (
		<Stack direction={"column"} spacing={4}>
			<CustomBackButton />
			<Stack
				alignItems={"center"}
				textAlign={"center"}
				direction={"column"}
				spacing={2}
			>
				<Lottie
					style={{ width: 120, height: 120 }}
					animationData={palm}
					loop={true}
				/>

				<Heading size={"md"}>{context.getTranslation("AitherCol Pay")}</Heading>

				<Text textAlign={"center"}>
					{context.getTranslation(
						"Accept payments and send coins using our API."
					)}
				</Text>
			</Stack>

			<Stack direction={"column"} spacing={2}>
				<Heading
					size={"sm"}
					color={getTelegram().themeParams.hint_color}
					textTransform={"uppercase"}
				>
					{context.getTranslation("Merchants")}
				</Heading>
				{merchants.length === 0 && (
					<NotFoundBadge text={context.getTranslation("No Merchants Yet")} />
				)}
				{merchants.map(merchant => (
					<Cell
						title={merchant.title}
						icon={
							merchant.photo ? (
								<LazyLoadImage
									style={{ borderRadius: "999px" }}
									width={"40px"}
									height={"40px"}
									src={merchant.photo}
								/>
							) : undefined
						}
						onClick={() => router.push(`/pay/merchants/${merchant.id}`)}
					/>
				))}
			</Stack>

			{context.props.auth?.profile.is_allowed_to_create_merchants && (
				<MainButton
					text={context.getTranslation("Create Merchant")}
					onClick={() => router.push("/pay/new")}
				/>
			)}
		</Stack>
	);
}
