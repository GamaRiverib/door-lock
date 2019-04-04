import * as Router from 'vanilla-router';

function aNav(component) {
    let l = component.el.querySelectorAll("a");
    l.forEach((x) => {
        if(!x.hasAttribute("m-c") && x.hash) {
            x.addEventListener("click", (e) => {
                e.preventDefault();
                window.router.navigateTo(x.hash, component);
            });
        }
    });
}

function abind(component, query, attribute, event) {
    component.el.querySelectorAll(`[${query}]`).forEach(el => {
        let property = el.getAttribute(query);
        el.removeAttribute(query);
        component[`_${property}`] = component[property] || "";
        if(event) { 
            el.addEventListener(event, () => { 
                component[`_${property}`] = el[attribute];
            }); 
        }
        Object.defineProperty(component, property, {
            get: () => { 
                return component[`_${property}`]; 
            },
            set: (val) => {
                component[`_${property}`] = val;
                el[attribute] = val;
            }
        });
        el[attribute] = component[property];
    });
}

function aBinds(component) {
    abind(component, "m-b", "innerHTML");
    abind(component, "m-v", "value", "keyup");
}

function aClicks(component) {
    let l = component.el.querySelectorAll("[m-c]");
    l.forEach((el) => {
        let a = el.getAttribute("m-c");
        el.removeAttribute("m-c");
        el.addEventListener("click", (e) => {
            e.preventDefault();
            component[a].call(component, e);
        });
    });
}

function aFor(component) {
    let l = component.el.querySelectorAll("[m-f]");
    l.forEach((el) => {
        let c = JSON.parse(el.getAttribute("m-f").replace(/\'/g, "\""));
        let items = component[c.items];
        let d = document.createElement("DIV");
        items.forEach((i) => {
            let e = document.createElement(el.tagName);
            let h = el.innerHTML.toString();
            let m = el.innerHTML.match(/{{\s*[\w\.]+\s*}}/g)
                .map(function(x) { return x.match(/[\w\.]+/)[0]; });
            for(let j = 0; j < m.length; j++) {
                if(m[j].startsWith("item.")) {
                    let k = m[j].substr(5);
                    h = h.replace(m[j], i[k]);
                }
            }
            h = h.replace(/{{/g, "").replace(/}}/g, "");

            for(let j = 0; j < el.attributes.length; j++) {
                let a = el.attributes[j];
                if(a.value && a.value.trim().startsWith("item.")) {
                    let k = a.value.trim().substr(5);
                    if(typeof i[k] === "string") {
                        e.setAttribute(a.name, i[k]);
                    } else {
                        e.setAttribute(a.name, k);
                    }
                } else if(a.name != "m-f") {
                    e.setAttribute(a.name, a.value);
                }
            }
            e.innerHTML = h;
            d.appendChild(e);
        });
        let p = el.parentNode;
        p.replaceChild(d, el);
        el.removeAttribute("m-f");
    });
}

function aComponent(view, component) {
    let l = view.el.querySelectorAll(component.selector);
    l.forEach((el) => {
        component.render(el);
        aFor(component);
        aClicks(component);
        aBinds(component);
    });
}

function aView(outlet, view) {
    while(outlet.firstChild) {
        outlet.removeChild(outlet.firstChild);
    }
    view.render(outlet);
    aFor(view);
    aClicks(view);
    aBinds(view);
    aNav(view);
}

function onBeforeView(v) {
    // console.log("onBeforeView", v);
}

export function BaseComponent(template) {

    var _el;

    Object.defineProperty(this, "el", { enumerable: true, get: () => _el, set: undefined });

    this.render = function(outlet) {
        if(!_el) {
            _el = document.createElement("DIV");
            _el.innerHTML = template.call(this);
        }
        if(outlet) {
            outlet.appendChild(_el);
        }
    };
}

export class MicroFrwk {

    constructor(selector) {
        this.el = document.querySelector(selector);
        let hooks = { before: onBeforeView };
        window.router = new Router({ mode: "hash", hooks: hooks, page404: (e) => console.log(e) });
        window.router.addUriListener();
    }

    add(path, view, outlet) {
        let _this = this;
        window.router.add(path, function(...args) {
            // console.log(args);
            let v;
            if (typeof view === 'function') {
                v = view.call(args);
            } else if(typeof view === 'object' && view.render) {
                v = view;
            } else {
                throw new Error(`Invalid view component`);
            }
            v.render();
            if(v.components) {
                v.components.forEach(c => aComponent(v, c));
            }
            if(outlet) {
                if (typeof outlet === "string") {
                    outlet = document.querySelector(outlet);
                }
            }
            aView(outlet || _this.el, v);
        });
        return this;
    }

}