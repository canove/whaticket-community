import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { i18n } from "../../translate/i18n";
import { styled } from "@mui/material/styles";
import type { CSSObject } from "@mui/system";

interface ContactDrawerSkeletonProps {
  classes: {
    content: CSSObject;
    contactHeader: CSSObject;
    contactAvatar: CSSObject;
    contactDetails: CSSObject;
    contactExtraInfo: CSSObject;
  };
}

const ContactDrawerSkeleton: React.FC<ContactDrawerSkeletonProps> = ({
  classes,
}) => {
  const Content = styled("div")({
    ...classes.content,
  });

  const ContactHeader = styled(Paper)({
    ...classes.contactHeader,
  });

  const ContactAvatar = styled(Skeleton)({
    ...classes.contactAvatar,
  });

  const ContactDetail = styled(Paper)({
    ...classes.contactDetails,
  });

  const ContactExtraInfo = styled(Paper)({
    ...classes.contactExtraInfo,
  });

  return (
    <Content>
      <ContactHeader square variant="outlined">
        <ContactAvatar
          animation="wave"
          variant="circular"
          width={160}
          height={160}
        />
        <Skeleton animation="wave" height={25} width={90} />
        <Skeleton animation="wave" height={25} width={80} />
        <Skeleton animation="wave" height={25} width={80} />
      </ContactHeader>
      <ContactDetail square>
        <Typography variant="subtitle1">
          {i18n.t("contactDrawer.extraInfo")}
        </Typography>
        <ContactExtraInfo square variant="outlined">
          <Skeleton animation="wave" height={20} width={60} />
          <Skeleton animation="wave" height={20} width={160} />
        </ContactExtraInfo>
        <ContactExtraInfo square variant="outlined">
          <Skeleton animation="wave" height={20} width={60} />
          <Skeleton animation="wave" height={20} width={160} />
        </ContactExtraInfo>
        <ContactExtraInfo square variant="outlined">
          <Skeleton animation="wave" height={20} width={60} />
          <Skeleton animation="wave" height={20} width={160} />
        </ContactExtraInfo>
      </ContactDetail>
    </Content>
  );
};

export default ContactDrawerSkeleton;
