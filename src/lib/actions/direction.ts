type Direction = 'up' | 'down';

function parent_child_node(node: Node, parent: HTMLElement): HTMLElement {
	if (!node.parentElement || !(node instanceof HTMLElement)) throw new Error('No parent element');
	if (node.parentElement === parent || node.parentElement.children.length > 1) return node;
	return parent_child_node(node.parentElement, parent);
}

export function direction(node: HTMLElement) {
	function dispatch(direction: Direction) {
		node.dispatchEvent(new CustomEvent('direction', { detail: { direction } }));
	}

	function update(direction: Direction) {
		node.classList.toggle('direction-up', direction === 'up');
		node.classList.toggle('direction-down', direction === 'down');
		dispatch(direction);
	}

	function on_mutation(mutations: MutationRecord[]) {
		let prev: HTMLElement | null = null;
		let next: HTMLElement | null = null;

		for (const mutation of mutations) {
			if (mutation.oldValue === 'false' || !mutation.oldValue) {
				next = parent_child_node(mutation.target, node);
			} else {
				prev = parent_child_node(mutation.target, node);
			}
		}

		let direction: Direction = 'down';

		let sibling = prev?.previousElementSibling;
		while (sibling) {
			if (sibling === next) {
				direction = 'up';
				break;
			}
			sibling = sibling.previousElementSibling;
		}

		update(direction);
	}

	const observer = new MutationObserver(on_mutation);

	observer.observe(node, {
		subtree: true,
		attributes: true,
		attributeOldValue: true,
		attributeFilter: ['aria-selected', 'aria-current']
	});

	node.classList.add('direction-down');

	return {
		destroy() {
			node.classList.remove('direction-up', 'direction-down');
			observer.disconnect();
		}
	};
}
