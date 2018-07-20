// Manages all state, automatically persisting to browser local storage.

import deepGet from 'get-value';
import deepSet from 'set-value';
import deepUnset from 'unset-value';
import event from '../event';
import logger from '../logger';
import {story} from '../story';

const {log} = logger('state');
let vars = {};
let defaults = {};

const stateDefaults = {
	'config.state.autosave': true,
	'config.state.saveKey': () => 'chapbook-state-' + story.name
};
export {stateDefaults as defaults};

function addGlobalProxy(target, name) {
	// If the property already exists on the target, do nothing.

	if (deepGet(target, name)) {
		return;
	}

	// Navigate through any nested object properties.

	const dottedProps = name.split('.');
	const targetName = dottedProps[dottedProps.length - 1];

	for (let i = 0; i < dottedProps.length - 1; i++) {
		target[dottedProps[i]] = target[dottedProps[i]] || {};
		target = target[dottedProps[i]];
	}

	// Set up the proxy.

	Object.defineProperty(target, targetName, {
		get() {
			return get(name);
		},
		set(value) {
			set(name, value);
		},

		// Allow overwriting.
		configurable: true
	});
}

function removeGlobalProxy(target, name) {
	deepUnset(target, name);
}

// Resets all set variables, but not defaults. (If you want to do that, default
// a key to undefined.) This emits `state-change` events as it works.

export function reset() {
	function deleteProps(obj, objName) {
		Object.keys(obj).forEach(k => {
			const keyName = objName === '' ? k : `${objName}.${k}`;

			if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
				deleteProps(obj[k], keyName);
			} else {
				// We can't use a `set()` call here because we would be setting
				// off a ton of local storage serializations at once.

				const previous = obj[k];

				delete obj[k];
				removeGlobalProxy(window, objName);
				event.emit('state-change', {
					name: keyName,
					value: get(keyName),
					previous
				});
			}
		});
	}

	deleteProps(vars, '');
	event.emit('state-reset');

	if (get('config.state.autosave')) {
		saveToStorage();
	}
}

// Sets a state variable, triggering a `state-change` event if it is changing a
// previous value.

export function set(name, value) {
	const previous = get(name);

	log(`Setting "${name}" to ${JSON.stringify(value)}`);
	deepSet(vars, name, value);
	addGlobalProxy(window, name);

	const now = get(name);

	if (now !== previous) {
		event.emit('state-change', {name, value: get(name), previous});
	}

	if (get('config.state.autosave')) {
		saveToStorage();
	}
}

// Sets a state default, triggering a `state-change` event if that effectively
// causes the variable value's to change (e.g. if it is currently undefined).

export function setDefault(name, value) {
	const previous = get(name);

	log(`Defaulting "${name}" to ${JSON.stringify(value)}`);
	deepSet(defaults, name, value);
	addGlobalProxy(window, name);

	if (previous === null || previous === undefined) {
		event.emit('state-change', {name, value, previous});
	}
}

// Gets the value of a variable.

export function get(name) {
	const varValue = deepGet(vars, name);

	return varValue === undefined || varValue === null
		? deepGet(defaults, name)
		: varValue;
}

// Returns an object representing the current state, that can be given back to
// restoreFromObject(). Although this a plain JavaScript object, it should be
// considered read-only.

export function saveToObject() {
	return Object.assign({}, vars);
}

// Sets state based on a previously serialized object. This will trigger
// `state-change` events as it works.

export function restoreFromObject(previous) {
	reset();
	Object.keys(previous).forEach(v => set(v, previous[v]));
}

// Returns whether it is possible to save values to local storage.

export function canSaveToStorage() {
	try {
		window.localStorage.setItem('chapbook-test', 'a');
		window.localStorage.removeItem('chapbook-test');
		return true;
	} catch (e) {
		return false;
	}
}

// Saves all values to local storage for later retrieval by restoreFromStorage().

export function saveToStorage() {
	log('Saving to local storage');
	window.localStorage.setItem(
		get('config.state.saveKey'),
		JSON.stringify(saveToObject())
	);
	log('Save complete');
}

// Returns whether there is state to restore in local storage.

export function canRestoreFromStorage() {
	return (
		canSaveToStorage() &&
		window.localStorage.getItem(get('config.state.saveKey')) !== null
	);
}

// Restores state from local storage.

export function restoreFromStorage() {
	log('Restoring variables from local storage');
	restoreFromObject(
		JSON.parse(window.localStorage.getItem(get('config.state.saveKey')))
	);
	log('Restore complete');
}

// Returns all variable names currently set.

export function varNames(includeDefaults) {
	function catalog(obj, prefix, result = []) {
		return Object.keys(obj).reduce((out, k) => {
			if (
				typeof obj[k] === 'object' &&
				obj[k] &&
				!Array.isArray(obj[k])
			) {
				catalog(obj[k], prefix ? prefix + '.' + k : k, out);
			} else {
				let varName = prefix ? prefix + '.' + k : k;

				if (out.indexOf(varName) === -1) {
					out.push(varName);
				}
			}

			return out;
		}, result);
	}

	if (includeDefaults) {
		return catalog(defaults, null, catalog(vars, null)).sort();
	}

	return catalog(vars).sort();
}
