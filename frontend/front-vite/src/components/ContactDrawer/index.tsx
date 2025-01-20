import { useState } from "react";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Drawer from "@mui/material/Drawer";
import Link from "@mui/material/Link";
import InputLabel from "@mui/material/InputLabel";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

import { i18n } from "../../translate/i18n";
import ContactModal from "../ContactModal";
import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import MarkdownWrapper from "../MarkdownWrapper";
import type { CSSObject } from "@mui/system";

const drawerWidth = 320;

const styles = {
  content: {
    display: "flex",
    backgroundColor: "#eee",
    flexDirection: "column",
    padding: "8px 0px 8px 8px",
    height: "100%",
    overflowY: "scroll",
  },

  contactAvatar: {
    margin: 15,
    width: 160,
    height: 160,
  },

  contactHeader: {
    display: "flex",
    padding: 8,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    "& > *": {
      margin: 4,
    },
  },

  contactDetails: {
    marginTop: 8,
    padding: 8,
    display: "flex",
    flexDirection: "column",
  },
  contactExtraInfo: {
    marginTop: 4,
    padding: 6,
  },
} as {
  content: CSSObject;
  contactHeader: CSSObject;
  contactAvatar: CSSObject;
  contactDetails: CSSObject;
  contactExtraInfo: CSSObject;
};

const DrawerStyled = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    display: "flex",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
    borderRight: "1px solid rgba(0, 0, 0, 0.12)",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
});

const Header = styled("div")(({ theme }) => ({
  display: "flex",
  borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
  backgroundColor: "#eee",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  minHeight: "73px",
  justifyContent: "flex-start",
}));

const Content = styled("div")(({}) => ({
  display: "flex",
  backgroundColor: "#eee",
  flexDirection: "column",
  padding: "8px 0px 8px 8px",
  height: "100%",
  overflowY: "scroll",
}));

const ContactHeader = styled(Paper)(({}) => ({
  display: "flex",
  padding: 8,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  "& > *": {
    margin: 4,
  },
}));

const ContactAvatar = styled(Avatar)(({}) => ({
  margin: 15,
  width: 160,
  height: 160,
}));

const ContactDetail = styled(Paper)(({}) => ({
  marginTop: 8,
  padding: 8,
  display: "flex",
  flexDirection: "column",
}));

const ContactExtraInfo = styled(Paper)(({}) => ({
  marginTop: 4,
  padding: 6,
}));

import type { FC } from "react";

interface ContactDrawerProps {
  open: boolean;
  handleDrawerClose: () => void;
  contact: {
    name?: string;
    profilePicUrl?: string;
    number?: string | number;
    id: string | number;
    extraInfo?: { id: string; name: string; value: string }[];
  };
  loading: boolean;
}

const ContactDrawer: FC<ContactDrawerProps> = ({
  open,
  handleDrawerClose,
  contact,
  loading,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <DrawerStyled
      variant="persistent"
      anchor="right"
      open={open}
      PaperProps={{ style: { position: "absolute" } }}
      BackdropProps={{ style: { position: "absolute" } }}
      ModalProps={{
        container: document.getElementById("drawer-container"),
        style: { position: "absolute" },
      }}
    >
      <Header>
        <IconButton onClick={handleDrawerClose}>
          <CloseIcon />
        </IconButton>
        <Typography style={{ justifySelf: "center" }}>
          {i18n.t("contactDrawer.header")}
        </Typography>
      </Header>
      {loading ? (
        <ContactDrawerSkeleton classes={styles} />
      ) : (
        <Content>
          <ContactHeader square variant="outlined">
            <ContactAvatar
              alt={contact.name}
              src={contact.profilePicUrl}
            ></ContactAvatar>

            <Typography>{contact.name}</Typography>
            <Typography>
              <Link href={`tel:${contact.number}`}>{contact.number}</Link>
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setModalOpen(true)}
            >
              {i18n.t("contactDrawer.buttons.edit")}
            </Button>
          </ContactHeader>
          <ContactDetail square variant="outlined">
            <ContactModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              contactId={contact.id}
            ></ContactModal>
            <Typography variant="subtitle1">
              {i18n.t("contactDrawer.extraInfo")}
            </Typography>
            {contact?.extraInfo?.map((info) => (
              <ContactExtraInfo key={info.id} square variant="outlined">
                <InputLabel>{info.name}</InputLabel>
                <Typography component="div" noWrap style={{ paddingTop: 2 }}>
                  <MarkdownWrapper>{info.value}</MarkdownWrapper>
                </Typography>
              </ContactExtraInfo>
            ))}
          </ContactDetail>
        </Content>
      )}
    </DrawerStyled>
  );
};

export default ContactDrawer;
