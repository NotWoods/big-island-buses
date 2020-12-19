(function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function not_equal(a, b) {
        return a != a ? b == b : a !== b;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    var pathPrefix = "/big-island-buses/";

    /**
     * Contains construstors and helper functions.  Avoids using the DOM for functions.
     * @author       Tiger Oakes <tigeroakes@gmail.com>
     * @copyright    2014 Tiger Oakes
     */
    var _a;
    (_a = navigator.serviceWorker) === null || _a === void 0 ? void 0 : _a.register(pathPrefix + 'service-worker.js');
    const PIN_URL = pathPrefix + 'assets/pins.png';
    const normal = {
        url: PIN_URL,
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 0, y: 0 },
        anchor: { x: 12, y: 12 },
    }, unimportant = {
        url: PIN_URL,
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 96, y: 0 },
        anchor: { x: 12, y: 12 },
    }, userShape = {
        url: PIN_URL,
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 48, y: 0 },
        anchor: { x: 12, y: 12 },
    }, placeShape = {
        url: PIN_URL,
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 72, y: 0 },
        anchor: { x: 12, y: 23 },
    }, stopShape = {
        url: PIN_URL,
        size: { height: 26, width: 24 },
        scaledSize: { height: 26, width: 120 },
        origin: { x: 24, y: 0 },
        anchor: { x: 12, y: 20 },
    };
    /**
     * Grabs the API data and parses it into a GTFSData object for the rest of the program.
     */
    function getScheduleData() {
        return fetch(pathPrefix + 'api.json')
            .then((res) => {
            if (res.ok)
                return res.json();
            throw new Error(res.statusText);
        })
            .then((json) => json);
    }
    /**
     * Creates a promise version of the document load event
     * @return {Promise<DocumentReadyState>} resolves if document has loaded
     */
    function documentLoad() {
        if (document.readyState === 'interactive' ||
            document.readyState === 'complete') {
            return Promise.resolve(document.readyState);
        }
        return new Promise((resolve) => {
            document.addEventListener('readystatechange', () => {
                if (document.readyState === 'interactive') {
                    resolve(document.readyState);
                }
            });
        });
    }

    var View;
    (function (View) {
        View[View["LIST"] = 0] = "LIST";
        View[View["MAP_PRIMARY"] = 1] = "MAP_PRIMARY";
        View[View["STREET_PRIMARY"] = 2] = "STREET_PRIMARY";
    })(View || (View = {}));
    var LocationPermission;
    (function (LocationPermission) {
        LocationPermission[LocationPermission["NOT_ASKED"] = -1] = "NOT_ASKED";
        LocationPermission[LocationPermission["GRANTED"] = 0] = "GRANTED";
        LocationPermission[LocationPermission["DENIED"] = 1] = "DENIED";
        LocationPermission[LocationPermission["UNAVALIABLE"] = 2] = "UNAVALIABLE";
        LocationPermission[LocationPermission["TIMEOUT"] = 3] = "TIMEOUT";
    })(LocationPermission || (LocationPermission = {}));
    const stopViewStore = writable(View.MAP_PRIMARY);
    const store = writable({
        route: {},
        locatePermission: LocationPermission.NOT_ASKED,
        focus: 'stop',
    });
    function memoize(fn) {
        let lastArgs;
        let lastResult;
        return function (...args) {
            if (lastArgs === null || lastArgs === void 0 ? void 0 : lastArgs.every((arg, i) => arg === args[i])) {
                return lastResult;
            }
            lastArgs = args;
            lastResult = fn(...args);
            return lastResult;
        };
    }
    function strictEqual(a, b) {
        return a === b;
    }
    function deepEqual(a, b) {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) {
            return false;
        }
        return aKeys.every((key) => a[key] === b[key]);
    }
    /**
     * Like Promise.all, but for objects with promises in the values.
     */
    function awaitObject(obj) {
        const keys = Object.keys(obj);
        return Promise.all(keys.map((key) => obj[key])).then((values) => {
            const result = {};
            keys.forEach((key, i) => {
                result[key] = values[i];
            });
            return result;
        });
    }
    function connect(store, mapStateToProps, propsEqual, callback) {
        let lastProps;
        function listener(state) {
            return Promise.resolve(mapStateToProps(state)).then((props) => {
                if (!lastProps || !propsEqual(lastProps, props)) {
                    lastProps = props;
                    callback(props);
                }
            });
        }
        return store.subscribe(listener);
    }

    function getLinkState(state) {
        return { route: state.route, stop: state.stop };
    }
    /**
     * Generates a link for href values. Meant to maintain whatever active data is avaliable.
     * @param type Type of item to change
     * @param value	ID to change
     * @return URL to use for href, based on active object.
     */
    function createLink(type, value, state) {
        let url = pathPrefix;
        switch (type) {
            case 'route':
                url += `routes/${value}/`;
                if (state.route.trip != null) {
                    url += state.route.trip;
                }
                if (state.stop != null) {
                    url += `?stop=${state.stop}`;
                }
                break;
            case 'stop':
                return `?stop=${value}`;
            case 'trip':
                url += `routes/${state.route.id}/${value}`;
                if (state.stop != null) {
                    url += `?stop=${state.stop}`;
                }
                break;
            default:
                console.warn('Invalid type provided for link: %i', type);
                break;
        }
        return url;
    }
    /**
     * Slices off the fragment from the string and returns the result.
     * Null is returned if the fragment does not exist in the string.
     * @param str Full string
     * @param fragment Part to slice off
     */
    function sliceOff(str, fragment) {
        const idx = str.indexOf(fragment);
        if (idx > -1) {
            return str.substring(idx + fragment.length);
        }
        else {
            return null;
        }
    }
    /**
     * Group 1: Route name
     * Group 2: Trip name
     */
    const LINK_FORMAT = new RegExp(pathPrefix + 'routes/([\\w-]+)/(\\w+)?');
    /**
     * Parse a link. Handles the current /route/<name>/<trip> format and
     * the older query parameters in hash syntax.
     * Returns the corresponding state object.
     */
    function parseLink(url) {
        var _a;
        const query = sliceOff(url.hash, '#!') || ((_a = sliceOff(url.search, '_escaped_fragment_')) === null || _a === void 0 ? void 0 : _a.replace(/%26/g, '&'));
        if (query) {
            const params = new URLSearchParams(query);
            return {
                route: {
                    id: params.get('route'),
                    trip: params.get('trip'),
                },
                stop: params.get('stop'),
            };
        }
        const path = url.pathname.match(LINK_FORMAT);
        const stop = url.searchParams.get('stop');
        if (path) {
            const [, route, trip] = path;
            return {
                route: {
                    id: route,
                    trip,
                },
                stop,
            };
        }
        else {
            return {
                route: {},
                stop,
            };
        }
    }
    function getStateWithLink(state, type, value) {
        const newState = getLinkState(state);
        switch (type) {
            case 'stop':
                newState.stop = value;
                break;
            case 'route':
                newState.route = { id: value, trip: undefined };
                break;
            case 'trip':
                newState.route = { id: state.route.id, trip: value };
                break;
        }
        return newState;
    }

    /**
     * Navigate to the described page
     */
    function openLinkableValues(type, value) {
        store.update((state) => {
            const newLink = createLink(type, value, state);
            const newState = getStateWithLink(state, type, value);
            if (type === 'stop') {
                newState.focus = 'stop';
            }
            history.pushState(newState, '', newLink);
            ga === null || ga === void 0 ? void 0 : ga('send', 'pageview', { page: newLink, title: document.title });
            return { ...state, ...newState };
        });
    }
    function openLinkable(linkable, value) {
        let type;
        if (value) {
            type = linkable;
        }
        if (linkable instanceof HTMLElement) {
            type = linkable.dataset.type;
            value = linkable.dataset.value;
        }
        else {
            const marker = linkable;
            type = marker.get('type');
            value = marker.get('value');
        }
        openLinkableValues(type, value);
    }
    /**
     * Converts an A element into an automatically updating link.
     * @param type What value to change in link
     * @param value Value to use
     * @param store If given, used to update the link when state changes
     * @return A element with custom properties
     */
    function convertToLinkable(node, type, value, store) {
        node.dataset.type = type;
        node.dataset.value = value;
        node.addEventListener('click', clickEvent);
        if (store) {
            connect(store, getLinkState, deepEqual, (state) => {
                node.href = createLink(type, value, state);
            });
        }
        return node;
    }
    /**
     * Used for the click event of a dynamicLinkNode
     * @param  {Event} e
     */
    function clickEvent(e) {
        var _a, _b;
        (_a = e.preventDefault) === null || _a === void 0 ? void 0 : _a.call(e);
        (_b = e.stopPropagation) === null || _b === void 0 ? void 0 : _b.call(e);
        openLinkable(this);
        return false;
    }

    function createLocationMarker(options) {
        let marker;
        return (map, location, stop_id) => {
            if (!marker) {
                marker = new google.maps.Marker(options);
                marker.setMap(map);
                marker.set('type', 'stop');
                google.maps.event.addListener(marker, 'click', clickEvent);
            }
            marker.set('value', stop_id);
            marker.setPosition(location);
            return marker;
        };
    }

    let watchId = 0;
    /**
     * Start watching the user positon and update the store.
     */
    function locateUser(store) {
        let firstPosition = true;
        navigator.geolocation.clearWatch(watchId);
        watchId = navigator.geolocation.watchPosition(function onsuccess({ coords }) {
            let newState = {
                locatePermission: LocationPermission.GRANTED,
                userLocation: { lat: coords.latitude, lng: coords.longitude },
            };
            if (firstPosition) {
                newState.focus = 'user';
                firstPosition = false;
            }
            store.update((oldState) => ({ ...oldState, ...newState }));
        }, function onerror(error) {
            store.update((oldState) => ({
                ...oldState,
                locatePermission: error.code,
            }));
        });
    }

    var url = "worker/info.js";

    let messageIds = 0;
    class PromiseWorker {
        constructor(worker) {
            this.worker = worker;
            this.callbacks = new Map();
            worker.addEventListener('message', (evt) => this.onMessage(evt.data));
        }
        onMessage(message) {
            if (!Array.isArray(message) || message.length < 2) {
                // Ignore - this message is not for us.
                return;
            }
            const [messageId, error, result] = message;
            const callback = this.callbacks.get(messageId);
            if (!callback) {
                // Ignore - user might have created multiple PromiseWorkers.
                // This message is not for us.
                return;
            }
            this.callbacks.delete(messageId);
            callback(error, result);
        }
        postMessage(userMessage) {
            const messageId = messageIds++;
            const messageToSend = [messageId, userMessage];
            return new Promise((resolve, reject) => {
                this.callbacks.set(messageId, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
                this.worker.postMessage(messageToSend);
            });
        }
    }

    const worker = new PromiseWorker(new Worker(pathPrefix + url));
    let sentData = false;
    /**
     * Find the best trip based on the current time of day,
     * along with other route details.
     */
    function getRouteDetails(route) {
        const trips = Object.values(route.trips);
        const message = { type: 'route_details', trips };
        return worker.postMessage(message);
    }
    /**
     * Find the closest stop to the user's location or searched place.
     * @param stops List of stops from API.
     * @param state Location of user and/or search place.
     */
    function findClosestStop(stops, location) {
        if (!location)
            return Promise.resolve(undefined);
        if (!sentData) {
            const message = { type: 'data', stops: Object.values(stops) };
            worker.postMessage(message);
            sentData = true;
        }
        const message = { type: 'closest_stop', location };
        return worker.postMessage(message);
    }

    const getClosestToUser = memoize(findClosestStop);
    const getClosestToSearch = memoize(findClosestStop);
    function closestToUser(stops, state) {
        return getClosestToUser(stops, state.userLocation);
    }
    function closestToSearch(stops, state) {
        var _a;
        return getClosestToSearch(stops, (_a = state.searchLocation) === null || _a === void 0 ? void 0 : _a.location);
    }
    function getStopId(stop) {
        return stop === null || stop === void 0 ? void 0 : stop.stop_id;
    }
    /**
     * Returns the ID of the stop that should be displayed in the user interface.
     * @param stops Map of stop IDs to stops.
     * @param state Current UI state.
     */
    function stopToDisplay(stops, selectedStop, state) {
        return Promise.resolve().then(() => {
            switch (state.focus) {
                case 'user':
                    return closestToUser(stops, state).then(getStopId);
                case 'search':
                    return closestToSearch(stops, state).then(getStopId);
                case 'stop':
                    return selectedStop || undefined;
            }
        });
    }

    const NEARBY_INFO_TEXT = {
        [LocationPermission.NOT_ASKED]: 'Find routes near my location >',
        [LocationPermission.GRANTED]: '',
        [LocationPermission.DENIED]: 'Location permission denied.',
        [LocationPermission.UNAVALIABLE]: 'Location search failed.',
        [LocationPermission.TIMEOUT]: 'Location search timed out.',
    };
    /**
     * Hydrate the pre-rendered sidebar HTML.
     */
    function hydrateAside() {
        const nearbyList = document.getElementById('nearby');
        const otherList = document.getElementById('other');
        const nearbyInfo = document.getElementById('nearby-info');
        const routeListItems = new Map();
        for (const child of otherList.children) {
            const listItem = child;
            const route_id = listItem.dataset.route;
            const link = listItem.querySelector('a.routes__link');
            convertToLinkable(link, 'route', route_id, store);
            routeListItems.set(route_id, listItem);
        }
        return function connectStore(api, store) {
            // Start searching user location on click
            nearbyInfo.addEventListener('click', () => {
                nearbyInfo.textContent = 'Loading...';
                nearbyInfo.hidden = false;
                locateUser(store);
            });
            connect(store, (state) => state.locatePermission, strictEqual, function showHideButton(permission) {
                const text = NEARBY_INFO_TEXT[permission];
                nearbyInfo.textContent = text;
                nearbyInfo.hidden = !text;
            });
            connect(store, (state) => closestToUser(api.stops, state), strictEqual, function updateNearbyRoutes(nearest) {
                const nearbyRoutes = new Set(nearest === null || nearest === void 0 ? void 0 : nearest.routes);
                for (const [route_id, listItem] of routeListItems) {
                    if (nearbyRoutes.has(route_id)) {
                        nearbyList.appendChild(listItem);
                    }
                    else {
                        otherList.appendChild(listItem);
                    }
                }
            });
        };
    }

    const toInt = (n) => Number.parseInt(n, 10);

    /**
     * Returns a special `Date` without an associated year or month.
     *
     * Used throughout the application to represent times with no dates attached.
     * This roughly equates to `Temporal.PlainTime` with space for overflow.
     */
    function plainTime(hours, minutes, seconds) {
        let days = 0;
        if (hours >= 24) {
            days = Math.floor(hours / 24);
            hours = hours % 24;
        }
        return new Date(0, 0, days, hours, minutes, seconds, 0);
    }
    /**
     * Turns a date into a string with hours, minutes.
     * @param  {Date} 	date Date to convert
     * @param  {string} date 24hr string in format 12:00:00 to convert to string in 12hr format
     * @return {string}    	String representation of time
     */
    function stringTime(date) {
        if (typeof date === 'string') {
            if (date.indexOf(':') > -1 && date.lastIndexOf(':') > date.indexOf(':')) {
                const [hour, min, second] = date.split(':').map(toInt);
                date = plainTime(hour, min, second);
            }
        }
        if (typeof date != 'object') {
            throw new TypeError(`date must be Date or string, not ${typeof date}`);
        }
        let m = 'am';
        let displayHour = '';
        let displayMinute = '';
        const hr = date.getHours();
        const min = date.getMinutes();
        if (hr === 0) {
            displayHour = '12';
        }
        else if (hr === 12) {
            displayHour = '12';
            m = 'pm';
        }
        else if (hr > 12) {
            const mathHr = hr - 12;
            displayHour = mathHr.toString();
            m = 'pm';
        }
        else {
            displayHour = hr.toString();
        }
        if (min === 0) {
            displayMinute = '';
        }
        else if (min < 10) {
            displayMinute = ':0' + min.toString();
        }
        else {
            displayMinute = ':' + min.toString();
        }
        return displayHour + displayMinute + m;
    }
    /**
     * Returns a date object based on the string given
     * @param  {string} string in format 13:00:00, from gtfs data
     * @return {Date}
     */
    function gtfsArrivalToDate(string) {
        const [hour, min, second] = string.split(':').map((s) => toInt(s));
        return plainTime(hour, min, second);
    }
    /**
     * Combines stringTime() and gtfsArrivalToDate()
     * @param  {string} string in format 13:00:00, from gtfs data
     * @return {string}        String representation of time
     */
    function gtfsArrivalToString(string) {
        return stringTime(gtfsArrivalToDate(string));
    }

    /* src/page/component/DynamicLinkNode.svelte generated by Svelte v3.31.0 */
    const file = "src/page/component/DynamicLinkNode.svelte";

    function create_fragment(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	let a_levels = [
    		/*$$restProps*/ ctx[4],
    		{ "data-type": /*type*/ ctx[0] },
    		{ "data-value": /*value*/ ctx[1] },
    		{ href: /*href*/ ctx[2] }
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", {
    				"data-type": true,
    				"data-value": true,
    				href: true
    			});

    			var a_nodes = children(a);
    			if (default_slot) default_slot.l(a_nodes);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_attributes(a, a_data);
    			add_location(a, file, 13, 0, 359);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", stop_propagation(prevent_default(/*handleClick*/ ctx[3])), false, true, true);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				dirty & /*$$restProps*/ 16 && /*$$restProps*/ ctx[4],
    				(!current || dirty & /*type*/ 1) && { "data-type": /*type*/ ctx[0] },
    				(!current || dirty & /*value*/ 2) && { "data-value": /*value*/ ctx[1] },
    				(!current || dirty & /*href*/ 4) && { href: /*href*/ ctx[2] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	const omit_props_names = ["type","value"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $store;
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(5, $store = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DynamicLinkNode", slots, ['default']);
    	
    	
    	let { type } = $$props;
    	let { value } = $$props;

    	function handleClick(evt) {
    		openLinkable(evt.currentTarget);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(4, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("type" in $$new_props) $$invalidate(0, type = $$new_props.type);
    		if ("value" in $$new_props) $$invalidate(1, value = $$new_props.value);
    		if ("$$scope" in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		store,
    		createLink,
    		openLinkable,
    		type,
    		value,
    		handleClick,
    		href,
    		$store
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("type" in $$props) $$invalidate(0, type = $$new_props.type);
    		if ("value" in $$props) $$invalidate(1, value = $$new_props.value);
    		if ("href" in $$props) $$invalidate(2, href = $$new_props.href);
    	};

    	let href;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type, value, $store*/ 35) {
    			 $$invalidate(2, href = createLink(type, value, $store));
    		}
    	};

    	return [type, value, href, handleClick, $$restProps, $store, $$scope, slots];
    }

    class DynamicLinkNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, not_equal, { type: 0, value: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DynamicLinkNode",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*type*/ ctx[0] === undefined && !("type" in props)) {
    			console.warn("<DynamicLinkNode> was created without expected prop 'type'");
    		}

    		if (/*value*/ ctx[1] === undefined && !("value" in props)) {
    			console.warn("<DynamicLinkNode> was created without expected prop 'value'");
    		}
    	}

    	get type() {
    		throw new Error("<DynamicLinkNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<DynamicLinkNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<DynamicLinkNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<DynamicLinkNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/page/component/stop/Connection.svelte generated by Svelte v3.31.0 */
    const file$1 = "src/page/component/stop/Connection.svelte";

    // (12:2) <DynamicLinkNode     type="route"     value={routeId}     class="connections__link"     style="border-color: #{route?.route_color}">
    function create_default_slot(ctx) {
    	let t_value = /*route*/ ctx[2]?.route_long_name + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*route*/ 4 && t_value !== (t_value = /*route*/ ctx[2]?.route_long_name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(12:2) <DynamicLinkNode     type=\\\"route\\\"     value={routeId}     class=\\\"connections__link\\\"     style=\\\"border-color: #{route?.route_color}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let li;
    	let dynamiclinknode;
    	let current;

    	dynamiclinknode = new DynamicLinkNode({
    			props: {
    				type: "route",
    				value: /*routeId*/ ctx[0],
    				class: "connections__link",
    				style: "border-color: #" + /*route*/ ctx[2]?.route_color,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(dynamiclinknode.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			li = claim_element(nodes, "LI", { class: true });
    			var li_nodes = children(li);
    			claim_component(dynamiclinknode.$$.fragment, li_nodes);
    			li_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(li, "class", "connections__item");
    			toggle_class(li, "connections__item--active-route", /*current*/ ctx[1]);
    			add_location(li, file$1, 8, 0, 220);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(dynamiclinknode, li, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const dynamiclinknode_changes = {};
    			if (dirty & /*routeId*/ 1) dynamiclinknode_changes.value = /*routeId*/ ctx[0];
    			if (dirty & /*route*/ 4) dynamiclinknode_changes.style = "border-color: #" + /*route*/ ctx[2]?.route_color;

    			if (dirty & /*$$scope, route*/ 20) {
    				dynamiclinknode_changes.$$scope = { dirty, ctx };
    			}

    			dynamiclinknode.$set(dynamiclinknode_changes);

    			if (dirty & /*current*/ 2) {
    				toggle_class(li, "connections__item--active-route", /*current*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dynamiclinknode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dynamiclinknode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(dynamiclinknode);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Connection", slots, []);
    	
    	let { routes } = $$props;
    	let { routeId } = $$props;
    	let { current } = $$props;
    	const writable_props = ["routes", "routeId", "current"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Connection> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("routeId" in $$props) $$invalidate(0, routeId = $$props.routeId);
    		if ("current" in $$props) $$invalidate(1, current = $$props.current);
    	};

    	$$self.$capture_state = () => ({
    		DynamicLinkNode,
    		routes,
    		routeId,
    		current,
    		route
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("routeId" in $$props) $$invalidate(0, routeId = $$props.routeId);
    		if ("current" in $$props) $$invalidate(1, current = $$props.current);
    		if ("route" in $$props) $$invalidate(2, route = $$props.route);
    	};

    	let route;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*routes, routeId*/ 9) {
    			 $$invalidate(2, route = routes[routeId]);
    		}
    	};

    	return [routeId, current, route, routes];
    }

    class Connection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, not_equal, { routes: 3, routeId: 0, current: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Connection",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*routes*/ ctx[3] === undefined && !("routes" in props)) {
    			console.warn("<Connection> was created without expected prop 'routes'");
    		}

    		if (/*routeId*/ ctx[0] === undefined && !("routeId" in props)) {
    			console.warn("<Connection> was created without expected prop 'routeId'");
    		}

    		if (/*current*/ ctx[1] === undefined && !("current" in props)) {
    			console.warn("<Connection> was created without expected prop 'current'");
    		}
    	}

    	get routes() {
    		throw new Error("<Connection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Connection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get routeId() {
    		throw new Error("<Connection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routeId(value) {
    		throw new Error("<Connection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current() {
    		throw new Error("<Connection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current(value) {
    		throw new Error("<Connection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/page/component/stop/StopConnections.svelte generated by Svelte v3.31.0 */
    const file$2 = "src/page/component/stop/StopConnections.svelte";

    function get_then_context(ctx) {
    	ctx[5] = ctx[6].routes;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (1:0) <script lang="ts">var _a; ; import Connection from './Connection.svelte'; export let schedule; export let stop = undefined; export let currentRoute = undefined; $: connections = (_a = stop === null || stop === void 0 ? void 0 : stop.routes) !== null && _a !== void 0 ? _a : []; //# sourceMappingURL=StopConnections.svelte.js.map</script>  <h2 class="connections__heading">Connects to</h2> <ul class="connections__list" id="connections">   {#await schedule then { routes }}
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\">var _a; ; import Connection from './Connection.svelte'; export let schedule; export let stop = undefined; export let currentRoute = undefined; $: connections = (_a = stop === null || stop === void 0 ? void 0 : stop.routes) !== null && _a !== void 0 ? _a : []; //# sourceMappingURL=StopConnections.svelte.js.map</script>  <h2 class=\\\"connections__heading\\\">Connects to</h2> <ul class=\\\"connections__list\\\" id=\\\"connections\\\">   {#await schedule then { routes }}",
    		ctx
    	});

    	return block;
    }

    // (12:35)      {#each connections as routeId (routeId)}
    function create_then_block(ctx) {
    	get_then_context(ctx);
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*connections*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*routeId*/ ctx[7];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(nodes);
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			get_then_context(ctx);

    			if (dirty & /*schedule, connections, currentRoute*/ 7) {
    				const each_value = /*connections*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(12:35)      {#each connections as routeId (routeId)}",
    		ctx
    	});

    	return block;
    }

    // (13:4) {#each connections as routeId (routeId)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let connection;
    	let current;

    	connection = new Connection({
    			props: {
    				routes: /*routes*/ ctx[5],
    				routeId: /*routeId*/ ctx[7],
    				current: /*currentRoute*/ ctx[1] === /*routeId*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(connection.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			first = empty();
    			claim_component(connection.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(connection, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const connection_changes = {};
    			if (dirty & /*schedule*/ 1) connection_changes.routes = /*routes*/ ctx[5];
    			if (dirty & /*connections*/ 4) connection_changes.routeId = /*routeId*/ ctx[7];
    			if (dirty & /*currentRoute, connections*/ 6) connection_changes.current = /*currentRoute*/ ctx[1] === /*routeId*/ ctx[7];
    			connection.$set(connection_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(connection.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(connection.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(connection, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(13:4) {#each connections as routeId (routeId)}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script lang="ts">var _a; ; import Connection from './Connection.svelte'; export let schedule; export let stop = undefined; export let currentRoute = undefined; $: connections = (_a = stop === null || stop === void 0 ? void 0 : stop.routes) !== null && _a !== void 0 ? _a : []; //# sourceMappingURL=StopConnections.svelte.js.map</script>  <h2 class="connections__heading">Connects to</h2> <ul class="connections__list" id="connections">   {#await schedule then { routes }}
    function create_pending_block(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script lang=\\\"ts\\\">var _a; ; import Connection from './Connection.svelte'; export let schedule; export let stop = undefined; export let currentRoute = undefined; $: connections = (_a = stop === null || stop === void 0 ? void 0 : stop.routes) !== null && _a !== void 0 ? _a : []; //# sourceMappingURL=StopConnections.svelte.js.map</script>  <h2 class=\\\"connections__heading\\\">Connects to</h2> <ul class=\\\"connections__list\\\" id=\\\"connections\\\">   {#await schedule then { routes }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let h2;
    	let t0;
    	let t1;
    	let ul;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 6,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*schedule*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text("Connects to");
    			t1 = space();
    			ul = element("ul");
    			info.block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			h2 = claim_element(nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t0 = claim_text(h2_nodes, "Connects to");
    			h2_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			ul = claim_element(nodes, "UL", { class: true, id: true });
    			var ul_nodes = children(ul);
    			info.block.l(ul_nodes);
    			ul_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h2, "class", "connections__heading");
    			add_location(h2, file$2, 9, 0, 339);
    			attr_dev(ul, "class", "connections__list");
    			attr_dev(ul, "id", "connections");
    			add_location(ul, file$2, 10, 0, 389);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, ul, anchor);
    			info.block.m(ul, info.anchor = null);
    			info.mount = () => ul;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*schedule*/ 1 && promise !== (promise = /*schedule*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[6] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(ul);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("StopConnections", slots, []);
    	var _a;
    	
    	let { schedule } = $$props;
    	let { stop = undefined } = $$props;
    	let { currentRoute = undefined } = $$props;
    	const writable_props = ["schedule", "stop", "currentRoute"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StopConnections> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("schedule" in $$props) $$invalidate(0, schedule = $$props.schedule);
    		if ("stop" in $$props) $$invalidate(3, stop = $$props.stop);
    		if ("currentRoute" in $$props) $$invalidate(1, currentRoute = $$props.currentRoute);
    	};

    	$$self.$capture_state = () => ({
    		_a,
    		Connection,
    		schedule,
    		stop,
    		currentRoute,
    		connections
    	});

    	$$self.$inject_state = $$props => {
    		if ("_a" in $$props) $$invalidate(4, _a = $$props._a);
    		if ("schedule" in $$props) $$invalidate(0, schedule = $$props.schedule);
    		if ("stop" in $$props) $$invalidate(3, stop = $$props.stop);
    		if ("currentRoute" in $$props) $$invalidate(1, currentRoute = $$props.currentRoute);
    		if ("connections" in $$props) $$invalidate(2, connections = $$props.connections);
    	};

    	let connections;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*stop, _a*/ 24) {
    			 $$invalidate(2, connections = $$invalidate(4, _a = stop === null || stop === void 0 ? void 0 : stop.routes) !== null && _a !== void 0
    			? _a
    			: []);
    		}
    	};

    	return [schedule, currentRoute, connections, stop, _a];
    }

    class StopConnections extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, not_equal, { schedule: 0, stop: 3, currentRoute: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StopConnections",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*schedule*/ ctx[0] === undefined && !("schedule" in props)) {
    			console.warn("<StopConnections> was created without expected prop 'schedule'");
    		}
    	}

    	get schedule() {
    		throw new Error("<StopConnections>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set schedule(value) {
    		throw new Error("<StopConnections>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stop() {
    		throw new Error("<StopConnections>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stop(value) {
    		throw new Error("<StopConnections>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentRoute() {
    		throw new Error("<StopConnections>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentRoute(value) {
    		throw new Error("<StopConnections>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/page/component/trip/Stop.svelte generated by Svelte v3.31.0 */
    const file$3 = "src/page/component/trip/Stop.svelte";

    // (8:0) <DynamicLinkNode   type="stop"   value={stopTime.stop_id}   class="schedule__stop">
    function create_default_slot$1(ctx) {
    	let div;
    	let span0;
    	let span1;
    	let t0;
    	let span2;
    	let t1_value = /*stops*/ ctx[0][/*stopTime*/ ctx[1].stop_id]?.stop_name + "";
    	let t1;
    	let t2;
    	let time;
    	let t3_value = gtfsArrivalToString(/*stopTime*/ ctx[1].arrival_time) + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			span1 = element("span");
    			t0 = space();
    			span2 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			time = element("time");
    			t3 = text(t3_value);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			span0 = claim_element(div_nodes, "SPAN", { class: true });
    			children(span0).forEach(detach_dev);
    			span1 = claim_element(div_nodes, "SPAN", { class: true });
    			children(span1).forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			span2 = claim_element(nodes, "SPAN", { class: true });
    			var span2_nodes = children(span2);
    			t1 = claim_text(span2_nodes, t1_value);
    			span2_nodes.forEach(detach_dev);
    			t2 = claim_space(nodes);
    			time = claim_element(nodes, "TIME", { class: true });
    			var time_nodes = children(time);
    			t3 = claim_text(time_nodes, t3_value);
    			time_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(span0, "class", "line");
    			add_location(span0, file$3, 11, 21, 327);
    			attr_dev(span1, "class", "line");
    			add_location(span1, file$3, 11, 42, 348);
    			attr_dev(div, "class", "lines");
    			add_location(div, file$3, 11, 2, 308);
    			attr_dev(span2, "class", "schedule__stopname name");
    			add_location(span2, file$3, 12, 2, 378);
    			attr_dev(time, "class", "schedule__time");
    			add_location(time, file$3, 15, 2, 470);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(div, span1);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span2, anchor);
    			append_dev(span2, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, time, anchor);
    			append_dev(time, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*stops, stopTime*/ 3 && t1_value !== (t1_value = /*stops*/ ctx[0][/*stopTime*/ ctx[1].stop_id]?.stop_name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*stopTime*/ 2 && t3_value !== (t3_value = gtfsArrivalToString(/*stopTime*/ ctx[1].arrival_time) + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(time);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(8:0) <DynamicLinkNode   type=\\\"stop\\\"   value={stopTime.stop_id}   class=\\\"schedule__stop\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let dynamiclinknode;
    	let current;

    	dynamiclinknode = new DynamicLinkNode({
    			props: {
    				type: "stop",
    				value: /*stopTime*/ ctx[1].stop_id,
    				class: "schedule__stop",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(dynamiclinknode.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(dynamiclinknode.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dynamiclinknode, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const dynamiclinknode_changes = {};
    			if (dirty & /*stopTime*/ 2) dynamiclinknode_changes.value = /*stopTime*/ ctx[1].stop_id;

    			if (dirty & /*$$scope, stopTime, stops*/ 7) {
    				dynamiclinknode_changes.$$scope = { dirty, ctx };
    			}

    			dynamiclinknode.$set(dynamiclinknode_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dynamiclinknode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dynamiclinknode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dynamiclinknode, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Stop", slots, []);
    	
    	let { stops } = $$props;
    	let { stopTime } = $$props;
    	const writable_props = ["stops", "stopTime"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Stop> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("stops" in $$props) $$invalidate(0, stops = $$props.stops);
    		if ("stopTime" in $$props) $$invalidate(1, stopTime = $$props.stopTime);
    	};

    	$$self.$capture_state = () => ({
    		gtfsArrivalToString,
    		DynamicLinkNode,
    		stops,
    		stopTime
    	});

    	$$self.$inject_state = $$props => {
    		if ("stops" in $$props) $$invalidate(0, stops = $$props.stops);
    		if ("stopTime" in $$props) $$invalidate(1, stopTime = $$props.stopTime);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [stops, stopTime];
    }

    class Stop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, not_equal, { stops: 0, stopTime: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stop",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*stops*/ ctx[0] === undefined && !("stops" in props)) {
    			console.warn("<Stop> was created without expected prop 'stops'");
    		}

    		if (/*stopTime*/ ctx[1] === undefined && !("stopTime" in props)) {
    			console.warn("<Stop> was created without expected prop 'stopTime'");
    		}
    	}

    	get stops() {
    		throw new Error("<Stop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stops(value) {
    		throw new Error("<Stop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stopTime() {
    		throw new Error("<Stop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stopTime(value) {
    		throw new Error("<Stop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/page/component/trip/Schedule.svelte generated by Svelte v3.31.0 */

    function get_then_context$1(ctx) {
    	ctx[4] = ctx[5].stops;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (1:0) <script lang="ts">var _a; ; import Stop from './Stop.svelte'; export let schedule; export let trip = undefined; $: stopTimes = (_a = trip === null || trip === void 0 ? void 0 : trip.stop_times) !== null && _a !== void 0 ? _a : []; //# sourceMappingURL=Schedule.svelte.js.map</script>  {#await schedule then { stops }}
    function create_catch_block$1(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\">var _a; ; import Stop from './Stop.svelte'; export let schedule; export let trip = undefined; $: stopTimes = (_a = trip === null || trip === void 0 ? void 0 : trip.stop_times) !== null && _a !== void 0 ? _a : []; //# sourceMappingURL=Schedule.svelte.js.map</script>  {#await schedule then { stops }}",
    		ctx
    	});

    	return block;
    }

    // (9:32)    {#each stopTimes as stopTime (stopTime.stop_sequence)}
    function create_then_block$1(ctx) {
    	get_then_context$1(ctx);
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*stopTimes*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*stopTime*/ ctx[6].stop_sequence;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(nodes);
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			get_then_context$1(ctx);

    			if (dirty & /*schedule, stopTimes*/ 3) {
    				const each_value = /*stopTimes*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(9:32)    {#each stopTimes as stopTime (stopTime.stop_sequence)}",
    		ctx
    	});

    	return block;
    }

    // (10:2) {#each stopTimes as stopTime (stopTime.stop_sequence)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let stop;
    	let current;

    	stop = new Stop({
    			props: {
    				stops: /*stops*/ ctx[4],
    				stopTime: /*stopTime*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(stop.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			first = empty();
    			claim_component(stop.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(stop, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const stop_changes = {};
    			if (dirty & /*schedule*/ 1) stop_changes.stops = /*stops*/ ctx[4];
    			if (dirty & /*stopTimes*/ 2) stop_changes.stopTime = /*stopTime*/ ctx[6];
    			stop.$set(stop_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stop.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stop.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(stop, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(10:2) {#each stopTimes as stopTime (stopTime.stop_sequence)}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script lang="ts">var _a; ; import Stop from './Stop.svelte'; export let schedule; export let trip = undefined; $: stopTimes = (_a = trip === null || trip === void 0 ? void 0 : trip.stop_times) !== null && _a !== void 0 ? _a : []; //# sourceMappingURL=Schedule.svelte.js.map</script>  {#await schedule then { stops }}
    function create_pending_block$1(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(1:0) <script lang=\\\"ts\\\">var _a; ; import Stop from './Stop.svelte'; export let schedule; export let trip = undefined; $: stopTimes = (_a = trip === null || trip === void 0 ? void 0 : trip.stop_times) !== null && _a !== void 0 ? _a : []; //# sourceMappingURL=Schedule.svelte.js.map</script>  {#await schedule then { stops }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 5,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*schedule*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			await_block_anchor = empty();
    			info.block.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*schedule*/ 1 && promise !== (promise = /*schedule*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[5] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Schedule", slots, []);
    	var _a;
    	
    	let { schedule } = $$props;
    	let { trip = undefined } = $$props;
    	const writable_props = ["schedule", "trip"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Schedule> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("schedule" in $$props) $$invalidate(0, schedule = $$props.schedule);
    		if ("trip" in $$props) $$invalidate(2, trip = $$props.trip);
    	};

    	$$self.$capture_state = () => ({ _a, Stop, schedule, trip, stopTimes });

    	$$self.$inject_state = $$props => {
    		if ("_a" in $$props) $$invalidate(3, _a = $$props._a);
    		if ("schedule" in $$props) $$invalidate(0, schedule = $$props.schedule);
    		if ("trip" in $$props) $$invalidate(2, trip = $$props.trip);
    		if ("stopTimes" in $$props) $$invalidate(1, stopTimes = $$props.stopTimes);
    	};

    	let stopTimes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*trip, _a*/ 12) {
    			 $$invalidate(1, stopTimes = $$invalidate(3, _a = trip === null || trip === void 0
    			? void 0
    			: trip.stop_times) !== null && _a !== void 0
    			? _a
    			: []);
    		}
    	};

    	return [schedule, stopTimes, trip, _a];
    }

    class Schedule extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, not_equal, { schedule: 0, trip: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Schedule",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*schedule*/ ctx[0] === undefined && !("schedule" in props)) {
    			console.warn("<Schedule> was created without expected prop 'schedule'");
    		}
    	}

    	get schedule() {
    		throw new Error("<Schedule>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set schedule(value) {
    		throw new Error("<Schedule>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get trip() {
    		throw new Error("<Schedule>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set trip(value) {
    		throw new Error("<Schedule>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/page/component/trip/TripSelect.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1 } = globals;
    const file$4 = "src/page/component/trip/TripSelect.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i].trip_id;
    	child_ctx[7] = list[i].trip_short_name;
    	return child_ctx;
    }

    // (24:2) {#each trips as { trip_id, trip_short_name }
    function create_each_block$2(key_1, ctx) {
    	let option;
    	let t0_value = /*trip_short_name*/ ctx[7] + "";
    	let t0;
    	let t1;
    	let option_value_value;
    	let option_selected_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			option = claim_element(nodes, "OPTION", { value: true, selected: true });
    			var option_nodes = children(option);
    			t0 = claim_text(option_nodes, t0_value);
    			t1 = claim_space(option_nodes);
    			option_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			option.__value = option_value_value = /*trip_id*/ ctx[6];
    			option.value = option.__value;
    			option.selected = option_selected_value = /*trip_id*/ ctx[6] === /*selectedTrip*/ ctx[0];
    			add_location(option, file$4, 24, 4, 770);
    			this.first = option;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*trips*/ 2 && t0_value !== (t0_value = /*trip_short_name*/ ctx[7] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*trips*/ 2 && option_value_value !== (option_value_value = /*trip_id*/ ctx[6])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}

    			if (dirty & /*trips, selectedTrip*/ 3 && option_selected_value !== (option_selected_value = /*trip_id*/ ctx[6] === /*selectedTrip*/ ctx[0])) {
    				prop_dev(option, "selected", option_selected_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(24:2) {#each trips as { trip_id, trip_short_name }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let label;
    	let svg;
    	let path;
    	let t;
    	let select;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let mounted;
    	let dispose;
    	let each_value = /*trips*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*trip_id*/ ctx[6];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			label = claim_element(nodes, "LABEL", { for: true });
    			var label_nodes = children(label);
    			svg = claim_element(label_nodes, "svg", { class: true, viewBox: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach_dev);
    			svg_nodes.forEach(detach_dev);
    			label_nodes.forEach(detach_dev);
    			t = claim_space(nodes);
    			select = claim_element(nodes, "SELECT", { class: true, id: true, "data-type": true });
    			var select_nodes = children(select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(select_nodes);
    			}

    			select_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(path, "d", "M10,18h4v-2h-4V18z M3,6v2h18V6H3z M6,13h12v-2H6V13z");
    			add_location(path, file$4, 15, 4, 529);
    			attr_dev(svg, "class", "info__icon");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$4, 14, 2, 480);
    			attr_dev(label, "for", "trip-select");
    			add_location(label, file$4, 13, 0, 452);
    			attr_dev(select, "class", "info__select");
    			attr_dev(select, "id", "trip-select");
    			attr_dev(select, "data-type", "trip");
    			add_location(select, file$4, 18, 0, 612);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, svg);
    			append_dev(svg, path);
    			insert_dev(target, t, anchor);
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(select, "input", /*handleChange*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*trips, selectedTrip*/ 3) {
    				const each_value = /*trips*/ ctx[1];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, select, destroy_block, create_each_block$2, null, get_each_context$2);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $store;
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(5, $store = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TripSelect", slots, []);
    	var _a;
    	
    	let { route = undefined } = $$props;

    	let { selectedTrip = (_a = $store.route) === null || _a === void 0
    	? void 0
    	: _a.trip } = $$props;

    	function handleChange(evt) {
    		const option = evt.target;
    		openLinkable("trip", option.value);
    	}

    	const writable_props = ["route", "selectedTrip"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TripSelect> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("route" in $$props) $$invalidate(3, route = $$props.route);
    		if ("selectedTrip" in $$props) $$invalidate(0, selectedTrip = $$props.selectedTrip);
    	};

    	$$self.$capture_state = () => ({
    		_a,
    		openLinkable,
    		store,
    		route,
    		selectedTrip,
    		handleChange,
    		$store,
    		trips
    	});

    	$$self.$inject_state = $$props => {
    		if ("_a" in $$props) _a = $$props._a;
    		if ("route" in $$props) $$invalidate(3, route = $$props.route);
    		if ("selectedTrip" in $$props) $$invalidate(0, selectedTrip = $$props.selectedTrip);
    		if ("trips" in $$props) $$invalidate(1, trips = $$props.trips);
    	};

    	let trips;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*route*/ 8) {
    			 $$invalidate(1, trips = route ? Object.values(route.trips) : []);
    		}
    	};

    	return [selectedTrip, trips, handleChange, route];
    }

    class TripSelect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, not_equal, { route: 3, selectedTrip: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TripSelect",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get route() {
    		throw new Error("<TripSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set route(value) {
    		throw new Error("<TripSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedTrip() {
    		throw new Error("<TripSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedTrip(value) {
    		throw new Error("<TripSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * Contains code to build UI. Interacts with DOM.
     * @author       Tiger Oakes <tigeroakes@gmail.com>
     * @copyright    2014 Tiger Oakes
     */
    let map;
    let streetview;
    let autocomplete;
    let boundsAllStops;
    let markers = [];
    let stopMarker;
    const documentPromise = documentLoad();
    const schedulePromise = getScheduleData();
    const mapPromise = loadMap();
    schedulePromise.then((api) => {
        // @ts-ignore
        window.api = api;
        // @ts-ignore
        window.store = store;
    });
    const stopConnections = new StopConnections({
        target: document.getElementById('connections-wrapper'),
        props: { schedule: schedulePromise },
        hydrate: true,
    });
    const tripSchedule = new Schedule({
        target: document.getElementById('schedule'),
        props: { schedule: schedulePromise },
        hydrate: true,
    });
    const tripSelect = new TripSelect({
        target: document.getElementById('trip-select-container'),
        props: {},
        hydrate: true,
    });
    // Update map when location changes
    Promise.all([schedulePromise, mapPromise]).then(([schedule, map]) => {
        function updateMarker({ location, stop, buildMarker }) {
            if (location)
                buildMarker(map, location, stop === null || stop === void 0 ? void 0 : stop.stop_id);
        }
        const buildUserMarker = createLocationMarker({
            title: 'My Location',
            icon: userShape,
            animation: google.maps.Animation.DROP,
            zIndex: 1000,
        });
        const buildPlaceMarker = createLocationMarker({
            title: 'Search Location',
            icon: placeShape,
            animation: google.maps.Animation.DROP,
            zIndex: 1000,
        });
        connect(store, (state) => awaitObject({
            location: state.userLocation,
            stop: closestToUser(schedule.stops, state),
            buildMarker: buildUserMarker,
        }), deepEqual, updateMarker);
        connect(store, (state) => {
            var _a;
            return awaitObject({
                location: (_a = state.searchLocation) === null || _a === void 0 ? void 0 : _a.location,
                stop: closestToSearch(schedule.stops, state),
                buildMarker: buildPlaceMarker,
            });
        }, deepEqual, updateMarker);
    });
    // Create sidebar, and update it when nearby routes changes
    Promise.all([
        schedulePromise,
        documentPromise.then(hydrateAside),
    ]).then(([schedule, connectStore]) => connectStore(schedule, store));
    function loadMap() {
        if (!navigator.onLine ||
            typeof google !== 'object' ||
            typeof google.maps !== 'object') {
            documentPromise.then(function () {
                document.body.classList.add('no-map');
            });
            throw new Error('Google Maps API has not loaded');
        }
        boundsAllStops = new google.maps.LatLngBounds();
        markers = [];
        function markersAndLatLng(api) {
            return Promise.resolve().then(() => {
                for (const stop of Object.values(api.stops)) {
                    const marker = new google.maps.Marker({
                        position: stop.position,
                        title: stop.stop_name,
                        icon: normal,
                    });
                    marker.set('type', 'stop');
                    marker.set('value', stop.stop_id);
                    marker.stop_id = stop.stop_id;
                    google.maps.event.addListener(marker, 'click', clickEvent);
                    boundsAllStops.extend(marker.getPosition());
                    markers.push(marker);
                }
                return {
                    markers: markers,
                    bounds: boundsAllStops,
                };
            });
        }
        function mapLoad() {
            return Promise.resolve().then(() => {
                const stopView = get_store_value(stopViewStore);
                const mapElement = stopView === View.MAP_PRIMARY
                    ? document.getElementById('map-canvas')
                    : document.getElementById('streetview-canvas');
                const panoElement = stopView === View.STREET_PRIMARY
                    ? document.getElementById('map-canvas')
                    : document.getElementById('streetview-canvas');
                map = new google.maps.Map(mapElement, {
                    center: new google.maps.LatLng(19.6, -155.56),
                    zoom: 10,
                    mapTypeControlOptions: {
                        position: google.maps.ControlPosition.BOTTOM_CENTER,
                    },
                    panControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_TOP,
                    },
                    streetViewControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_TOP,
                    },
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_TOP,
                    },
                });
                streetview = new google.maps.StreetViewPanorama(panoElement, {
                    position: new google.maps.LatLng(19.723835, -155.084741),
                    visible: true,
                    pov: { heading: 34, pitch: 0 },
                    scrollwheel: false,
                    panControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_CENTER,
                    },
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.SMALL,
                        position: google.maps.ControlPosition.RIGHT_CENTER,
                    },
                    addressControl: false,
                });
                map.setStreetView(streetview);
                autocomplete = new google.maps.places.Autocomplete(document.getElementById('search'));
                autocomplete.bindTo('bounds', map);
                google.maps.event.addListener(autocomplete, 'place_changed', function () {
                    const place = autocomplete.getPlace();
                    if (!place.geometry)
                        return;
                    store.update((oldState) => ({
                        ...oldState,
                        searchLocation: {
                            placeId: place.place_id,
                            location: place.geometry.location.toJSON(),
                        },
                        focus: 'search',
                    }));
                });
                return map;
            });
        }
        const mapReady = documentPromise.then(mapLoad);
        Promise.all([mapReady, schedulePromise.then(markersAndLatLng)]).then(function ([map, { markers, bounds }]) {
            map.setCenter(bounds.getCenter());
            map.fitBounds(bounds);
            google.maps.event.addListener(map, 'bounds_changed', function () {
                const mapBounds = map.getBounds();
                for (const marker of markers) {
                    if (mapBounds.contains(marker.getPosition())) {
                        if (marker.getMap() !== map)
                            marker.setMap(map);
                    }
                    else {
                        marker.setMap(null);
                    }
                }
            });
            markers.forEach((marker) => marker.setMap(map));
        });
        window.addEventListener('resize', function () {
            google.maps.event.trigger(map, 'resize');
            google.maps.event.trigger(streetview, 'resize');
            if (!get_store_value(store).route.id) {
                map.setCenter(boundsAllStops.getCenter());
                map.fitBounds(boundsAllStops);
            }
        });
        return mapReady;
    }
    documentPromise.then(function () {
        uiEvents();
    });
    schedulePromise.then((schedule) => {
        function openActive(state) {
            let routePromise = Promise.resolve();
            if (state.route) {
                routePromise = openRoute(schedule, state.route).then((bestTrip) => { var _a; return openTrip(schedule, state.route, (_a = state.trip) !== null && _a !== void 0 ? _a : bestTrip); });
            }
            if (state.stop)
                openStop(schedule, state.route, state.stop);
            return routePromise;
        }
        connect(store, (state) => {
            var _a, _b;
            return awaitObject({
                route: ((_a = state.route) === null || _a === void 0 ? void 0 : _a.id) || undefined,
                trip: ((_b = state.route) === null || _b === void 0 ? void 0 : _b.trip) || undefined,
                stop: stopToDisplay(schedule.stops, state.stop, state),
            });
        }, deepEqual, openActive);
    });
    if (window.history.state) {
        store.update((oldState) => ({ ...oldState, ...window.history.state }));
    }
    else {
        const state = parseLink(new URL(location.href));
        store.update((oldState) => ({ ...oldState, ...state }));
    }
    window.onhashchange = () => {
        const state = parseLink(new URL(location.href));
        store.update((oldState) => ({ ...oldState, ...state }));
    };
    window.onpopstate = (evt) => {
        store.update((oldState) => ({ ...oldState, ...evt.state }));
    };
    /**
     * Adds click events to buttons in the site.
     */
    function uiEvents() {
        if (!navigator.onLine) {
            document.getElementById('main').classList.add('offline');
        }
        document
            .getElementById('map-toggle')
            .addEventListener('click', switchMapStreetview);
        function toggleSidebar() {
            document.getElementById('aside').classList.toggle('open');
        }
        document
            .getElementById('screen-cover')
            .addEventListener('click', toggleSidebar);
        document.getElementById('menu').addEventListener('click', toggleSidebar);
        document.getElementById('alt-menu').addEventListener('click', toggleSidebar);
    }
    /**
     * Swaps map and streetview divs
     * @return {[type]} [description]
     */
    function switchMapStreetview() {
        if (!map || !streetview) {
            console.error('Map and StreetViewPanorama have not loaded');
            throw new TypeError();
        }
        const mapParent = document.getElementById('map');
        const panoParent = document.getElementById('streetview-header');
        stopViewStore.update((stopView) => {
            if (stopView === View.MAP_PRIMARY) {
                mapParent.insertBefore(document.getElementById('streetview-canvas'), mapParent.firstChild);
                panoParent.insertBefore(document.getElementById('map-canvas'), mapParent.firstChild);
                this.classList.add('on');
                return View.STREET_PRIMARY;
            }
            else if (stopView === View.STREET_PRIMARY) {
                mapParent.insertBefore(document.getElementById('map-canvas'), mapParent.firstChild);
                panoParent.insertBefore(document.getElementById('streetview-canvas'), mapParent.firstChild);
                this.classList.remove('on');
                return View.MAP_PRIMARY;
            }
            else {
                return stopView;
            }
        });
    }
    /**
     * Creates a route UI and opens the section if the map is currently in fullscreen mode.
     * @param route_id ID of the route
     * @return trip_id that can be used in openTrip. Best matches time and open stop, if any.
     */
    const openRoute = memoize(function openRoute(api, route_id) {
        const thisRoute = api.routes[route_id];
        if (!thisRoute || !thisRoute.route_id) {
            console.error('Invalid Route %s', route_id);
            return Promise.resolve(undefined);
        }
        const detailsPromise = getRouteDetails(thisRoute);
        document.title = `${thisRoute.route_long_name} | Big Island Buses`;
        const container = document.getElementById('content');
        container.style.setProperty('--route-color', `#${thisRoute.route_color}`);
        container.style.setProperty('--route-text-color', `#${thisRoute.route_text_color}`);
        const name = document.getElementById('route_long_name');
        name.textContent = thisRoute.route_long_name;
        tripSelect.$set({
            route: thisRoute,
        });
        return detailsPromise.then((details) => {
            function stopName(id) {
                return api.stops[id].stop_name;
            }
            const minString = details.closestTrip.minutes !== 1
                ? `${details.closestTrip.minutes} minutes`
                : '1 minute';
            document.getElementById('place-value').textContent = `Between ${stopName(details.firstStop)} - ${stopName(details.lastStop)}`;
            document.getElementById('time-value').textContent = `${stringTime(details.earliest)} - ${stringTime(details.latest)}`;
            document.getElementById('next-stop-value').textContent = `Reaches ${stopName(details.closestTrip.stop)} in ${minString}`;
            document.getElementById('main').classList.add('open');
            if (map) {
                const routeBounds = new google.maps.LatLngBounds();
                for (const marker of markers) {
                    if (details.stops.has(marker.stop_id)) {
                        marker.setIcon(normal);
                        marker.setZIndex(200);
                        marker.activeInRoute = true;
                        routeBounds.extend(marker.getPosition());
                    }
                    else {
                        marker.setIcon(unimportant);
                        marker.setZIndex(null);
                        marker.activeInRoute = false;
                    }
                }
                if (stopMarker) {
                    stopMarker.setIcon(stopShape);
                    stopMarker.setZIndex(300);
                }
                google.maps.event.trigger(map, 'resize');
                map.setCenter(routeBounds.getCenter());
                map.fitBounds(routeBounds);
                google.maps.event.trigger(streetview, 'resize');
            }
            return details.closestTrip.id;
        });
    });
    /**
     * Creates a Stop fragment in the #stop element
     * @param  {[type]} stop_id Id of the stop to use
     * @return {void}           Creates an element
     */
    function openStop(api, currentRoute, stop_id) {
        const thisStop = api.stops[stop_id];
        if (!thisStop || !thisStop.stop_id) {
            console.error('Invalid Stop %s', stop_id);
            return;
        }
        if (streetview) {
            streetview.setPosition(thisStop.position);
        }
        if (map) {
            for (const marker of markers) {
                if (marker.activeInRoute || currentRoute == null) {
                    marker.setIcon(normal);
                }
                else {
                    marker.setIcon(unimportant);
                }
                if (marker.stop_id === thisStop.stop_id) {
                    stopMarker = marker;
                }
            }
            stopMarker.setIcon(stopShape);
            stopMarker.setZIndex(300);
            streetview.setPosition(stopMarker.getPosition());
            google.maps.event.trigger(streetview, 'resize');
            google.maps.event.addListener(streetview, 'pano_changed', function () {
                document.getElementById('address').textContent = streetview.getLocation().description;
                streetview.setPov(streetview.getPhotographerPov());
            });
        }
        if (!streetview) {
            document.getElementById('stop').classList.add('no-streetview');
        }
        document.getElementById('stop_name').textContent = thisStop.stop_name;
        stopConnections.$set({
            stop: thisStop,
            currentRoute,
        });
        document.getElementById('main').classList.add('open-stop');
    }
    function openTrip(api, route_id, trip_id) {
        const route = api.routes[route_id];
        if (!route) {
            console.error('Invalid Route %s', route_id);
            return;
        }
        const trip = route.trips[trip_id];
        if (!trip || !trip.trip_id) {
            console.error('Invalid trip %s in route %s', trip_id, route_id);
            return;
        }
        document.getElementById('week-days-value').textContent =
            api.calendar[trip.service_id].text_name;
        tripSchedule.$set({
            trip,
        });
    }

}());
//# sourceMappingURL=main.js.map
