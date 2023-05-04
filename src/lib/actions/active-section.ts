import { sleep } from '$lib/utils';

export function active_section(node: HTMLElement) {
	let current_active_section: Element | null = null;

	let anchor_interaction_pending = false;

	const sections = new Map<Element, { position: number; ratio: number }>();

	const activate = (new_active_section: Element | null) => {
		if (!new_active_section || current_active_section === new_active_section) {
			return;
		}

		const current_section_details = sections.get(current_active_section ?? new_active_section);
		const new_section_details = sections.get(new_active_section);
		const active = new_active_section.id;

		if (new_section_details && current_section_details) {
			node.dispatchEvent(
				new CustomEvent('activesection', {
					detail: {
						active,
						direction:
							new_section_details.position > current_section_details.position ? 'down' : 'up'
					}
				})
			);
			current_active_section = new_active_section;
		}
	};

	const on_intersection = (section_entries: IntersectionObserverEntry[]) => {
		section_entries.forEach((section_entry) => {
			const values = sections.get(section_entry.target);
			if (values) {
				values.ratio = section_entry.intersectionRatio;
			}
		});

		if (anchor_interaction_pending) return;

		const [last_section] = [...sections.entries()].pop() ?? [];
		const [new_active_section, new_section_details] =
			[...sections.entries()].sort((a, b) => b[1].ratio - a[1].ratio).shift() ?? [];

		if (last_section && window.innerHeight + Math.round(window.scrollY) >= node.scrollHeight) {
			// if the user has scrolled to the bottom of the page, activate the last section
			activate(last_section);
		} else if (
			new_active_section &&
			current_active_section !== new_active_section &&
			new_section_details &&
			new_section_details.ratio > 0
		) {
			activate(new_active_section);
		}
	};

	const on_anchor = async (event: Event) => {
		if (event.type === 'keydown' && (event as KeyboardEvent).key !== 'Enter') return;
		const anchor = event.currentTarget as HTMLAnchorElement;
		const new_active = document.getElementById(anchor.href.split('#')[1]);

		anchor_interaction_pending = true;
		await sleep(100);
		if (new_active !== current_active_section) {
			activate(new_active);
		}
		anchor_interaction_pending = false;
	};

	const observer = new IntersectionObserver(on_intersection, {
		threshold: Array(101)
			.fill(0)
			.map((_, i) => i / 100)
	});

	node.querySelectorAll('section').forEach((section, index) => {
		if (section.id.length > 0) {
			if (!current_active_section) {
				activate(section);
			}
			observer.observe(section);
			sections.set(section, { position: index, ratio: 0 });

			document.querySelectorAll(`a[href="#${section.id}"]`).forEach((anchor) => {
				anchor.addEventListener('click', on_anchor);
				anchor.addEventListener('keydown', on_anchor);
			});
		}
	});

	return {
		destroy() {
			observer?.disconnect();
			sections.forEach((_, section) => {
				document.querySelectorAll(`a[href="#${section.id}"]`).forEach((anchor) => {
					anchor.removeEventListener('click', on_anchor);
				});
			});
		}
	};
}
