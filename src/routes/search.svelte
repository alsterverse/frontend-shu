<script lang="ts">
	import { algolia, type AlgoliaSearchHit } from '$lib/actions/algolia';
	import {
		PUBLIC_ALGOLIA_API_KEY,
		PUBLIC_ALGOLIA_APP_ID,
		PUBLIC_ALGOLIA_INDEX
	} from '$env/static/public';

	let hits: AlgoliaSearchHit[] = [
		{
			anchor: 'introduction',
			objectID: '1',
			hierarchy: {
				lvl0: 'Getting Started',
				lvl1: 'Introduction',
				lvl2: null,
				lvl3: null,
				lvl4: null,
				lvl5: null,
				lvl6: null
			},
			url: '/getting-started/introduction',
			content: '<p>Introduction to SvelteKit</p>'
		},
		{
			anchor: 'introduction',
			objectID: '1',
			hierarchy: {
				lvl0: 'Getting Started',
				lvl1: 'Introduction',
				lvl2: null,
				lvl3: null,
				lvl4: null,
				lvl5: null,
				lvl6: null
			},
			url: '/getting-started/introduction',
			content: '<p>Introduction to SvelteKit</p>'
		},
		{
			anchor: 'introduction',
			objectID: '1',
			hierarchy: {
				lvl0: 'Getting Started',
				lvl1: 'Introduction',
				lvl2: null,
				lvl3: null,
				lvl4: null,
				lvl5: null,
				lvl6: null
			},
			url: '/getting-started/introduction',
			content: '<p>Introduction to SvelteKit</p>'
		}
	];

	const algolia_options = {
		app_id: PUBLIC_ALGOLIA_APP_ID,
		api_key: PUBLIC_ALGOLIA_API_KEY,
		index_name: PUBLIC_ALGOLIA_INDEX
	};

	const get_title = (hierarchy: Record<string, string | null>) => {
		const filtered_hierarchy = Object.values(hierarchy).filter((value) => value !== null);
		const title = filtered_hierarchy.pop();
		const breadcrumb = `${filtered_hierarchy.join(' › ')} ›`;

		return { title, breadcrumb };
	};

	const on_hits = (event: CustomEvent<AlgoliaSearchHit[]>) => {
		hits = event.detail;
	};

	const on_pending = (event: CustomEvent<boolean>) => {
		console.log('pending', event.detail);
	};
</script>

<form>
	<div>
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
		/>
		<button>Search</button>
	</div>
	<span id="search-description" class="visually-hidden">Results will update as you type</span>
	<ul aria-hidden={hits.length ? undefined : true}>
		{#each hits as hit}
			{@const { title, breadcrumb } = get_title(hit.hierarchy)}
			<li class="hit">
				<span>{breadcrumb}</span>
				<h2><a href={hit.url}>{title}</a></h2>
				{#if hit.content}
					{@html hit.content}
				{/if}
			</li>
		{/each}
	</ul>
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

	div {
		display: flex;
		align-items: center;
		height: var(--header-height);
		width: 50%;
	}

	form:focus-within div {
		width: 100%;
		height: auto;
		padding: 1.5rem 1.5rem 0;
	}

	ul {
		display: none;
		padding: 0;
		margin: 0;
		list-style: none;
		width: 100%;
	}

	form:focus-within ul {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 1.5rem;
		padding: 0 1.5rem 1.5rem 0;
	}
	form:focus-within ul[aria-hidden='true'] {
		display: none;
	}

	li {
		padding: 0.5rem 0 0.5rem 1.75rem;
	}

	li:hover {
	}

	span,
	form :global(p) {
		color: var(--theme-body);
	}

	span {
		font-size: 0.625rem;
	}

	form :global(p) {
		font-size: 0.75rem;
		margin-top: 0.3rem;
	}

	h2 {
		margin: 0;
		font-size: 0.875rem;
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
