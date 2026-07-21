import { notFound } from "next/navigation";
import TokenTerminalPage from "../../TokenTerminalPage";
import { getLbpTokenDetail } from "../../lbpTokenData";

export default async function TokenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = getLbpTokenDetail(id);
  if (!token) notFound();
  return <TokenTerminalPage token={token} />;
}

