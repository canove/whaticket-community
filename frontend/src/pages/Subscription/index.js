import React, { useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import SubscriptionModal from "../../components/SubscriptionModal";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainContainer from "../../components/MainContainer";

import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const _formatDate = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diff = Math.abs(now.getTime() - past.getTime());
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return days;
}

const Contacts = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [loading,] = useState(false);
  const [, setPageNumber] = useState(1);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [hasMore,] = useState(false);


  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <SubscriptionModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      ></SubscriptionModal>

      <MainHeader>
        <Title>Assinatura</Title>
      </MainHeader>
      <Grid item xs={12} sm={4}>
        <Paper
          className={classes.mainPaper}
          variant="outlined"
          onScroll={handleScroll}
        >

          <div>
            <TextField
              id="outlined-full-width"
              label="Período de teste"
              defaultValue={`Seu período de teste termina em ${_formatDate(user?.company?.trialExpiration)} dias!`}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />

          </div>

          <div>
            <TextField
              id="outlined-full-width"
              label="Email de cobrança"
              defaultValue={user?.company?.email}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />

          </div>

          <div>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenContactModal}
              fullWidth
            >
              Assine Agora!
            </Button>
          </div>

        </Paper>
      </Grid>
    </MainContainer>
  );
};

export default Contacts;
