import { Observable, PropertyChangeData, EventData } from "tns-core-modules/data/observable";
import { ViewBase, Page } from "tns-core-modules/ui/page/page";
import { alert, AlertOptions, confirm, ConfirmOptions } from "tns-core-modules/ui/dialogs/dialogs";

import { Door } from "~/models/door";
import { DoorService } from "~/shared/door-service";
import { Device, DeviceService } from "~/shared/device-service";
import { Config } from "~/models/config";

const doorService: DoorService = DoorService.getInstance();
const deviceService: DeviceService = DeviceService.getInstance();

const KEYS = {
    name: 'name',
    ssid: 'ssid',
    pass: 'pass',
    relayPin: 'relayPin',
    magneticPin: 'magneticPin',
    buttonPin: 'buttonPin',
    host: 'host',
    dirty: 'dirty',
    removable: 'removable',
    title: 'title',
    showConfig: 'showConfig',
    isLoading: 'isLoading'
};

const MESSAGES = {
    newItem: 'New',
    editItem: 'Edit',
    confirmCancel: {
        title: 'Cancel changes',
        message: 'Changes will not be saved, are you sure?',
        okButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        neutralButtonText: 'Save'
    },
    confirmDelete: {
        title: 'Delete door',
        message: 'Are you sure?',
        okButtonText: 'Ok',
        cancelButtonText: 'Cancel'
    },
    alertFailLoadConfig: {
        title: "Load config",
        message: "Failed to get the configuration",
        okButtonText: "Ok",
        cancelable: true
    },
    alertFailSaveConfig: {
        title: "Save config",
        message: "Failed to save the configuration",
        okButtonText: "Ok",
        cancelable: true
    }
};

export class DoorViewModel extends Observable {

    private _door?: Door;
    private _config?: Config;
    private _position?: number;

    constructor(position?: number) {
        super();
        this._position = position;
        if (this.isValidPosition()) {
            this._door = doorService.doors.getItem(position);
        } else {
            this._door = new Door();
        }
        this.set(KEYS.name, this._door.name);
        this.set(KEYS.host, this._door.host);
        this.setTitle(position);
        this.set(KEYS.dirty, false);
        this.set(KEYS.isLoading, false);
        this.set(KEYS.showConfig, 'collapsed');
        this.on(Observable.propertyChangeEvent, this.onPropertyChangeHandler.bind(this));
        this.loadConfig();
    }

    onButtonSaveTap(args: EventData) {
        const view: ViewBase = <ViewBase>args.object;
        const page: Page = view.page;
        this.set(KEYS.isLoading, true);
        this.saveDeviceConfig()
            .then(() => {
                this.set(KEYS.isLoading, false);
                page.closeModal(true);
            }).catch((reason: any) => {
                console.log(reason);
                this.set(KEYS.isLoading, false);
                this.handleFailSaveConfig(reason);
        });
        this._door.name = this.get(KEYS.name);
        this._door.host = this.get(KEYS.host);
        if(!this.isValidPosition()) {
            doorService.doors.push(this._door);
        }
        doorService.save();
    }

    onButtonConnectTap(args: EventData) {
        this.loadConfig();
        if(this.get(KEYS.host) !== this._door.host) {
            this.set(KEYS.dirty, true);
        }
    }
    
    onButtonBackTap(args: EventData) {
        const view: ViewBase = <ViewBase>args.object;
        const page: Page = view.page;
        let dirty: boolean = this.get(KEYS.dirty);
        if(dirty) {
            const confirmOpts: ConfirmOptions = MESSAGES.confirmCancel;
            confirm(confirmOpts)
                .then((response?: boolean) => {
                    if(response) {
                        page.closeModal(false);
                    } else if(response === undefined) {
                        console.log('Save changes');
                        this.set(KEYS.isLoading, true);
                        this.saveDeviceConfig()
                            .then(() => {
                                this.set(KEYS.isLoading, false);
                                page.closeModal(true);
                            }).catch((reason: any) => {
                                console.log(reason);
                                this.set(KEYS.isLoading, false);
                                this.handleFailSaveConfig(reason);
                        }); 
                        this._door.name = this.get(KEYS.name);
                        this._door.host = this.get(KEYS.host);
                        doorService.save();                          
                    }
                }).catch((reason: any) => {
                    console.log(reason);
            });
        } else {
            page.closeModal(false);
        }
    }
    
