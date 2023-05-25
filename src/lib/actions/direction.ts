const Dir = {
	Up: 'up',
	Down: 'down'
} as const;

type Direction = (typeof Dir)[keyof typeof Dir];

const CssClass: Record<Direction, string> = {
	[Dir.Up]: 'direction-up',
	[Dir.Down]: 'direction-down'
};

function direct_child_of_root(root: HTMLElement, node: Node): HTMLElement {
	if (!node.parentElement) throw new Error('node has no parent element');
	if (!(node instanceof HTMLElement)) throw new Error('node is not a HTMLElement');
	let item = node;
	let parent = node.parentElement;
	while (parent !== root) {
		item = parent;
		if (!parent.parentElement) break;
		parent = parent.parentElement;
	}

	return item;
}

function num_parents_until(root: HTMLElement, node: Node): number {
	let count = 0;
	let parent = node.parentElement;
	while (parent && parent !== root) {
		count++;
		if (!parent.parentElement) break;
		parent = parent.parentElement;
	}

	return count;
}

function first_common_ancestor(root: HTMLElement, node_a: Node, node_b: Node): HTMLElement {
	const parents_a = num_parents_until(root, node_a);
	const parents_b = num_parents_until(root, node_b);

	let ancestor = root;
	let deep = parents_a > parents_b ? node_a.parentElement : node_b.parentElement;
	const shallow = parents_a > parents_b ? node_b.parentElement : node_a.parentElement;

	if (shallow === root || deep === root) return ancestor;

	while (ancestor === root && deep && deep !== root) {
		let inner_shallow = shallow;
		while (inner_shallow && inner_shallow !== root) {
			if (deep === inner_shallow) {
				ancestor = deep;
				break;
			}
			inner_shallow = inner_shallow.parentElement;
		}
		deep = deep.parentElement;
	}

	return ancestor;
}

function get_direction(prev: HTMLElement, next: HTMLElement): Direction {
	let direction: Direction = Dir.Down;

	let sibling = prev.previousElementSibling;
	while (sibling) {
		if (sibling === next) {
			direction = Dir.Up;
			break;
		}
		sibling = sibling.previousElementSibling;
	}

	return direction;
}

type DirectionOptions = {
	/** Whether to dispatch a custom event (`direction`) when the direction changes. Default is `true`. */
	dispatch?: boolean;
	/** Whether to update CSS classes (`direction-up` / `direction-down`) based on the direction. Default is `true`. */
	css?: boolean;
	/** The old value to compare for mutation records. Default is `false`. */
	oldValue?: string;
	/** Options for the MutationObserver. Default options are provided. */
	observerOptions?: MutationObserverInit;
};

const default_options = {
	dispatch: true,
	css: true,
	oldValue: 'false',
	observerOptions: {
		subtree: true,
		attributes: true,
		attributeOldValue: true,
		attributeFilter: ['aria-selected', 'aria-current']
	}
};

/**
 * @param {HTMLElement} node - The element to observe for direction for child attribute changes.
 * @param {DirectionOptions} [options] - Options for the direction action.
 */
export function direction(node: HTMLElement, options?: DirectionOptions) {
	let opts = { ...default_options, ...options };
	let observer: MutationObserver | null = null;

	function dispatch(direction: Direction) {
		node.dispatchEvent(new CustomEvent('direction', { detail: { direction } }));
	}

	function update(direction: Direction) {
		if (opts.css) {
			node.classList.toggle(CssClass[Dir.Up], direction === Dir.Up);
			node.classList.toggle(CssClass[Dir.Down], direction === Dir.Down);
		}
		if (opts.dispatch) {
			dispatch(direction);
		}
	}

	function on_mutation(mutations: MutationRecord[]) {
		let prev: MutationRecord | null = null;
		let next: MutationRecord | null = null;

		for (const mutation of mutations) {
			if (mutation.oldValue === opts.oldValue || !mutation.oldValue) {
				next = mutation;
			} else {
				prev = mutation;
			}
		}

		if (!prev || !next) {
			update(Dir.Down);
			return;
		}

		const ancestor = first_common_ancestor(node, prev.target, next.target);
		const prev_list_item = direct_child_of_root(ancestor, prev.target);
		const next_list_item = direct_child_of_root(ancestor, next.target);

		const direction = get_direction(prev_list_item, next_list_item);

		update(direction);
	}

	function init() {
		observer = new MutationObserver(on_mutation);
		observer.observe(node, opts.observerOptions);
	}

	init();

	return {
		update(options?: DirectionOptions) {
			opts = { ...opts, ...options };
			observer?.disconnect();
			init();
		},
		destroy() {
			node.classList.remove(CssClass[Dir.Up], CssClass[Dir.Down]);
			observer?.disconnect();
		}
	};
}
