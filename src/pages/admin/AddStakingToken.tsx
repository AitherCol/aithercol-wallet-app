import { Button, Heading, Input, Stack, useToast } from "@chakra-ui/react";
import { useContext } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import api from "../../api/api";
import CustomBackButton from "../../components/CustomBackButton";
import { AppContext } from "../../providers/AppProvider";
import { MarketContext } from "../../providers/MarketProvider";
import { getTelegram } from "../../utils";
import errorHandler from "../../utils/utils";

interface FormBody {
	contract: string;
	percent: number;
	min_amount: string;
}

export default function AdminAddStakingToken() {
	const context = useContext(AppContext);
	const market = useContext(MarketContext);

	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
		setValue,
		reset,
	} = useForm<FormBody>();
	const toast = useToast();

	const onSubmit: SubmitHandler<FormBody> = async data => {
		try {
			await api.custom.postForm(
				"admin/add_staking_token",
				context.props.auth?.token,
				data
			);
			toast({ status: "success", title: "Success" });
			reset();
		} catch (error) {
			errorHandler(error, toast);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack direction={"column"} spacing={2}>
				<CustomBackButton />

				<Heading
					size={"sm"}
					color={getTelegram().themeParams.hint_color}
					textTransform={"uppercase"}
				>
					Add Staking Token
				</Heading>

				<Input
					borderColor={"transparent"}
					bgColor={getTelegram().themeParams.bg_color}
					_hover={{
						borderColor: getTelegram().themeParams.hint_color,
					}}
					isDisabled={isSubmitting}
					_focus={{
						borderColor: getTelegram().themeParams.accent_text_color,
						boxShadow: "none",
					}}
					placeholder="Contract"
					{...register("contract", { required: true })}
				></Input>
				<Input
					borderColor={"transparent"}
					bgColor={getTelegram().themeParams.bg_color}
					_hover={{
						borderColor: getTelegram().themeParams.hint_color,
					}}
					isDisabled={isSubmitting}
					_focus={{
						borderColor: getTelegram().themeParams.accent_text_color,
						boxShadow: "none",
					}}
					placeholder="APY"
					{...register("percent", { required: true })}
				></Input>

				<Input
					borderColor={"transparent"}
					bgColor={getTelegram().themeParams.bg_color}
					_hover={{
						borderColor: getTelegram().themeParams.hint_color,
					}}
					isDisabled={isSubmitting}
					_focus={{
						borderColor: getTelegram().themeParams.accent_text_color,
						boxShadow: "none",
					}}
					placeholder="Amount (in raw)"
					{...register("min_amount", { required: true })}
				></Input>

				<Button type="submit" isDisabled={isSubmitting} colorScheme="button">
					Submit
				</Button>
			</Stack>
		</form>
	);
}
