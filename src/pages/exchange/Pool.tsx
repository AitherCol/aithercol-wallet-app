import {
	Box,
	Center,
	Heading,
	IconButton,
	Image,
	Input,
	Stack,
	Text,
	useToast,
} from "@chakra-ui/react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import { useContext, useState } from "react";
import { FaArrowUp } from "react-icons/fa6";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import Pool from "../../api/types/Pool";
import Cell from "../../components/Cell";
import CustomBackButton from "../../components/CustomBackButton";
import Loader from "../../components/Loader";
import useInterval from "../../hooks/useInterval";
import { AppContext } from "../../providers/AppProvider";
import { HistoryContext } from "../../providers/HistoryProviders";
import { getTelegram } from "../../utils";
import { getCacheItemJSON, setCacheItem } from "../../utils/cache";
import errorHandler, { formatBigint, reduceString } from "../../utils/utils";

function PoolList() {
	const context = useContext(AppContext);
	const toast = useToast();
	const router = useContext(HistoryContext);
	const navigate = router.push;
	const params = useParams();
	const [impactOccurred, notificationOccurred, selectionChanged] =
		useHapticFeedback();

	const [poolBalance, setPoolBalance] = useState<string>(
		getCacheItemJSON(`poolbalance:${params.contract}`) || "0"
	);
	const [pools, setPools] = useState<Pool[]>(getCacheItemJSON("pools"));
	const [search, setSearch] = useState<string>("");

	useInterval(() => {
		const getBalances = async () => {
			try {
				const poolBalance = await api.wallet.exchange.getPoolBalance(
					params.contract || "",
					context.props.auth?.token || ""
				);
				setPoolBalance(poolBalance.balance);
				setCacheItem(
					`poolbalance:${params.contract}`,
					JSON.stringify(poolBalance.balance)
				);
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
			}

			try {
				const pools = await api.wallet.exchange.getPools(
					context.props.auth?.token || ""
				);
				setPools(pools.pools);
				setCacheItem(`pools`, JSON.stringify(pools.pools));
			} catch (error) {
				errorHandler(error, toast);
				notificationOccurred("error");
			}
		};

		getBalances();
	}, 10000);

	const getBalance = () => {
		const balance = context.balances.find(e => e.contract === params.contract);
		if (!balance) {
			return null;
		}
		const rate = context.rates.find(e => e.contract === balance.contract);
		return { ...balance, rate };
	};

	return !pools ? (
		<Loader />
	) : (
		<>
			<CustomBackButton />
			<Center mt="36px" mb="36px">
				<Stack direction={"column"} spacing={6} alignItems={"center"}>
					<Stack
						alignItems={"center"}
						textAlign={"center"}
						direction={"column"}
						spacing={3}
					>
						<Image
							src={getBalance()?.image}
							w={"80px"}
							h="80px"
							borderRadius={"999px"}
						/>
						<Stack direction={"column"} spacing={2}>
							<Text color={getTelegram().themeParams.subtitle_text_color}>
								{context.getTranslation("pool_balance")}
							</Text>
							<Heading size={"2xl"}>
								{formatBigint(poolBalance, getBalance()?.decimals || 1)}{" "}
								{getBalance()?.symbol}
							</Heading>
							<Text color={getTelegram().themeParams.subtitle_text_color}>
								$
								{(
									(getBalance()?.rate?.price || 0) *
									Number(formatBigint(poolBalance, getBalance()?.decimals || 1))
								).toFixed(2)}
							</Text>
						</Stack>
					</Stack>
					<Stack direction={"row"} spacing={6}>
						<Stack
							alignItems={"center"}
							direction={"column"}
							spacing={2}
							cursor={"pointer"}
							onClick={() =>
								router.push(`/exchange/pool/${params.contract}/deposit`)
							}
						>
							<Box>
								<IconButton
									aria-label="withdraw"
									borderRadius={"999px"}
									icon={<FaArrowUp size={"20px"} />}
									colorScheme="button"
								></IconButton>
							</Box>
							<Heading color={"button.500"} size={"sm"}>
								{context.getTranslation("deposit")}
							</Heading>
						</Stack>
					</Stack>
				</Stack>
			</Center>

			<Stack direction={"column"} spacing={2}>
				<Heading
					size={"sm"}
					color={getTelegram().themeParams.hint_color}
					textTransform={"uppercase"}
				>
					{context.getTranslation("swap_to")}
				</Heading>

				{pools.length === 0 && (
					<Center>
						<Stack
							alignItems={"center"}
							textAlign={"center"}
							direction={"column"}
							spacing={2}
						>
							<Heading>{context.getTranslation("No Pools Yet")}</Heading>
							<Text>
								{context.getTranslation(
									"When someone deposits coins into the pool, we will be able to exchange tokens"
								)}
							</Text>
						</Stack>
					</Center>
				)}

				{pools.length !== 0 && (
					<>
						<Input
							borderColor={getTelegram().themeParams.hint_color}
							_hover={{
								borderColor: getTelegram().themeParams.hint_color,
							}}
							_focus={{
								borderColor: getTelegram().themeParams.accent_text_color,
								boxShadow: "none",
							}}
							placeholder={`${context.getTranslation("search")}...`}
							value={search}
							onChange={e => setSearch(e.currentTarget.value)}
						></Input>

						{pools
							.filter(e => {
								return (
									e.contract !== getBalance()?.contract &&
									(search.trim() === "" ||
										e.name.toLowerCase().includes(search.trim().toLowerCase()))
								);
							})
							.map(e => (
								<Cell
									icon={
										<LazyLoadImage
											style={{ borderRadius: "999px" }}
											width={"40px"}
											height={"40px"}
											src={e.image}
										/>
									}
									title={e.name}
									subTitle={reduceString(e.contract, 20)}
									onClick={() => {
										if (e.amount === "0") {
											toast({
												status: "error",
												title: context.getTranslation("error"),
												description: context.getTranslation(
													"Pool balance is 0, we cannot swap tokens."
												),
											});
											notificationOccurred("error");
										} else {
											navigate(
												`/exchange/pool/${params.contract}/swap/${e.contract}`
											);
										}
									}}
								/>
							))}
					</>
				)}
			</Stack>
		</>
	);
}

export default PoolList;
