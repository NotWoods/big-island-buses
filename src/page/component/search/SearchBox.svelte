<script lang="ts">
  import type { Route, Stop } from '../../../shared/gtfs-types';
  import { openLinkable } from '../../links/open';
  import SearchResult from './SearchResult.svelte';

  let predictions: google.maps.places.AutocompletePrediction[] = [];
  let routes: Route[] = [];
  let stops: Stop[] = [];
</script>

<form class="search__container">
  <header class="searchbox">
    <button type="button" id="menu" title="Menu" aria-label="Menu">
      <svg viewBox="0 0 24 24">
        <path d="M3,18h18v-2H3V18z M3,13h18v-2H3V13z M3,6v2h18V6H3z" />
      </svg>
    </button>
    <input
      type="search"
      name="search"
      id="search"
      aria-label="Enter a location" />
    <button type="submit" title="Search" aria-label="Search">
      <svg viewBox="0 0 24 24">
        <path
          d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
    </button>
  </header>

  <section>
    <h2 class="searchresults__header">Places</h2>
    <ul class="searchresults">
      {#each predictions as { structured_formatting: prediction } (prediction.id)}
        <SearchResult
          title={prediction.main_text}
          address={prediction.secondary_text}
          matched={prediction.main_text_matched_substrings}>
          <svg viewBox="0 0 24 24">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </SearchResult>
      {/each}
    </ul>

    <h2 class="searchresults__header">Stops</h2>
    <ul class="searchresults">
      {#each stops as stop (stop.stop_id)}
        <SearchResult
          title={stop.stop_name}
          on:click={() => openLinkable('stop', stop.stop_id)}>
          <svg viewBox="0 0 24 24">
            <path
              d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
          </svg>
        </SearchResult>
      {/each}
    </ul>

    <h2 class="searchresults__header">Routes</h2>
    <ul class="searchresults">
      {#each routes as route (route.route_id)}
        <SearchResult
          title={route.route_name}
          on:click={() => openLinkable('route', route.route_id)}>
          <span class="line" />
        </SearchResult>
      {/each}
    </ul>
  </section>
</form>
