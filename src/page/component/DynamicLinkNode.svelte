<script lang="ts">
  import type { Store } from 'unistore';
  import type { Type } from '../links/state';
  import type { LinkableElement } from '../links/open';
  import type { State } from '../state/store';
  import { createLink } from '../links/state';
  import { openLinkable } from '../links/open';

  export let store: Store<State>;
  export let type: Type;
  export let value: string;

  $: href = createLink(type, value, $store);

  function handleClick(evt: MouseEvent) {
    openLinkable(evt.currentTarget as LinkableElement & HTMLElement)
  }
</script>

<a
  {...$$restProps}
  data-type={type}
  data-value={value}
  {href}
  on:click|preventDefault|stopPropagation={handleClick}>
  <slot />
</a>
