import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';

interface Props {
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
}

function getTargetDate(date: string, time?: string) {
  // Always in America/New_York
  if (time) {
    return DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm', { zone: 'America/New_York' });
  }
  return DateTime.fromFormat(date, 'yyyy-MM-dd', { zone: 'America/New_York' }).startOf('day');
}

const CountdownTimer: React.FC<Props> = ({ date, time }) => {
  const [now, setNow] = useState(DateTime.now().setZone('America/New_York'));
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(DateTime.now().setZone('America/New_York'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const target = getTargetDate(date, time);
  const diff = target.diff(now, ['days', 'hours', 'minutes', 'seconds']).toObject();
  const isPast = target < now;

  if (isPast) return <span className="text-red-500">Expired</span>;

  return (
    <span>
      {Math.floor(diff.days || 0)}d {Math.floor(diff.hours || 0)}h {Math.floor(diff.minutes || 0)}m {Math.floor(diff.seconds || 0)}s
    </span>
  );
};

export default CountdownTimer; 