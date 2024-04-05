<template>
  <div v-if="visible" class="lightbox-backdrop" @click.self="close">
    <div class="lightbox-content">
      <!-- Tabs for dining options -->
      <div class="tabs">
        <div 
          v-for="(option, index) in diningOptions" 
          :key="index" 
          class="tab" 
          :class="{ active: activeTab === index }" 
          @click="activeTab = index">
          {{ option.name }}
        </div>
      </div>
      
      <div class="tab-content">
        <div v-if="activeTab === 0">
          <!-- Content for Moe's -->
          <p>Moe's schedule and menu...</p>
        </div>
        <div v-if="activeTab === 1">
          <!-- Content for DCC Cafe -->
          <p>DCC Cafe schedule and menu...</p>
        </div>
        <!-- Add more v-if blocks for each dining option as needed -->
      </div>

      <button @click="close">Close</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      diningOptions: [
        { name: "Moe's" },
        { name: "DCC Cafe" },
        { name: "Evelyn's Cafe" },
        // Add more options here
      ],
      activeTab: 0, // Default to the first tab
    };
  },
  methods: {
    open() {
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
  },
};
</script>

<style>
.lightbox-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.lightbox-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  text-align: center;
}
.tabs {
  display: flex;
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
}
.tab {
  margin-right: 10px;
  cursor: pointer;
  padding: 5px;
}
.tab.active {
  font-weight: bold;
  border-bottom: 2px solid blue;
}
.tab-content {
  margin-top: 20px;
}
</style>
