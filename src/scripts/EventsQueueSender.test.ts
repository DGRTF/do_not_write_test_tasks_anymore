import EventsQueueSender from "./EventsQueueSender";

const timeout = 1005;

async function waitForQueueTimer() {
  await waitForTime(timeout);
}

async function waitForTime(time: number) {
  await new Promise((r) => setTimeout(r, time));
}

function numberComparer(firstNumber: number, secondNumber: number) {
  return firstNumber - secondNumber;
}

function getEventsAccumulatorWithFailsByOddInvokesSender() {
  let isRepeat = true;
  const eventsCache: any = [];

  return {
    async failsByOddInvokes(events: any[]) {
      const isRepeatCache = isRepeat;
      isRepeat = !isRepeat;

      if (!isRepeatCache) eventsCache.push(...events);

      return isRepeatCache;
    },
    getEvents() {
      return [...eventsCache];
    },
  };
}

function getEventsAccumulatorWithNotFailsSender() {
  const eventsCache: any = [];

  return {
    async failsByOddInvokes(events: any) {
      return await Promise.resolve().then(() => {
        eventsCache.push(events);

        return false;
      });
    },
    getEvents() {
      return [...eventsCache];
    },
    reset() {
      eventsCache.length = 0;
    },
  };
}

function getEventsAccumulatorWithAlwaysFailsSender() {
  const eventsCache: any = [];

  return {
    async failsByOddInvokes(events: any) {
      return await Promise.resolve().then(() => {
        eventsCache.push(events);

        return true;
      });
    },
    getEvents() {
      return [...eventsCache];
    },
    reset() {
      eventsCache.length = 0;
    },
  };
}

test("SHOULD do not send empty array WHEN try send via force", async () => {
  const sender = jest.fn();

  let queue = new EventsQueueSender(sender);

  queue.sendEventsForce();

  expect(sender.mock.calls).toHaveLength(0);
});

test("SHOULD send events without duplicates WHEN add events via sync instructions", async () => {
  let eventsAccumulator = getEventsAccumulatorWithNotFailsSender();

  let queue = new EventsQueueSender((events) =>
    eventsAccumulator.failsByOddInvokes(events),
  );

  queue.addEvent("1");
  queue.addEvent("2");
  queue.addEvent("3");

  expect(eventsAccumulator.getEvents()).toEqual([]);

  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents()).toEqual([["1"], ["2", "3"]]);
});

test("SHOULD send first messages and wait other WHEN messages less than four and more than one", async () => {
  let eventsAccumulator = getEventsAccumulatorWithNotFailsSender();
  let queue = new EventsQueueSender((events) =>
    eventsAccumulator.failsByOddInvokes(events),
  );

  await queue.addEvent("1");
  await queue.addEvent("2");
  await queue.addEvent("3");

  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents()).toEqual([["1"], ["2", "3"]]);
});

test("SHOULD send first messages immediately", async () => {
  let eventsAccumulator = getEventsAccumulatorWithNotFailsSender();
  let queue = new EventsQueueSender((events) =>
    eventsAccumulator.failsByOddInvokes(events),
  );

  await queue.addEvent("1");

  expect(eventsAccumulator.getEvents()).toEqual([["1"]]);

  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents()).toEqual([["1"]]);
});

test("SHOULD send first messages then second three and wait other WHEN messages less than 7 and more than 4", async () => {
  let eventsAccumulator = getEventsAccumulatorWithNotFailsSender();
  let queue = new EventsQueueSender((events) =>
    eventsAccumulator.failsByOddInvokes(events),
  );

  await queue.addEvent("1");
  await queue.addEvent("2");
  await queue.addEvent("3");
  await queue.addEvent("4");
  await queue.addEvent("5");

  expect(eventsAccumulator.getEvents()).toEqual([["1"], ["2", "3", "4"]]);

  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents()).toEqual([
    ["1"],
    ["2", "3", "4"],
    ["5"],
  ]);
});

