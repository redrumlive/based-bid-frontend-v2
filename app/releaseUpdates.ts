export const RELEASE_UPDATES_EVENT = "based-bid:open-release-updates";

export function openReleaseUpdates() {
  window.dispatchEvent(new CustomEvent(RELEASE_UPDATES_EVENT));
}
