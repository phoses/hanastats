import 'primeicons/primeicons.css'
import 'primevue/resources/themes/md-dark-indigo/theme.css';
import 'primeflex/primeflex.css';
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import { initializeApp } from "firebase/app";

import App from './App.vue'
import router from './router'
import { firebaseConfig } from './auth/firebaseconfig';

const app = createApp(App)
initializeApp(firebaseConfig);

app.use(createPinia())
app.use(router)
app.use(PrimeVue);


app.mount('#app')
