import { mDevice } from './lib/mdevice';
import { MicroFrwk } from './lib/microFrwk';
import { MainView } from './views/Main';

const server = "http://192.168.1.222/rpc";

document.addEventListener("DOMContentLoaded", () => {
    window.device = new mDevice(server);
    window.app = new MicroFrwk("#app");
    window.app.add("", MainView);

    let hash = window.location.hash;
    window.location.hash = "";
    window.router.check();
    window.router.navigateTo(hash || "#home");
});