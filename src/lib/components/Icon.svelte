<script>
	import octicons from '@primer/octicons';

	export let name;
	export let size = 16;

	$: icon = octicons[name];
	$: svg = icon ? (size === 24 ? icon.toSVG({ width: 24, height: 24 }) : icon.toSVG({ width: 16, height: 16 })) : '';
</script>

{#if icon}
	{@html svg}
{:else}
	<span class="icon-placeholder" style="width: {size}px; height: {size}px;"></span>
{/if}

<style>
	.icon-placeholder {
		display: inline-block;
		background: var(--color-bg-tertiary);
		border-radius: 2px;
	}
</style>
