import { createContext, ReactNode, useContext, useState } from 'react';

interface BoardContextType {
  activeBoard: string;
  setActiveBoard: (board: string) => void;
  currentBoardId: string | undefined;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

interface BoardProviderProps {
  children: ReactNode;
}

export const BoardProvider = ({ children }: BoardProviderProps) => {
  const [activeBoard, setActiveBoard] = useState("all");

  const currentBoardId = activeBoard === "all" || 
    activeBoard === "favorites" || 
    activeBoard === "recent" 
    ? undefined 
    : activeBoard;

  return (
    <BoardContext.Provider value={{ activeBoard, setActiveBoard, currentBoardId }}>
      {children}
    </BoardContext.Provider>
  );
};
