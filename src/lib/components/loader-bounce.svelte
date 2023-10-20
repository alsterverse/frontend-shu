<script lang="ts">
	let clazz = '';
	export { clazz as class };
</script>

<div class={clazz}>
	<span class="loader-container">
		<span />
		<span />
		<span />
	</span>
</div>

<style>
	.loader-container {
		--color: var(--theme-fg);
		--size-square: 0.25rem;
		--duration: 1024ms;

		display: flex;
		justify-content: center;
		gap: 4px;
		align-items: center;
	}

	.loader-container > span {
		width: var(--size-square);
		height: var(--size-square);
		background: var(--theme-fg);

		animation: loader 300ms infinite alternate;
	}

	.loader-container > span:nth-child(2) {
		animation: loader 200ms infinite alternate;
	}

	.loader-container > span:nth-child(3) {
		animation: loader 220ms infinite alternate;
	}

	@keyframes loader {
		to {
			transform: translate(0, -0.5rem);
		}
	}
</style>
