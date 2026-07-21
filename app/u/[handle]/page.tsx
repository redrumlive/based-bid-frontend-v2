import ProfilePage from "../../ProfilePage";

export default async function UserProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return <ProfilePage handle={decodeURIComponent(handle)} />;
}
