import styles from "./auth.module.scss";
import { IconButton } from "./button";

import { useNavigate, useLocation } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";

import BotIcon from "../icons/bot.svg";
import { useEffect, useState } from "react";
import { getClientConfig } from "../config/client";
import { ClientApi } from "../client/api";
import { showToast } from "../components/ui-lib";

export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const accessStore = useAccessStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const goHome = () => {
    navigate(Path.Chat)
  };
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
  const goQYChat = async () => {
    const api: ClientApi = new ClientApi();
    const result = await api.loginRedirectUrl();

    if (result.code) {
      window.location.href = result.url;
    }
  };
  const loginQY = async (code: string) => {
    const api: ClientApi = new ClientApi();
    const result = await api.loginQYChat(code);

    if (result.code) {
      accessStore.update((access) => {
        access.accessCode = result.token;
      });
      window.location.href = '/';
      showToast(Locale.Auth.Success);
    } else {
      window.location.href = '/#/auth';
      showToast(Locale.Auth.Error);
    }
  }
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

    const ps = window.location.href.split('?');
    if (ps.length > 1) {
      const searchParams = new URLSearchParams(ps[1]);

      const codeParam = searchParams.get('code') || '';
      loginQY(codeParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

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
      </div>

      <div className={styles["auth-other"]}>
        <IconButton
          text={Locale.Auth.ConfirmQYWechat}
          type="qywechat"
          onClick={async () => {await goQYChat()}}
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
