import { Observable } from "tns-core-modules/data/observable";

import { SelectedPageService } from "../shared/selected-page-service";

export class AboutViewModel extends Observable {
    constructor() {
        super();

        SelectedPageService.getInstance().updateSelectedPage("About");
    }
}
