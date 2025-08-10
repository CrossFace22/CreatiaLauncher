import React, { useState, useEffect } from "react";
import Modal from "../modals/Modal";
import styles from "./SettingsModal.module.css";
import Button from "../button/Button";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsProps) {
  const [settings, setSettings] = useState({
    javaPath: "",
    memoryMax: 4, // Default in GB (4G)
    memoryMin: 2, // Default in GB (2G)
    gamePath: "",
  });

  const [originalGamePath, setOriginalGamePath] = useState("");
  const [showRestartModal, setShowRestartModal] = useState(false);

  useEffect(() => {
    // Cargar configuraciones actuales
    window?.api?.getSettings().then((currentSettings: any) => {
      setSettings({
        ...currentSettings,
        memoryMax: currentSettings.memoryMax / 1024, // Convert MB to GB
        memoryMin: currentSettings.memoryMin / 1024, // Convert MB to GB
      });
      setOriginalGamePath(currentSettings.gamePath); // Guardar el valor original del gamePath
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const handleSave = () => {
    // Convert GB to MB before saving
    const updatedSettings = {
      ...settings,
      memoryMax: settings.memoryMax * 1024,
      memoryMin: settings.memoryMin * 1024,
    };

    // Verificar si el gamePath cambió
    if (settings.gamePath !== originalGamePath) {
      setShowRestartModal(true); // Mostrar el modal de reinicio
    }

    window?.api?.updateSettings(updatedSettings);
    onClose();
  };

  const handleBrowseJava = async () => {
    const result = await window?.api?.openFileDialog({
      title: "Seleccionar Java",
      filters: [{ name: "Ejecutable Java", extensions: ["exe"] }],
      properties: ["openFile"],
    });

    if (result) {
      setSettings((prev) => ({ ...prev, javaPath: result }));
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Configuracion">
        <div className={styles.container}>
          <div className={styles.field}>
            <label>Ejecutable de Java:</label>
            <div className={styles.inputContainer}>
              <input
                type="text"
                name="javaPath"
                value={settings.javaPath}
                onChange={handleChange}
                className={styles.input}
              />
              <button
                onClick={handleBrowseJava}
                className={styles.browseButton}
              >
                Buscar
              </button>
            </div>
          </div>
          <div className={styles.field}>
            <label>Directorio del juego:</label>
            <input
              type="text"
              name="gamePath"
              value={settings.gamePath}
              onChange={handleChange}
              placeholder={"<Directorio predeterminado>"}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>Memoria Máxima: {settings.memoryMax}G</label>
            <input
              type="range"
              name="memoryMax"
              min="2"
              max="16"
              step="1"
              value={settings.memoryMax}
              onChange={handleSliderChange}
              className={styles.slider}
            />
          </div>
          <div className={styles.field}>
            <label>Memoria Mínima: {settings.memoryMin}G</label>
            <input
              type="range"
              name="memoryMin"
              min="2"
              max="16"
              step="1"
              value={settings.memoryMin}
              onChange={handleSliderChange}
              className={styles.slider}
            />
          </div>
          <div className={styles.buttonContainer}>
            <Button
              onClick={handleSave}
              text="Guardar"
              className={styles.button}
            />
          </div>
        </div>
      </Modal>

      {/* Modal de reinicio */}
      {showRestartModal && (
        <Modal
          isOpen={showRestartModal}
          onClose={() => setShowRestartModal(false)}
          title="Reinicio Requerido"
        >
          <div className={styles.restartModalContent}>
            <p>
              Cambiaste el directorio del juego. Reinicia el launcher para
              aplicar los cambios.
            </p>
            <Button
              onClick={() => window?.api?.exit()}
              text="Entendido"
              className={styles.button}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
