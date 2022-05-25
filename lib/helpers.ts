export const formatDate = (date: Date) => {
  return Intl.DateTimeFormat("en-GB").format(new Date(date));
};
