import { Center, Heading, Stack } from "@chakra-ui/react";
import { useContext } from "react";
import { FaMoneyBillWave, FaWallet } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import Cell from "../../components/Cell";
import CustomBackButton from "../../components/CustomBackButton";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";

function Method() {
	const router = useContext(HistoryContext);
	const params = useParams();

	return (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				Choose method
			</Heading>

			<Cell
				icon={
					<Center
						w={"40px"}
						h="40px"
						borderRadius={"999px"}
						overflow={"hidden"}
						bgColor={getTelegram().themeParams.accent_text_color}
						color={getTelegram().themeParams.button_text_color}
					>
						<FaMoneyBillWave size={"20px"} />
					</Center>
				}
				title={"By check"}
				subTitle={"Send coins instantly using a check"}
				onClick={() => router.push(`/withdraw/${params.contract}/check`)}
			/>
			<Cell
				icon={
					<Center
						w={"40px"}
						h="40px"
						borderRadius={"999px"}
						overflow={"hidden"}
						bgColor={getTelegram().themeParams.accent_text_color}
						color={getTelegram().themeParams.button_text_color}
					>
						<FaWallet size={"20px"} />
					</Center>
				}
				title={"By address"}
				subTitle={"Send coins to any wallet in TON"}
				onClick={() => router.push(`/withdraw/${params.contract}/address`)}
			/>
		</Stack>
	);
}

export default Method;
