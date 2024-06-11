import { BackButton } from "@vkruglikov/react-telegram-web-app";
import { useContext } from "react";
import { HistoryContext } from "../providers/HistoryProviders";

function CustomBackButton() {
	const context = useContext(HistoryContext);

	return <BackButton onClick={context.back} />;
}

export default CustomBackButton;
