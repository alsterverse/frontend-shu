<script lang="ts">
	import { menu_state, is_large_screen, theme } from '$lib/app';
	import { browser } from '$app/environment';
	import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
	import ButtonMenuToggle from '$lib/components/button-menu-toggle.svelte';
	import Search from './search.svelte';
	import { fade } from 'svelte/transition';

	export let toggle_menu = () => {};
	let site_search_visibility_mobile: 'visible' | 'hidden' = 'hidden';
	const set_site_search_visibility = (visibility: 'visible' | 'hidden') => {
		return () => (site_search_visibility_mobile = visibility);
	};

	function on_search_close() {
		site_search_visibility_mobile = 'hidden';
	}

	$: menu_expanded = $menu_state === 'open';
</script>

{#if browser && !$is_large_screen}
	<div
		in:fade
		class="site-search-modal"
		class:site-search-visible={site_search_visibility_mobile === 'visible'}
	>
		<Search
			context="device"
			focus={site_search_visibility_mobile === 'visible'}
			on:search_close={on_search_close}
		/>
	</div>
{/if}
<menu
	class:interactive={browser}
	class:contracted={browser && !menu_expanded}
	class:site-search-visible={site_search_visibility_mobile === 'visible'}
>
	<section>
		<a href="/" class="logo"><span class="visually-hidden">Home</span></a>
		<ButtonMenuToggle class={'button-menu-toggle'} on:click={toggle_menu} state={$menu_state} />
		{#if browser && $is_large_screen}
			<div in:fade class="site-search">
				<Search />
			</div>
			<ThemeSwitcher class={`theme-switcher${!menu_expanded ? ' hidden' : ''}`} />
		{/if}

		{#if browser && !$is_large_screen}
			<div class="actions">
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<button class="theme" on:click={theme.toggle}><span />Theme</button>
				<button class="search" on:click={set_site_search_visibility('visible')}
					><span />Search</button
				>
			</div>
		{/if}
	</section>
</menu>

<style>
	.site-search-modal {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		width: 100%;

		z-index: 100;
	}

	.site-search-visible.site-search-modal {
		display: unset;
		height: 100%;
	}

	menu {
		--icon-theme: url(/icons/lightbulb_inverted.svg);
		--icon-search: url(/icons/search_inverted.svg);
		--menu-action-bar-bg: hsla(0, 0%, 100%, 0.05);

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
		transition-duration: var(--color-transition-duration), 280ms;
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

	menu.site-search-visible {
		/* top: 0;
		left: 0;
		right: 0;
        width: 100%; */
	}

	menu.contracted {
		width: 4.5rem;
		transition-duration: var(--color-transition-duration), 300ms;
		transition-delay: 50ms, 50ms;
		transition-timing-function: var(--ease), var(--ease-out);
	}

	section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 0 0 1.5rem;
		height: 4rem;
		gap: 1.5rem;
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

	.site-search {
		display: none;
		position: fixed;
		max-width: 100%;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.site-search-visible .site-search {
		display: unset;
	}

	@media (prefers-color-scheme: dark) {
		.logo {
			--logo: url('/logo-alster_inverted.svg');
		}
	}
	:global(.dark) .logo {
		--logo: url('/logo-alster_inverted.svg');
	}

	:global(.light) menu {
		--menu-action-bar-bg: hsla(0, 0%, 100%, 0.3);
	}

	.actions {
		display: flex;
		flex-direction: row;
		flex: 1;
		justify-content: flex-end;
		height: 100%;
		gap: 3rem;
		padding: 0 1.5rem;
		background: var(--menu-action-bar-bg);
		box-shadow: inset -15px 0 10px -10px hsla(0, 0%, 0%, 0.02);

		transition-property: transform, opacity;
		transition-duration: 400ms, 400ms;
		transition-delay: 100ms, 50ms;
		transition-timing-function: var(--ease-out), ease-in;
		transform-origin: right;
	}

	menu.contracted .actions {
		transform: scaleX(0);
		transition-duration: 0ms, 0ms;
		transition-delay: 0ms, 0ms;
		opacity: 0;
	}

	.actions button {
		all: unset;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		padding-top: 2px;
		font-size: 0.625rem;
		font-weight: 300;

		transition-property: transform, opacity;
		transition-duration: 200ms, 500ms;
		transition-delay: 350ms, 350ms;
		transition-timing-function: ease-out;
	}

	button span {
		transition-property: transform, opacity;
		transition-duration: 200ms, 500ms;
		transition-delay: 350ms, 350ms;
		transition-timing-function: ease-out;

		-webkit-tap-highlight-color: transparent;
	}

	button span::before {
		content: '';
		display: block;
		height: 1.25rem;
		width: 1.25rem;
		background-repeat: no-repeat;
		background-size: cover;
	}

	:global(.light) .theme span::before {
		--icon-theme: url(/icons/lightbulb.svg);
	}
	button.theme span::before {
		background-image: var(--icon-theme);
	}

	:global(.light) .search span::before {
		--icon-search: url(/icons/search.svg);
	}
	button.search span::before {
		background-image: var(--icon-search);
	}

	button.theme span {
		transition-delay: 440ms, 440ms;
	}

	menu.contracted button {
		opacity: 0;
		transform: translateY(6px);
		transition-delay: 0ms;
		transition-duration: 0ms, 0ms;
	}

	menu.contracted span {
		opacity: 0;
		transform: translateY(-10px);
		transition-delay: 0ms;
		transition-duration: 0ms, 0ms;
	}

	@media (min-width: 55em) {
		:global(.light) menu,
		menu {
			--menu-action-bar-bg: none;
		}

		menu,
		menu.interactive {
			position: sticky;
			opacity: 1;
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

		menu.contracted button,
		menu.contracted button span,
		menu.contracted .actions {
			opacity: 1;
			transform: translate(0, 0);
		}

		menu.contracted .actions {
			transform: scaleX(1);
		}

		section {
			padding: 0 1.5rem;
		}

		.actions {
			flex: none;
		}
		.actions .search {
			display: none;
		}

		.logo {
			display: initial;
		}

		.site-search {
			display: initial;
			position: initial;
			align-self: flex-start;
		}
	}
</style>
