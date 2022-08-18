import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { Grid, Input, MenuItem, Select, Slider, Typography } from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(8, 8, 3),
	},
	paper: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
		marginBottom: 12,
	},
	settingOption: {
		marginLeft: "auto",
	},
	margin: {
		margin: theme.spacing(1),
	},
    mainPaper: {
        flex: 1,
        padding: theme.spacing(1),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
    },
}));

const WhatsConfig = () => {
	const classes = useStyles();
	const { i18n } = useTranslation();
    const { whatsApps } = useContext(WhatsAppsContext);

    const [value, setValue] = useState(1);
    const [selectedConnection, setSelectedConnection] = useState([]);

    const handleSliderChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleInputChange = (event) => {
        setValue(event.target.value === '' ? '' : Number(event.target.value));
    };

    const handleBlur = () => {
        if (value < 1) {
            setValue(1);
        } else if (value > 60) {
            setValue(60);
        }
    };

    const handleChangeConnection = (e) => {
		const {
			target: { value },
		} = e;

		if (value.includes('Todos')) {
			setSelectedConnection([]);

			let allConnections = []

			whatsApps.map((whats => {
				allConnections.push(whats.id);
			}));

			setSelectedConnection(allConnections);
		} else {
			setSelectedConnection(typeof value === "string" ? value.split(",") : value);
		}
	}

	return (
	    <MainContainer>
            <MainHeader>
                <Title>Configurações</Title>
            </MainHeader>
            <Paper
                className={classes.paper}
                variant="outlined"
            >
                <Typography id="input-slider" gutterBottom>
                    Tempo de Disparo entre as Instâncias (1min - 60min)
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                        <Slider
                            value={typeof value === 'number' ? value : 0}
                            onChange={handleSliderChange}
                            aria-labelledby="input-slider"
                            step={1}
                            min={1}
                            max={60}
                            valueLabelDisplay="auto"
                        />
                    </Grid>
                    <Grid item>
                        <Input
                            value={value}
                            margin="dense"
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            inputProps={{
                            step: 1,
                            min: 0,
                            max: 60,
                            type: 'number',
                            'aria-labelledby': 'input-slider',
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>
            <Paper
                className={classes.paper}
                variant="outlined"
            >
                <Typography variant="subtitle1" gutterBottom>
                	Conexões:
				</Typography>
				<Select
					labelId="type-select-label"
					id="type-select"
					value={selectedConnection}
					label="Type"
					onChange={handleChangeConnection}
					multiple
				>
					<MenuItem value={"Todos"}>Todos</MenuItem>
					{whatsApps && whatsApps.map((whats, index) => {
						if (whats.official === false) {
							if (whats.status === "CONNECTED") {
								return (
									<MenuItem key={index} value={whats.id}>{whats.name}</MenuItem>
								)
							}
						} return null
					})}
				</Select>
            </Paper>
    </MainContainer>
	);
};

export default WhatsConfig;
