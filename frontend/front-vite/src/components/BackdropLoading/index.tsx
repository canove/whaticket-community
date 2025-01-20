import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";

const BackdropStyled = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  color: "#fff",
}));

const BackdropLoading = () => {
  return (
    <BackdropStyled open={true}>
      <CircularProgress color="inherit" />
    </BackdropStyled>
  );
};

export default BackdropLoading;
