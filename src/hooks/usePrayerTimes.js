import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPrayer, PRAYERS } from '../store/prayerSlice';
import { ddmmyyyy, offsetNow, toMin, tzNow } from '../time';

const FIVE = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/**
 * Horaires du jour + horloge (1 s) dans le fuseau de la ville choisie.
 * Calcule la prochaine prière, la prière en cours et le compte à rebours.
 */
export function usePrayerTimes() {
  const dispatch = useDispatch();
  const { location, tz, offset, status, today, tomorrow } = useSelector((s) => s.prayer);
  const clock = () => (offset != null ? offsetNow(offset) : tzNow(tz));
  const [now, setNow] = useState(clock);
  const refetched = useRef('');

  useEffect(() => {
    setNow(clock());
    const id = setInterval(() => setNow(clock()), 1000);
    return () => clearInterval(id);
  }, [tz, offset]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (status === 'idle') dispatch(fetchPrayer());
  }, [status, dispatch]);

  // Nouveau jour (ou premier chargement dans un autre fuseau) -> on recharge une fois
  const dayStr = ddmmyyyy(now);
  useEffect(() => {
    if (status === 'succeeded' && today && today.date !== dayStr && refetched.current !== dayStr) {
      refetched.current = dayStr;
      dispatch(fetchPrayer());
    }
  }, [dayStr, today, status, dispatch]);

  const computed = useMemo(() => {
    if (!today || !tomorrow) return null;
    const T = Object.fromEntries(PRAYERS.map((k) => [k, toMin(today.timings[k])]));
    const events = PRAYERS.map((k) => ({ key: k, time: today.timings[k], min: T[k] }));
    return { T, events };
  }, [today, tomorrow]);

  if (!computed) return { location, status, today, tomorrow, now, ready: false };

  const { T, events } = computed;
  const t = now.min;
  let next = FIVE.map((k) => ({ key: k, time: today.timings[k], min: T[k] })).find((e) => e.min > t);
  if (!next) next = { key: 'Fajr', time: tomorrow.timings.Fajr, min: toMin(tomorrow.timings.Fajr) + 1440, tomorrow: true };
  const passed = FIVE.filter((k) => T[k] <= t);
  const currentKey = passed.length ? passed[passed.length - 1] : 'Isha';
  const prevMin = passed.length ? T[currentKey] : T.Isha - 1440;
  const secondsLeft = next.min * 60 - now.sec;
  const progress = Math.min(1, Math.max(0, (t - prevMin) / (next.min - prevMin)));

  return { location, status, today, tomorrow, now, ready: true, T, events, next, currentKey, secondsLeft, progress };
}
