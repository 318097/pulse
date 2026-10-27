// largest first, so convertDuration picks the biggest unit that fits
const DURATION_UNITS = [
  { seconds: 60 * 60, singular: "hr", plural: "hrs" },
  { seconds: 60, singular: "min", plural: "mins" },
  { seconds: 1, singular: "sec", plural: "secs" },
];

// converts seconds to hrs, mins or secs (whichever fits) and returns it with the unit
export const convertDuration = (seconds) => {
  const unit =
    DURATION_UNITS.find((u) => seconds >= u.seconds) ?? DURATION_UNITS.at(-1);
  const value = Number((seconds / unit.seconds).toFixed(1));
  return `${value} ${value === 1 ? unit.singular : unit.plural}`;
};
