<script lang="ts">
  import type { Route } from '../../../shared/gtfs-types';
  import { openLinkable } from '../../links/open';
  import { store } from '../../state/store';

  export let route: Route | undefined = undefined;
  export let selectedTrip = $store.route?.trip

  $: trips = route ? Object.values(route.trips) : [];

  function handleChange(evt: Event) {
    const option = evt.target as HTMLOptionElement;
    openLinkable('trip', option.value);
  }
</script>

<label for="trip-select">
  <svg class="info__icon" viewBox="0 0 24 24">
    <path d="M10,18h4v-2h-4V18z M3,6v2h18V6H3z M6,13h12v-2H6V13z" />
  </svg>
</label>
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
