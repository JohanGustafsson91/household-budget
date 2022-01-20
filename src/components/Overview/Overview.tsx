import { signOut } from "firebase/auth";
import { auth } from "utils";

export const Overview = () => {
  function handleSignOut() {
    signOut(auth);
  }

  const [profile] = auth.currentUser?.providerData ?? [];

  return (
    <div>
      <button onClick={handleSignOut}>Logout</button>
      <h1>Overview</h1>
      <p>Welcome {profile.displayName || profile.email}</p>
    </div>
  );
};
