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
import QRCode from "react-qr-code";
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
			<DrawerContent bgColor={getTelegram().themeParams.bg_color}>
				<DrawerCloseButton />
				<DrawerHeader>Deposit</DrawerHeader>
				<DrawerBody>
					<Stack direction={"column"} spacing={4}>
						<Center>
							<QRCode value={wallet.address} />
						</Center>

						<Text textAlign={"center"}>{wallet.address}</Text>

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
