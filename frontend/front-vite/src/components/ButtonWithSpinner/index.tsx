import { green } from "@mui/material/colors";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";

const ButtonStyled = styled(Button)({
  position: "relative",
});

const ButtonProgress = styled(CircularProgress)({
  color: green[500],
  position: "absolute",
  top: "50%",
  left: "50%",
  marginTop: -12,
  marginLeft: -12,
});

type buttonWithSpinnerProps = {
  loading: boolean;
  children: React.ReactNode;
  [any: string]: any;
};

const ButtonWithSpinner = ({
  loading,
  children,
  ...rest
}: buttonWithSpinnerProps) => {
  return (
    <ButtonStyled disabled={loading} {...rest}>
      {children}
      {loading && <ButtonProgress size={24} />}
    </ButtonStyled>
  );
};

export default ButtonWithSpinner;
