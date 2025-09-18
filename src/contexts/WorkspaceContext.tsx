import { createContext, ReactNode, useContext, useState } from 'react';

interface WorkspaceContextType {
  activeWorkspace: string | null;
  setActiveWorkspace: (workspace: string | null) => void;
  currentWorkspaceId: string | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider = ({ children }: WorkspaceProviderProps) => {
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);

  const currentWorkspaceId = activeWorkspace;

  return (
    <WorkspaceContext.Provider value={{ activeWorkspace, setActiveWorkspace, currentWorkspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  );
};