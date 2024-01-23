import type ReadonlyEvent from "../types/Track.js";
import Track from "../types/Track.js";
import type EventsQueueSender from "./EventsQueueSender.js";

export default function getTracker(QueueSender: {
  new (
    send: (events: ReadonlyEvent[]) => Promise<boolean>,
  ): EventsQueueSender<ReadonlyEvent>;
}) {
  async function sendTracks(tracks: Track[]) {
    const body = JSON.stringify(tracks);

    const response = await fetch("http://localhost:8888/track", {
      method: "POST",
      body,
    })
      .then((_) => false)
      .catch((_) => true);

    return response;
  }

  const queueSender = new QueueSender(sendTracks);
  window.addEventListener("beforeunload", () => queueSender.sendEventsForce());

  return {
    track(event: string, ...tags: string[]): void {
      queueSender.addEvent({
        event,
        tags,
        url: window.location.href,
        title: document.title,
        ts: new Date().getTime(),
      });
    },
  };
}
