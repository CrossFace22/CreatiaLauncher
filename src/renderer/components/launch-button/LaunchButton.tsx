import Button from "../button/Button";
import styles from "./LaunchButton.module.css";
import React, { useEffect, useState } from "react";

export default function LaunchButton({
  progress,
  setProgress,
}: {
  progress: any;
  setProgress: React.Dispatch<React.SetStateAction<any>>;
}) {
  const [installing, setInstalling] = useState(false);
  const [init, setInit] = useState(false);
  const [combinedProgress, setCombinedProgress] = useState(0);

  useEffect(() => {
    // Listen for installation progress
    window?.api?.onInstallProgress(
      (data: { type: string; progress: number; total: number }) => {
        setProgress((prev: any) => ({
          ...prev,
          [data.type]: {
            progress: data.progress,
            total: data.total,
          },
        }));
      }
    );

    // Listen for installation completion
    window?.api?.onInstallComplete((data: { type: string }) => {
      if (data.type === "instance") {
        setInstalling(false);
        setCombinedProgress(0);
        setInit(true);
        window?.api?.launchApp("forge");
      }
    });

    // Listen for installation errors
    window?.api?.onInstallError((error: string) => {
      setInstalling(false);
      setInit(false);
      alert(`Error en la instalación: ${error}`);
    });

    return () => {
      window?.api?.onInstallProgress(() => {}); // Remove progress listener
    };
  }, []);

  useEffect(() => {
    // Calculate combined progress
    const gameProgress = progress.game.total
      ? progress.game.progress / progress.game.total
      : 0;
    const instanceProgress = progress.instance.total
      ? progress.instance.progress / progress.instance.total
      : 0;
    const combined = (gameProgress * 0.5 + instanceProgress * 0.5) * 100; // 50% game, 50% instance

    setCombinedProgress(Math.round(combined));
  }, [progress]);

  return (
    <Button
      text={
        init
          ? "Iniciando..."
          : installing
          ? `Descargando... ${combinedProgress}%`
          : "Jugar"
      }
      className={styles.button}
      onClick={() => {
        setInstalling(true);
        window?.api?.installGame("forge");
      }}
    ></Button>
  );
}