test("SHOULD send first messages then second three then third tree WHEN messages are 7", async () => {
  let eventsAccumulator = getEventsAccumulatorWithNotFailsSender();
  let queue = new EventsQueueSender((events) =>
    eventsAccumulator.failsByOddInvokes(events),
  );

  await queue.addEvent("1");
  await queue.addEvent("2");
  await queue.addEvent("3");
  await queue.addEvent("4");
  await queue.addEvent("5");
  await queue.addEvent("6");
  await queue.addEvent("7");

  expect(eventsAccumulator.getEvents()).toEqual([
    ["1"],
    ["2", "3", "4"],
    ["5", "6", "7"],
  ]);

  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents()).toEqual([
    ["1"],
    ["2", "3", "4"],
    ["5", "6", "7"],
  ]);

  eventsAccumulator.reset();
  eventsAccumulator = getEventsAccumulatorWithNotFailsSender();
  queue = new EventsQueueSender((events) =>
    eventsAccumulator.failsByOddInvokes(events),
  );

  await queue.addEvent("1");
  await queue.addEvent("2");
  await queue.addEvent("3");
  await queue.addEvent("4");
  await queue.addEvent("5");
  await queue.addEvent("6");
  await queue.addEvent("7");

  expect(eventsAccumulator.getEvents()).toEqual([
    ["1"],
    ["2", "3", "4"],
    ["5", "6", "7"],
  ]);

  eventsAccumulator.reset();
  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents()).toEqual([]);
});

test("SHOULD send first messages then second three then third tree and wait for 8 event WHEN messages more than 7 and less than 10", async () => {
  const eventsAccumulator = getEventsAccumulatorWithNotFailsSender();
  const queue = new EventsQueueSender((events) =>
    eventsAccumulator.failsByOddInvokes(events),
  );

  await queue.addEvent("1");
  await queue.addEvent("2");
  await queue.addEvent("3");
  await queue.addEvent("4");
  await queue.addEvent("5");
  await queue.addEvent("6");
  await queue.addEvent("7");
  await queue.addEvent("8");

  expect(eventsAccumulator.getEvents()).toEqual([
    ["1"],
    ["2", "3", "4"],
    ["5", "6", "7"],
  ]);

  eventsAccumulator.reset();
  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents()).toEqual([["8"]]);
});

test("Complex for adding events", async () => {
  const eventsAccumulator = getEventsAccumulatorWithNotFailsSender();
  const queue = new EventsQueueSender((events) =>
    eventsAccumulator.failsByOddInvokes(events),
  );

  await queue.addEvent("1");
  await queue.addEvent("2");
  await queue.addEvent("3");
  await queue.addEvent("4");
  await queue.addEvent("5");
  await queue.addEvent("6");
  await queue.addEvent("7");
  await queue.addEvent("8");

  expect(eventsAccumulator.getEvents()).toEqual([
    ["1"],
    ["2", "3", "4"],
    ["5", "6", "7"],
  ]);

  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents()).toEqual([
    ["1"],
    ["2", "3", "4"],
    ["5", "6", "7"],
    ["8"],
  ]);

  await queue.addEvent("11");
  await queue.addEvent("12");
  await queue.addEvent("13");
  await queue.addEvent("14");
  await queue.addEvent("15");
  await queue.addEvent("16");
  await queue.addEvent("17");
  await queue.addEvent("18");

  expect(eventsAccumulator.getEvents()).toEqual([
    ["1"],
    ["2", "3", "4"],
    ["5", "6", "7"],
    ["8"],
    ["11", "12", "13"],
    ["14", "15", "16"],
  ]);

  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents()).toEqual([
    ["1"],
    ["2", "3", "4"],
    ["5", "6", "7"],
    ["8"],
    ["11", "12", "13"],
    ["14", "15", "16"],
    ["17", "18"],
  ]);

  await queue.addEvent("121");
  await queue.addEvent("122");
  await queue.addEvent("123");
  await queue.addEvent("124");
  await queue.addEvent("125");
  await queue.addEvent("126");
  await queue.addEvent("127");

  expect(eventsAccumulator.getEvents()).toEqual([
    ["1"],
    ["2", "3", "4"],
    ["5", "6", "7"],
    ["8"],
    ["11", "12", "13"],
    ["14", "15", "16"],
    ["17", "18"],
    ["121", "122", "123"],
    ["124", "125", "126"],
  ]);

  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents()).toEqual([
    ["1"],
    ["2", "3", "4"],
    ["5", "6", "7"],
    ["8"],
    ["11", "12", "13"],
    ["14", "15", "16"],
    ["17", "18"],
    ["121", "122", "123"],
    ["124", "125", "126"],
    ["127"],
  ]);
}, 10_000);

