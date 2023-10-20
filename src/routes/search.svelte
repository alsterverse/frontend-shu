<script lang="ts">
	import { algolia, type AlgoliaSearchHit } from '$lib/actions/algolia';
	import {
		PUBLIC_ALGOLIA_API_KEY,
		PUBLIC_ALGOLIA_APP_ID,
		PUBLIC_ALGOLIA_INDEX
	} from '$env/static/public';
	import { clamp } from '$lib/utils';
	import { afterNavigate, goto } from '$app/navigation';
	import { keepSelectedInView } from '$lib/actions/keep-selected-in-view';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { is_large_screen } from '$lib/app';

	import { direction } from '$lib/actions/direction';
	import { overflow } from '$lib/actions/overflow';
	import LoaderBounce from '$lib/components/loader-bounce.svelte';
	import { virtualKeyboardDetector } from '$lib/actions/visual-viewport-resize';

	export let focus = false;
	export let context: '' | 'device' = '';

	let loading = false;
	let search_input: HTMLInputElement;
	let hits: AlgoliaSearchHit[] = [];

	const dispatch = createEventDispatcher();

	const algolia_options = {
		appID: PUBLIC_ALGOLIA_APP_ID,
		apiKey: PUBLIC_ALGOLIA_API_KEY,
		indexName: PUBLIC_ALGOLIA_INDEX,
		debounceMs: 500
	};

	let active_hit_index = 0;

	function on_hits(event: CustomEvent<AlgoliaSearchHit[]>) {
		loading = false;
		hits = event.detail;
	}

	function on_pending(event: CustomEvent<boolean>) {
		loading = true;
		console.log('pending', event.detail);
	}

	function on_keydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			blur_search();
			return;
		}
		if (!hits.length) return;
		if (event.key === 'Enter') {
			event.preventDefault();
			goto(new URL(hits[active_hit_index].url));
		} else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			event.preventDefault();
			active_hit_index = clamp(
				active_hit_index + (event.key === 'ArrowUp' ? -1 : 1),
				0,
				hits.length - 1
			);
		}
	}

	function reset() {
		active_hit_index = 0;
	}

	function focus_input(event?: MouseEvent) {
		search_input.focus();
	}

	function blur_search(event?: MouseEvent) {
		if (document.activeElement) {
			(document.activeElement as HTMLElement).blur();
		}
		window.focus();
		dispatch('uisearchclose');
	}

	function handle_icon() {
		if (focus || context !== 'device') {
			focus_input();
		} else {
			blur_search();
		}
	}

	const handle_virtualkeyboard = (event: CustomEvent<{ direction: 'open' | 'close' }>) => {
		if (event.detail.direction === 'close') {
			blur_search();
		}
	};

	afterNavigate(() => {
		blur_search();
	});

	$: {
		if (focus === true) {
			focus_input();
			focus = false;
		}
	}
</script>

