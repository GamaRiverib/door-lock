import { BaseComponent } from '../lib/microFrwk';
import { LinksComponent } from './Links';

export function SidenavComponent() {

    function template() {
        return `
            <div class="sidenav">
                <a class="closebtn" m-c="close">&times;</a>
                <a class="link" m-f="{ 'items': 'links' }" href="item.path">{{ item.text }}</a>
            </div>
        `;
    }

    var _openClass = 'open', _selector = 'sidenav', _sidenav, _activeClass = 'active';

    BaseComponent.call(this, template);
    LinksComponent.call(this);

    function init() {
        let t = this;

        this.render();

        this.el.addEventListener('DOMSubtreeModified', () => {
            t._setActiveLink.call(t, t.activeLink);
        });

        _sidenav = this.el.getElementsByClassName(_selector)[0];
        _sidenav.addEventListener('click', function(e) {
            if(e.target.tagName === 'A' && e.target.classList.contains('link')) {
                let link = t._findLink(e.target.hash);
                if (link) {
                    t.el.dispatchEvent(new CustomEvent('link-click', { detail: link }));
                    t._setActiveLink.call(t, link);
                }
            }
        });
        return this;
    }

    Object.defineProperty(this, 'selector', {
        enumerable: true,
        writable: false,
        value: _selector
    });
    
    Object.defineProperty(this, 'activeClass', { enumerable: true,
        get: function() {
            return _activeClass;
        },
        set: undefined
    });

    this.open = function() {
        _sidenav.classList.add(_openClass);
    };

    this.close = function() {
        _sidenav.classList.remove(_openClass);
    };

    return init.call(this);
}