import { ReactNode } from "react";

interface TabPanelProps {
  children: ReactNode;
  value: any;
  name: any;
  [key: string]: any;
}

const TabPanel = ({ children, value, name, ...rest }: TabPanelProps) => {
  if (value === name) {
    return (
      <div
        role="tabpanel"
        id={`simple-tabpanel-${name}`}
        aria-labelledby={`simple-tab-${name}`}
        {...rest}
      >
        <>{children}</>
      </div>
    );
  } else return null;
};

export default TabPanel;