<form use:virtualKeyboardDetector on:virtualkeyboard={handle_virtualkeyboard}>
	<div class="filter">
		<input
			use:algolia={algolia_options}
			on:hits={on_hits}
			on:pending={on_pending}
			type="search"
			placeholder="Search"
			spellcheck="false"
			autocapitalize="off"
			autocorrect="off"
			autocomplete="off"
			aria-labelledby="search-description"
			on:keydown={on_keydown}
			bind:this={search_input}
		/>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<span class="icon" on:click={handle_icon} aria-label="Search" />
		<button>Search</button>
		<LoaderBounce class={`loader${!loading ? ' hidden' : ''}`} />
	</div>
	<span id="search-description" class="visually-hidden">Results will update as you type</span>
	<div class="result" use:overflow aria-hidden={hits.length ? undefined : true}>
		{#if hits.length}
			<ul on:mouseleave={reset} use:keepSelectedInView use:direction>
				{#each hits as hit, index}
					{@const result = hit._highlightResult}
					{@const breadcrumbs = Object.values(result.hierarchy).filter((value) => value !== null)}
					{@const title = breadcrumbs.pop()?.value}
					{@const url = new URL(hit.url)}
					<li aria-selected={active_hit_index === index} role="option">
						<a class="indicator hover" href={url.pathname}>
							{#if breadcrumbs.length > 0}
								<ol>
									{#each breadcrumbs as breadcrumb}
										<li>{@html breadcrumb.value}</li>
									{/each}
								</ol>
							{/if}
							<h2>{@html title}</h2>
							{#if result.content?.value}
								<p>{@html result.content.value}</p>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</form>

<style>
	form :global(.search-highlight) {
		background-color: var(--theme-accent);
		color: var(--theme-fg);
		padding: 0.25rem 0.125rem;
		font-weight: 500;
		letter-spacing: 0.06rem;
		font-style: normal;
	}

	:global(.light) form :global(.search-highlight) {
		color: var(--theme-bg);
	}

	form :global(.loader) {
		position: absolute;
		bottom: 2rem;
		right: 4rem;
		transform: translate(-50%, -0.25rem);
		opacity: 1;
		transition: opacity 300ms ease-in, transform 100ms ease-in;
	}

	form :global(.loader.hidden) {
		opacity: 0;
	}

	form:not(:focus-within) :global(.loader) {
		transform: translate(-0.25rem, 0.4rem);
	}

	form {
		--divider-color: var(--theme-track);
		--bg: var(--theme-card);
		--input-bg: var(--theme-track);

		display: flex;
		flex-direction: column;
		align-items: center;
		width: auto;
		height: 100%;
		padding: 0;
		background-color: var(--bg);
	}

	form:focus-within {
		--input-bg: var(--theme-bg);
	}

	:global(.light) form {
		--divider-color: var(--theme-stroke);
		--bg: var(--theme-bg-contrast);
		--input-bg: var(--theme-track);
	}
	:global(.light) form:focus-within {
		--input-bg: var(--theme-stroke);
	}

	.filter {
		position: relative;
		display: flex;
		align-items: center;
		gap: 1rem;
		height: var(--header-height);
		width: 100%;
		padding: 1.5rem;
		height: auto;
	}

	.result {
		width: 100%;
	}

	ul {
		padding: 0;
		margin: 0;
		list-style: none;
		width: 100%;
		height: 100%;
		overflow: auto;
		display: none;
	}

	form:focus-within ul {
		display: flex;
		flex-direction: column;
		padding-bottom: 2.5rem;
	}

	li {
		scroll-margin: 2rem 0;
	}

	ul > li {
		border-top: 0.25rem solid var(--divider-color);
	}

	ul > li:first-child {
		border: none;
	}

	a {
		display: flex;
		flex-direction: column;
		color: inherit;
		text-decoration: none;
		padding: 1.5rem 2rem;
	}

	ol,
	form :global(p) {
		color: var(--theme-body);
	}

	ol {
		list-style: none;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		column-gap: 0.25rem;
		font-size: 0.688rem;
		line-height: 1;
		margin: 0;
		padding: 0;
	}

	ol li {
		display: flex;
		align-items: center;
		column-gap: 0.125rem;
		opacity: 0.6;
	}

	ol li:after {
		content: '/';
		font-size: 0.75rem;
		font-weight: 500;
		line-height: inherit;
	}

	form :global(p) {
		font-size: 0.813rem;
		margin-top: 0.5rem;
	}

	h2 {
		margin: 0.25rem 0 0;
		font-size: 1.25rem;
		color: var(--theme-fg);
	}

	input {
		border: none;
		border-radius: 1rem;
		background-color: var(--input-bg);
		color: var(--theme-text);
		font-size: 1rem;
		width: 100%;
		height: 2.5rem;
		padding: 0 1rem;
		opacity: 0.5;
	}

	form:focus-within input {
		opacity: 1;
	}

	button {
		display: none;
	}

	.icon {
		--icon-input: url(/icons/search_inverted.svg);
		cursor: pointer;
	}

	:global(.light) .icon {
		--icon-input: url(/icons/search.svg);
	}

	form:focus-within .icon {
		--icon-input: url(/icons/cancel_inverted.svg);
	}

	:global(.light) form:focus-within .icon {
		--icon-input: url(/icons/cancel.svg);
	}

	.icon::after {
		content: '';
		display: block;
		height: 1.25rem;
		width: 1.25rem;
		background-repeat: no-repeat;
		background-size: cover;
		background-image: var(--icon-input);
	}

	input:focus-within {
		outline: none;
	}

	@media (min-width: 55em) {
		form :global(.loader) {
			transform: translate(-50%, -0.25rem);
		}
		form {
			border-radius: 1rem;
			transition: transform 100ms ease-out, background-color 100ms ease-out;
			min-height: var(--header-height);
			width: 38rem;
			background: none;
		}

		form:focus-within {
			background-color: var(--bg);
			transform: translateY(1.5rem);
			box-shadow: 0px 12px 60px rgba(0, 0, 0, 0.55), 0px 4px 4px rgba(0, 0, 0, 0.2);
		}

		.filter {
			display: flex;
			align-items: center;
			height: var(--header-height);
			width: 60%;
		}

		form:focus-within .filter {
			width: 100%;
			height: auto;
			padding: 1.5rem;
		}

		ul {
			max-height: min(46rem, 60vh);
		}

		input {
			font-size: 0.75rem;
			height: 1.5rem;
			transition: all 100ms ease-out;
		}

		form:hover input,
		form:focus-within input {
			font-size: 0.875rem;
			border-radius: 0.5rem;
			height: 2.5rem;
		}

		.icon {
			transition-property: background-color;
			transition-duration: 200ms;
			transition-timing-function: ease-in-out;
		}

		.icon::after {
			height: 1rem;
			width: 1rem;
		}

		.icon:hover {
			background-color: var(--theme-accent);
		}
	}
</style>
