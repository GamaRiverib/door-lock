export function LinksComponent() {

    var _links, _activeLink;

    this._setActiveLink = function(link) {
        if (this.el && link) {
            let links = this.el.querySelectorAll('.link');
            for(let i = 0; i < links.length; i++) {
                let l = links[i];
                if (l.hash === link.path) {
                    l.classList.add(this.activeClass);
                } else {
                    l.classList.remove(this.activeClass);
                }
            }
        }
    }

    this._findLink = function(path) {
        let index = -1;
        _links.forEach((l,i) => {
            if(l.path === path) {
                return index = i;
            }
        });
        if (index >= 0) {
            return _links[index];
        }
        return null;
    }

    Object.defineProperty(this, 'activeLink', { enumerable: true,
        get: () => _activeLink,
        set: function(l) {
            if(typeof l === 'string') {
                l = this._findLink(l);
            }
            _activeLink = l;
            this._setActiveLink.call(this, l);
        } 
    });

    Object.defineProperty(this, 'links', { enumerable: true,
        get: function() {
            return _links;
        },
        set: undefined
    });

    this.setLinks = function(links) {
        if (Array.isArray(links)) {
            _links = links;
        }
    };

    this.addLink = function(path, text) {
        if(!_links) {
            _links = [];
        }
        _links.push({ path: path, text: text });
        return this;
    };

    this.removeLink = function(path) {
        _links.forEach((l,i,a) => {
            if(l.path === path) {
                return a.splice(i, 1);
            }
        });
    };

    return this;
}