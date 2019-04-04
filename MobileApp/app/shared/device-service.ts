import { request, HttpRequestOptions, HttpResponse } from 'tns-core-modules/http';
import { Config } from '~/models/config';
// import { connectionType, getConnectionType, startMonitoring, stopMonitoring }from 'tns-core-modules/connectivity';

let _instance: DeviceService = null;

class RpcMgr {
    private _server: string;

    constructor(server: string) {
        this._server = `${server}/rpc`;
    }

    request(url: string, method: 'GET' | 'POST' | 'PUT' | 'DEL', data?: any): Promise<HttpResponse> {
        let opts: HttpRequestOptions = {
            url: url,
            method: method
        };
        if(data) {
            opts.headers = { 'Content-Type': 'application/json' };
            opts.content = typeof data === 'string' ? data : JSON.stringify(data);
        }
        return request(opts);
    }

    rpc(name: string, data?: any): Promise<HttpResponse> {
        let url: string = `${this._server}/${name}`;
        if(data) {
            return this.request(url, 'POST', data);
        }
        return this.request(url, 'GET');
    }
}

export interface SysInfo {
	device: {
		id: string,
		password: string
	}
	mqtt: {
		enable: boolean,
		server: string,
		client_id: string,
		user: string,
		pass: string
	},
	wifi: {
		sta: {
			enable: boolean,
			ssid: string,
			pass: string
		}
	},
	sntp: {
		enable: boolean,
		server: string,
		update_interval: number
	},
	pinout: {
        relay: number,
        magnetic: number,
        button: number
    }
}


export class Device {

    private _rpcMgr: RpcMgr;

    private _config: Config;

    constructor(server: string) {
        this._rpcMgr = new RpcMgr(server);
        this._config = new Config();
    }

    isConnected(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._rpcMgr.rpc('RPC.Ping')
                .then((response: HttpResponse) => {
                    if(response.statusCode >= 200 && response.statusCode < 300) {
                        return resolve(true);
                    }
                    return resolve(false);
                }).catch(reject);
        });
    }

    sysInfo(): Promise<SysInfo> {
        return new Promise<SysInfo>((resolve, reject) => {
            this._rpcMgr.rpc('Sys.GetInfo')
                .then((response: HttpResponse) => {
                    let sysInfo: SysInfo = response.content.toJSON() as SysInfo;
                    resolve(sysInfo);
                }).catch(reject);
        });
    }

    reboot(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._rpcMgr.rpc('Sys.Reboot')
                .then((response: HttpResponse) => {
                    if(response.statusCode >= 200 && response.statusCode < 300) {
                        return resolve(true);
                    }
                    return resolve(false);
                }).catch(reject);
        });
    }

    getConfig(force?: boolean): Promise<Config> {
        if(!this._config.needUpdate() && !force) {
            return Promise.resolve(this._config);
        }
        return new Promise<Config>((resolve, reject) => {
            this._rpcMgr.rpc('Config.Get')
                .then((response: HttpResponse) => {
                    let json: Config = response.content.toJSON() as Config;
                    this._config = new Config(json);
                    resolve(this._config);
                }).catch(reject);
        });
    }

    setConfig(json: Config): void {
        this._config.set(json);
    }

    saveConfig(reboot?: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            let json = this._config.getJson();
            let d = JSON.stringify({ config: json });
            console.log('data', d);
            this._rpcMgr.rpc('Config.Set', d)
                .then((response: HttpResponse) => {
                    let result: { saved: boolean } = response.content.toJSON();
                    if(result.saved) {
                        let r = JSON.stringify({ 'reboot': reboot ? true : false });
                        this._rpcMgr.rpc('Config.Save', r)
                            .then((res: HttpResponse) => {
                                let result: { saved: boolean } = res.content.toJSON();
                                if(result.saved) {
                                    this._config = new Config(json);
                                    resolve();
                                } else {
                                    // alert
                                    reject();
                                }
                            })
                            .catch(reject);
                    } else {
                        // alert
                        reject();
                    }
                }).catch(reject);
        });
    }

    readGpio(pin: number): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this._rpcMgr.rpc('GPIO.Read', JSON.stringify({ pin: pin }))
                .then((response: HttpResponse) => {
                    let r: { value: number } = response.content.toJSON();
                    resolve(r.value);
                }).catch(reject);

        });
    }
	
	writeGpio(pin: number, val: 0 | 1 | true | false): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._rpcMgr.rpc('GPIO.Write', JSON.stringify({ pin: pin, value: val }))
                .then(() => resolve()).catch(reject);
        });
	}
}

export class DeviceService {

    private _devices: { [host: string]: Device };

    private constructor() {
        this._devices = {};
    }

    static getInstance(): DeviceService {
        if(_instance === null) {
            _instance = new DeviceService();
        }
        return _instance;
    }

    private _getDevice(host: string): Device {
        if(!this._devices[host]) {
            this._devices[host] = new Device(host);
        }
        return this._devices[host];
    }

    device(host: string): Device {
        return this._getDevice(host);
    }

}