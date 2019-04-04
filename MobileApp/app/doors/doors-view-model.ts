import { Observable } from "tns-core-modules/data/observable";

import { SelectedPageService } from "../shared/selected-page-service";

export class DoorsViewModel extends Observable {
    constructor() {
        super();

        SelectedPageService.getInstance().updateSelectedPage("Doors");
    }
}
