<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import '$lib/styles/theme.css';
	import '$lib/styles/main.css';
	import '$lib/styles/utility.css';
	import NavigationList from '$lib/components/navigation-list.svelte';
	import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
	import { is_large_screen, menu_expanded } from '$lib/app.js';
	import ButtonMenuToggle from '$lib/components/button-menu-toggle.svelte';
	import { browser } from '$app/environment';

	export let data;
	let direction: 'up' | 'down' = 'down';
	let menu_transition_delay_out = '0ms';

	afterNavigate(({ from, to }) => {
		let previous_id = from?.params?.slug ?? '';
		let current_id = to?.params?.slug ?? '';

		const prev_index = data.navigation_items.findIndex((item) => item.slug === previous_id);
		const current_index = data.navigation_items.findIndex((item) => item.slug === current_id);

		direction = prev_index > current_index ? 'up' : 'down';
	});
	/*
		Todo: stäm av med johan om detta är en bra lösning /fj
	*/
	const navigate_handler = () => {
		menu_transition_delay_out = '500ms';
		menu_expanded.set(false)();
	};

	const toggle_menu_handler = () => {
		menu_transition_delay_out = '0ms';
		menu_expanded.set(!$menu_expanded)();
	};
</script>

<div class="layout" style="--menu-transition-delay-out: {menu_transition_delay_out}">
	<nav
		id="wiki-articles"
		aria-labelledby="menu-button"
		aria-hidden={browser && !$is_large_screen && !$menu_expanded ? true : undefined}
		class:interactive={browser}
	>
		<NavigationList {direction}>
			{#each data.navigation_items as item, index}
				<li>
					<a
						href={`${index > 0 ? '/articles' : ''}/${item.slug}`}
						on:click={navigate_handler}
						aria-current={(!$page.params.slug && item.slug === '') ||
						$page.params.slug === item.slug
							? 'page'
							: undefined}>{item.title}</a
					>
				</li>
			{/each}
		</NavigationList>
	</nav>
	<menu class:interactive={browser}>
		<section>
			<a href="/" class="logo"><span class="visually-hidden">Home</span></a>
			<ButtonMenuToggle
				class={'button-menu-toggle'}
				on:click={toggle_menu_handler}
				open={$menu_expanded && browser}
			/>
			{#if browser}
				<ThemeSwitcher class={`theme-switcher${!$menu_expanded ? ' hidden' : ''}`} />
			{/if}
		</section>
	</menu>
	<main>
		<slot />
	</main>
</div>

<style>
	.layout {
		--menu-transition-delay-out: 0ms;
		display: flex;
		flex-direction: column;
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 var(--gutter-width);
		height: 100vh;
	}

	nav {
		position: static;
		background: var(--theme-bg);
		transform: translateX(0);
		border-right: 0.25rem solid var(--theme-panel);
		pointer-events: initial;
		transition: transform 300ms var(--ease-out);
		transition-delay: 0ms;
	}

	nav.interactive {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		z-index: 5;

		padding-top: 0;
	}

	nav[aria-hidden='true'] {
		transition: transform 150ms var(--ease);

		transition-delay: var(--menu-transition-delay-out);
		transform: translateX(-100%);
		pointer-events: none;
	}

	menu {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		margin: 0;
		padding: 0;
		background-color: var(--theme-panel);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		transition-property: background-color, width;
		transition-duration: var(--color-transition-duration), 380ms;
		transition-timing-function: var(--ease) var(--ease-out);
	}

	menu.interactive {
		position: fixed;
		bottom: var(--gutter-width);
		left: unset;
		right: unset;
		top: unset;
		z-index: 10;
		width: calc(100vw - var(--gutter-width) * 2);
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

	nav[aria-hidden='true'] + menu {
		width: 4.5rem;
		transition-duration: var(--color-transition-duration), 300ms;
		transition-delay: calc(var(--menu-transition-delay-out) + 50ms),
			calc(var(--menu-transition-delay-out) + 100ms);
		transition-timing-function: var(--ease), var(--ease-out);
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
		transition-delay: var(--menu-transition-delay-out);
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
			grid-template-rows: var(--header-height) auto;
			grid-template-areas:
				'menu menu'
				'nav main';
			gap: 0 calc(var(--gap-width) * 0.5);
		}

		nav,
		nav.interactive {
			position: static;
			top: var(--header-height);
			right: unset;
			left: unset;
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
			top: calc(var(--header-height));
		}

		menu,
		menu.interactive {
			top: 0;
			left: 0;
			right: 0;
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

		li:first-child {
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
