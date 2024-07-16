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
					let ref = null;
					if (
						initData?.start_param &&
						initData?.start_param.startsWith("R") &&
						initData.start_param.length > 1
					) {
						ref = initData.start_param.slice(1);
					}
					const login = await api.auth.login(
						getTelegram().initData,
						ref as any
					);
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
								if (initData.start_param === "referrals") {
									navigate(`/referrals`);
								}
								if (initData.start_param === "market") {
									navigate(`/market`);
								}
								if (initData.start_param === "send") {
									navigate(`/withdraw`);
								}
								if (initData.start_param === "settings") {
									navigate(`/settings`);
								}
								if (initData.start_param === "history") {
									navigate(`/history`);
								}
								if (initData.start_param === "exchange") {
									navigate(`/exchange`);
								}
								if (initData.start_param === "giveaways") {
									navigate(`/giveaways`);
								}
								if (initData.start_param === "pay") {
									navigate(`/pay`);
								}
								if (initData.start_param === "bonuses") {
									navigate(`/bonuses`);
								}
								if (initData.start_param === "admin-merchants") {
									navigate(`/admin/review_merchant`);
								}
								if (initData.start_param === "staking") {
									navigate(`/staking`);
								}
								if (initData.start_param.startsWith("C")) {
									navigate(`/check/${initData.start_param.slice(1)}`);
								}
								if (initData.start_param.startsWith("O")) {
									navigate(`/market/offer/${initData.start_param.slice(1)}`);
								}
								if (initData.start_param.startsWith("G")) {
									navigate(`/giveaway/${initData.start_param.slice(1)}`);
								}
								if (initData.start_param.startsWith("I")) {
									navigate(`/pay/invoice/${initData.start_param.slice(1)}`);
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
