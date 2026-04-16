import { useState, useEffect } from 'react';

export function useDiscordInvite() {
  const [inviteUrl, setInviteUrl] = useState('https://discord.gg/vN25r7fMn3');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvite = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/discord/invite');
      
      if (!response.ok) {
        throw new Error('Failed to fetch invite');
      }
      
      const data = await response.json();
      setInviteUrl(data.inviteUrl);
      
      console.log('[discord-invite] Fetched invite:', data);
    } catch (err) {
      console.error('[discord-invite] Error fetching invite:', err);
      setError(err.message);
      // Keep the fallback URL on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvite();
    
    // Refresh invite every 30 minutes
    const interval = setInterval(fetchInvite, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { inviteUrl, isLoading, error, refreshInvite: fetchInvite };
}
