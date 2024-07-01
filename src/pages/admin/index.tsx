import { Heading, Stack } from "@chakra-ui/react";
import { useContext } from "react";
import CellButton from "../../components/CellButton";
import CustomBackButton from "../../components/CustomBackButton";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";

export default function AdminPanel() {
	const router = useContext(HistoryContext);

	return (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />

			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				Admin Panel
			</Heading>

			<CellButton
				title={"Add Method to Market"}
				onClick={() => router.push("/admin/add_method")}
			/>
		</Stack>
	);
}
