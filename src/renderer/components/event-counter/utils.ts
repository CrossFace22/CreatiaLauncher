export function getCountdownTime(targetTime: Date): {
  days: string;
  hours: string;
  minutes: string;
  isFinished: boolean;
} {
  const now = new Date().getTime();

  const diff = targetTime.getTime() - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  let isFinished = false;

  if (diff <= 0) {
    isFinished = true;
  }

  return {
    days: days + "d",
    hours: hours + "hs",
    minutes: minutes + "m",
    isFinished,
  };
}
