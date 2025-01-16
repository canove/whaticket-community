import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import { CircularProgress, Button } from "@material-ui/core";

const useStyles = makeStyles((_theme) => ({
  button: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

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
  const classes = useStyles();

  return (
    <Button className={classes.button} disabled={loading} {...rest}>
      {children}
      {loading && (
        <CircularProgress size={24} className={classes.buttonProgress} />
      )}
    </Button>
  );
};

export default ButtonWithSpinner;
