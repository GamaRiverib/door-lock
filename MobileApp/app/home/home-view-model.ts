import { Observable, EventData, PropertyChangeData } from "tns-core-modules/data/observable";

import { exitEvent, lowMemoryEvent, resumeEvent, /*suspendEvent, */
        ApplicationEventData, on as applicationOn } from "tns-core-modules/application";

import * as localStorage from "nativescript-localstorage";

import { Vibrate } from "nativescript-vibrate";

import { SelectedPageService } from "../shared/selected-page-service";

import { DoorService } from "~/shared/door-service";

import { Config } from "~/models/config";
import { DeviceService, Device } from "~/shared/device-service";
import { Door } from "~/models/door";

const ICONS: { [id: string]: string } = {
    doorOpen: String.fromCharCode(0xF52B),
    doorClosed: String.fromCharCode(0xF52A),
    lock: String.fromCharCode(0xF023),
    unlock: String.fromCharCode(0xF09C)
};

const KEYS = {
    doorName: 'doorName',
    buttonEnabled: 'buttonEnabled',
    isLoading: 'isLoading',
    isOnline: 'isOnline',
    statusText: 'statusText',
    statusIcon: 'statusIcon',
    buttonIcon: 'buttonIcon',
    selectedDoorIndex: 'selectedDoorIndex'
};

const MESSAGES: { [id: string]: string } = {
    doorOpen: 'OPEN',
    doorClosed: 'CLOSED',
    online: 'ONLINE',
    offline: 'OFFLINE'
};

const deviceService: DeviceService = DeviceService.getInstance();

const doorService: DoorService = DoorService.getInstance();

const LOCAL_STORAGE_SELECTED_DOOR_INDEX: string = "selected";

export class HomeViewModel extends Observable {

    private _intervalId: number;
    private _saveIntervalId: number;
    private _failedCount: number;
    private _door: Door | null = null;
    private _config: Config | null;

    private _doorOpened: boolean | null = null;
    private _vibrator: Vibrate;

    constructor() {
        super();

        SelectedPageService.getInstance().updateSelectedPage('Home');

        let doorIndex: number = parseInt(localStorage.getItem(LOCAL_STORAGE_SELECTED_DOOR_INDEX) || "-1");
        this.set(KEYS.selectedDoorIndex, doorIndex);
        if(doorIndex < 0 && doorService.doors.length > 0) {
            doorIndex = 0;
            localStorage.setItem(LOCAL_STORAGE_SELECTED_DOOR_INDEX, doorIndex.toString());
            this.set(KEYS.selectedDoorIndex, doorIndex);
        }

        this.on(Observable.propertyChangeEvent, this.onPropertyChangeHandler.bind(this));

        if(doorIndex >= 0 && doorIndex < doorService.doors.length) {
            this.select(doorService.doors.getItem(doorIndex));
        }

        this._vibrator = new Vibrate();

        //applicationOn(suspendEvent, this.suspendEventHandler.bind(this));
        applicationOn(resumeEvent, this.resumeEventHandler.bind(this));
        applicationOn(exitEvent, this.exitEventHandler.bind(this));
        applicationOn(lowMemoryEvent, this.lowMemoryEventHandler.bind(this));
    }

    set doorOpened(val: boolean) {
        let last: boolean = this._doorOpened;
        this._doorOpened = val;
        if(val && last != val) {
            this._vibrator.vibrate([300, 500]);
        }
    }

    get doorOpened(): boolean {
        return this._doorOpened;
    }

    previous(): void {
        if(doorService.doors.length > 0) {
            let doorIndex: number = this.get(KEYS.selectedDoorIndex);
            if(doorIndex == 0) {
                doorIndex = doorService.doors.length - 1;
            } else {
                doorIndex -= 1;
            }
            this.set(KEYS.selectedDoorIndex, doorIndex);
            this.select(doorService.doors.getItem(doorIndex));
        }
    }

    next(): void {
        if(doorService.doors.length > 0) {
            let doorIndex: number = this.get(KEYS.selectedDoorIndex);
            if(doorIndex >= doorService.doors.length) {
                doorIndex = 0;
            } else {
                doorIndex += 1;
            }
            this.set(KEYS.selectedDoorIndex, doorIndex);
            this.select(doorService.doors.getItem(doorIndex));
        }
    }

