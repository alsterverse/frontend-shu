// See https://kit.svelte.dev/docs/types#app

import type { AlgoliaSearchHit } from '$lib/actions/algolia';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
	namespace svelteHTML {
		interface HTMLAttributes<T> {
			'on:activesection'?: (
				event: CustomEvent<{ active: string; direction: 'up' | 'down'; anchored: boolean }>
			) => void;
			'on:startoverflowratio'?: (event: CustomEvent<number>) => void;
			'on:endoverflowratio'?: (event: CustomEvent<number>) => void;
			'on:hits'?: (event: CustomEvent<AlgoliaSearchHit>) => void;
			'on:pending'?: (event: CustomEvent<boolean>) => void;
		}
		interface DOMAttributes<T> {
			'on:activesection'?: (
				event: CustomEvent<{ active: string; direction: 'up' | 'down'; anchored: boolean }>
			) => void;
			'on:startoverflowratio'?: (event: CustomEvent<number>) => void;
			'on:endoverflowratio'?: (event: CustomEvent<number>) => void;
			'on:hits'?: (event: CustomEvent<AlgoliaSearchHit>) => void;
			'on:pending'?: (event: CustomEvent<boolean>) => void;
		}
	}
}

export {};
