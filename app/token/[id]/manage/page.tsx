import { notFound } from "next/navigation";
import TokenManagePage from "../../../TokenManagePage";
import { getLbpTokenDetail } from "../../../lbpTokenData";

export default async function ManageTokenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = getLbpTokenDetail(id);
  if (!token) notFound();
  return <TokenManagePage token={token} />;
}
