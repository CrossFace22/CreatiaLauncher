import { YoutubeIcon } from "../icons/social/YoutubeIcon";
import { TwitterIcon } from "../icons/social/TwitterIcon";
import React from "react";
import Button from "../button/Button";
import styles from "./SocialMediaButtons.module.css";

export default function SocialMediaButtons() {
  return (
    <div className={styles.socialMedia}>
      <Button
        onClick={() =>
          window?.api?.openExternal("https://www.youtube.com/@CrossFace22")
        }
        icon={<YoutubeIcon color="#000" width="40px" />}
      ></Button>
      <Button
        onClick={() => window?.api?.openExternal("https://x.com/CreatiaSMP")}
        icon={<TwitterIcon color="#000" width="40px" />}
      ></Button>
    </div>
  );
}
