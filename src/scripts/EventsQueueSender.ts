export default class EventsQueueSender<TEvent> {
  constructor(send: (events: TEvent[]) => Promise<boolean>) {
    this.#send = send;
  }

  readonly #send: (events: TEvent[]) => Promise<boolean>;
  readonly #buffer: TEvent[] = [];
  readonly #timeout = 1001;
  #currentTimeoutId: number | null = null;

  async addEvent(event: TEvent) {
    this.#buffer.push(event);

    const areEventsInABufferMoreThanTwo = this.#buffer.length > 2;
    const isNotExistTimeout = !this.#currentTimeoutId;

    const doNeedToSend = isNotExistTimeout || areEventsInABufferMoreThanTwo;

    if (doNeedToSend) this.sendEventsForce();
  }

  async sendEventsForce() {
    if (this.#buffer.length === 0) return;

    if (this.#currentTimeoutId) {
      window.clearTimeout(this.#currentTimeoutId);
      this.#currentTimeoutId = null;
    }

    this.#sendAndSetTimer();
  }

  async #sendEventsNow() {
    const sendingBuffer = [...this.#buffer];
    this.#buffer.length = 0;

    const isRepeatSending = await this.#send([...sendingBuffer]);

    if (isRepeatSending) this.#buffer.push(...sendingBuffer);
  }

  #sendByTimeout() {
    if (!this.#currentTimeoutId) {
      this.#currentTimeoutId = window.setTimeout(async () => {
        this.#currentTimeoutId = null;

        if (this.#buffer.length !== 0) {
          this.#sendAndSetTimer();
        }
      }, this.#timeout);
    }
  }

  #sendAndSetTimer() {
    this.#sendEventsNow();
    this.#sendByTimeout();
  }
}
