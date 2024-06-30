import { useBoolean } from "@chakra-ui/react";
import { useInitData } from "@vkruglikov/react-telegram-web-app";
import { useContext, useEffect } from "react";
import api from "../api/api";
import Loader from "../components/Loader";
import { getTelegram } from "../utils";
import { AppContext } from "./AppProvider";
import BaseProvider from "./BaseProvider";
import { HistoryContext } from "./HistoryProviders";

function AuthProvider({ children }: { children: React.ReactNode }) {
	const [loading, setLoading] = useBoolean(true);
	const context = useContext(AppContext);
	const router = useContext(HistoryContext);
	const navigate = router.push;
	const [initData] = useInitData();

	useEffect(() => {
		const getAuth = async () => {
			try {
				if (!context.props.auth) {
					setLoading.on();
					const login = await api.auth.login(getTelegram().initData);
					if (login.token && context.setProps) {
						const profile = await api.auth.getProfile(login.token);
						const network = await api.wallet.getNetwork();

						if (profile === null) {
							navigate("/error");
						} else {
							context.setProps({
								auth: {
									token: login.token,
									profile: profile,
								},
								network: network.network,
							});
							getTelegram().SettingsButton.show();
							getTelegram().SettingsButton.onClick(() => navigate("/settings"));
							if (initData?.start_param && initData?.start_param.length > 1) {
								if (initData.start_param.startsWith("C")) {
									navigate(`/check/${initData.start_param.slice(1)}`);
								}
								if (initData.start_param.startsWith("O")) {
									navigate(`/market/offer/${initData.start_param.slice(1)}`);
								}
							}
						}
					} else {
						navigate("/error");
					}
				}
			} catch (error) {
				navigate("/error");
			} finally {
				setLoading.off();
			}
		};

		getAuth();
	}, []);

	return loading ? (
		<BaseProvider>
			<Loader />
		</BaseProvider>
	) : (
		<>
			<BaseProvider>{!context.checks ? <Loader /> : children}</BaseProvider>
		</>
	);
}

export default AuthProvider;
