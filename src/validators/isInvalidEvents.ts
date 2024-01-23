import type ReadonlyEvent from "../types/Track.js";

export default function isInvalidEvents(events: readonly ReadonlyEvent[]) {
  return !Array.isArray(events) || events.some(eventIsInvalid);
}

// Для меня конструкция ниже выглядит вполне читаемо
// Если у Вас есть предложения, как ее улучшить, то пишите
function eventIsInvalid(event: ReadonlyEvent) {
  return (
    typeof event.event !== "string" ||
    typeof event.title !== "string" ||
    typeof event.ts !== "number" ||
    typeof event.url !== "string" ||
    event.ts > new Date().getTime() ||
    !Array.isArray(event.tags) ||
    isInvalidHttpUrl(event.url) ||
    isInvalidTags(event.tags)
  );
}

function isInvalidTags(tags: string[]) {
  return tags.length !== 0 && tags.some((tag) => typeof tag !== "string");
}

function isInvalidHttpUrl(string: string) {
  let url: URL;

  try {
    url = new URL(string);
  } catch (_) {
    return true;
  }

  return url.protocol !== "http:" && url.protocol !== "https:";
}
