import { Heading, Stack, Text, useToast } from "@chakra-ui/react";
import Lottie from "lottie-react";
import { useContext } from "react";
import { FaCopy } from "react-icons/fa6";
import CustomBackButton from "../components/CustomBackButton";
import InfoCell from "../components/InfoCell";
import InfoRawCell from "../components/InfoRawCell";
import config from "../config";
import { AppContext } from "../providers/AppProvider";
import duck_money_out from "../stickers/duck_money_out.json";
import { getTelegram } from "../utils";

export default function Ref() {
	const context = useContext(AppContext);
	const toast = useToast();

	return (
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
					animationData={duck_money_out}
					loop={true}
				/>

				<Heading size={"md"}>
					{context.getTranslation("Referral Program")}
				</Heading>

				<Text textAlign={"center"}>
					{context.getTranslation(
						"Invite users and receive 30% of their commission."
					)}
				</Text>
			</Stack>

			<InfoCell
				title={context.getTranslation("Your invite link")}
				value={`t.me/${config.username}/app?startapp=R${context.props.auth?.profile.id}`}
				isLink
				rightIcon={<FaCopy color={getTelegram().themeParams.link_color} />}
				onClick={() => {
					window.navigator.clipboard.writeText(
						`https://t.me/${config.username}/app?startapp=R${context.props.auth?.profile.id}`
					);
					toast({ title: context.getTranslation("Copied to clipboard") });
				}}
			></InfoCell>

			<Stack direction={"column"} spacing={2}>
				<InfoRawCell
					title={context.getTranslation("Total invited")}
					value={context.props.auth?.profile.ref_invited.toString() || ""}
				/>
				<InfoRawCell
					title={context.getTranslation("Total earned")}
					value={
						"$" + (context.props.auth?.profile.ref_profit.toString() || "")
					}
				/>
			</Stack>
		</Stack>
	);
}