test("Complex for adding sending and events event immediately", async () => {
  const eventsAccumulator = getEventsAccumulatorWithNotFailsSender();
  const queue = new EventsQueueSender((events) =>
    eventsAccumulator.failsByOddInvokes(events),
  );

  await queue.addEvent("1");
  await queue.addEvent("2");
  await queue.addEvent("3");
  await queue.addEvent("4");
  await queue.addEvent("5");
  await queue.sendEventsForce();
  await queue.addEvent("6");
  await queue.addEvent("7");

  expect(eventsAccumulator.getEvents()).toEqual([
    ["1"],
    ["2", "3", "4"],
    ["5"],
  ]);

  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents()).toEqual([
    ["1"],
    ["2", "3", "4"],
    ["5"],
    ["6", "7"],
  ]);

  eventsAccumulator.reset();

  await queue.addEvent("1");
  await queue.addEvent("2");
  await queue.addEvent("3");
  await queue.addEvent("4");
  await queue.addEvent("5");
  await queue.sendEventsForce();
  await queue.addEvent("6");
  await queue.addEvent("7");

  expect(eventsAccumulator.getEvents()).toEqual([
    ["1", "2", "3"],
    ["4", "5"],
  ]);

  eventsAccumulator.reset();
  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents()).toEqual([["6", "7"]]);

  eventsAccumulator.reset();

  await queue.addEvent("1");
  await queue.addEvent("2");
  await queue.addEvent("3");
  await queue.addEvent("4");
  await queue.addEvent("5");
  await queue.sendEventsForce();
  await queue.addEvent("6");
  await queue.addEvent("7");
  await queue.addEvent("8");

  expect(eventsAccumulator.getEvents()).toEqual([
    ["1", "2", "3"],
    ["4", "5"],
    ["6", "7", "8"],
  ]);

  eventsAccumulator.reset();
  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents()).toEqual([]);
}, 1000_000);

test("SHOULD retry sending via timeout WHEN sending function return true", async () => {
  const eventsAccumulator = getEventsAccumulatorWithAlwaysFailsSender();
  const queue = new EventsQueueSender((events) =>
    eventsAccumulator.failsByOddInvokes(events),
  );

  await queue.addEvent("1");

  expect(eventsAccumulator.getEvents()).toEqual([["1"]]);

  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents()).toEqual([["1"], ["1"]]);

  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents()).toEqual([["1"], ["1"], ["1"]]);
});

