import React, { useEffect, useState } from "react";
import { getCountdownTime } from "./utils";
import styles from "./EventCounter.module.css";

export default function EventCounter({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: "",
    hours: "",
    minutes: "",
    isFinished: false,
  });

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      const { days, hours, minutes, isFinished } = getCountdownTime(targetDate);

      setTimeLeft({
        days,
        hours,
        minutes,
        isFinished,
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [targetDate]);

  return (
    <div className={styles.container}>
      <div className={styles.textCountdown}>
        <p>
          Proximo evento en:{" "}
          {timeLeft.days
            ? `${timeLeft.days} ${timeLeft.hours} ${timeLeft.minutes}`
            : "Calculando..."}
        </p>
      </div>
      <div className={styles.textEvent}>
        <p>INICIO CREATIA 3</p>
      </div>
    </div>
  );
}
