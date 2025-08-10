import React, { useEffect, useState } from "react";
import styles from "./Account.module.css";

export default function Account() {
  const [accountData, setAccountData] = useState({
    name: "Iniciar sesion",
    uuid: "6d959fcc-e0ca-44ff-8d49-f4a2ae9f8de8",
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    getAccountData();
  }, []);

  const getAccountData = async () => {
    const data = await window?.api?.getAccountData();

    if (data) {
      setAccountData({
        name: data.profile.name,
        uuid: data.profile.id,
      });
    }
  };

  const logout = async (e: any) => {
    e.preventDefault();
    await window?.api?.logout();

    setAccountData({
      name: "Iniciar sesion",
      uuid: "6d959fcc-e0ca-44ff-8d49-f4a2ae9f8de8",
    });
  };

  const login = async () => {
    const data = await window?.api?.login();

    if (data) {
      setAccountData({
        name: data.profile.name,
        uuid: data.profile.id,
      });
    }
  };

  // @ts-ignore
  const AVATAR_URL = import.meta.env.VITE_AVATAR_URL + accountData?.uuid;

  return (
    <div
      className={styles.container}
      onClick={() => {
        if (accountData.name === "Iniciar sesion") {
          return login();
        }

        setDropdownOpen(!dropdownOpen);
      }}
    >
      <div className={styles.account}>
        <p className={styles.name}>{accountData.name}</p>
        <div className={styles.avatar}>
          <img src={AVATAR_URL} alt="" className={styles.img} />
        </div>
      </div>
      {dropdownOpen && (
        <div
          className={`${styles.dropdown} ${dropdownOpen ? styles.open : ""}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className={styles.dropdownContent}>
            <div className={styles.dropdownItem} onClick={logout}>
              <p className={styles.dropdownText}>Cerrar sesion</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
