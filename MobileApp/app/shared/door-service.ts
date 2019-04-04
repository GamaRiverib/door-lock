
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import * as localStorage from "nativescript-localstorage";
import { Door } from "~/models/door";

let _instance: DoorService = null;

const LOCAL_STORAGE_DOORS_KEY: string = "doors";

export class DoorService {

    private _doors: ObservableArray<Door>;

    private constructor() {
        this._doors = new ObservableArray<Door>();
        let doors = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DOORS_KEY));
        if(!doors) {
            doors = new Array<Door>();
        }
        this._doors.push(doors);
    }

    static getInstance(): DoorService {
        if(_instance === null) {
            _instance = new DoorService();
        }
        return _instance;
    }

    get doors(): ObservableArray<Door> {
        return this._doors;
    }

    save(): void {
        localStorage.setItem(LOCAL_STORAGE_DOORS_KEY, JSON.stringify(this._doors.concat([])));
    }
}