test("SHOULD send events without duplications complex", async () => {
  let eventsAccumulator = getEventsAccumulatorWithFailsByOddInvokesSender();
  let queue = new EventsQueueSender((events) =>
    eventsAccumulator.failsByOddInvokes(events),
  );

  await queue.addEvent(1);
  queue.addEvent(2);
  queue.addEvent(3);
  await queue.addEvent(4);
  queue.addEvent(5);
  await queue.sendEventsForce();
  await queue.addEvent(6);
  queue.addEvent(7);

  await waitForQueueTimer();
  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents().sort(numberComparer)).toEqual([
    1, 2, 3, 4, 5, 6, 7,
  ]);

  queue.addEvent(8);
  queue.addEvent(9);
  queue.addEvent(10);
  queue.addEvent(11);
  queue.sendEventsForce();
  queue.addEvent(12);
  queue.addEvent(13);
  queue.addEvent(14);
  await queue.sendEventsForce();
  queue.addEvent(15);

  await waitForQueueTimer();
  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents().sort(numberComparer)).toEqual([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  ]);

  await queue.addEvent(16);
  await queue.addEvent(17);
  await queue.addEvent(18);
  await queue.addEvent(19);
  queue.sendEventsForce();
  await queue.addEvent(20);
  await queue.addEvent(21);
  await queue.addEvent(22);
  await queue.sendEventsForce();
  await queue.addEvent(23);

  await waitForQueueTimer();
  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents().sort(numberComparer)).toEqual([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23,
  ]);

  eventsAccumulator = getEventsAccumulatorWithFailsByOddInvokesSender();
  queue = new EventsQueueSender((events) =>
    eventsAccumulator.failsByOddInvokes(events),
  );

  await queue.addEvent(1);
  queue.addEvent(2);
  queue.addEvent(3);
  await queue.addEvent(4);
  queue.addEvent(5);
  await queue.sendEventsForce();
  await queue.addEvent(6);
  queue.addEvent(7);

  queue.addEvent(8);
  queue.addEvent(9);
  queue.addEvent(10);
  queue.addEvent(11);
  queue.sendEventsForce();
  queue.addEvent(12);
  queue.addEvent(13);
  queue.addEvent(14);
  await queue.sendEventsForce();
  queue.addEvent(15);

  await queue.addEvent(16);
  await queue.addEvent(17);
  await queue.addEvent(18);
  await queue.addEvent(19);
  queue.sendEventsForce();
  await queue.addEvent(20);
  await queue.addEvent(21);
  await queue.addEvent(22);
  await queue.sendEventsForce();
  await queue.addEvent(23);

  await waitForQueueTimer();
  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents().sort(numberComparer)).toEqual([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23,
  ]);
}, 100_000);

test("SHOULD send events without duplications with sync sender complex", async () => {
  let eventsAccumulator = getEventsAccumulatorWithFailsByOddInvokesSender();
  let queue = new EventsQueueSender((events) =>
    eventsAccumulator.failsByOddInvokes(events),
  );

  await queue.addEvent(1);
  queue.addEvent(2);
  queue.addEvent(3);
  await queue.addEvent(4);
  queue.addEvent(5);
  await queue.sendEventsForce();
  await queue.addEvent(6);
  queue.addEvent(7);

  await waitForQueueTimer();
  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents().sort(numberComparer)).toEqual([
    1, 2, 3, 4, 5, 6, 7,
  ]);

  queue.addEvent(8);
  queue.addEvent(9);
  queue.addEvent(10);
  queue.addEvent(11);
  queue.sendEventsForce();
  queue.addEvent(12);
  queue.addEvent(13);
  queue.addEvent(14);
  await queue.sendEventsForce();
  queue.addEvent(15);

  await waitForQueueTimer();
  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents().sort(numberComparer)).toEqual([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  ]);

  await queue.addEvent(16);
  await queue.addEvent(17);
  await queue.addEvent(18);
  await queue.addEvent(19);
  queue.sendEventsForce();
  await queue.addEvent(20);
  await queue.addEvent(21);
  await queue.addEvent(22);
  await queue.sendEventsForce();
  await queue.addEvent(23);

  await waitForQueueTimer();
  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents().sort(numberComparer)).toEqual([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23,
  ]);

  eventsAccumulator = getEventsAccumulatorWithFailsByOddInvokesSender();
  queue = new EventsQueueSender((events) =>
    eventsAccumulator.failsByOddInvokes(events),
  );

  await queue.addEvent(1);
  queue.addEvent(2);
  queue.addEvent(3);
  await queue.addEvent(4);
  queue.addEvent(5);
  await queue.sendEventsForce();
  await queue.addEvent(6);
  queue.addEvent(7);

  queue.addEvent(8);
  queue.addEvent(9);
  queue.addEvent(10);
  queue.addEvent(11);
  queue.sendEventsForce();
  queue.addEvent(12);
  queue.addEvent(13);
  queue.addEvent(14);
  await queue.sendEventsForce();
  queue.addEvent(15);

  await queue.addEvent(16);
  await queue.addEvent(17);
  await queue.addEvent(18);
  await queue.addEvent(19);
  queue.sendEventsForce();
  await queue.addEvent(20);
  await queue.addEvent(21);
  await queue.addEvent(22);
  await queue.sendEventsForce();
  await queue.addEvent(23);

  await waitForQueueTimer();
  await waitForQueueTimer();

  expect(eventsAccumulator.getEvents().sort(numberComparer)).toEqual([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23,
  ]);
}, 100_000);

