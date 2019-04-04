import { Page, NavigatedData, EventData } from "tns-core-modules/ui/page";
import { TextField } from "tns-core-modules/ui/text-field";

import { DoorViewModel } from "./door-view-model";

export function onNavigatingTo(args: NavigatedData) {
    const context: { position: number | null } = args.context;
    const page: Page = <Page>args.object;
    page.bindingContext = new DoorViewModel(context.position);
}

export function onNavigatingFrom(args: NavigatedData) {
    console.log('onNavigatingFrom');
    console.log(args);
}

export function onLoaded(args: EventData) {
    const page = args.object as Page;
    const txtHost: TextField = page.getViewById('txtHost');
    txtHost.focus();
}