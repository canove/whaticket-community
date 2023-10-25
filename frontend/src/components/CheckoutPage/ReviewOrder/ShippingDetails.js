import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import useStyles from './styles';

function PaymentDetails(props) {
  const { formValues } = props;
  const classes = useStyles();
  const { plan } = formValues;

  const newPlan = JSON.parse(plan);
  const { users, connections, price } = newPlan;
  return (
    <Grid item xs={12} sm={12}>
      <Typography variant="h6" gutterBottom className={classes.title}>
        Detalhes do plano
      </Typography>
      <Typography gutterBottom>Usuários: {users}</Typography>
      <Typography gutterBottom>Whatsapps: {connections}</Typography>
      <Typography gutterBottom>Cobrança: Mensal</Typography>
      <Typography gutterBottom>Total: R${price.toLocaleString('pt-br', {minimumFractionDigits: 2})}</Typography>
    </Grid>
  );
}

export default PaymentDetails;
