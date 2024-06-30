import {
	Avatar,
	Box,
	Center,
	Heading,
	SimpleGrid,
	Stack,
	Text,
} from "@chakra-ui/react";
import { useContext } from "react";
import { FaCreditCard, FaStar } from "react-icons/fa6";
import CellButton from "../../components/CellButton";
import CustomBackButton from "../../components/CustomBackButton";
import MyOffers from "../../components/market/MyOffers";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { MarketContext } from "../../providers/MarketProvider";
import { getTelegram } from "../../utils";

function Profile() {
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const market = useContext(MarketContext);

	return (
		<>
			<CustomBackButton />

			<Center w="full" mt="36px" mb="36px">
				<Stack w="full" direction={"column"} spacing={6} alignItems={"center"}>
					<Stack
						alignItems={"center"}
						textAlign={"center"}
						direction={"column"}
						spacing={2}
					>
						<Avatar
							name={context.props.auth?.profile.name}
							w={"80px"}
							size={"xl"}
							h="80px"
							borderRadius={"999px"}
						/>

						<Stack direction={"row"} spacing={2} alignItems={"center"}>
							<Heading size={"md"}>{context.props.auth?.profile.name}</Heading>
							{context.props.auth?.profile.is_premium && (
								<FaStar size={"20px"} />
							)}
						</Stack>

						<Text
							fontSize={"md"}
							color={getTelegram().themeParams.hint_color}
							maxW="250px"
						>
							{context.getTranslation(
								"This name is used as your username on the P2P Market"
							)}
						</Text>
					</Stack>

					<SimpleGrid w="full" columns={2} spacing={3}>
						<Stack
							bgColor={getTelegram().themeParams.bg_color}
							direction={"column"}
							spacing={1}
							minH={"80px"}
							borderRadius={"lg"}
							w={"full"}
							p={3}
						>
							<Heading>{context.props.auth?.profile.deals}</Heading>
							<Text
								fontSize={"sm"}
								color={getTelegram().themeParams.hint_color}
							>
								{context.getTranslation("Number of deals")}
							</Text>
						</Stack>

						<Stack
							bgColor={getTelegram().themeParams.bg_color}
							direction={"column"}
							spacing={1}
							minH={"80px"}
							borderRadius={"lg"}
							w={"full"}
							p={3}
						>
							<Heading>
								{context.props.auth?.profile.deals !== 0
									? (
											((context.props.auth?.profile.completed_deals || 0) /
												(context.props.auth?.profile.deals || 0)) *
											100
									  ).toFixed(0)
									: "0"}
								%
							</Heading>
							<Text
								fontSize={"sm"}
								color={getTelegram().themeParams.hint_color}
							>
								{context.getTranslation("Deal completion rate")}
							</Text>
						</Stack>
					</SimpleGrid>
				</Stack>
			</Center>

			<Box mb={4}>
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
							<FaCreditCard size={"14px"} />
						</Center>
					}
					title={context.getTranslation("Payment Settings")}
					onClick={() => router.push("/market/profile/methods")}
				/>
			</Box>
			<MyOffers />
		</>
	);
}

export default Profile;
