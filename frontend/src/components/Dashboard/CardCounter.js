import React from "react";

import { Avatar, Card, CardHeader, Typography } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";

import { makeStyles } from "@material-ui/core/styles";
import { grey } from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
	cardAvatar: {
		fontSize: '55px',
		color: grey[500],
		backgroundColor: '#ffffff',
		width: theme.spacing(7),
		height: theme.spacing(7)
	},
	cardTitle: {
		fontSize: '18px',
		color: theme.palette.text.primary
	},
	cardSubtitle: {
		color: grey[600],
		fontSize: '14px'
	}
}));

export default function CardCounter(props) {
    const { icon, title, value, loading } = props
	const classes = useStyles();
    return ( !loading ? 
        <Card>
            <CardHeader
                avatar={
                    <Avatar className={classes.cardAvatar}>
                        {icon}
                    </Avatar>
                }
                title={
                    <Typography variant="h6" component="h2" className={classes.cardTitle}>
                        { title }
                    </Typography>
                }
                subheader={
                    <Typography variant="subtitle1" component="p" className={classes.cardSubtitle}>
                        { value }
                    </Typography>
                }
            />
        </Card>
        : <Skeleton variant="rect" height={80} />
    )
    
}