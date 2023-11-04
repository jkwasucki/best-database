import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DataContextProps {
  shouldRefetchData: boolean;
  shakeData: () => void;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataContextProvider: React.FC<DataProviderProps> = ({ children }) => {
    const [shouldRefetchData, setShouldRefetchData] = useState(false);

    const shakeData = () => setShouldRefetchData((prev)=>!prev)

  return (
    <DataContext.Provider 
      value={{ 
        shouldRefetchData, 
        shakeData 
        }}
      >
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = (): DataContextProps => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