    onButtonDeleteTap(args: EventData) {
        const view: ViewBase = <ViewBase>args.object;
        const page: Page = view.page;
        if(this.isValidPosition()) {
            const confirmOpts: ConfirmOptions = MESSAGES.confirmDelete;
            confirm(confirmOpts)
                .then((response: boolean) => {
                    if(response) {
                        console.log('delete item');
                        doorService.doors.splice(this._position, 1);
                        doorService.save();
                        page.closeModal(true);
                    }
                }).catch((reason: any) => {
                    console.log(reason);
            });
        }
    }

    private handleFailLoadConfig(reason: any) {
        const alertOptions: AlertOptions = MESSAGES.alertFailLoadConfig;
        alert(alertOptions).then(() => {});
    }

    private handleFailSaveConfig(reason: any) {
        const alertOptions: AlertOptions = MESSAGES.alertFailSaveConfig;
        alert(alertOptions).then(() => {});
    }

    private isValidPosition(): boolean {
        return this._position !== null && this._position !== undefined && this._position >= 0 && this._position < doorService.doors.length;
    }

    private onPropertyChangeHandler(data: PropertyChangeData) {
        let dirty: boolean = false;
        if(this._config) {
            let c: Config = this._config;
            if(this.get(KEYS.name) !== c.name) {
                dirty = true;
            }
            if(this.get(KEYS.ssid) !== c.ssid) {
                dirty = true;
            }
            if(this.get(KEYS.pass) !== c.pass) {
                dirty = true;
            }
            if(this.get(KEYS.buttonPin) !== c.buttonPin) {
                dirty = true;
            }
            if(this.get(KEYS.relayPin) !== c.relayPin) {
                dirty = true; 
            }
            if(this.get(KEYS.magneticPin) !== c.magneticPin) {
                dirty = true;
            }
        }
        if(this._door) {
            if(this.get(KEYS.host) !== this._door.host) {
                dirty = true;
            }
        }
        this.set(KEYS.dirty, dirty);
    }

    private setTitle(position?: number): void {
        if(position !== null && position !== undefined && position >= 0) {
            this.set(KEYS.title, MESSAGES.editItem);
            this.set(KEYS.removable, 'visible');
        } else {
            this.set(KEYS.title, MESSAGES.newItem);
            this.set(KEYS.removable, 'collapsed');
        }
    }

    private loadConfig(): Promise<void> {
        let host: string = this.get(KEYS.host);
        if(host === null || host === undefined || host === '') {
            return Promise.reject({ error: 'host is empty' });
        }
        return new Promise<void>((resolve, reject) => {
            let device: Device = deviceService.device(this.get(KEYS.host));
            this.set(KEYS.isLoading, true);
            device.getConfig(true)
                .then((cfg: Config) => {
                    this._config = cfg;
                    this.set(KEYS.name, cfg.name);
                    this.set(KEYS.ssid, cfg.ssid);
                    this.set(KEYS.pass, cfg.pass);
                    this.set(KEYS.buttonPin, cfg.buttonPin);
                    this.set(KEYS.relayPin, cfg.relayPin);
                    this.set(KEYS.magneticPin, cfg.magneticPin);
                    this.set(KEYS.showConfig, 'visible');
                    this.set(KEYS.isLoading, false);
                    resolve();
                }).catch((reason: any) => {
                    this.set(KEYS.showConfig, 'collapsed');
                    this.set(KEYS.isLoading, false);
                    this.handleFailLoadConfig(reason);
                    reject(reason);
            });
        });
    }

    private saveDeviceConfig(): Promise<void> {
        this.set(KEYS.isLoading, true);
        let device: Device = deviceService.device(this.get(KEYS.host));
        let config: any = {
            device: {
                id: this.get(KEYS.name)   
            },
            wifi: {
                ssid: this.get(KEYS.ssid),
                pass: this.get(KEYS.pass)
            },
            pinout: {
                relay: parseInt(this.get(KEYS.relayPin)),
                magnetic: parseInt(this.get(KEYS.magneticPin)),
                button: parseInt(this.get(KEYS.buttonPin))
            }
        };
        device.setConfig(config);
        return device.saveConfig(true);
    }
}