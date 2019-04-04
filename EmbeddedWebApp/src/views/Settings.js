import { BaseComponent } from '../lib/microFrwk';

var settingsViewInstance = null;

export function SettingsView() {
	
	if(settingsViewInstance !== null) {
		return settingsViewInstance;
	}

    function template() {
        return /*html*/`
            <form>
                <h2>Device</h2>
                <hr/>
                <label for="deviceId">ID</label>
                <input type="text" id="deviceId" minlength="1" maxlength="50" m-v="deviceId" />
                <label for="buttonPin">Button PIN</label>
                <input type="number" id="buttonPin" min="0" max="16" m-v="buttonPin" />
                <label for="relayPin">Relay PIN</label>
                <input type="number" id="relayPin" min="0" max="16" m-v="relayPin" />
                <label for="magneticPin">Magnetic PIN</label>
                <input type="number" id="magneticPin" min="0" max="16" m-v="magneticPin" />
                <h2>WiFi</h2>
                <hr />
                <label for="ssid">SSID</label>
                <input type="text" id="ssid" minlength="1" maxlength="100" m-v="ssid" />
                <label for="pass">Password</label>
                <input type="password" id="pass" maxlength="50" m-v="pass" />

                <button>Save</button>
            </form>
        `;
    }

    BaseComponent.call(this, template);

    var _actions, _btnSave, _changes = [], _originalConfig = {};

    function init() {

        getConfig.call(this);

        this.render();

        let inputs = this.el.querySelectorAll('input');
        inputs.forEach(inputEl => inputEl.addEventListener('keyup', validateChange.bind(this)));

        _btnSave = this.el.querySelector('button');
        _btnSave.setAttribute('disabled', true);
        _btnSave.onclick = save.bind(this);

        return this;
    }

    function getConfig() {
        window.device.getConfig()
            .then((res) => {
                if(res) {
                    if(res.device) {
                        this.deviceId = res.device.id;
                        _originalConfig.deviceId = res.device.id;
                    }
                    if(res.pinout) {
                        this.buttonPin = res.pinout.button;
                        this.relayPin = res.pinout.relay;
                        this.magneticPin = res.pinout.magnetic;
                        _originalConfig.buttonPin = res.pinout.button;
                        _originalConfig.relayPin = res.pinout.relay;
                        _originalConfig.magneticPin = res.pinout.magnetic;
                    }
                    if(res.wifi && res.wifi.sta) {
                        this.ssid = res.wifi.sta.ssid;
                        this.pass = res.wifi.sta.pass;

                        _originalConfig.ssid = res.wifi.sta.ssid;
                        _originalConfig.pass = res.wifi.sta.pass;
                    }
                }
            })
            .catch((e) => console.log(e));
    }

    function validateChange(ev) {
        let v = ev.target.value;
        let i = ev.target.id;
        if(_originalConfig[i] == v) {
            let j = _changes.indexOf(i);
            if(j >= 0) {
                _changes.splice(j, 1);
            }
        } else {
            _changes.push(i);
        }

        if(_changes.length > 0) {
            _btnSave.removeAttribute('disabled');
        } else {
            _btnSave.setAttribute('disabled', true);
        }
    }

    function save(ev) {
        ev.preventDefault();
        _btnSave.setAttribute('disabled', true);
        let data = {};
        _changes.forEach(k => {
            if(k == 'deviceId') {
                if(!data.device) {
                    data.device = {};
                }
                data.device.id = this.deviceId;
            }
            if(k == 'buttonPin') {
                if(!data.pinout) {
                    data.pinout = {};
                }
                data.pinout.button = parseInt(this.buttonPin);
            }
            if(k == 'relayPin') {
                if(!data.pinout) {
                    data.pinout = {};
                }
                data.pinout.relay = parseInt(this.relayPin);
            }
            if(k == 'magneticPin') {
                if(!data.pinout) {
                    data.pinout = {};
                }
                data.pinout.magnetic = parseInt(this.magneticPin);
            }
            if(k == 'ssid') {
                if(!data.wifi) {
                    data.wifi = {};
                }
                if(!data.wifi.sta) {
                    data.wifi.sta = {};
                }
                data.wifi.sta.ssid = this.ssid;
            }
            if(k == 'pass') {
                if(!data.wifi) {
                    data.wifi = {};
                }
                if(!data.wifi.sta) {
                    data.wifi.sta = {};
                }
                data.wifi.sta.pass = this.pass;
            }
        });
        window.device.saveConfig(data);
        setTimeout(() => location.reload(), 3000);
    };

    Object.defineProperty(this, "selector", {
        enumerable: true,
        writable: false,
        value: "settings-view"
    });

    Object.defineProperty(this, "actions", {
        enumerable: true,
        get: () => _actions,
        set: undefined
    });

    settingsViewInstance = init.call(this);

	return settingsViewInstance;
}