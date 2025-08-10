import styles from "./Button.module.css";
import React from "react";

export default function Button({
  text,
  onClick,
  icon,
  className,
}: {
  text?: string;
  onClick?: () => void;
  icon?: JSX.Element;
  className?: string;
}) {
  return (
    <button
      className={`${styles.button} ${
        icon ? styles.buttonIcon : ""
      } ${className}`}
      onClick={onClick}
    >
      <div>{icon}</div>
      <p>{text}</p>
    </button>
  );
}
