export default interface Track {
  readonly event: string;
  readonly tags: readonly string[];
  readonly url: string;
  readonly title: string;
  readonly ts: number;
}
