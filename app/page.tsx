"use client";

import { useState } from "react";
import Script from "next/script";

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;
const META_CONFIG_ID = process.env.NEXT_PUBLIC_META_CONFIG_ID;

declare global {
  interface Window {
    FB: any;
  }
}

export default function Home() {
  const [sdkReady, setSdkReady] = useState(false);

  const initFacebook = () => {
    if (!window.FB) {
      console.error("FB SDK não encontrado");
      return;
    }

    console.log("Inicializando Facebook SDK...");

    window.FB.init({
      appId: META_APP_ID,
      autoLogAppEvents: true,
      xfbml: false,
      version: "v21.0",
    });

    console.log("Facebook SDK inicializado");
    setSdkReady(true);
  };

  const launchWhatsAppSignup = () => {
    if (!sdkReady) {
      console.error("Facebook SDK não carregou ainda.");
      return;
    }

    console.log("Abrindo popup de login da Meta...");

    window.FB.login(
      (response: any) => {
        console.log("Resposta completa do Facebook:", response);

        if (!response) {
          console.error("Nenhuma resposta retornada");
          return;
        }

        if (response.authResponse) {
          console.log("authResponse:", response.authResponse);

          const code = response.authResponse.code;

          console.log("Authorization Code recebido:", code);

          if (!code) {
            console.warn("AuthResponse recebido mas sem code");
            return;
          }

          processSignupResponse(code);
        } else {
          console.warn("Usuário cancelou login ou não houve authResponse");
        }
      },
      {
        config_id: META_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
      }
    );
  };

  const processSignupResponse = async (code: string) => {
    try {
      console.log("Enviando code para backend:", code);

      const response = await fetch("/api/whatsapp-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      console.log("Resposta do backend:", data);
    } catch (err) {
      console.error("Erro ao enviar código:", err);
    }
  };

  return (
    <>
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        onLoad={initFacebook}
      />

      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-6 bg-white dark:bg-black p-12 rounded-xl shadow">

          <h1 className="text-3xl font-semibold text-black dark:text-white">
            Conectar WhatsApp Business
          </h1>

          <button
            onClick={launchWhatsAppSignup}
            disabled={!sdkReady}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {sdkReady ? "Conectar WhatsApp" : "Carregando SDK..."}
          </button>

        </div>
      </div>
    </>
  );
}