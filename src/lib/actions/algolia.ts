import type { default as AlgoliaSearch, SearchClient, SearchIndex } from 'algoliasearch/lite';

export type AlgoliaHit = {
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

type AlgoliaHitHiglight = AlgoliaHit & {
	hierarchy: {
		lvl0: { value: string | null };
		lvl1: { value: string | null };
		lvl2: { value: string | null };
		lvl3: { value: string | null };
		lvl4: { value: string | null };
		lvl5: { value: string | null };
		lvl6: { value: string | null };
	};
	content: { value: string | null };
};

export type AlgoliaSearchHit = AlgoliaHit & {
	_highlightResult: AlgoliaHitHiglight;
};

function hit_event(hits: AlgoliaSearchHit[]) {
	return new CustomEvent('hits', { detail: hits });
}

function pending_event(pending: boolean) {
	return new CustomEvent('pending', { detail: pending });
}

async function load_algolia() {
	const algolia_module = await import('algoliasearch/lite');
	return algolia_module.default as unknown as typeof AlgoliaSearch;
}

type AlgoliaActionOptions = {
	appID: string;
	apiKey: string;
	indexName: string;
	debounceMs?: number;
};

export function algolia(node: HTMLInputElement, options: AlgoliaActionOptions) {
	let algoliasearch: typeof AlgoliaSearch | null = null;
	let client: SearchClient | null = null;
	let index: SearchIndex | null = null;
	let last_value = '';

	let debounce_ms = options.debounceMs ?? 0;
	let debounce: ReturnType<typeof setTimeout> | null = null;

	function search(value: string) {
		return async () => {
			const { hits } = (await index?.search(value, {
				attributesToHighlight: ['content', 'hierarchy'],
				highlightPreTag: '<em class="search-highlight">',
				highlightPostTag: '</em>'
			})) ?? { hits: [] };
			node.dispatchEvent(pending_event(false));
			node.dispatchEvent(hit_event(hits as AlgoliaSearchHit[]));
			last_value = value;
		};
	}

	async function init_algoliasearch(app_id: string, api_key: string, index_name: string) {
		if (!algoliasearch) algoliasearch = await load_algolia();
		client = algoliasearch(app_id, api_key);
		index = client.initIndex(index_name);
	}

	function on_focus() {
		if (!algoliasearch) init_algoliasearch(options.appID, options.apiKey, options.indexName);
	}

	function on_keyup(event: KeyboardEvent) {
		if (event.target instanceof HTMLInputElement) {
			if (debounce) clearTimeout(debounce);
			if (last_value === event.target.value) return;
			node.dispatchEvent(pending_event(true));
			debounce = setTimeout(search(event.target.value), debounce_ms);
		}
	}

	node.addEventListener('focus', on_focus);
	node.addEventListener('keyup', on_keyup);

	return {
		update(options: AlgoliaActionOptions) {
			debounce_ms = options.debounceMs ?? 0;
			init_algoliasearch(options.appID, options.apiKey, options.indexName);
		},
		destroy() {
			node.removeEventListener('focus', on_focus);
			node.removeEventListener('keyup', on_keyup);
			algoliasearch = null;
			client = null;
			index = null;
		}
	};
}
