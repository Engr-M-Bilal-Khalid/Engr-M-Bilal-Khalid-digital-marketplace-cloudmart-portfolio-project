export const handleSignOut = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
      });

      if (response.ok) {
        window.location.href = '/sign-in';
      } else {
        console.error('Sign out failed');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };