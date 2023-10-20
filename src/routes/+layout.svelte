<script lang="ts">
	import { afterNavigate } from '$app/navigation';

	import '$lib/styles/theme.css';
	import '$lib/styles/main.css';
	import '$lib/styles/utility.css';
	import NavigationList from '$lib/components/navigation-list.svelte';
	import { is_large_screen, menu_state } from '$lib/app.js';

	import { browser } from '$app/environment';
	import NavigationNode from './navigation-node.svelte';
	import Menu from './menu.svelte';

	export let data;

	let should_transition = false;
	let menu_expanded = false;

	afterNavigate(() => {
		if ($menu_state !== 'inactive') menu_state.set('closed');
	});

	const toggle_menu = () => {
		if (!should_transition) should_transition = true;
		menu_state.set($menu_state === 'open' ? 'closed' : 'open');
	};

	$: menu_expanded = $menu_state === 'open';
</script>

<Menu {toggle_menu} />
<div class="layout">
	<nav
		id="wiki-articles"
		aria-labelledby={browser && !is_large_screen ? 'menu-button' : undefined}
		aria-hidden={browser && !$is_large_screen && !menu_expanded ? true : undefined}
		class:interactive={browser}
		class:transition={should_transition}
	>
		<NavigationList>
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
		background: var(--theme-bg-contrast);
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
