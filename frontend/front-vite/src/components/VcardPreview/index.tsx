import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toastError from "../../errors/toastError";
import api from "../../services/api";

import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";

import { AuthContext } from "../../context/Auth/AuthContext";

import { Button, Divider } from "@mui/material";
import type { Error } from "../../types/Error";

interface VcardPreviewProps {
  contact: string;
  numbers: string;
}

const VcardPreview = ({ contact, numbers }: VcardPreviewProps) => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const user = authContext ? authContext.user : null;

  const [selectedContact, setContact] = useState({
    id: "",
    name: "",
    number: 0,
    profilePicUrl: "",
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          let contactObj = {
            name: contact,
            // number: numbers.replace(/\D/g, ""),
            number: numbers !== undefined && numbers.replace(/\D/g, ""),
            email: "",
          };
          const { data } = await api.post("/contact", contactObj);
          setContact(data);
        } catch (err) {
          console.log(err);
          toastError(err as Error);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [contact, numbers]);

  const handleNewChat = async () => {
    try {
      const { data: ticket } = await api.post("/tickets", {
        contactId: selectedContact.id,
        userId: user.id,
        status: "open",
      });
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      toastError(err as Error);
    }
  };

  return (
    <>
      <div
        style={{
          minWidth: "250px",
        }}
      >
        <Grid container spacing={1}>
          <Grid
            size={{
              xs: 3,
            }}
          >
            <Avatar src={selectedContact.profilePicUrl} />
          </Grid>
          <Grid size={{ xs: 9 }}>
            <Typography
              style={{ marginTop: "12px", marginLeft: "10px" }}
              variant="subtitle1"
              color="primary"
              gutterBottom
            >
              {selectedContact.name}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Divider />
            <Button
              fullWidth
              color="primary"
              onClick={handleNewChat}
              disabled={!selectedContact.number}
            >
              Conversar
            </Button>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default VcardPreview;
