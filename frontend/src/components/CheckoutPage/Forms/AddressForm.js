import React, { useContext, useEffect, useState } from "react";
import { Grid, Typography } from "@material-ui/core";
import { InputField, SelectField } from "../../FormFields";
import { AuthContext } from "../../../context/Auth/AuthContext";

const countries = [
  {
    value: "BR",
    label: "Brasil",
  },
  {
    value: "usa",
    label: "United States",
  },
];

export default function AddressForm(props) {

  const { user } = useContext(AuthContext);
  const [billingName, setBillingName] = useState(user.company.billingName);
  const [addressZipCode, setAddressZipCode] = useState(user.company.addressZipCode);
  const [addressStreet, setAddressStreet] = useState(user.company.addressStreet);
  const [addressState, setAddressState] = useState(user.company.addressState);
  const [addressCity, setAddressCity] = useState(user.company.addressCity);
  const [addressDistrict, setAddressDistrict] = useState(user.company.addressDistrict);

  const {
    formField: {
      firstName,
      address1,
      city,
      state,
      zipcode,
      country,
    },
    setFieldValue
  } = props;
  useEffect(() => {
    setFieldValue("firstName", billingName)
    setFieldValue("zipcode", addressZipCode)
    setFieldValue("address2", addressStreet)
    setFieldValue("state", addressState)
    setFieldValue("city", addressCity)
    setFieldValue("country", addressDistrict)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Vamos precisar de algumas informações
      </Typography>
      <Grid container spacing={3}>

        <Grid item xs={6} sm={6}>
          <InputField name={firstName.name} label={firstName.label} fullWidth
            value={billingName}
            onChange={(e) => {
              setBillingName(e.target.value)
              setFieldValue("firstName", e.target.value)
            }}
          />
        </Grid>
        <Grid item xs={6} sm={6}>
          <SelectField
            name={country.name}
            label={country.label}
            data={countries}
            fullWidth
            value={addressDistrict}
            onChange={(e) => {
              setAddressDistrict(e.target.value)
              setFieldValue("country", e.target.value)
            }
            }
          />
        </Grid>

        <Grid item xs={4}>
          <InputField
            name={zipcode.name}
            label={zipcode.label}
            fullWidth
            value={addressZipCode}
            onChange={(e) => {
              setAddressZipCode(e.target.value)
              setFieldValue("zipcode", e.target.value)
            }}
          />
        </Grid>
        <Grid item xs={8}>
          <InputField
            name={address1.name}
            label={address1.label}
            fullWidth
            value={addressStreet}
            onChange={(e) => {
              setAddressStreet(e.target.value)
              setFieldValue("address2", e.target.value)

            }}
          />
        </Grid>

        <Grid item xs={4}>
          <InputField
            name={state.name}
            label={state.label}
            fullWidth
            value={addressState}
            onChange={(e) => {
              setAddressState(e.target.value)
              setFieldValue("state", e.target.value)

            }}
          />
        </Grid>
        <Grid item xs={8}>
          <InputField
            name={city.name}
            label={city.label}
            fullWidth
            value={addressCity}
            onChange={(e) => {
              setAddressCity(e.target.value)
              setFieldValue("city", e.target.value)
            }}
          />
        </Grid>

      </Grid>
    </React.Fragment>
  );
}
