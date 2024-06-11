import { useBoolean } from "@chakra-ui/react";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Loader from "../components/Loader";
import { getTelegram } from "../utils";
import { AppContext } from "./AppProvider";
import BaseProvider from "./BaseProvider";

function AuthProvider({ children }: { children: React.ReactNode }) {
	const [loading, setLoading] = useBoolean(true);
	const context = useContext(AppContext);
	const navigate = useNavigate();

	useEffect(() => {
		const getAuth = async () => {
			try {
				if (!context.props.auth) {
					setLoading.on();
					const login = await api.auth.login(getTelegram().initData);
					if (login.token && context.setProps) {
						const profile = await api.auth.getProfile(login.token);

						if (profile === null) {
							navigate("/login");
						} else {
							context.setProps({
								auth: { token: login.token, profile: profile },
							});
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
			<BaseProvider>{children}</BaseProvider>
		</>
	);
}

export default AuthProvider;