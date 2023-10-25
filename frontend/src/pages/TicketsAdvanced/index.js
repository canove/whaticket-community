import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import ChatIcon from '@material-ui/icons/Chat';

import TicketsManagerTabs from "../../components/TicketsManagerTabs/";
import Ticket from "../../components/Ticket/";
import TicketAdvancedLayout from "../../components/TicketAdvancedLayout";

import { TicketsContext } from "../../context/Tickets/TicketsContext";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
    header: {
    },
    content: {
        overflow: "auto"
    },
    placeholderContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
		backgroundColor: "#eee"
    },
    placeholderItem: {
    }
}));

const TicketAdvanced = (props) => {
	const classes = useStyles();
	const { ticketId } = useParams();
	const [option, setOption] = useState(0);
    const { currentTicket, setCurrentTicket } = useContext(TicketsContext)

    useEffect(() => {
        if(currentTicket.id !== null) {
            setCurrentTicket({ id: currentTicket.id, code: '#open' })
        }
        if (!ticketId) {
            setOption(1)
        }
        return () => {
            setCurrentTicket({ id: null, code: null })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (currentTicket.id !== null) {
            setOption(0)
        }
    }, [currentTicket])

	const renderPlaceholder = () => {
		return <Box className={classes.placeholderContainer}>
            <div className={classes.placeholderItem}>{i18n.t("chat.noTicketMessage")}</div><br />
            <Button onClick={() => setOption(1)} variant="contained" color="primary">
                Selecionar Ticket
            </Button>
        </Box>
	}

	const renderMessageContext = () => {
		if (ticketId) {
			return <Ticket />
		}
		return renderPlaceholder()
	}

	const renderTicketsManagerTabs = () => {
		return <TicketsManagerTabs />
	}

	return (
        <TicketAdvancedLayout>
            <Box className={classes.header}>
                <BottomNavigation
                    value={option}
                    onChange={(event, newValue) => {
                        setOption(newValue);
                    }}
                    showLabels
                    className={classes.root}
                >
                    <BottomNavigationAction label="Ticket" icon={<ChatIcon />} />
                    <BottomNavigationAction label="Atendimentos" icon={<QuestionAnswerIcon />} />
                </BottomNavigation>
            </Box>
            <Box className={classes.content}>
                { option === 0 ? renderMessageContext() : renderTicketsManagerTabs() }
            </Box>
        </TicketAdvancedLayout>
	);
};

export default TicketAdvanced;
