import styles from "./auth.module.scss";
import { IconButton } from "./button";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";

import BotIcon from "../icons/bot.svg";
import { useEffect, useState } from "react";
import { getClientConfig } from "../config/client";
import { ClientApi } from "../client/api";
import { showToast } from "../components/ui-lib";

export function AuthPage() {
  const navigate = useNavigate();
  const accessStore = useAccessStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const goHome = () => navigate(Path.Home);
  const goChat = async () => {
    const api: ClientApi = new ClientApi();
    const result = await api.login(username, password);

    if (result.code) {
      accessStore.update((access) => {
        access.accessCode = result.token;
      });
      navigate(Path.Chat)
    } else {
      showToast(Locale.Auth.Error);
    }
  };
  const resetAccessCode = () => {
    accessStore.update((access) => {
      access.openaiApiKey = "";
      access.accessCode = "";
    });
  }; // Reset access code to empty string

  useEffect(() => {
    if (getClientConfig()?.isApp) {
      navigate(Path.Settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles["auth-page"]}>
      <div className={`no-dark ${styles["auth-logo"]}`}>
        <BotIcon />
      </div>

      <div className={styles["auth-title"]}>{Locale.Auth.Title}</div>
      <div className={styles["auth-tips"]}>{Locale.Auth.Tips}</div>

      <input
        className={styles["auth-input"]}
        type="text"
        placeholder={Locale.Auth.Username}
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
        }}
      />
      <input
        className={styles["auth-input"]}
        type="password"
        placeholder={Locale.Auth.Password}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        onKeyDown={async (e) => {
          if (e.key === 'Enter') {
            await goChat();
          }
        }}
      />

      <div className={styles["auth-actions"]}>
        <IconButton
          text={Locale.Auth.Confirm}
          type="primary"
          onClick={async () => {await goChat()}}
        />
        <IconButton
          text={Locale.Auth.Later}
          onClick={() => {
            resetAccessCode();
            goHome();
          }}
        />
      </div>
    </div>
  );
}
