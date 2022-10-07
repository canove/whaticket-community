import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core/styles";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
} from "@material-ui/core";

import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import Typography from '@material-ui/core/Typography';

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { format, parseISO } from "date-fns";
import SystemChangeJSONModal from "../SystemChangeJSONModal";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '25ch',
  },

  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const SystemChangeModal = ({ open, onClose, systemChange, registerId }) => {
    const { i18n } = useTranslation();
    const classes = useStyles();

    const [historics, setHistorics] = useState([]);
    const [selectedHistoricJSON, setSelectedHistoricJSON] = useState(null);
    const [historicJSONModalOpen, setHistoricJSONModalOpen] = useState(false);

    useEffect(() => {
        const fetchHistorics = async () => {
            try {
                const { data } = await api.get(`/historics/`, {
                    params: { systemChange, registerId }
                });
                setHistorics(data);
            } catch (err) {
                toastError(err);
            }
        }

        if (open === true) {
            fetchHistorics();
        }
    }, [systemChange, registerId, open]);

    const handleClose = () => {
        onClose();
    };

    const formatDate = (date) => {
        if (date) {
            return format(parseISO(date), "dd/MM/yyyy HH:mm");
        }

        return date;
    }

    const getActionType = (actionType) => {
        if (actionType === 0) {
            return `${i18n.t("pricing.pricingModal.createdAt")}`;
        }

        if (actionType === 1) {
            return `${i18n.t("pricing.pricingModal.updatedAt")}`;
        }

        if (actionType === 2) {
            return `${i18n.t("pricing.pricingModal.deletedAt")}`;
        }
    }

    const handleOpenHistoricJSONModal = (historic) => {
        setSelectedHistoricJSON(historic);
        setHistoricJSONModalOpen(true);
    };

    const handleCloseHistoricJSONModal = () => {
        setSelectedHistoricJSON(null);
        setHistoricJSONModalOpen(false);
    };

    return (
        <div className={classes.root}>
            <SystemChangeJSONModal
                open={historicJSONModalOpen}
                onClose={handleCloseHistoricJSONModal}
                aria-labelledby="form-dialog-title"
                historic={selectedHistoricJSON}
            />
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                scroll="paper"
            >
                <DialogTitle id="form-dialog-title">
                   {i18n.t("pricing.pricingModal.historic")}
                </DialogTitle>
                <DialogContent dividers>
                    <Timeline align="alternate">
                        { historics && historics.map(historic => {
                            return (
                                <TimelineItem key={historic.id}>
                                    <TimelineOppositeContent>
                                        <Typography color="textSecondary">{formatDate(historic.createdAt)}</Typography>
                                    </TimelineOppositeContent>
                                    <TimelineSeparator>
                                        <Button
                                            onClick={() => {handleOpenHistoricJSONModal(historic)}}
                                        >
                                            <TimelineDot />
                                        </Button>
                                        <TimelineConnector />
                                    </TimelineSeparator>
                                    <TimelineContent>
                                        <Typography>
                                            {getActionType(historic.actionType)}
                                                {i18n.t("pricing.pricingModal.by")}
                                            {historic.user.name}
                                        </Typography>
                                    </TimelineContent>
                                </TimelineItem>
                            );
                        })}
                    </Timeline>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        color="secondary"
                        variant="outlined"
                    >
                        {i18n.t("pricing.pricingModal.closed")}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SystemChangeModal;
