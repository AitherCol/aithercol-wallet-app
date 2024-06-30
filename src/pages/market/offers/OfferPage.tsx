import { useContext } from "react";
import { useParams } from "react-router-dom";
import { HistoryContext } from "../../../providers/HistoryProviders";
import Offer from "./Offer";

export default function OfferPage() {
	const params = useParams();
	const router = useContext(HistoryContext);
	return <Offer id={params.id as any} onClose={router.back} />;
}
