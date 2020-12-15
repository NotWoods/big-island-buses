<script lang="ts">
  import { splitString } from '../../utils/search';
  export let title: string;
  export let matched: PredictionSubstring[] = [];

  export let address: string;
  $: splits = splitString(title, matched);
</script>

<li class="searchresult__item">
  <button type="button" class="searchresult__button" on:click>
    <span class="searchresult__icon">
      <slot />
    </span>
    <span class="searchresult__title">
      {#each splits as split}
        {#if split.match}
          {split.text}
        {:else}
          <span class="searchresult__match">{split.text}</span>
        {/if}
      {/each}
    </span>
    <span class="searchresult__address">{address}</span>
  </button>
</li>
