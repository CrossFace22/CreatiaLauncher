import React, { useEffect, useState } from "react";
import styles from "./Home.module.css";
import webmLogo from "../../../assets/background/Creatia3Logo.webm";
import Button from "../../button/Button";
import { ConfigIcon } from "../../icons/ConfigIcon";
import { SavesIcon } from "../../icons/SavesIcon";
import SettingsModal from "../../settings/SettingsModal";
import ImageSlider from "../../image-slider/ImageSlider";
import bg1 from "../../../assets/background/bg1.png";
import bg2 from "../../../assets/background/bg2.jpeg";
import bg3 from "../../../assets/background/bg3.jpeg";
import bg4 from "../../../assets/background/bg4.jpeg";
import bg5 from "../../../assets/background/bg5.jpeg";
import bg6 from "../../../assets/background/bg6.jpeg";
import bg7 from "../../../assets/background/bg7.jpeg";
import bg8 from "../../../assets/background/bg8.png";
import bg10 from "../../../assets/background/bg10.png";

export default function Home() {
  const backgrounds = [bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8, bg10];

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(
    Math.floor(Math.random() * backgrounds.length)
  );
  const [opacity, setOpacity] = useState(1);

  const onClickSaves = () => {
    window?.api?.openFolder("saves");
  };

  const onClickScreenshots = () => {
    window?.api?.openFolder("screenshots");
  };

  useEffect(() => {
    window.api?.onError?.((event: any, data: any) => {
      console.error("Error from main process:", data);
      alert(`${data.message}`);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setOpacity(0.2);

      setTimeout(() => {
        setCurrentBgIndex((prevIndex) =>
          prevIndex === backgrounds.length - 1 ? 0 : prevIndex + 1
        );
        // Fade in
        setOpacity(1);
      }, 200);
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.container}>
      <img
        src={backgrounds[currentBgIndex]}
        alt="Background"
        className={styles.background}
        style={{
          opacity: opacity,
          transition: "opacity 0.2s ease-in-out",
        }}
      />
      <div className={styles.contentContainer}>
        <div className={styles.logo}>
          <video autoPlay loop width="480" height="200">
            <source src={webmLogo} type="video/webm" />
          </video>
        </div>
        <div className={styles.content}>
          <div className={styles.screenshot}>
            <ImageSlider />
            <div className={styles.screenshotButton}>
              <Button
                text="Capturas"
                onClick={onClickScreenshots}
                className={styles.button}
              />
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <Button
              onClick={() => setIsSettingsOpen(true)}
              icon={<ConfigIcon color="#00000" width="26px" />}
            />
            <Button
              onClick={onClickSaves}
              icon={<SavesIcon color="#00000" width="26px" />}
            />
          </div>
        </div>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </section>
  );
}