    select(door: Door): void {
        this._config = null;
        this._door = door;
        clearInterval(this._intervalId);

        this.set(KEYS.doorName, door.name);
        this.set(KEYS.buttonEnabled, false);
        this.set(KEYS.isLoading, true);

        this.load.call(this);
    }

    onButtonTap(args: EventData) {
        // const button = <Button>args.object;
        this.set(KEYS.buttonEnabled, false);
        if(this._config) {
            let device: Device = this.getDevice();
            let relayPin: number = this._config.relayPin;
            device.writeGpio(relayPin, 0);
            setTimeout(() => {
                device.writeGpio(relayPin, 1);
                this.set(KEYS.buttonEnabled, true);
            }, 500);
        } else {
            this.load.call(this);
        }
    }

    getSelectedDoor(): Door | null {
        return this._door;
    }

    private onPropertyChangeHandler(data: PropertyChangeData) {
        if(data.propertyName === KEYS.selectedDoorIndex) {
            clearInterval(this._saveIntervalId);
            this._saveIntervalId = setInterval(() => {
                let doorIndex: number = this.get(KEYS.selectedDoorIndex);
                localStorage.setItem(LOCAL_STORAGE_SELECTED_DOOR_INDEX, doorIndex.toString());
            }, 5000);
        }
    }

    private handleFailed(reason: any) {
        console.log(reason);
        this._failedCount++;
        if(this._failedCount > 5) {
            this.set(KEYS.isOnline, MESSAGES.offline);
        }
    }

    private getDevice(): Device | null {
        if(this._door) {
            return deviceService.device(this._door.host);
        }
        return null;
    }

    private load(): void {
        let device: Device | null = this.getDevice();
        if(device) {
            device.getConfig(true)
                .then((config: Config) => {
                    this._config = config;
                    this.set(KEYS.isOnline, MESSAGES.online);
                    let magneticPin = this._config.magneticPin;
                    device.readGpio(magneticPin)
                        .then(this.updateDoorState.bind(this))
                        .catch(this.handleFailed.bind(this));
                    this.start();
                })
                .catch((reason: any) => {
                    console.log(reason);
                    // TODO alert
            });
        }
    }

    private updateDoorState(val: number) {
        this.doorOpened = val ? false : true;
        let statusText: string = val ? MESSAGES.doorClosed : MESSAGES.doorOpen;
        let statusIcon: string = val ? ICONS.doorClosed : ICONS.doorOpen;
        let buttonIcon: string = val ? ICONS.lock : ICONS.unlock;
        this.set(KEYS.statusText, statusText);
        this.set(KEYS.statusIcon, statusIcon);
        this.set(KEYS.buttonIcon, buttonIcon);
        this.set(KEYS.isOnline, MESSAGES.online);
        this._failedCount = 0;
    }

    private start(): void {
        this.set(KEYS.buttonEnabled, true);
        this.set(KEYS.isLoading, false);
        if(this._config) {
            let magneticPin = this._config.magneticPin;
            if(!this._intervalId && magneticPin) {
                this._intervalId = setInterval(() => {
                    let device: Device | null = this.getDevice();
                    if(device) {
                        device.readGpio(magneticPin)
                            .then(this.updateDoorState.bind(this))
                            .catch(this.handleFailed.bind(this));
                    } else {
                        clearInterval(this._intervalId);
                        this.load.call(this);
                    }
                }, 2000);
            }
        } else {
            this.load.call(this);
        }
    }

    private resumeEventHandler(args: ApplicationEventData): void {
        console.log('resumeEventHandler');
        this.start();
    }

    /*private suspendEventHandler(args: ApplicationEventData): void {
        console.log('suspendEventHandler');
        clearInterval(this._intervalId);
    }*/

    private exitEventHandler(args: ApplicationEventData): void {
        console.log('exitEventHandler')
        clearInterval(this._intervalId);
    }

    private lowMemoryEventHandler(args: ApplicationEventData): void {
        console.log('lowMemoryEventHandler');
        clearInterval(this._intervalId);
    };
}
