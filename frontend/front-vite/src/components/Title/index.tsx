import Typography from "@mui/material/Typography";

import { ReactNode } from "react";

interface TitleProps {
  children: ReactNode;
}

export default function Title(props: TitleProps) {
  return (
    <Typography variant="h5" color="primary" gutterBottom>
      {props.children}
    </Typography>
  );
}
