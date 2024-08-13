import { useParams } from "react-router-dom";

const EventDetailSummary = () => {
    const {eventId} = useParams();
  return (
    <div>
      <h1>Event Detail Summary: {eventId}</h1>
    </div>
  );
};

export default EventDetailSummary;
