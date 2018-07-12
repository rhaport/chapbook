// Color-related functions. This accepts #rrggbb, #rrggbbaa, hsl, hsla, rgb,
// rgba, and Open Color keywords. If you specify a bare Open Color, e.g. "red",
// it will pick the darkest part of the color range for you.

import openColors from 'open-color/open-color.json';
import parseColor from 'pure-color/parse';
import rgbToHsl from 'pure-color/convert/rgb2hsl';
import factoryFor from '../util/class-factory';

export class Color {
	constructor(value = 'black') {
		if (value) {
			// If we matched only one part of an Open Color keyword, check to
			// see if there's a range.

			if (openColors[value]) {
				if (Array.isArray(openColors[value])) {
					value = openColors[value][openColors[value].length - 1];
				} else {
					value = openColors[value];
				}
			}

			const colorLookup = /^(\w+)-(\d)$/.exec(value);

			if (colorLookup && openColors[colorLookup[1]]) {
				value = openColors[colorLookup[1]][colorLookup[2]];
			}
		}

		// pure-color doesn't convert alpha, so we have to maintain it manually.

		const rgba = parseColor(value);

		this.hsla = rgbToHsl(rgba);
		this.hsla[3] = rgba[3] || 1;
	}

	spin(degrees) {
		this.hsla[0] = (this.hsla[0] + degrees) % 360;
		return this;
	}

	saturate(percent) {
		this.hsla[1] = Math.min(
			this.hsla[1] + this.hsla[1] * (1 + percent),
			100
		);
		return this;
	}

	desaturate(percent) {
		this.hsla[1] = Math.max(this.hsla[1] - this.hsla[1] * (1 + percent), 0);
		return this;
	}

	lighten(percent) {
		this.hsla[2] = Math.min(
			this.hsla[2] + this.hsla[2] * (1 + percent),
			100
		);
		return this;
	}

	darken(percent) {
		this.hsla[2] = Math.min(
			this.hsla[2] - this.hsla[2] * (1 + percent),
			100
		);
		return this;
	}

	fadeIn(percent) {
		this.hsla[3] = Math.min(this.hsla[3] + this.hsla[3] * (1 + percent), 1);
		return this;
	}

	fadeOut(percent) {
		this.hsla[3] = Math.min(this.hsla[3] - this.hsla[3] * (1 + percent), 1);
		return this;
	}

	toString() {
		return `hsla(${this.hsla[0]}, ${this.hsla[1]}%, ${this.hsla[2]}%, ${
			this.hsla[3]
		})`;
	}
}

export default factoryFor(Color);