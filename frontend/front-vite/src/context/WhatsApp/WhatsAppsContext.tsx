import { createContext } from "react";
import type { ReactNode } from "react";
import useWhatsApps from "../../hooks/useWhatsApps";

interface WhatsAppsContextType {
  whatsApps: any[];
  loading: boolean;
}

const WhatsAppsContext = createContext<WhatsAppsContextType>({
  whatsApps: [],
  loading: true,
});

const WhatsAppsProvider = ({ children }: { children: ReactNode }) => {
  const { loading, whatsApps } = useWhatsApps();

  return (
    <WhatsAppsContext.Provider value={{ whatsApps, loading }}>
      {children}
    </WhatsAppsContext.Provider>
  );
};

export { WhatsAppsContext, WhatsAppsProvider };
