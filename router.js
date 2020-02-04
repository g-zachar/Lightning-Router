const getRouterLevel = (router) => {
    let level = 0;
    let parent = router.cparent;
    while (parent.cparent) {
        if (parent.type === Router) {
            level += 1;
        }
        parent = parent.cparent;
    }
    return level;
}

export class Router extends lng.Component {

    static navigate(path, data={}) {
        this.data = data;
        window.location.hash = '#' + path;
    }

    static back(data={}) {
        this.data = data;
        window.history.back();
    }

    getRoutes() {
        return this.children.map(ch => ch.ref)
    }

    _init() {
        /* This will clear hash when reloading page */
        history.replaceState(null, null, ' ');

        this.patch(this.routes);
        this.children.forEach((ch) => {
            ch.patch({alpha: 0});
        });
        this.activeRoute = '';
        window.addEventListener('hashchange', this._onPageLoad.bind(this));
    }

    _getFocused() {
        return this.activeRoute ? this.tag(this.activeRoute) : this;
    }

    _onPageLoad(event) {
        const route = window.location.hash.substr(1).split('/');
        const oldRoute = event.oldURL.indexOf('#') !== -1 ? event.oldURL.substring(event.oldURL.indexOf('#') + 1).split('/') : [];

        const routerIndex = getRouterLevel(this);
        const routeChanged = route[routerIndex] != oldRoute[routerIndex];

        if (!routeChanged) {
            return
        }
        console.log('Route changed:', oldRoute.join('/'), '->', route.join('/'), 'data:', Router.data);
        const inactive = this.children.find((ch) => ch.ref === oldRoute[routerIndex]);
        const active = this.children.find((ch) => ch.ref === route[routerIndex]);


        const deactivateOldRoute = () => {
            if (inactive && inactive._onRouteDeactivated) {
                return inactive._onRouteDeactivated(Router.data);
            }
            return Promise.resolve();
        };

        const activateNewRoute = () => {
            if (active) {
                Router.data = {};
                this.activeRoute = route[routerIndex];

                /* Call new route hook if any */
                if (active._onRouteActivated) {
                    return active._onRouteActivated(Router.data);
                }
            }
            return Promise.resolve();
        };

        const updateRouterState = () => {
            this._refocus();
            return Promise.resolve();
        };

        deactivateOldRoute()
        .then(() => {if (inactive) { inactive.setSmooth('alpha', 0)}})
        .then(() => {if (active) {active.setSmooth('alpha', 1)}})
        .then(() => activateNewRoute())
        .then(() => updateRouterState())


    }
}

