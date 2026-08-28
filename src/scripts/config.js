const CONFIG = {
  BASE_URL: import.meta.env.VITE_APP_URL,
  API_URL: import.meta.env.VITE_API_ENDPOINT,
  MAP_API_KEY: import.meta.env.VITE_MAP_SERVICE_API_KEY,
  PUSH_MSG_VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BCC4vbzBGxofqZYGbIlSUi-zd1jdYnt6KVDLfnvmHsCQjtc63jIgeK7A5SifreEgKxk_0y0GWi_W83a0nA3-Gr0',
};

export default CONFIG;

