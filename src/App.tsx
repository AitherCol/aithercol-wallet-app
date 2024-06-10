import { ChakraProvider, Heading, extendTheme } from "@chakra-ui/react";
import {
	useExpand,
	useInitData,
	useThemeParams,
} from "@vkruglikov/react-telegram-web-app";
import { useEffect } from "react";

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
							color: themeParams.text_color,
							backgroundColor: themeParams.bg_color,
						},
					},
				},
			})}
		>
			<Heading>h1</Heading>
		</ChakraProvider>
	);
}

export default App;
