import React from 'react';
import { useFormikContext } from 'formik';
import { Typography, Grid } from '@material-ui/core';
import ShippingDetails from './ShippingDetails';

export default function ReviewOrder() {
  const { values: formValues } = useFormikContext();
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Resumo da assinatura
      </Typography>
      <Grid container spacing={2}>
        <ShippingDetails formValues={formValues} />
      </Grid>
    </React.Fragment>
  );
}
