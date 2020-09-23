/*
Renders a button.
*/

import event from '../../event';
import {get, set} from '../../state';
import htmlify from '../../util/htmlify';

export default {
	match: /^button?/i,
	render(_, props) {
		return htmlify('button', 
		{
			type: 'button',
			'data-cb-hint-trigger': "test",
			'data-cb-hint-text': props.text || 'No hint'
		}, 
		[props.caption]);
	}
};

event.on('dom-click', el => {
	if (el.dataset.cbHintTrigger) {

		// Get the modal
		var modal = document.querySelector("#cb-modal");
		modal.style.display = "block";
		// change text on the form
		var hint = document.querySelector('#cb-modal-text');
		hint.innerHTML = el.dataset.cbHintText;

		// Get the <span> element that closes the modal
		var span = document.querySelector("#cb-modal-close");
	
		// When the user clicks on <span> (x), close the modal
		span.onclick = function() {
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

