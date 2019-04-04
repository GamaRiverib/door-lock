import { BaseComponent } from '../lib/microFrwk';

var homeViewInstance = null;

export function HomeView() {
	
	if(homeViewInstance !== null) {
		return homeViewInstance;
    }
    
    var _actions = [],
        relay = null,
        magnetic = null,
        intervalId = null;

    function template() {
        return /*html*/`
            <div class="container">
                <div class="status">
                    <i class="fas fa-door-closed"></i>
                </div>
                <section class="main">
                    <div class="switch">
                        <input type="checkbox" />
                        <label>
                            <i class="fas fa-lock"></i>
                        </label>
                    </div>
                </section>
            </div>
        `;
    }

    BaseComponent.call(this, template);

    function init() {

        this.render();

        let _this = this;
        let _bussy = false;
        let btn = this.el.querySelector('.switch');

        btn.onclick = function() {
            if(relay && !_bussy) {
                _bussy = true;
                let input = btn.querySelector('input');
                window.device.writeGpio(relay, 0);
                input.checked = true;
                setTimeout(() => {
                    window.device.writeGpio(relay, 1);
                    input.checked = false;
                    _bussy = false;
                }, 500);
            }
        }

        window.device.getConfig()
            .then((res) => {
                if(res && res.pinout) {
                    relay = res.pinout.relay || null;
                    magnetic = res.pinout.magnetic || null;
                    startInterval.call(_this);
                }
            })
            .catch((e) => console.log(e));
        
        return this;
    }

    function startInterval() {
        let _this = this;
        if(!intervalId && magnetic) {
            intervalId = setInterval(() => {
                window.device.readGpio(magnetic)
                    .then((res) => {
                        if(res && res.value >= 0) {
                            let status = _this.el.querySelector('.status i');
                            if(status) {
                                let btn = this.el.querySelector('.switch');
                                let icon = btn.querySelector('i');
                                if(res.value === 0) {
                                    status.classList.remove('fa-door-closed');
                                    status.classList.add('fa-door-open');

                                    icon.classList.remove('fa-lock');
                                    icon.classList.add('fa-unlock');
                                } else {
                                    status.classList.remove('fa-door-open');
                                    status.classList.add('fa-door-closed');

                                    icon.classList.remove('fa-unlock');
                                    icon.classList.add('fa-lock');
                                }
                            }
                        }
                    }).catch(e => console.log(e));
            }, 2000);
        }
    }

    Object.defineProperty(this, "selector", {
        enumerable: true,
        writable: false,
        value: "home-view"
    });

    Object.defineProperty(this, "actions", {
        enumerable: true,
        get: () => _actions,
        set: undefined
    });


    homeViewInstance = init.call(this);

	return homeViewInstance;
}