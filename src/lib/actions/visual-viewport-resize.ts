import { is_large_screen } from '$lib/app';

export function virtualKeyboardDetector(node: HTMLElement) {
	const check = (event: Event) => {
		const heightDiff = (event.target as VisualViewport).height;
		const clientHeight = (document.scrollingElement as Element).clientHeight;
		if (heightDiff && clientHeight && heightDiff + 30 < clientHeight) {
			node.dispatchEvent(new CustomEvent('virtualkeyboard', { detail: { direction: 'open' } }));
		} else {
			node.dispatchEvent(new CustomEvent('virtualkeyboard', { detail: { direction: 'close' } }));
		}
	};

	is_large_screen.subscribe((isLarge) => {
		if (window && window.visualViewport) {
			if (!isLarge) {
				window.visualViewport.addEventListener('resize', check);
			} else {
				window.visualViewport.removeEventListener('resize', check);
			}
		}
	});

	return {
		destroy() {
			if (window && window.visualViewport) {
				window.visualViewport.removeEventListener('resize', check);
			}
		}
	};
}
