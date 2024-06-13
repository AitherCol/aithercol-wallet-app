import { Stack, useColorMode } from "@chakra-ui/react";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Balance from "./pages/Balance";
import History from "./pages/History";
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
import WithdrawToken from "./pages/withdraw";
import WithdrawContract from "./pages/withdraw/Contract";
import Method from "./pages/withdraw/Method";
import AuthProvider from "./providers/AuthProvider";
import { getTelegram } from "./utils";

function App() {
	const { setColorMode } = useColorMode();
	useEffect(() => {
		if (getTelegram().initData === "") {
			window.location.href = "https://t.me/AitherColWalletBot";
		}
		setColorMode(getTelegram().colorScheme);
	}, []);
	if (getTelegram().initData === "") {
		return <></>;
	}

	return (
		<Stack direction={"column"} minH="100svh" justifyContent={"space-between"}>
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

					<Route
						path={"/settings"}
						element={
							<AuthProvider>
								<Settings />
							</AuthProvider>
						}
					/>
				</Routes>
			</Stack>
		</Stack>
	);
}

export default App;
