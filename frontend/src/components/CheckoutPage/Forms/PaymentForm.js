import React, { useState, useEffect, useReducer } from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import StarIcon from '@material-ui/icons/StarBorder';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';


import usePlans from "../../../hooks/usePlans";
import useCompanies from "../../../hooks/useCompanies";

const useStyles = makeStyles((theme) => ({
  '@global': {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
  margin: {
    margin: theme.spacing(1),
  },


  cardHeader: {
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
  },
  cardPricing: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: theme.spacing(2),
  },
  footer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(8),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.up('sm')]: {
      paddingTop: theme.spacing(6),
      paddingBottom: theme.spacing(6),
    },
  },

  customCard: {
    display: "flex",
    marginTop: "16px",
    alignItems: "center",
    flexDirection: "column",
  },
  custom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }
}));


export default function Pricing(props) {
  const {
    setFieldValue,
    setActiveStep,
    activeStep,
  } = props;

 

  const { list, finder } = usePlans();
  const { find } = useCompanies();

  const classes = useStyles();
  const [usersPlans, setUsersPlans] = React.useState(3);
  const [companiesPlans, setCompaniesPlans] = useState(0);
  const [connectionsPlans, setConnectionsPlans] = React.useState(3);
  const [storagePlans, setStoragePlans] = React.useState([]);
  const [customValuePlans, setCustomValuePlans] = React.useState(49.00);
  const [loading, setLoading] = React.useState(false);
  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    async function fetchData() {
      await loadCompanies();
    }
    fetchData();
  }, [])

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const companiesList = await find(companyId);
      setCompaniesPlans(companiesList.planId);
      await loadPlans(companiesList.planId);
    } catch (e) {
      console.log(e);
      // toast.error("Não foi possível carregar a lista de registros");
    }
    setLoading(false);
  };
  const loadPlans = async (companiesPlans) => {
    setLoading(true);
    try {
      const plansCompanies = await finder(companiesPlans);
      const plans = []

      //plansCompanies.forEach((plan) => {
      plans.push({
        title: plansCompanies.name,
        planId: plansCompanies.id,
        price: plansCompanies.value,
        description: [
          `${plansCompanies.users} Usuários`,
          `${plansCompanies.connections} Conexão`,
          `${plansCompanies.queues} Filas`
        ],
        users: plansCompanies.users,
        connections: plansCompanies.connections,
        queues: plansCompanies.queues,
        buttonText: 'SELECIONAR',
        buttonVariant: 'outlined',
      })

      // setStoragePlans(data);
      //});
      setStoragePlans(plans);
    } catch (e) {
      console.log(e);
      // toast.error("Não foi possível carregar a lista de registros");
    }
    setLoading(false);
  };


  const tiers = storagePlans
  return (
    <React.Fragment>
      <Grid container spacing={3}>
        {tiers.map((tier) => (
          // Enterprise card is full width at sm breakpoint
          <Grid item key={tier.title} xs={12} sm={tier.title === 'Enterprise' ? 12 : 12} md={12}>
            <Card>
              <CardHeader
                title={tier.title}
                subheader={tier.subheader}
                titleTypographyProps={{ align: 'center' }}
                subheaderTypographyProps={{ align: 'center' }}
                action={tier.title === 'Pro' ? <StarIcon /> : null}
                className={classes.cardHeader}
              />
              <CardContent>
                <div className={classes.cardPricing}>
                  <Typography component="h2" variant="h3" color="textPrimary">
                    {

                      <React.Fragment>
                        R${tier.price.toLocaleString('pt-br', { minimumFractionDigits: 2 })}
                      </React.Fragment>
                    }
                  </Typography>
                  <Typography variant="h6" color="textSecondary">
                    /mês
                  </Typography>
                </div>
                <ul>
                  {tier.description.map((line) => (
                    <Typography component="li" variant="subtitle1" align="center" key={line}>
                      {line}
                    </Typography>
                  ))}
                </ul>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant={tier.buttonVariant}
                  color="primary"
                  onClick={() => {
                    if (tier.custom) {
                      setFieldValue("plan", JSON.stringify({
                        users: usersPlans,
                        connections: connectionsPlans,
                        price: customValuePlans,
                      }));
                    } else {
                      setFieldValue("plan", JSON.stringify(tier));
                    }
                    setActiveStep(activeStep + 1);
                  }
                  }
                >
                  {tier.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </React.Fragment>
  );
}