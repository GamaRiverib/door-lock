import { BaseComponent } from '../lib/microFrwk';
import { SettingsView } from './Settings';
import { HomeView } from './Home';
import { TopbarComponent } from '../components/Topbar';
import { SidenavComponent } from '../components/Sidenav';

var mainViewInstance = null;

export function MainView() {
	
	if(mainViewInstance !== null) {
		return mainViewInstance;
	}
	
    function template() {
        return /*html*/`
            <topbar></topbar>
            <sidenav></sidenav>
            <div id='main' class='container'>
            </div>
        `;
    }

    var _components, _homeView, _settingsView, _topbar, _sidenav;

    BaseComponent.call(this, template);
    
    function init() {
        _homeView = new HomeView();
        _settingsView = new SettingsView();
        _topbar = new TopbarComponent();
        _sidenav = new SidenavComponent();

        var links = [
            { path: '#home', text: 'Home', component: _homeView },
            { path: '#settings', text: 'Settings', component: _settingsView }
        ];

        var rebootAction = {
            text: 'Reboot',
            name: 'reboot',
            handler: this.reboot
        };

        var actions = [rebootAction];

        _topbar.setLinks(links);
        _topbar.setActions(actions);
        _sidenav.setLinks(links);
        _sidenav.activeLink = links[0];
        _components = [ _homeView, _settingsView, _topbar, _sidenav ];

        _topbar.el.addEventListener('open', _sidenav.open);

        _topbar.el.addEventListener('link-click', _sidenav.close);
        _sidenav.el.addEventListener('link-click', _sidenav.close);

        window.addEventListener('hashchange', function(ev) {
            let hash = window.location.hash;
            links.forEach(l => {
                if(l.path === hash) {
                    _sidenav.activeLink = l;
                    _topbar.activeLink = l;
                    _topbar.title = l.text;

                    if (l.component.actions && Array.isArray(l.component.actions)) {
                        _topbar.updateActions(actions.concat(l.component.actions));
                    } else {
                        _topbar.updateActions(actions);
                    }
                }
            });
        });

        _topbar.el.addEventListener('action-click', _topbar.hide);

        this.render();

        let outlet = '#main';
        links.forEach(l => window.app.add(l.path.substr(1), l.component, outlet));

        return this;
    }

    Object.defineProperty(this, 'selector', {
        enumerable: true,
        writable: false,
        value: 'main-view'
    });

    Object.defineProperty(this, 'components', {
        enumerable: true,
        get: () => _components,
        set: undefined
    });

    this.reboot = function() {
        let response = confirm('Are you sure?');
        if(response) {
            window.device.reboot();
        }
    };

    mainViewInstance = init.call(this);
    
	return mainViewInstance;
}