function getTimeAccumulator(
  requestHandler: (events: any) => Promise<boolean> | boolean,
) {
  const intervals: any[] = [];
  let lastTime = 0;

  return {
    async generateInterval() {
      const now = performance.now();
      intervals.push(now - lastTime);
      lastTime = now;

      return requestHandler([]);
    },

    getIntervals() {
      return intervals.filter((_, i) => i !== 0);
    },
  };
}

async function asyncNotFailsRequestHandler() {
  return await Promise.resolve(false);
}

describe.each([
  [
    () => {
      const t = getEventsAccumulatorWithFailsByOddInvokesSender();
      return async (events) => await t.failsByOddInvokes(events);
    },
  ],
  [
    () => {
      const t = getEventsAccumulatorWithFailsByOddInvokesSender();
      return (events) => t.failsByOddInvokes(events);
    },
  ],
  [() => () => false],
  [() => asyncNotFailsRequestHandler],
])("Check timeouts", (getRequestHandler) => {
  test("SHOULD send events not less than once in a second WHEN adding events sync", async () => {
    const timeCollection = getTimeAccumulator(getRequestHandler());
    const queue = new EventsQueueSender(() =>
      timeCollection.generateInterval(),
    );

    queue.addEvent(1);
    queue.addEvent(1);
    await waitForQueueTimer();
    await waitForQueueTimer();

    expect(timeCollection.getIntervals()[0]).toBeGreaterThan(1000);
  });

  test("SHOULD send events not less than once in a second WHEN adding events async", async () => {
    const timeCollection = getTimeAccumulator(getRequestHandler());
    const queue = new EventsQueueSender(() =>
      timeCollection.generateInterval(),
    );

    await queue.addEvent(1);
    await queue.addEvent(1);
    await waitForQueueTimer();
    await waitForQueueTimer();

    expect(timeCollection.getIntervals()[0]).toBeGreaterThan(1000);
  });

  test("SHOULD send events not less than once in a second WHEN adding first event sync and second async", async () => {
    const timeCollection = getTimeAccumulator(getRequestHandler());
    const queue = new EventsQueueSender(() =>
      timeCollection.generateInterval(),
    );

    await queue.addEvent(1);
    queue.addEvent(1);
    await waitForQueueTimer();
    await waitForQueueTimer();

    expect(timeCollection.getIntervals()[0]).toBeGreaterThan(1000);
  });

  test("SHOULD send events not less than once in a second WHEN adding first event async and second sync", async () => {
    const timeCollection = getTimeAccumulator(getRequestHandler());
    const queue = new EventsQueueSender(() =>
      timeCollection.generateInterval(),
    );

    queue.addEvent(1);
    await queue.addEvent(1);
    await waitForQueueTimer();
    await waitForQueueTimer();

    expect(timeCollection.getIntervals()[0]).toBeGreaterThan(1000);
  });

  test("SHOULD send events not less than once in a second complex", async () => {
    const timeCollection = getTimeAccumulator(getRequestHandler());

    const queue = new EventsQueueSender(() =>
      timeCollection.generateInterval(),
    );

    queue.addEvent(1);
    await queue.addEvent(2);
    await waitForQueueTimer();
    await waitForQueueTimer();

    expect(timeCollection.getIntervals()[0]).toBeGreaterThan(1000);

    queue.addEvent(3);
    await queue.addEvent(4);
    await waitForQueueTimer();
    await waitForQueueTimer();

    let intervals = timeCollection.getIntervals();

    expect(intervals.length).toBe(3);
    expect(intervals.every((interval) => interval > 1000)).toBe(true);

    queue.addEvent(1);
    queue.addEvent(1);
    await waitForQueueTimer();
    await waitForQueueTimer();

    intervals = timeCollection.getIntervals();
    expect(intervals.length).toBe(5);
    expect(intervals.every((interval) => interval > 1000)).toBe(true);

    queue.addEvent(1);
    queue.addEvent(1);
    await waitForQueueTimer();
    await waitForQueueTimer();

    intervals = timeCollection.getIntervals();
    expect(intervals.length).toBe(7);
    expect(intervals.every((interval) => interval > 1000)).toBe(true);

    await queue.addEvent(1);
    await queue.addEvent(1);
    await waitForQueueTimer();
    await waitForQueueTimer();

    intervals = timeCollection.getIntervals();

    expect(intervals.length).toBe(9);
    expect(intervals.every((interval) => interval > 1000)).toBe(true);

    await queue.addEvent(1);
    await queue.addEvent(1);
    await waitForQueueTimer();
    await waitForQueueTimer();

    intervals = timeCollection.getIntervals();
    expect(intervals.length).toBe(11);
    expect(intervals.every((interval) => interval > 1000)).toBe(true);

    await queue.addEvent(1);
    queue.addEvent(1);
    await waitForQueueTimer();
    await waitForQueueTimer();

    intervals = timeCollection.getIntervals();
    expect(intervals.length).toBe(13);
    expect(intervals.every((interval) => interval > 1000)).toBe(true);

    await queue.addEvent(1);
    queue.addEvent(1);
    await waitForQueueTimer();
    await waitForQueueTimer();

    intervals = timeCollection.getIntervals();
    expect(intervals.length).toBe(15);
    expect(intervals.every((interval) => interval > 1000)).toBe(true);
  }, 1000_000);
});

