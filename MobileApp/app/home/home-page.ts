import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page, ViewBase } from "tns-core-modules/ui/page";
import { alert, AlertOptions } from "tns-core-modules/ui/dialogs";

import { HomeViewModel } from "./home-view-model";
import { SwipeGestureEventData, SwipeDirection, GestureTypes } from "tns-core-modules/ui/gestures/gestures";

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    const vm: HomeViewModel = new HomeViewModel();
    page.bindingContext = vm;
    page.layoutView.on(GestureTypes.swipe, handleGestureSwipe);

    if(vm.getSelectedDoor() === null) {
        const alertOptions: AlertOptions = {
            title: 'You don\'t have any doors yet',
            message: 'Do you want to go to the configuration?',
            okButtonText: 'OK'
        };
    
        alert(alertOptions).then(() => page.frame.navigate('doors/doors-page'));
    }
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

function handleGestureSwipe(args: SwipeGestureEventData) {
    const v = <ViewBase>args.object;
    const page = v.page;
    const context: HomeViewModel = page.bindingContext as HomeViewModel;
    switch(args.direction) {
        case SwipeDirection.down:
            context.previous();
            break;
        case SwipeDirection.up:
            context.next();
            break;
        case SwipeDirection.left:
        case SwipeDirection.right:
            break;
    }
}
