import { Stack, useColorMode } from "@chakra-ui/react";
import { useExpand } from "@vkruglikov/react-telegram-web-app";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import config from "./config";
import Balance from "./pages/Balance";
import Error from "./pages/Error";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Transaction from "./pages/Transaction";
import Wallet from "./pages/Wallet";
import Activate from "./pages/checks/Activate";
import CreateCheck from "./pages/checks/Create";
import CheckList from "./pages/checks/List";
import BalancesToExchange from "./pages/exchange/Balances";
import DepositToPool from "./pages/exchange/DepositToPool";
import PoolList from "./pages/exchange/Pool";
import Swap from "./pages/exchange/Swap";
import MarketMain from "./pages/market";
import MarketCurrency from "./pages/market/Currency";
import Profile from "./pages/market/Profile";
import DealPage from "./pages/market/deal";
import AddMarketMethod from "./pages/market/methods/AddMethod";
import EditMethod from "./pages/market/methods/EditMethod";
import MarketMethods from "./pages/market/methods/Methods";
import SelectMethod from "./pages/market/methods/SelectMethod";
import NewOffer from "./pages/market/offers/NewOffer";
import OfferPage from "./pages/market/offers/OfferPage";
import Offers from "./pages/market/offers/Offers";
import WithdrawToken from "./pages/withdraw";
import WithdrawContract from "./pages/withdraw/Contract";
import Method from "./pages/withdraw/Method";
import AuthProvider from "./providers/AuthProvider";
import BaseProvider from "./providers/BaseProvider";
import MarketProvider from "./providers/MarketProvider";
import { getTelegram } from "./utils";

function App() {
	const { setColorMode } = useColorMode();
	const { 1: expand } = useExpand();
	useEffect(() => {
		if (getTelegram().initData === "") {
			window.location.href = `https://t.me/${config.username}`;
		}
		setColorMode(getTelegram().colorScheme);
		expand();
		getTelegram().setHeaderColor("secondary_bg_color");
		getTelegram().setBackgroundColor("secondary_bg_color");
	}, []);
	if (getTelegram().initData === "") {
		return <></>;
	}

	return (
		<Stack
			direction={"column"}
			minH={"var(--tg-viewport-stable-height)"}
			transition={"min-height 0.3s linear"}
			justifyContent={"space-between"}
		>
			<Stack direction={"column"} spacing={0}>
				<Routes>
					<Route
						path={`/`}
						element={
							<AuthProvider>
								<Wallet />
							</AuthProvider>
						}
					/>
					<Route
						path={`/balance/:balance`}
						element={
							<AuthProvider>
								<Balance />
							</AuthProvider>
						}
					/>

					<Route
						path={`/checks`}
						element={
							<AuthProvider>
								<CheckList />
							</AuthProvider>
						}
					/>

					<Route
						path={`/check/:key`}
						element={
							<AuthProvider>
								<Activate />
							</AuthProvider>
						}
					/>

					<Route
						path={`/withdraw`}
						element={
							<AuthProvider>
								<WithdrawToken />
							</AuthProvider>
						}
					/>
					<Route
						path={`/withdraw/:contract`}
						element={
							<AuthProvider>
								<Method />
							</AuthProvider>
						}
					/>
					<Route
						path={`/withdraw/:contract/address`}
						element={
							<AuthProvider>
								<WithdrawContract />
							</AuthProvider>
						}
					/>
					<Route
						path={`/withdraw/:contract/check`}
						element={
							<AuthProvider>
								<CreateCheck />
							</AuthProvider>
						}
					/>
					<Route
						path={`/history/:balance`}
						element={
							<AuthProvider>
								<History />
							</AuthProvider>
						}
					/>
					<Route
						path={`/transaction/:id`}
						element={
							<AuthProvider>
								<Transaction />
							</AuthProvider>
						}
					/>

					<Route
						path={`/exchange`}
						element={
							<AuthProvider>
								<BalancesToExchange />
							</AuthProvider>
						}
					/>
					<Route
						path={"/exchange/pool/:contract"}
						element={
							<AuthProvider>
								<PoolList />
							</AuthProvider>
						}
					/>
					<Route
						path={"/exchange/pool/:contract/deposit"}
						element={
							<AuthProvider>
								<DepositToPool />
							</AuthProvider>
						}
					/>
					<Route
						path={"/exchange/pool/:contract/swap/:output"}
						element={
							<AuthProvider>
								<Swap />
							</AuthProvider>
						}
					/>

					{config.isMarketEnabled && (
						<>
							<Route
								path={"/market"}
								element={
									<AuthProvider>
										<MarketProvider>
											<MarketMain />
										</MarketProvider>
									</AuthProvider>
								}
							/>

							<Route
								path={"/market/offers/:type"}
								element={
									<AuthProvider>
										<MarketProvider>
											<Offers />
										</MarketProvider>
									</AuthProvider>
								}
							/>

							<Route
								path={"/market/offer/:id"}
								element={
									<AuthProvider>
										<MarketProvider>
											<OfferPage />
										</MarketProvider>
									</AuthProvider>
								}
							/>

							<Route
								path={"/market/profile"}
								element={
									<AuthProvider>
										<MarketProvider>
											<Profile />
										</MarketProvider>
									</AuthProvider>
								}
							/>

							<Route
								path={"/market/deal/:id"}
								element={
									<AuthProvider>
										<MarketProvider>
											<DealPage />
										</MarketProvider>
									</AuthProvider>
								}
							/>

							<Route
								path={"/market/profile/methods"}
								element={
									<AuthProvider>
										<MarketProvider>
											<MarketMethods />
										</MarketProvider>
									</AuthProvider>
								}
							/>

							<Route
								path={"/market/profile/methods/:id"}
								element={
									<AuthProvider>
										<MarketProvider>
											<EditMethod />
										</MarketProvider>
									</AuthProvider>
								}
							/>

							<Route
								path={"/market/profile/methods/new"}
								element={
									<AuthProvider>
										<MarketProvider>
											<SelectMethod />
										</MarketProvider>
									</AuthProvider>
								}
							/>

							<Route
								path={"/market/profile/methods/new/:id"}
								element={
									<AuthProvider>
										<MarketProvider>
											<AddMarketMethod />
										</MarketProvider>
									</AuthProvider>
								}
							/>

							<Route
								path={"/market/profile/offers/new"}
								element={
									<AuthProvider>
										<MarketProvider>
											<NewOffer />
										</MarketProvider>
									</AuthProvider>
								}
							/>

							<Route
								path={"/market/currency"}
								element={
									<AuthProvider>
										<MarketProvider>
											<MarketCurrency />
										</MarketProvider>
									</AuthProvider>
								}
							/>
						</>
					)}

					<Route
						path={"/settings"}
						element={
							<AuthProvider>
								<Settings />
							</AuthProvider>
						}
					/>

					<Route
						path={"/error"}
						element={
							<BaseProvider>
								<Error />
							</BaseProvider>
						}
					/>

					<Route
						path={"*"}
						element={
							<AuthProvider>
								<NotFound />
							</AuthProvider>
						}
					/>
				</Routes>
			</Stack>
		</Stack>
	);
}

export default App;
