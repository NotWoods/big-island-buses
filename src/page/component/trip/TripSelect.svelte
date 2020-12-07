<script lang="ts">
  import type { Route } from '../../../gtfs-types';
  import { openLinkableValues } from '../../links/open';

  export let route: Route;
  export let selectedTrip: string;

  $: trips = Object.values(route.trips);

  function handleChange(evt: Event) {
    const option = evt.target as HTMLOptionElement;
    openLinkableValues('trip', option.value);
  }
</script>

<select
  class="info__select"
  id="trip-select"
  data-type="trip"
  on:input={handleChange}>
  {#each trips as { trip_id, trip_short_name } (trip_id)}
    <option value={trip_id} selected={trip_id === selectedTrip}>
      {trip_short_name}
    </option>
  {/each}
</select>
