import {
	Button,
	Center,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	Stack,
	Text,
	useToast,
} from "@chakra-ui/react";
import { useContext } from "react";
import { FaCopy } from "react-icons/fa6";
import { QRCode } from "react-qrcode-logo";
import Wallet from "../../api/types/Wallet";
import { AppContext } from "../../providers/AppProvider";
import { getTelegram } from "../../utils";

function DepositModal({
	onClose,
	isOpen,
	wallet,
}: {
	onClose: () => void;
	isOpen: boolean;
	wallet: Wallet;
}) {
	const toast = useToast();
	const context = useContext(AppContext);

	return (
		<Drawer placement="bottom" onClose={onClose} isOpen={isOpen} size={"full"}>
			<DrawerOverlay />
			<DrawerContent bgColor={getTelegram().themeParams.secondary_bg_color}>
				<DrawerCloseButton />
				<DrawerHeader>{context.getTranslation("receive")}</DrawerHeader>
				<DrawerBody>
					<Stack direction={"column"} alignItems={"center"} spacing={4}>
						<Stack
							bgColor={"white"}
							p={1}
							alignItems={"center"}
							direction={"column"}
							borderRadius={"2xl"}
						>
							<Center>
								<QRCode
									logoImage="https://assets.aithercol.com/logos/circle_logo.png"
									logoWidth={56}
									logoHeight={56}
									logoPadding={2}
									logoPaddingStyle="circle"
									size={220}
									eyeRadius={16}
									value={wallet.address}
									removeQrCodeBehindLogo
								/>
							</Center>
						</Stack>

						<Text
							maxW="240px"
							fontSize={"md"}
							textAlign={"center"}
							whiteSpace={"normal"}
							wordBreak={"break-all"}
						>
							{wallet.address}
						</Text>

						<Center>
							<Button
								leftIcon={<FaCopy />}
								colorScheme="button"
								onClick={() => {
									window.navigator.clipboard.writeText(wallet.address);
									toast({ title: context.getTranslation("address_copied") });
								}}
							>
								{context.getTranslation("copy_address")}
							</Button>
						</Center>
					</Stack>
				</DrawerBody>
			</DrawerContent>
		</Drawer>
	);
}

export default DepositModal;
