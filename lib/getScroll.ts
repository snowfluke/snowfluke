export function isWindow(obj: HTMLElement | Window | Document | null) {
  return obj !== null && obj !== undefined;
}

export const getScroll = (
  target: HTMLElement | Window | Document | null
): number => {
  if (typeof window === "undefined") {
    return 0;
  }
  let result = 0;
  if (isWindow(target)) {
    result = (target as Window)["pageYOffset"];
  } else if (target instanceof Document) {
    result = target.documentElement["scrollTop"];
  } else if (target) {
    result = (target as HTMLElement)["scrollTop"];
  }
  if (target && !isWindow(target) && typeof result !== "number") {
    result = ((target as HTMLElement).ownerDocument || (target as Document))
      .documentElement?.["scrollTop"];
  }
  return result;
};
