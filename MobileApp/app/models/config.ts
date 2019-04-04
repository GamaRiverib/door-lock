export class Config {

    public name: string;

    public relayPin: number;
    public magneticPin: number;
    public buttonPin: number;

    public ssid: string;
    public pass: string;

    private _updated: number;

    constructor(config?: any) {
        this.set(config);
        this._updated = Date.now();
    }

    set(config?: any): void {
        if (config) {
            if(config.pinout) {
                this.relayPin = config.pinout.relay;
                this.magneticPin = config.pinout.magnetic;
                this.buttonPin = config.pinout.button;
            }
            if(config.wifi && config.wifi.sta) {
                this.ssid = config.wifi.sta.ssid;
                this.pass = config.wifi.sta.pass;
            }
            if(config.device) {
                this.name = config.device.id;
            }
        }
    }

    needUpdate(): boolean {
        return (Date.now() - this._updated > 86400000);
    }

    getJson(): object {
        return {
            device: {
                id: this.name
            },
            wifi: {
                sta: {
                    ssid: this.ssid,
                    pass: this.pass
                }
            },
            pinout: {
                relay: this.relayPin,
                magnetic: this.magneticPin,
                button: this.buttonPin
            }
        };
    }

}