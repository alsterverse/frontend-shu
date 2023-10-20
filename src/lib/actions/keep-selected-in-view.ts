export function keepSelectedInView(node: HTMLElement) {
	function on_mutation(mutations: MutationRecord[]) {
		mutations.forEach((mutation) => {
			if (mutation.oldValue === 'false') {
				if (mutation.target instanceof HTMLElement)
					mutation.target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
			}
		});
	}

	const observer = new MutationObserver(on_mutation);

	observer.observe(node, {
		subtree: true,
		attributes: true,
		attributeOldValue: true,
		attributeFilter: ['aria-selected']
	});

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
