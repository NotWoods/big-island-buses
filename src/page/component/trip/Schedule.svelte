<script lang="ts">
  import type { Store } from 'unistore';
  import type { GTFSData, Trip } from '../../../gtfs-types';
  import type { State } from '../../state/store';
  import Stop from './Stop.svelte';

  export let store: Store<State>;
  export let stops: GTFSData['stops'] = {};
  export let trip: Trip | undefined = undefined;

  $: stopTimes = trip?.stop_times ?? [];
</script>

{#each stopTimes as stopTime (stopTime.stop_sequence)}
  <Stop {store} {stops} {stopTime} />
{/each}
