<script lang="ts">
  import type { GTFSData, StopTime } from '../../../shared/gtfs-types';
  import { gtfsArrivalToString } from '../../../shared/utils/date';
  import DynamicLinkNode from '../DynamicLinkNode.svelte';

  export let stops: GTFSData['stops'];
  export let stopTime: StopTime;
</script>

<DynamicLinkNode
  type="stop"
  value={stopTime.stop_id}
  class="schedule__stop">
  <div class="lines"><span class="line" /><span class="line" /></div>
  <span class="schedule__stopname name">
    {stops[stopTime.stop_id]?.stop_name}
  </span>
  <time class="schedule__time">
    {gtfsArrivalToString(stopTime.arrival_time)}
  </time>
</DynamicLinkNode>
