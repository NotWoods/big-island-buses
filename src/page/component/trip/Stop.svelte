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
  <div class="schedule__stopname">
    <span class="schedule__stop-name">
      {stops[stopTime.stop_id]?.stop_name}
    </span>
    <span class="schedule__stop-desc">
      {stops[stopTime.stop_id]?.stop_desc || ''}
    </span>
  </div>
  <time class="schedule__time">
    {gtfsArrivalToString(stopTime.arrival_time)}
  </time>
</DynamicLinkNode>
