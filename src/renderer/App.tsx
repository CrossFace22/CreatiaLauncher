import React, { useState } from "react";
import Button from "./components/button/Button";
import BottomBar from "./components/bottom-bar/BottomBar";
import Home from "./components/sections/home/Home";
import styles from "./App.module.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className={styles.window}>
      <Home />
      <BottomBar></BottomBar>
    </div>
  );
}

export default App;
