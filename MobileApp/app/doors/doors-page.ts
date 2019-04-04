import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page, ShownModallyData, ShowModalOptions, ViewBase } from "tns-core-modules/ui/page";
import { Button } from "tns-core-modules/ui/button";
import { ItemEventData } from "tns-core-modules/ui/list-view";
import { Frame, NavigationEntry } from "tns-core-modules/ui/frame/frame";

import { DoorsViewModel } from "./doors-view-model";
import { DoorService } from "~/shared/door-service";

const vm: DoorsViewModel = new DoorsViewModel();
const doorService: DoorService = DoorService.getInstance();

let editing: boolean = false;

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = vm;
    vm.set('doors', doorService.doors);
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onAddButtonTap(args: EventData) {
    const button = <Button>args.object;
    const page: Page = button.page;
    const modalFrame: Frame = new Frame();

    modalFrame.once('shownModally', (args: ShownModallyData) => {
        const entry: NavigationEntry = {
            moduleName: 'doors/door-details-page',
            context: args.context
        };
        modalFrame.navigate(entry);
    });

    const modalOpts: ShowModalOptions = {
        fullscreen: true,
        context: { position: null },
        closeCallback: onItemEditDone
    };
    page.showModal(modalFrame, modalOpts);
}

export function onItemTap(args: ItemEventData) {
    if(!editing) {
        const position: number = args.index;
        const view: ViewBase = <ViewBase>args.object;
        const modalFrame: Frame = new Frame();

        modalFrame.once('shownModally', (args: ShownModallyData) => {
            const entry: NavigationEntry = {
                moduleName: 'doors/door-details-page',
                context: args.context
            };
            modalFrame.navigate(entry);
        });

        const modalOpts: ShowModalOptions = {
            fullscreen: true,
            context: { position: position },
            closeCallback: onItemEditDone
        };
        view.page.showModal(modalFrame, modalOpts);

        editing = true;
        setTimeout(() => editing = false, 500);
    }
}

function onItemEditDone(changes: boolean) {
    if(changes) {
        console.log('Door list change');
    }
}
