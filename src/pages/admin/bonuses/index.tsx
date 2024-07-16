import { Heading, IconButton, Image, Stack, useToast } from "@chakra-ui/react";
import {
	MainButton,
	useHapticFeedback,
} from "@vkruglikov/react-telegram-web-app";
import { useContext, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import api from "../../../api/api";
import Cell from "../../../components/Cell";
import CustomBackButton from "../../../components/CustomBackButton";
import Loader from "../../../components/Loader";
import { AppContext } from "../../../providers/AppProvider";
import { HistoryContext } from "../../../providers/HistoryProviders";
import { getTelegram } from "../../../utils";
import errorHandler from "../../../utils/utils";

export default function AdminBonuses() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const toast = useToast();
	const { 1: notificationOccurred } = useHapticFeedback();

	const [bonuses, setBonuses] = useState<any[]>();
	const update = async () => {
		try {
			const bonuses = await api.custom.get(
				"admin/bonuses",
				context.props.auth?.token
			);
			setBonuses(bonuses.bonuses);
		} catch (error) {
			notificationOccurred("error");
			errorHandler(error, toast);
		}
	};
	useEffect(() => {
		update();
	}, []);

	return !bonuses ? (
		<Loader />
	) : (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				Bonuses
			</Heading>

			{bonuses.map(e => (
				<Cell
					icon={<Image w="40px" h="40px" src={e.photo} borderRadius="999px" />}
					title={e.title + ` (${e.language})`}
					subTitle={e.description}
					additionalComponent={
						<IconButton
							colorScheme="button"
							variant={"ghost"}
							color={"button.500"}
							onClick={async () => {
								try {
									await api.custom.post(
										"admin/bonuses/delete",
										context.props.auth?.token,
										{ id: e.id }
									);
									await update();
								} catch (error) {
									errorHandler(error, toast);
								}
							}}
							aria-label="delete"
							icon={<FaTrash />}
						/>
					}
				/>
			))}

			<MainButton
				text={"Add Bonus"}
				onClick={() => router.push("/admin/bonuses/add")}
			/>
		</Stack>
	);
}
