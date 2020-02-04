import {Router} from '../router.js';
console.log(Router)

class ViewWrapper extends lng.Component {
    static _template() {
        return {
            color: 0xff555555,
            rect: true,
            w: 600,
            h: 750,
            clipping: true,
        }
    }

    _onRouteActivated() {
        return new Promise((resolve, reject) => {
            const anim = this.animation({
                duration: 0.3,
                actions: [
                    // Horizontal expand
                    {p: 'w', v: {0: 1, 0.5: 600}},
                    {p: 'x', v: {0: 600 / 2, 0.5: 0}},

                    // Vertical expand
                    {p: 'y', v: {0.5: 750 / 2, 1: 0}},
                    {p: 'h', v: {0.5: 5, 1: 750}},
                ]
            });
            anim.start();
            anim.on('finish', () => resolve());
        });
    }

    _onRouteDeactivated() {
        return new Promise((resolve, reject) => {
            const anim = this.animation({
                duration: 0.3,
                actions: [
                    // Vertical shrink
                    {p: 'y', v: {0: 0, 0.5: 750 / 2}},
                    {p: 'h', v: {0: 750, 0.5: 5}},

                    // Horizontal shrink
                    {p: 'w', v: {0.5: 600, 1: 1}},
                    {p: 'x', v: {0.5: 0, 1: 600 / 2}},
                ]
            });
            anim.start();
            anim.on('finish', () => resolve());
        });
    }
}

class SidebarItem extends lng.Component {
    static _template() {
        return {
            w: 150, h: 80,
            rect: true,
            color: 0xff555555,
            Title: {w: w=>w, text: {text: '?', textAlign: 'center'}},
        }
    }

    _init() {
        const text = this.title || 'text';
        this.tag('Title').text.text = text
    }

    _focus() {
        this.patch({color: 0xffaaaaaa});
    }

    _unfocus() {
        this.patch({color: 0xff555555});
    }
}

class Sidebar extends lng.Component {
    static _template() {
        return {
            flex: {
                direction: 'column',
            },
            Home: { type: SidebarItem, title: 'Home'},
            About: { type: SidebarItem, title: 'About'},
            Help: { type: SidebarItem, title: 'Help'},
        }
    }
}

export default class App extends lng.Application {
    static _template() {
        return {
            Title: { w: 900, text: { text: 'Sidebar Example', textAlign: 'center'}},
            Sidebar: {
                x: 50, y: 100,
                type: Sidebar
            },
            Router: {
                x: 250, y: 100,
                type: Router,
                routes: {
                    Home: {
                        type: ViewWrapper,
                        Title: { w: 600, text: { text: 'Home', textAlign: 'center'}},
                    },
                    About: {
                        type: ViewWrapper,
                        Title: { w: 600, text: { text: 'About', textAlign: 'center'}},
                    },
                    Help: {
                        type: ViewWrapper,
                        Title: { w: 600, text: { text: 'Help', textAlign: 'center'}},
                    },
                }
            }
        }
    }

    _init() {
        Router.navigate("Home");
        this.activeIdx = 0
    }

    _getFocused() {
        return this.tag('Sidebar').children[this.activeIdx];
    }

    _handleDown() {
        this.activeIdx = (this.activeIdx + 1) % this.tag('Sidebar').children.length;
        Router.navigate(this.tag('Router').getRoutes()[this.activeIdx]);
    }

    _handleUp() {
        this.activeIdx = this.activeIdx == 0 ? this.tag('Sidebar').children.length - 1: this.activeIdx - 1;
        Router.navigate(this.tag('Router').getRoutes()[this.activeIdx]);
    }

}