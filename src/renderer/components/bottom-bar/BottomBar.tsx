import React, { useEffect, useState } from "react";
import styles from "./BottomBar.module.css";
import EventCounter from "../event-counter/EventCounter";
import SocialMediaButtons from "../social-media/SocialMediaButtons";
import Account from "../account/Account";
import Button from "../button/Button";
import LaunchButton from "../launch-button/LaunchButton";

export default function BottomBar() {
  const [event, setEvent] = React.useState({
    name: "",
    time: new Date(),
  });

  const [progress, setProgress] = useState({
    game: {
      progress: 0,
      total: 0,
    },
    instance: {
      progress: 0,
      total: 0,
    },
  });

  useEffect(() => {
    const getConfig = async () => {
      const config = await window?.api?.getConfig();
      if (config) {
        const time = config?.currentEvent?.time;
        const name = config?.currentEvent?.name;

        setEvent({
          name,
          time: new Date(time),
        });
      }
    };

    getConfig();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.bottomBar}>
        <SocialMediaButtons />
        <div className={styles.eventCounter}>
          <EventCounter targetDate={new Date(event.time)} />
        </div>
        <Account />
      </div>
      <div className={styles.button}>
        <LaunchButton setProgress={setProgress} progress={progress} />
      </div>
    </div>
  );
}
