<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import '$lib/styles/theme.css';
	import '$lib/styles/main.css';
	import '$lib/styles/utility.css';
	import NavigationList from '$lib/components/navigation-list.svelte';
	import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
	import { is_large_screen, menu_state } from '$lib/app.js';
	import ButtonMenuToggle from '$lib/components/button-menu-toggle.svelte';
	import { browser } from '$app/environment';
	import NavigationNode from './navigation-node.svelte';
	import { algolia, type AlgoliaSearchHit } from '$lib/actions/algolia';
	import {
		PUBLIC_ALGOLIA_API_KEY,
		PUBLIC_ALGOLIA_APP_ID,
		PUBLIC_ALGOLIA_INDEX
	} from '$env/static/public';

	export let data;

	const algolia_options = {
		app_id: PUBLIC_ALGOLIA_APP_ID,
		api_key: PUBLIC_ALGOLIA_API_KEY,
		index_name: PUBLIC_ALGOLIA_INDEX
	};

	let direction: 'up' | 'down' = 'down';
	let should_transition = false;
	let menu_expanded = false;

	afterNavigate(({ from, to }) => {
		const prev_index = data.nodes.findIndex((item) => item.slug === from?.params?.slug ?? '');
		const current_index = data.nodes.findIndex((item) => item.slug === to?.params?.slug ?? '');

		direction = prev_index > current_index ? 'up' : 'down';
		if ($menu_state !== 'inactive') menu_state.set('closed');
	});

	const toggle_menu = () => {
		if (!should_transition) should_transition = true;
		menu_state.set($menu_state === 'open' ? 'closed' : 'open');
	};

	const on_hits = (event: CustomEvent<AlgoliaSearchHit>) => {
		console.log(event.detail);
	};

	const on_pending = (event: CustomEvent<boolean>) => {
		console.log('pending', event.detail);
	};

	$: menu_expanded = $menu_state === 'open';
</script>

<menu class:interactive={browser} class:contracted={browser && !menu_expanded}>
	<section>
		<a href="/" class="logo"><span class="visually-hidden">Home</span></a>
		<form>
			<input
				use:algolia={algolia_options}
				on:hits={on_hits}
				on:pending={on_pending}
				type="search"
				placeholder="Search"
			/>
		</form>
		<ButtonMenuToggle class={'button-menu-toggle'} on:click={toggle_menu} state={$menu_state} />
		{#if browser}
			<ThemeSwitcher class={`theme-switcher${!menu_expanded ? ' hidden' : ''}`} />
		{/if}
	</section>
</menu>
<div class="layout">
	<nav
		id="wiki-articles"
		aria-labelledby={browser && !is_large_screen ? 'menu-button' : undefined}
		aria-hidden={browser && !$is_large_screen && !menu_expanded ? true : undefined}
		class:interactive={browser}
		class:transition={should_transition}
	>
		<NavigationList {direction}>
			{#each data.nodes.filter((node) => node.slug.split('/').length === 1) as node}
				<NavigationNode {node} nodes={data.nodes} />
			{/each}
		</NavigationList>
	</nav>
	<main>
		<slot />
	</main>
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 var(--gutter-width);
	}

	nav {
		position: relative;
		background: var(--theme-bg);
		transform: translateX(0);
		border-right: 0.25rem solid var(--theme-panel);
		pointer-events: initial;
		z-index: 5;
	}

	nav.transition {
		transition: transform 300ms var(--ease-out);
		transition-delay: 0ms;
	}

	nav.interactive {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		padding-top: 0;
	}

	nav.interactive :global(> div > ul) {
		padding-bottom: calc((2 * var(--header-height)));
		padding-top: var(--top-gutter);
	}

	nav[aria-hidden='true'] {
		transform: translateX(-100%);
		pointer-events: none;
	}

	nav[aria-hidden='true'].transition {
		transition: transform 150ms var(--ease);
	}

	menu {
		position: sticky;
		z-index: 10;
		top: 0;
		bottom: 0;
		margin: 0;
		padding: 0;
		opacity: 0;
		background-color: var(--theme-panel);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		transition-property: background-color, width, opacity;
		transition-duration: var(--color-transition-duration), 380ms;
		transition-timing-function: var(--ease) var(--ease-out);
		will-change: width;
	}

	menu.interactive {
		position: fixed;
		bottom: var(--gutter-width);
		left: var(--gutter-width);
		right: var(--gutter-width);
		top: unset;
		opacity: 1;
		width: calc(100% - var(--gutter-width) * 2);
	}

	menu.contracted {
		width: 4.5rem;
		transition-duration: var(--color-transition-duration), 300ms;
		transition-delay: 50ms, 100ms;
		transition-timing-function: var(--ease), var(--ease-out);
	}

	section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 1.5rem;
		height: 4rem;
	}

	menu :global(.theme-switcher) {
		transform: translateY(0rem);
		opacity: 1;

		transition-property: opacity, transform;
		transition-duration: 100ms, 100ms;
		transition-timing-function: var(--ease) var(--ease);
		transition-delay: 450ms, 500ms;
	}

	menu :global(.theme-switcher.hidden) {
		opacity: 0;
		transform: translateY(0.125rem);
		pointer-events: none;
		transition-delay: 0ms, 0ms;
	}

	.logo {
		display: none;
		width: 1.8125rem;
		height: 1.5rem;
		background-image: var(--logo);
	}

	.logo,
	:global(.light) .logo {
		--logo: url('/logo-alster.svg');
	}
	@media (prefers-color-scheme: dark) {
		.logo {
			--logo: url('/logo-alster_inverted.svg');
		}
	}
	:global(.dark) .logo {
		--logo: url('/logo-alster_inverted.svg');
	}

	main {
		padding-top: var(--top-gutter);
		padding-bottom: 7rem;
	}

	@media (min-width: 55em) {
		.layout {
			display: grid;
			grid-template-columns: var(--aside-width) auto;
			grid-template-areas:
				'menu menu'
				'nav main';
			gap: 0 calc(var(--gap-width) * 0.5);
		}

		nav,
		nav.interactive {
			position: static;
			grid-area: nav;
			pointer-events: initial;
			transition: none;
			transform: none;
			max-width: var(--aside-width);
			background: unset;
			margin-top: 0;
		}

		nav :global(> div) {
			position: sticky;
			top: var(--header-height);
			max-height: calc(100vh - var(--header-height));
		}

		nav :global(> div > ul),
		nav.interactive :global(> div > ul) {
			min-height: calc(100vh - var(--header-height));
			padding-bottom: calc((2 * var(--header-height)));
			padding-top: var(--top-gutter);
		}

		menu,
		menu.interactive {
			opacity: 1;
			position: sticky;
			top: 0;
			bottom: unset;
			grid-area: menu;
			width: auto;
		}

		menu :global(.button-menu-toggle) {
			display: none;
		}

		menu :global(.theme-switcher),
		menu :global(.theme-switcher.hidden) {
			opacity: 1;
			pointer-events: all;
		}

		.logo {
			display: initial;
		}

		nav :global(> div > ul > li:first-child) {
			font-size: 1.25rem;
		}

		main {
			grid-area: main;
		}
	}

	@media (min-width: 73rem) {
		.layout {
			gap: 0 var(--gap-width);
		}
	}
</style>
