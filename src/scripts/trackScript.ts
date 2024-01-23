import EventsQueueSender from "./EventsQueueSender.js";
import getTracker from "../scripts/getTrack.js";

export default `
  const QueueSender = ${EventsQueueSender.toString()};
  const tracker = (${getTracker.toString()})(QueueSender);
`;
