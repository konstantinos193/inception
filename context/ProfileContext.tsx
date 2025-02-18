"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Profile = {
  address: string;
  username: string;
  bio: string;
  profile_picture: string;
};

type ProfileContextType = {
  walletAddress: string | null;
  profile: Profile | null;
  setWalletAddress: (address: string | null) => void;
  setProfile: (profile: Profile | null) => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  return (
    <ProfileContext.Provider value={{ walletAddress, profile, setWalletAddress, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};