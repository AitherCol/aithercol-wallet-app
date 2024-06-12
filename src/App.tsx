import { Stack, useColorMode } from "@chakra-ui/react";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Balance from "./pages/Balance";
import History from "./pages/History";
import Transaction from "./pages/Transaction";
import Wallet from "./pages/Wallet";
import BalancesToExchange from "./pages/exchange/Balances";
import DepositToPool from "./pages/exchange/DepositToPool";
import PoolList from "./pages/exchange/Pool";
import Swap from "./pages/exchange/Swap";
import WithdrawToken from "./pages/withdraw";
import WithdrawContract from "./pages/withdraw/Contract";
import AuthProvider from "./providers/AuthProvider";
import { getTelegram } from "./utils";

function App() {
	const { setColorMode } = useColorMode();
	useEffect(() => {
		if (getTelegram().initData === "") {
			window.location.href = "https://t.me/AitherColWalletBot";
		}
		setColorMode("light");
	}, []);
	if (getTelegram().initData === "") {
		return <></>;
	}

	return (
		<Stack direction={"column"} minH="100svh" justifyContent={"space-between"}>
			<Stack direction={"column"} spacing={0}>
				<Routes>
					<Route
						path="/"
						element={
							<AuthProvider>
								<Wallet />
							</AuthProvider>
						}
					/>
					<Route
						path="/balance/:balance"
						element={
							<AuthProvider>
								<Balance />
							</AuthProvider>
						}
					/>

					<Route
						path="/withdraw"
						element={
							<AuthProvider>
								<WithdrawToken />
							</AuthProvider>
						}
					/>
					<Route
						path="/withdraw/:contract"
						element={
							<AuthProvider>
								<WithdrawContract />
							</AuthProvider>
						}
					/>
					<Route
						path="/history/:balance"
						element={
							<AuthProvider>
								<History />
							</AuthProvider>
						}
					/>
					<Route
						path="/transaction/:id"
						element={
							<AuthProvider>
								<Transaction />
							</AuthProvider>
						}
					/>

					<Route
						path="/exchange"
						element={
							<AuthProvider>
								<BalancesToExchange />
							</AuthProvider>
						}
					/>
					<Route
						path="/exchange/pool/:contract"
						element={
							<AuthProvider>
								<PoolList />
							</AuthProvider>
						}
					/>
					<Route
						path="/exchange/pool/:contract/deposit"
						element={
							<AuthProvider>
								<DepositToPool />
							</AuthProvider>
						}
					/>
					<Route
						path="/exchange/pool/:contract/swap/:output"
						element={
							<AuthProvider>
								<Swap />
							</AuthProvider>
						}
					/>
				</Routes>
			</Stack>
		</Stack>
	);
}

export default App;
