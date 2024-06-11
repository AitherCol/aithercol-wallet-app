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
import { FaCopy } from "react-icons/fa6";
import { QRCode } from "react-qrcode-logo";
import Wallet from "../../api/types/Wallet";
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

	return (
		<Drawer placement="bottom" onClose={onClose} isOpen={isOpen} size={"full"}>
			<DrawerOverlay />
			<DrawerContent bgColor={getTelegram().themeParams.secondary_bg_color}>
				<DrawerCloseButton />
				<DrawerHeader>Deposit</DrawerHeader>
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

						<Text fontSize={"md"} textAlign={"center"}>
							{wallet.address}
						</Text>

						<Center>
							<Button
								leftIcon={<FaCopy />}
								colorScheme="button"
								onClick={() => {
									window.navigator.clipboard.writeText(wallet.address);
									toast({ title: "Address copied" });
								}}
							>
								Copy address
							</Button>
						</Center>
					</Stack>
				</DrawerBody>
			</DrawerContent>
		</Drawer>
	);
}

export default DepositModal;
