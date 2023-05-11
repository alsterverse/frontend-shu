<script lang="ts">
	let clazz = '';
	export { clazz as class };
	export let state: 'closed' | 'open' | 'inactive' = 'inactive';
</script>

<button on:click class={clazz}>
	<span class="block-a" class:on_a={state === 'open'} class:off_a={state === 'closed'} />
	<span class="block-b" class:on_b={state === 'open'} class:off_b={state === 'closed'} />
</button>

<style>
	button {
		--a-speed: 300ms;
		--a-speed-off: 320ms;
		--a-ease-on: var(--ease-in);
		--a-ease-off: var(--ease-in);
		--block-size: 0.75em;
		--block-size-double: calc(var(--block-size) * 2);

		all: unset;
		display: flex;
		align-items: end;
		position: relative;
	}

	button::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: var(--hitarea-size);
		height: var(--hitarea-size);
		transform: translate(-50%, -50%);
	}

	span {
		display: block;
		width: var(--block-size);
		background: var(--theme-fg);
	}

	.block-a {
		height: var(--block-size);
		transform: rotate(22deg) translate(-18%, 0) scale(1, 1);
	}

	.block-b {
		height: var(--block-size-double);
		transform: rotate(-22deg) translate(-4%, 0);
	}

	.on_a {
		animation: toggle_on_a var(--a-speed) var(--a-ease-on) forwards;
	}

	.off_a {
		animation: toggle_off_a var(--a-speed-off) var(--a-ease-off) forwards;
	}

	.on_b {
		animation: toggle_on_b var(--a-speed) var(--a-ease-on) forwards;
	}

	.off_b {
		animation: toggle_off_b var(--a-speed-off) var(--a-ease-off) forwards;
	}

	@keyframes toggle_on_a {
		0% {
			transform: rotate(22deg) scale(1, 1);
		}
		20% {
			transform: rotate(45deg) translate(0, 0) scale(1, 1);
		}
		50% {
			transform: rotate(45deg) translate(0, -75%) scale(1, 2);
		}
		100% {
			transform: rotate(45deg) translate(0, -75%) scale(0.35, 2);
		}
	}

	@keyframes toggle_off_a {
		0% {
			transform: rotate(45deg) translate(0, -75%) scale(0.35, 2);
		}
		60% {
			transform: rotate(45deg) translate(0, -75%) scale(0.35, 2);
		}
		80% {
			transform: rotate(45deg) translate(0, 0) scale(1, 1);
		}
		100% {
			transform: rotate(22deg) translate(-18%, 0) scale(1, 1);
		}
	}

	@keyframes toggle_on_b {
		0% {
			transform: rotate(-22deg);
		}
		20% {
			transform: rotate(-45deg) translate(0, 0) scaleX(1);
		}
		50% {
			transform: rotate(-45deg) translate(-30%, -18%) scaleX(1);
		}
		100% {
			transform: rotate(-45deg) translate(-30%, -18%) scaleX(0.35);
		}
	}

	@keyframes toggle_off_b {
		0% {
			transform: rotate(-45deg) translate(-30%, -18%) scaleX(0.35);
		}
		60% {
			transform: rotate(-45deg) translate(-30%, -18%) scaleX(0.35);
		}
		80% {
			transform: rotate(-45deg) translate(0, 0) scaleX(1);
		}
		100% {
			transform: rotate(-22deg) translate(-4%, 0);
		}
	}
</style>
