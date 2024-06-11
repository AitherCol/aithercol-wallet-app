import { BackButton } from "@vkruglikov/react-telegram-web-app";
import { useContext } from "react";
import { HistoryContext } from "../providers/HistoryProviders";

function CustomBackButton() {
	const router = useContext(HistoryContext);

	return <BackButton onClick={router.back} />;
}

export default CustomBackButton;
