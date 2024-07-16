import { Stack, useColorMode } from "@chakra-ui/react";
import { useExpand } from "@vkruglikov/react-telegram-web-app";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import config from "./config";
import Balance from "./pages/Balance";
import Bonuses from "./pages/Bonuses";
import Error from "./pages/Error";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import Ref from "./pages/Ref";
import Settings from "./pages/Settings";
import Wallet from "./pages/Wallet";
import AdminPanel from "./pages/admin";
import AdminAddMethod from "./pages/admin/AddMethod";
import Dispute from "./pages/admin/Dispute";
import Disputes from "./pages/admin/Disputes";
import ReviewMerchant from "./pages/admin/ReviewMerchant";
import Stats from "./pages/admin/Stats";
import AdminBonuses from "./pages/admin/bonuses";
import AddBonus from "./pages/admin/bonuses/AddBonus";
import Activate from "./pages/checks/Activate";
import CreateCheck from "./pages/checks/Create";
import CheckList from "./pages/checks/List";
import Contacts from "./pages/contacts";
import AddContact from "./pages/contacts/Add";
import EditContact from "./pages/contacts/Edit";
import BalancesToExchange from "./pages/exchange/Balances";
import DepositToPool from "./pages/exchange/DepositToPool";
import PoolList from "./pages/exchange/Pool";
import Swap from "./pages/exchange/Swap";
import Giveaways from "./pages/giveaways";
import CreateGiveaway from "./pages/giveaways/CreateGiveaway";
import GiveawayPage from "./pages/giveaways/page";
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
import PayMerchants from "./pages/pay";
import NewMerchant from "./pages/pay/NewMerchant";
import Invoice from "./pages/pay/invoice/Invoice";
import MerchantPage from "./pages/pay/merchant/Merchant";
import Recovery from "./pages/recovery";
import Phrase from "./pages/recovery/Phrase";
import Restore from "./pages/recovery/Restore";
import WithdrawToken from "./pages/send";
import WithdrawContract from "./pages/send/Address";
import Method from "./pages/send/Method";
import WithdrawTelegram from "./pages/send/Telegram";
import AdminProvider from "./providers/AdminProvider";
import AuthProvider from "./providers/AuthProvider";
import BaseProvider from "./providers/BaseProvider";
import ChannelSubscriptionProvider from "./providers/ChannelSubscriptionProvider";
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
								<ChannelSubscriptionProvider>
									<Wallet />
								</ChannelSubscriptionProvider>
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
						path={`/withdraw/:contract/address/:address`}
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
						path={`/withdraw/:contract/telegram/:telegram_id`}
						element={
							<AuthProvider>
								<WithdrawTelegram />
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
						path={"/contacts"}
						element={
							<AuthProvider>
								<Contacts />
							</AuthProvider>
						}
					/>
					<Route
						path={"/contacts/add"}
						element={
							<AuthProvider>
								<AddContact />
							</AuthProvider>
						}
					/>
					<Route
						path={"/contacts/add/:address"}
						element={
							<AuthProvider>
								<AddContact />
							</AuthProvider>
						}
					/>
					<Route
						path={"/contacts/edit/:id"}
						element={
							<AuthProvider>
								<EditContact />
							</AuthProvider>
						}
					/>

					<Route
						path={"/settings"}
						element={
							<AuthProvider>
								<Settings />
							</AuthProvider>
						}
					/>

					<Route
						path={"/settings/recovery"}
						element={
							<AuthProvider>
								<Recovery />
							</AuthProvider>
						}
					/>
					<Route
						path={"/settings/recovery/phrase"}
						element={
							<AuthProvider>
								<Phrase />
							</AuthProvider>
						}
					/>
					<Route
						path={"/settings/recovery/restore"}
						element={
							<AuthProvider>
								<Restore />
							</AuthProvider>
						}
					/>

					<Route
						path={"/referrals"}
						element={
							<AuthProvider>
								<Ref />
							</AuthProvider>
						}
					/>

					<Route
						path={"/giveaways"}
						element={
							<AuthProvider>
								<Giveaways />
							</AuthProvider>
						}
					/>
					<Route
						path={"/giveaways/create"}
						element={
							<AuthProvider>
								<CreateGiveaway />
							</AuthProvider>
						}
					/>
					<Route
						path={"/giveaway/:key"}
						element={
							<AuthProvider>
								<GiveawayPage />
							</AuthProvider>
						}
					/>

					<Route
						path={"/pay"}
						element={
							<AuthProvider>
								<PayMerchants />
							</AuthProvider>
						}
					/>
					<Route
						path={"/pay/new"}
						element={
							<AuthProvider>
								<NewMerchant />
							</AuthProvider>
						}
					/>
					<Route
						path={"/pay/merchants/:id"}
						element={
							<AuthProvider>
								<MerchantPage />
							</AuthProvider>
						}
					/>

					<Route
						path={"/pay/invoice/:key"}
						element={
							<AuthProvider>
								<Invoice />
							</AuthProvider>
						}
					/>

					<Route
						path={"/admin"}
						element={
							<AuthProvider>
								<AdminProvider>
									<AdminPanel />
								</AdminProvider>
							</AuthProvider>
						}
					/>
					<Route
						path={"/admin/disputes"}
						element={
							<AuthProvider>
								<AdminProvider>
									<MarketProvider>
										<Disputes />
									</MarketProvider>
								</AdminProvider>
							</AuthProvider>
						}
					/>
					<Route
						path={"/admin/disputes/:id"}
						element={
							<AuthProvider>
								<AdminProvider>
									<MarketProvider>
										<Dispute />
									</MarketProvider>
								</AdminProvider>
							</AuthProvider>
						}
					/>

					<Route
						path={"/admin/bonuses"}
						element={
							<AuthProvider>
								<AdminProvider>
									<AdminBonuses />
								</AdminProvider>
							</AuthProvider>
						}
					/>
					<Route
						path={"/admin/bonuses/add"}
						element={
							<AuthProvider>
								<AdminProvider>
									<AddBonus />
								</AdminProvider>
							</AuthProvider>
						}
					/>
					<Route
						path={"/admin/review_merchant"}
						element={
							<AuthProvider>
								<AdminProvider>
									<ReviewMerchant />
								</AdminProvider>
							</AuthProvider>
						}
					/>

					<Route
						path={"/admin/add_method"}
						element={
							<AuthProvider>
								<AdminProvider>
									<MarketProvider>
										<AdminAddMethod />
									</MarketProvider>
								</AdminProvider>
							</AuthProvider>
						}
					/>
					<Route
						path={"/admin/stats"}
						element={
							<AuthProvider>
								<AdminProvider>
									<Stats />
								</AdminProvider>
							</AuthProvider>
						}
					/>

					<Route
						path={"/bonuses"}
						element={
							<AuthProvider>
								<Bonuses />
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
