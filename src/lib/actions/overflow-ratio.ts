export function overflowRatio(node: HTMLElement) {
	const parent = node.parentElement ?? node;
	let observer: IntersectionObserver | null = null;
	const threshold = Array(101)
		.fill(0)
		.map((_, i) => i / 100);

	const state = {
		start: 0,
		end: 0
	};

	const on_intersection = (entries: IntersectionObserverEntry[]) => {
		entries.forEach((entry) => {
			const content_overflows = node.scrollHeight > node.offsetHeight;
			if (content_overflows) {
				if (entry.target === node.firstElementChild) {
					let start_value = 1 - entry.intersectionRatio;
					if (node.scrollTop > entry.target.getBoundingClientRect().height) {
						start_value = 1;
					}
					if (start_value === 0) {
						start_value = 0.0001;
					}
					if (start_value !== state.start) {
						update('start', start_value);
					}
				} else if (entry.target === node.lastElementChild) {
					let end_value = 1 - entry.intersectionRatio;
					if (node.scrollTop + node.clientHeight === node.scrollHeight) {
						end_value = 0;
					}
					if (end_value === 0) {
						end_value = 0.0001;
					}
					if (end_value !== state.end) {
						update('end', end_value);
					}
				}
			}
		});
	};

	function update(id: keyof typeof state, ratio: number) {
		state[id] = ratio;
		dispatch(id, ratio);
		parent.style.setProperty(`--${id}-overflow-ratio`, ratio.toString());
	}

	const dispatch = (id: string, ratio: number) => {
		node.dispatchEvent(new CustomEvent(`${id}overflowratio`, { detail: ratio }));
	};

	function init() {
		observer = new IntersectionObserver(on_intersection, {
			threshold,
			root: node
		});

		const first = node.firstElementChild;
		const last = node.lastElementChild;

		if (first && last && observer) {
			observer.observe(first);
			observer.observe(last);
		}
	}

	init();

	return {
		update() {
			observer?.disconnect();
			init();
		},
		destroy() {
			observer?.disconnect();
			parent.style.removeProperty('--start-overflow-ratio');
			parent.style.removeProperty('--end-overflow-ratio');
		}
	};
}
