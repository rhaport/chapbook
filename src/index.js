import authorFunctions from './author';
import {init as initBackstage} from './backstage';
import {canRestoreFromStorage, get, restoreFromStorage} from './state';
import initDefaults from './state/defaults';
import {init as initDisplay} from './display';
import {
	init as initStory,
	loadFromData,
	runCustomScripts,
	addCustomStyles
} from './story';
import {init as initStyle} from './style';
import './index.scss';

loadFromData(document.querySelector('tw-storydata'));
Object.assign(window, authorFunctions);
initStyle();
initDefaults();
initDisplay();
initStory();

if (get('config.testing')) {
	initBackstage();
}

if (canRestoreFromStorage()) {
	restoreFromStorage();
}

addCustomStyles();
runCustomScripts();
