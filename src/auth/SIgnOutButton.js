import { Auth } from 'aws-amplify';

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}