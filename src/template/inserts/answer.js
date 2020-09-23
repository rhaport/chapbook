/*
Renders an answer button.
*/

import event from '../../event';
import {get, set} from '../../state';
import htmlify from '../../util/htmlify';

export default {
	match: /^answer(\s+for)/i,
	render(varName, props) {
		return htmlify('button', 
		{
			type: 'button',
			'data-cb-answer-for': varName,
			'data-cb-answer-text': props.text
		}, 
		[props.caption || "Get answer"]);
	}
};

event.on('dom-click', el => {
	if (el.dataset.cbAnswerFor) {
		// Get the modal
        var input_field = document.querySelector("input[data-cb-text-field-set='" + el.dataset.cbAnswerFor + "']");
        if (input_field)
        {
            input_field.value = el.dataset.cbAnswerText;
            event.emit('dom-change', input_field);
        }
	}
});
