import { ChakraProvider, Heading, extendTheme } from "@chakra-ui/react";
import {
	useExpand,
	useInitData,
	useThemeParams,
} from "@vkruglikov/react-telegram-web-app";
import { useEffect } from "react";
import { getTelegram } from "./utils";

function App() {
	const [colorScheme, themeParams] = useThemeParams();
	const [isExpanded, expand] = useExpand();
	const data = useInitData();
	useEffect(() => {
		console.log(isExpanded);
	}, []);
	return (
		<ChakraProvider
			theme={extendTheme({
				styles: {
					global: {
						body: {
							color: getTelegram().themeParams.text_color,
							backgroundColor: getTelegram().themeParams.bg_color,
						},
					},
				},
			})}
		>
			<Heading>{JSON.stringify(getTelegram())}</Heading>
		</ChakraProvider>
	);
}

export default App;
