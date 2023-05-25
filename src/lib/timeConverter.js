function padLeadingZeros(num, size) {
  var s = "0" + num;
  return s.substring(s.length - size);
}

export const convertFloatTimeToHHMM = (time) => {
  if (time == 0) return "0";
  // times are float input and we need to parse them to "H:MM", e.g 2.25 -> 2:15
  const minutes = time % 1; // extracts 0.25 from 2.25
  const displayMinutes = (+minutes * 60).toFixed(0);
  return `${Math.floor(time)}:${padLeadingZeros(displayMinutes, 2)}`;
};

export const convertHHMMTimeToFloat = (time) => {
  if (time.includes(":")) {
    const [hours, minutes] = time.split(":");
    const minuteFractions = Number(minutes) / 60;

    return Number(hours) + minuteFractions;
  } else {
    return time
  }
};
