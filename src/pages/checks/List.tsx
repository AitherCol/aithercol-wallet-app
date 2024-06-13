import {
	Box,
	Center,
	Heading,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Stack,
	useToast,
} from "@chakra-ui/react";
import { useContext } from "react";
import { FaLock, FaMoneyBillWave } from "react-icons/fa6";
import api from "../../api/api";
import Cell from "../../components/Cell";
import CustomBackButton from "../../components/CustomBackButton";
import config from "../../config";
import { AppContext } from "../../providers/AppProvider";
import { getTelegram } from "../../utils";
import errorHandler, { formatBigint } from "../../utils/utils";

function CheckList() {
	const context = useContext(AppContext);
	const toast = useToast();

	const getBalance = (id: number) => {
		const balance = context.balances.find(e => e.id === id);
		const rate = context.rates.find(e => e.contract === balance?.contract);
		if (!balance) {
			return null;
		}
		return { ...balance, rate };
	};

	return (
		<Stack direction={"column"} spacing={2}>
			<CustomBackButton />
			<Heading
				size={"sm"}
				color={getTelegram().themeParams.hint_color}
				textTransform={"uppercase"}
			>
				Checks
			</Heading>

			{context.checks.map((e, key) => {
				return (
					<Menu>
						<MenuButton as={Box}>
							<Cell
								key={key}
								icon={
									<Center
										w={"40px"}
										h="40px"
										borderRadius={"999px"}
										overflow={"hidden"}
										bgColor={getTelegram().themeParams.accent_text_color}
										color={getTelegram().themeParams.button_text_color}
									>
										{e.password_protected ? (
											<FaLock size={"20px"} />
										) : (
											<FaMoneyBillWave size={"20px"} />
										)}
									</Center>
								}
								title={`${getBalance(e.balance_id)?.symbol} Check`}
								subTitle={
									e.password_protected ? "Password protected" : undefined
								}
								additional={{
									title: `${formatBigint(
										e.amount,
										getBalance(e.balance_id)?.decimals || 1
									)} ${getBalance(e.balance_id)?.symbol}`,
									subTitle: `$${(
										(getBalance(e.balance_id)?.rate?.price || 0) *
										Number(
											formatBigint(
												e.amount,
												getBalance(e.balance_id)?.decimals || 1
											)
										)
									).toFixed(2)}`,
								}}
							/>
						</MenuButton>
						<MenuList bgColor={getTelegram().themeParams.bg_color}>
							<MenuItem
								onClick={() => {
									try {
										getTelegram().switchInlineQuery(`C${e.key}`, [
											"users",
											"groups",
											"channels",
										]);
									} catch (error) {
										errorHandler(error, toast);
									}
								}}
								bgColor={getTelegram().themeParams.bg_color}
							>
								Share
							</MenuItem>
							<MenuItem
								bgColor={getTelegram().themeParams.bg_color}
								onClick={async () => {
									try {
										window.navigator.clipboard.writeText(
											`https://t.me/${config.username}?start=C${e.key}`
										);
										toast({ title: "Link copied" });
									} catch (error) {
										errorHandler(error, toast);
									}
								}}
							>
								Copy Link
							</MenuItem>
							<MenuItem
								bgColor={getTelegram().themeParams.bg_color}
								onClick={async () => {
									try {
										await api.wallet.checks.deleteCheck(
											e.id,
											context.props.auth?.token || ""
										);
										await context.update();
									} catch (error) {
										errorHandler(error, toast);
									}
								}}
							>
								Delete
							</MenuItem>
						</MenuList>
					</Menu>
				);
			})}
		</Stack>
	);
}

export default CheckList;
