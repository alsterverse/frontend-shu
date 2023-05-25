const Position = {
	Start: 'start',
	End: 'end'
} as const;

function is_scrollable(node: Element): boolean {
	const style = getComputedStyle(node);
	const overflow =
		style.getPropertyValue('overflow') +
		style.getPropertyValue('overflow-x') +
		style.getPropertyValue('overflow-y');
	return overflow.includes('auto') || overflow.includes('scroll');
}

function scroll_child(node: HTMLElement): HTMLElement | null {
	let child = node.firstElementChild;
	while (child) {
		if (is_scrollable(child)) break;

		child = child.firstElementChild;
	}

	return child instanceof HTMLElement ? child : null;
}

type Position = (typeof Position)[keyof typeof Position];

function custom_property(location: Position): string {
	return `--${location}-overflow-ratio`;
}

type OverflowOptions = {
	/** Whether to dispatch custom events (`startoverflowratio`/`endoverflowratio`)
	 * when overflow occurs. Default is `true`.
	 */
	dispatch?: boolean;
	/** Whether to update CSS properties (`--start-overflow-ratio` and `--end-overflow-ratio`)
	 * based on overflow. Default is `true`.
	 */
	css?: boolean;
	/** The CSS class name to add to the container element. Default is 'overflow'. */
	className?: string;
};

const default_options = {
	dispatch: true,
	css: true,
	className: 'overflow'
};

/**
 * @param {HTMLElement} node - The container element of a child to observe for overflow.
 * @param {OverflowOptions} [options] - Options for the overflow action.
 */
export function overflow(node: HTMLElement, options?: OverflowOptions) {
	let opts = { ...default_options, ...options };

	let intersection_observer: IntersectionObserver | null = null;
	let mutation_observer: MutationObserver | null = null;

	const threshold = Array(101)
		.fill(0)
		.map((_, i) => i / 100);
	const state = {
		start: 0,
		end: 0
	};

	const on_intersection = (
		entries: IntersectionObserverEntry[],
		options: IntersectionObserverInit
	) => {
		const { root } = options;
		if (!root || (root && !(root instanceof HTMLElement))) return;

		for (const entry of entries) {
			const content_overflows = root.scrollHeight > root.offsetHeight;
			if (!content_overflows) return;
			if (entry.target === root.firstElementChild) {
				let start_value = 1 - entry.intersectionRatio;
				if (root.scrollTop > entry.target.getBoundingClientRect().height) {
					start_value = 1;
				}
				if (start_value !== state.start) {
					update(Position.Start, start_value);
				}
			} else if (entry.target === root.lastElementChild) {
				let end_value = 1 - entry.intersectionRatio;
				const root_bottom_scroll_pos = root.scrollTop + root.clientHeight;
				if (root_bottom_scroll_pos === root.scrollHeight) {
					end_value = 0;
				}
				if (end_value !== state.end) {
					update(Position.End, end_value);
				}
			}
		}
	};

	function update(id: Position, ratio: number) {
		state[id] = ratio;
		if (opts.dispatch) dispatch(id, ratio);
		if (opts.css) node.style.setProperty(custom_property(id), ratio.toString());
	}

	const dispatch = (id: Position, ratio: number) => {
		node.dispatchEvent(new CustomEvent(`${id}overflowratio`, { detail: ratio }));
	};

	function observe() {
		mutation_observer?.disconnect();
		const root = scroll_child(node);
		if (!root) {
			if (!mutation_observer) {
				mutation_observer = new MutationObserver(observe);
			}
			mutation_observer.observe(node, { childList: true, subtree: true });
			return;
		}
		node.classList.add(opts.className);
		intersection_observer = new IntersectionObserver(on_intersection, { threshold, root });

		const first = root.firstElementChild;
		const last = root.lastElementChild;

		if (first && last) {
			intersection_observer.observe(first);
			intersection_observer.observe(last);
		}

		Object.values(Position).forEach((id) => {
			update(id, state[id]);
		});
	}

	function clear() {
		node.style.removeProperty(custom_property(Position.Start));
		node.style.removeProperty(custom_property(Position.End));
		node.classList.remove(opts.className);
	}

	observe();

	return {
		update(options?: OverflowOptions) {
			node.classList.remove(opts.className);
			opts = { ...opts, ...options };
			node.classList.add(opts.className);
		},
		destroy() {
			intersection_observer?.disconnect();
			clear();
		}
	};
}
