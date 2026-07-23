import BoardDestinationPage from "../../BoardDestinationPage";
import { redirect } from "next/navigation";

export default async function BoardRoute({ params }: { params: Promise<{ boardName: string }> }) {
  const { boardName } = await params;
  if (decodeURIComponent(boardName).trim().toLowerCase() === "based") redirect("/");
  return <BoardDestinationPage boardName={boardName} />;
}
