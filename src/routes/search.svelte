<script lang="ts">
	import { algolia, type AlgoliaSearchHit } from '$lib/actions/algolia';
	import {
		PUBLIC_ALGOLIA_API_KEY,
		PUBLIC_ALGOLIA_APP_ID,
		PUBLIC_ALGOLIA_INDEX
	} from '$env/static/public';
	import { clamp } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { keepSelectedInView } from '$lib/actions/keep-selected-in-view';
	import { direction } from '$lib/actions/direction';
	import { overflow } from '$lib/actions/overflow';

	let hits: AlgoliaSearchHit[] = [];

	const algolia_options = {
		appID: PUBLIC_ALGOLIA_APP_ID,
		apiKey: PUBLIC_ALGOLIA_API_KEY,
		indexName: PUBLIC_ALGOLIA_INDEX,
		debounceMs: 500
	};

	let active_hit_index = 0;

	function on_hits(event: CustomEvent<AlgoliaSearchHit[]>) {
		hits = event.detail;
	}

	function on_pending(event: CustomEvent<boolean>) {
		console.log('pending', event.detail);
	}

	function on_keydown(event: KeyboardEvent) {
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
</script>

<form>
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
		/>
		<button>Search</button>
	</div>
	<span id="search-description" class="visually-hidden">Results will update as you type</span>
	<div use:overflow aria-hidden={hits.length ? undefined : true}>
		{#if hits.length}
			<ul on:mouseleave={reset} use:keepSelectedInView use:direction>
				{#each hits as hit, index}
					{@const breadcrumbs = Object.values(hit.hierarchy).filter((value) => value !== null)}
					{@const title = breadcrumbs.pop()}
					{@const url = new URL(hit.url)}
					<li aria-selected={active_hit_index === index} role="option">
						<a class="indicator hover" href={url.pathname}>
							{#if breadcrumbs.length > 0}
								<ol>
									{#each breadcrumbs as breadcrumb}
										<li>{breadcrumb}</li>
									{/each}
								</ol>
							{/if}
							<h2>{title}</h2>
							{#if hit.content}
								<p>{@html hit.content}</p>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		border-radius: 1rem;
		width: 28rem;
		padding: 0;
		transition: transform 100ms ease-out, background-color 100ms ease-out;
		min-height: var(--header-height);
	}

	form:focus-within {
		background-color: var(--theme-card);
		transform: translateY(1.5rem);
		box-shadow: 0px 12px 60px rgba(0, 0, 0, 0.55), 0px 4px 4px rgba(0, 0, 0, 0.2);
	}

	.filter {
		display: flex;
		align-items: center;
		height: var(--header-height);
		width: 50%;
	}

	form:focus-within .filter {
		width: 100%;
		height: auto;
		padding: 1.5rem;
	}

	ul {
		display: none;
		padding: 0;
		margin: 0;
		list-style: none;
		width: 100%;
		max-height: min(26rem, 50vh);
		overflow: auto;
	}

	form:focus-within ul {
		display: flex;
		flex-direction: column;
		padding-bottom: 2.5rem;
	}

	li {
		scroll-margin: 2rem 0;
	}

	a {
		display: flex;
		flex-direction: column;
		color: inherit;
		text-decoration: none;
		padding: 0.5rem 2.5rem 0.5rem 2.5rem;
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
		font-size: 0.75rem;
		padding-right: 2.5rem;
		line-height: 1;
		margin: 0;
		padding: 0;
	}

	ol li {
		display: flex;
		align-items: center;
		column-gap: 0.25rem;
	}

	ol li:after {
		content: '›';
		font-size: 1rem;
		font-weight: 500;
		line-height: inherit;
	}

	form :global(p) {
		font-size: 0.875rem;
		margin-top: 0.25rem;
	}

	h2 {
		margin: 0.125rem 0 0;
		font-size: 1rem;
		color: var(--theme-fg);
	}

	input {
		border: none;
		border-radius: 1rem;
		background-color: var(--theme-track);
		color: var(--theme-text);
		font-size: 0.75rem;
		height: 1.5rem;
		width: 100%;
		padding: 0 1rem;
		transition: all 100ms ease-out;
	}

	button {
		display: none;
	}

	input:hover,
	input:focus-within {
		font-size: 0.875rem;
		border-radius: 0.5rem;
		height: 2.5rem;
	}

	input:focus-within {
		outline: none;
	}
</style>
