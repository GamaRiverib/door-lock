class RpcMgr {
    
    constructor(server) {
        this.server = server;
    }

    request(url, method, data) {
        let m = method || "GET";
        return new Promise((resolve, reject) => {
            let xhttp = new XMLHttpRequest();
            xhttp.open(m, url, true);
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status >= 200 && this.status < 400) {
                        return resolve(JSON.parse(this.response));
                    }
                    reject({ status: this.status });
                }
            };
            function errorHandler(err) {
                reject(err);
            }
            xhttp.ontimeout = errorHandler;
            xhttp.onerror = errorHandler;
            xhttp.send(data || "");
        });
    }

    rpc(procedure, data) {
        let url = `${this.server}/${procedure}`;
        if (data) {
            return this.request(url, "POST", data);
        }
        return this.request(url);
    }
}

export class mDevice {

    constructor(server) {
        this.rpcMgr = new RpcMgr(server);
    }

    isConnected() {
        return this.rpcMgr.rpc("RPC.Ping");
    }

    sysInfo() {
        return this.rpcMgr.rpc("Sys.GetInfo");
    }

    reboot() {
        return this.rpcMgr.rpc("Sys.Reboot");
    }

    getConfig() {
        return this.rpcMgr.rpc("Config.Get");
    }

    saveConfig(data, reboot) {
        return new Promise((resolve, reject) => {
            let d = JSON.stringify({ config: data });
            this.rpcMgr.rpc("Config.Set", d).then(() => {
                let r = JSON.stringify({"reboot": reboot || true});
                return this.rpcMgr.rpc("Config.Save", r).then(resolve).catch(reject);
            }).catch(reject);
        });
    }

    readGpio(pin) {
        return this.rpcMgr.rpc("GPIO.Read", JSON.stringify({ pin: pin }));
    }
	
	writeGpio(pin, val) {
		return this.rpcMgr.rpc("GPIO.Write", JSON.stringify({ pin: pin, value: val }));
	}
}
