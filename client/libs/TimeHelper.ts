import dayjs from 'dayjs';

const DateDiffToString = (start: Date, end: Date, format: 'full' | 'round') => {
  const seconds = dayjs(end).diff(start, 'seconds');
  const day = Math.round(seconds / 86400);
  const dayStr = day > 0 ? day.toString() + ' ngày ' : '';
  let secondLeft = seconds - day * 86400;
  const hour = Math.round(secondLeft / 3600);
  const hourStr = day > 0 ? day.toString() + ' giờ ' : '';
  secondLeft = secondLeft - hour * 3600;
  const min = Math.round(secondLeft / 60);
  const minStr = day > 0 ? day.toString() + ' phút ' : '';
  secondLeft = secondLeft - min * 60;
  const secondStr = secondLeft > 0 ? day.toString() + ' giây ' : '';
  if (format === 'round') {
    if (day > 0) return dayStr;
    else if (hour > 0) return hourStr;
    else if (min > 0) return minStr;
    else return secondStr;
  } else if (format == 'full') {
    return dayStr + hourStr + minStr + secondStr;
  }
  return '';
};

export const TimeHelper = {
  DateDiffToString,
};
