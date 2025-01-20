import { Avatar, Card, CardHeader } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { styled } from "@mui/material/styles";

const TicketHeaderStyled = styled(Card)({
  display: "flex",
  backgroundColor: "#eee",
  flex: "none",
  borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
})


const TicketHeaderSkeleton = () => {
  return (
    <TicketHeaderStyled>
      <CardHeader
        titleTypographyProps={{ noWrap: true }}
        subheaderTypographyProps={{ noWrap: true }}
        avatar={
          <Skeleton animation="wave" variant="circular">
            <Avatar alt="contact_image" />
          </Skeleton>
        }
        title={<Skeleton animation="wave" width={80} />}
        subheader={<Skeleton animation="wave" width={140} />}
      />
    </TicketHeaderStyled>
  );
};

export default TicketHeaderSkeleton;
