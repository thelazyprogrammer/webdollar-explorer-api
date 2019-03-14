<template>

  <div id="status_wrapper">
   <p :class="status.class">{{ status.message }}</p>
  </div>

</template>

<script>

import StatusService from '@/services/StatusService'

export default {

  name: 'status',

  data () {
    return {
      status: {
        class: 'syncing',
        message: 'syncing'
      }
    }
  },

  mounted () {
    this.getStatus()
  },

  methods: {
    async getStatus () {
      const response = await StatusService.getStatus()

      if (response.data && response.data.last_block) {
        this.status.message = '#' + response.data.last_block
        if (response.data.is_synchronized) {
          this.status.class = 'synced'
        } else {
          this.status.class = 'syncing'
          this.status.message = '#' + response.data.last_block
        }
      } else {
        this.status.class = 'syncing'
        this.status.message = 'syncing'
      }
    }
  }

}
</script>
