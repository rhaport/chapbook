/*
Renders a button.
*/

import event from '../../event';
import {get, set} from '../../state';
import htmlify from '../../util/htmlify';

export default {
	match: /^button?/i,
	render(_, props) {
		return htmlify('hint', 
		{
			class: props.disabled ? "disabled" : undefined,
			'data-cb-hint-trigger': "test",
			'data-cb-hint-text': props.text || 'No hint',
			'data-cb-is-disabled': props.disabled ? "true" : "false"
		}, 
		[props.caption]);
	}
};

event.on('dom-click', el => {
	if (el.dataset.cbHintTrigger && el.dataset.cbIsDisabled == "false") {

		// Get the modal
		var modal = document.querySelector("#cb-modal");
		modal.style.display = "block";
		// change text on the form
		var hint = document.querySelector('#cb-modal-text');
		hint.innerHTML = el.dataset.cbHintText;

		// Get the close button element that closes the modal
		var closeBtn = document.querySelector("#cb-modal-close-button");
	
		// When the user clicks on <span> (x), close the modal
		closeBtn.onclick = function() {
			modal.style.display = "none";
		}
	
		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function(event) {
			if (event.target == modal) {
				modal.style.display = "none";
			}
		}
	}
});

