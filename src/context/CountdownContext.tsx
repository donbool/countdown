import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Countdown {
  id: string;
  name: string;
  date: string;
  time?: string;
  folderId?: string;
  notified?: boolean;
  note?: string;
}
export interface Folder {
  id: string;
  name: string;
}
export interface CountdownData {
  folders: Folder[];
  countdowns: Countdown[];
}

interface CountdownContextType extends CountdownData {
  setData: (data: CountdownData) => void;
  refresh: () => void;
}

const CountdownContext = createContext<CountdownContextType | undefined>(undefined);

export const useCountdowns = () => {
  const ctx = useContext(CountdownContext);
  if (!ctx) throw new Error('useCountdowns must be used within CountdownProvider');
  return ctx;
};

export const CountdownProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<CountdownData>({ folders: [], countdowns: [] });

  const refresh = async () => {
    const d = await (window as any).electronAPI.getData();
    setData(d);
  };

  useEffect(() => {
    refresh();
  }, []);

  const setAndSave = (d: CountdownData) => {
    setData(d);
    (window as any).electronAPI.saveData(d);
  };

  return (
    <CountdownContext.Provider value={{ ...data, setData: setAndSave, refresh }}>
      {children}
    </CountdownContext.Provider>
  );
}; 