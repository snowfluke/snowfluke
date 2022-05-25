const breakPoints = {
  mobileL: "576px",
  tabletM: "768px",
  desktopM: "992px",
  tabletL: "1024px",
  desktopL: "1200px",
};

export const devices = {
  mobileL: `(max-width: ${breakPoints.mobileL})`,
  tabletM: `(max-width: ${breakPoints.tabletM})`,
  desktopM: `(max-width: ${breakPoints.desktopM})`,
  tabletL: `(max-width: ${breakPoints.tabletL})`,
  desktopL: `(max-width: ${breakPoints.desktopL})`,
};
