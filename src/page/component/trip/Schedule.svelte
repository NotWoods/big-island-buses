<script lang="ts">
  import type { GTFSData, Trip } from '../../../shared/gtfs-types';
  import Stop from './Stop.svelte';

  export let schedule: Pick<GTFSData, 'stops'> | Promise<Pick<GTFSData, 'stops'>>;
  export let trip: Trip | undefined = undefined;

  $: stopTimes = trip?.stop_times ?? [];
</script>

{#await schedule then { stops }}
  {#each stopTimes as stopTime (stopTime.stop_sequence)}
    <Stop {stops} {stopTime} />
  {/each}
{/await}
