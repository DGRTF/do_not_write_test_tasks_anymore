import isInvalidEvents from "./isInvalidEvents";

function getValidEvent() {
  return {
    event: "event",
    tags: ["tag"],
    url: "http://url.com",
    title: "title",
    ts: 0,
  } as const;
}

test("Happy path with valid events", () => {
  const actual = isInvalidEvents([getValidEvent()]);

  expect(actual).toBe(false);
});

test("SHOULD return true WHEN events is not array", () => {
  const actual = isInvalidEvents(getValidEvent() as any);

  expect(actual).toBe(true);
});

test("SHOULD return true WHEN property event is not string", () => {
  const validEvent = getValidEvent();
  const invalidEvent = { ...validEvent, event: 5 };
  const actual = isInvalidEvents([invalidEvent] as any);

  expect(actual).toBe(true);
});

test("SHOULD return true WHEN property url is not string", () => {
  const validEvent = getValidEvent();
  const invalidEvent = { ...validEvent, url: 5 };
  const actual = isInvalidEvents([invalidEvent] as any);

  expect(actual).toBe(true);
});

test("SHOULD return true WHEN property title is not string", () => {
  const validEvent = getValidEvent();
  const invalidEvent = { ...validEvent, title: 5 };
  const actual = isInvalidEvents([invalidEvent] as any);

  expect(actual).toBe(true);
});

test("SHOULD return true WHEN tag is not string", () => {
  const validEvent = getValidEvent();
  const invalidEvent = { ...validEvent, tags: [5] };
  const actual = isInvalidEvents([invalidEvent] as any);

  expect(actual).toBe(true);
});

test("SHOULD return false WHEN property tags is empty array", () => {
  const validEvent = getValidEvent();
  const invalidEvent = { ...validEvent, tags: [] };
  const actual = isInvalidEvents([invalidEvent] as any);

  expect(actual).toBe(false);
});

test("SHOULD return true WHEN property tags is not string", () => {
  const validEvent = getValidEvent();
  const invalidEvent = { ...validEvent, tags: 5 };
  const actual = isInvalidEvents([invalidEvent] as any);

  expect(actual).toBe(true);
});

it.each([
  [
    "SHOULD return true WHEN property url without protocol",
    "url.com/index.html",
    true,
  ],
  [
    "SHOULD return true WHEN property url with non-http protocol",
    "ftp://url.com/index.html",
    true,
  ],
  [
    "SHOULD return false WHEN property url with port",
    "http://localhost:8888",
    false,
  ],
])("%s", (_, invalidUrl, expectedResult) => {
  const validEvent = getValidEvent();
  const invalidEvent = { ...validEvent, url: invalidUrl };
  const actual = isInvalidEvents([invalidEvent] as any);

  expect(actual).toBe(expectedResult);
});
