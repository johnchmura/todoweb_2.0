import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import toast from 'react-hot-toast';

export default function Enter() {
  const { user, logout } = useAuth();

  const handleAuthSuccess = () => {
    // AuthContext will handle setting the user state automatically
    // No need to do anything here
  };

  const handleSignOut = () => {
    logout();
    toast.success('Signed out successfully!');
  };

  return (
    <main className="enter-page">
      <div className="enter-container">
        {user ? 
          <SignOutButton onSignOut={handleSignOut} />
          : 
          <AuthForm onSuccess={handleAuthSuccess} />
        }
      </div>
    </main>
  );
}

// Removed Google OAuth components

// Sign out button
function SignOutButton({ onSignOut }) {
  return (
    <div className="sign-out-section">
      <h2>You&apos;re already signed in!</h2>
      <button className="btn-grey" onClick={onSignOut}>
        Sign Out
      </button>
    </div>
  );
}
