import { BaseComponent } from '../lib/microFrwk';
import { LinksComponent } from './Links';

export function TopbarComponent() {

    function template() {
        return /*html*/`
            <div class="topnav">
                <a href="#" class="menu-icon" m-c="openMenu">
                    <div class="bar1"></div>
                    <div class="bar2"></div>
                    <div class="bar3"></div>
                </a>
                <a class="topnav-title"></a>
                <a class="link" m-f="{ 'items': 'links' }" href="item.path">{{ item.text }}</a>
                <div class="topnav-right">
                    <div class="dropdown">
                        <button class="dropbtn"> 
                            <i class="dots dropbtn"></i>
                        </button>
                        <div class="dropdown-content">
                            <a class="action" m-f="{ 'items': 'actions' }" m-c="item.name">{{ item.text }}</a>
                        </div>
                    </div> 
                </div>
            </div>
        `;
    }

    var _selector = "topbar", _topbar, _content, _activeClass = "active", _titleEl, _actions = [];

    BaseComponent.call(this, template);
    LinksComponent.call(this);

    function findAction(name) {
        let index = -1;
        _actions.forEach((a, i) => {
            if(a.name == name) {
                return index = i;
            }
        });
        if(index >= 0) {
            return _actions[index];
        }
        return null;
    }

    function init() {
        let t = this;

        this.render();
        
        this.el.addEventListener("DOMSubtreeModified", () => {
            t._setActiveLink.call(t, t.activeLink);
        });

        _content = this.el.getElementsByClassName("dropdown-content")[0];
        _titleEl = this.el.getElementsByClassName("topnav-title")[0];

        let dropbtnEl = this.el.getElementsByClassName("dropbtn")[0];
        dropbtnEl.addEventListener("click", () => { this.toggle(); });
        window.addEventListener("click", () => { this.hide(); });
        this.el.addEventListener("click", (e) => { e.stopPropagation(); });

        _topbar = this.el.getElementsByClassName("topnav")[0];
        _topbar.addEventListener("click", function(e) {
            if(e.target.tagName === "A" && e.target.classList.contains("link")) {
                let link = t._findLink(e.target.hash);
                if (link) {
                    t.el.dispatchEvent(new CustomEvent("link-click", { detail: link }));
                    t._setActiveLink.call(t, link);
                }
            }
            if(e.target.tagName === "A" && e.target.classList.contains("action")) {
                let name = e.target.getAttribute("m-c");
                let action = findAction(name);
                if(action) {
                    t.el.dispatchEvent(new CustomEvent("action-click", { detail: action }));
                }
                t.toggle();
            }
        });

        return this;
    }

    Object.defineProperty(this, "selector", {
        enumerable: true,
        writable: false,
        value: _selector
    });
    
    Object.defineProperty(this, "title", { enumerable: true,
        get: function() {
            return _titleEl.innerHTML;
        },
        set: function(title) {
            _titleEl.innerHTML = title;
        }
    });

    Object.defineProperty(this, "actions", { enumerable: true,
        get: function() {
            return _actions;
        },
        set: undefined
    });

    Object.defineProperty(this, "activeClass", { enumerable: true,
        get: function() {
            return _activeClass;
        },
        set: undefined
    });

    this.setActions = function(actions) {
        if(Array.isArray(actions)) {
            let t = this;
            _actions = [];
            actions.forEach(a => t.addAction(a.text, a.name, a.handler));
        }
    };

    this.updateActions = function(actions) {
        if(Array.isArray(actions)) {
            let t = this;
            _actions.forEach(a => delete t[a.name]);
            _actions = [];
            while (_content.firstChild) {
                _content.removeChild(_content.firstChild);
            }
            actions.forEach(a => t.addAction(a.text, a.name, a.handler));
            _actions.forEach(a => {
                //<a class="action" m-f="{ 'items': 'actions' }" m-c="item.name">{{ item.text }}</a>
                let actionEl = document.createElement('a');
                actionEl.classList.add('action');
                actionEl.addEventListener('click', t[a.name]);
                actionEl.innerText = a.text;
                _content.appendChild(actionEl);
            });
        }

    };

    this.addAction = function(text, name, handler) {
        _actions.push({ text: text, name: name });
        this[name] = handler;
        return this;
    };

    this.removeAction = function(name) {
        let t = this;
        _actions.forEach((x,i,a) => {
            if(x.name === name) {
                delete t[name];
                return a.splice(i, 1);
            }
        });
    };

    this.openMenu = function() {
        this.el.dispatchEvent(new CustomEvent("open"));
    };

    this.toggle = function() {
        _content.classList.toggle("show");
    };

    this.show = function() {
        _content.classList.add("show");
    };

    this.hide = function() {
        _content.classList.remove("show");
    };

    this.action = function(e) {
        console.log(e);
    };

    return init.call(this);
}