it.each([[() => false], [asyncNotFailsRequestHandler]])(
  "SHOULD send events not less than once in a second complex 1",
  async (requestHandler) => {
    const timeCollection = getTimeAccumulator(requestHandler);

    const queue = new EventsQueueSender(() =>
      timeCollection.generateInterval(),
    );

    queue.addEvent(1);
    queue.addEvent(1);
    await queue.addEvent(1);

    await waitForQueueTimer();
    await waitForQueueTimer();

    let intervals = timeCollection.getIntervals();

    expect(intervals.length).toBe(1);
    expect(intervals.every((interval) => interval > 1000)).toBe(true);

    queue.addEvent(1);
    await queue.addEvent(1);
    queue.addEvent(1);

    await waitForQueueTimer();
    await waitForQueueTimer();

    intervals = timeCollection.getIntervals();

    expect(intervals.length).toBe(3);
    expect(intervals.every((interval) => interval > 1000)).toBe(true);

    queue.addEvent(1);
    await queue.addEvent(1);
    queue.addEvent(1);
    await queue.addEvent(1);

    await waitForQueueTimer();
    await waitForQueueTimer();

    intervals = timeCollection.getIntervals();

    expect(intervals.length).toBe(5);
    expect(intervals[intervals.length - 1]).toBeLessThan(1000);
    expect(intervals[intervals.length - 2]).toBeGreaterThan(1000);
  },
  1000_000,
);
