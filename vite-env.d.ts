/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GLOB_APP_CLIENT_ID?: string;
  readonly VITE_GLOB_RSA_PUBLIC_KEY?: string;
  readonly VITE_GLOB_RSA_PRIVATE_KEY?: string;
  readonly VITE_GLOB_SSE_ENABLE?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_APP_CHECK_UPDATES_INTERVAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

