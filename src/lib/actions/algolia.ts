import type { AlgoliaSearchOptions, SearchClient, SearchIndex } from 'algoliasearch';

type AlgoliaSearch = (
	appId: string,
	apiKey: string,
	options?: AlgoliaSearchOptions
) => SearchClient;

export type AlgoliaSearchHit = {
	objectID: string;
	anchor: string | null;
	content: string | null;
	hierarchy: {
		lvl0: string | null;
		lvl1: string | null;
		lvl2: string | null;
		lvl3: string | null;
		lvl4: string | null;
		lvl5: string | null;
		lvl6: string | null;
	};
	url: string;
};

export function algolia(
	node: HTMLInputElement,
	options: { app_id: string; api_key: string; index_name: string }
) {
	let algoliasearch: AlgoliaSearch | null = null;
	let client: SearchClient;
	let index: SearchIndex;
	let last_value = '';

	let debounce: ReturnType<typeof setTimeout> | null = null;

	function dispatch(hits: AlgoliaSearchHit[]) {
		node.dispatchEvent(new CustomEvent('hits', { detail: hits }));
	}

	function search(value: string) {
		return async () => {
			if (last_value === value) return;
			const { hits } = await index.search(value);
			dispatch(hits as AlgoliaSearchHit[]);
			last_value = value;
		};
	}

	async function init_algoliasearch() {
		const algolia_module = await import('algoliasearch/lite');
		algoliasearch = algolia_module.default as unknown as AlgoliaSearch;
		if (!algoliasearch) {
			throw new Error('Could not load algoliasearch');
		}
		client = algoliasearch(options.app_id, options.api_key);
		index = client.initIndex(options.index_name);
	}

	function on_focus() {
		if (!algoliasearch) init_algoliasearch();
	}

	function on_keyup(event: Event) {
		if (event.target instanceof HTMLInputElement) {
			if (debounce) clearTimeout(debounce);
			debounce = setTimeout(search(event.target.value), 500);
		}
	}

	node.addEventListener('focus', on_focus);
	node.addEventListener('keyup', on_keyup);

	return {
		destroy() {
			node.removeEventListener('focus', on_focus);
		}
	};
}
