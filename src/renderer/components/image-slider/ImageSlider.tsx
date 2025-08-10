import React, { useEffect, useState } from "react";
import styles from "./ImageSlider.module.css";

export default function ImageSlider() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchNextImage = async () => {
      const imagePath = await window?.api?.getNextImage();
      setCurrentImage(imagePath ? `file://${imagePath}` : null);
    };

    fetchNextImage(); // Cargar la primera imagen

    const interval = setInterval(() => {
      fetchNextImage(); // Cargar la siguiente imagen cada 3 segundos
    }, 3000);

    return () => clearInterval(interval); // Limpiar el intervalo al desmontar
  }, []);

  if (!currentImage) {
    return (
      <div className={styles.slider}>
        <p className={styles.placeholder}>No hay capturas aun</p>
      </div>
    );
  }

  return (
    <div className={styles.slider}>
      <img src={currentImage} alt="Screenshot" className={styles.image} />
    </div>
  );
}
