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
      
      <!-- Content for each tab, including potential sub-options -->
      <div class="tab-content">
        <div v-for="(option, index) in diningOptions" :key="index" v-show="activeTab === index">
          <h3>{{ option.name }}</h3>
          <div v-if="option.subOptions" class="scrollable-content">
            <div v-for="(sub, subKey) in option.subOptions" :key="subKey">
              <h4>{{ subKey }}</h4>
              <p>Times: {{ sub.times.join(', ') }}</p>
              <a :href="`https://${sub.url}`" target="_blank">More details</a>
            </div>
          </div>
          <div v-else>
            <p>Times: {{ option.times.join(', ') }}</p>
            <a :href="`https://${option.url}`" target="_blank">More details</a>
          </div>
        </div>
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
      activeTab: 0, // Default to the first tab
      diningOptions: [
        { name: "DCC Cafe", times: ["07:30-18:00"], url: "dcc-cafe" },
        { name: "Evelyn's Cafe", times: ["11:00-14:00"], url: "evelyns_cafe" },
        { name: "Argo Tea", times: ["09:00-18:00"], url: "library-cafe" },
        {
          name: "Student Union",
          subOptions: {
            "Father's Marketplace": { times: ["08:00-23:00"], url: "fathers-marketplace" },
            "Panera Bread": { times: ["08:00-20:00"], url: "mcneil-room" },
            "Thunder Mountain Curry": { times: ["11:00-15:00"], url: "TMC" },
            "Wild Blue Sushi": { times: ["11:00-22:00"], url: "wild_blue_sushi" },
            "Collar City Grill": { times: ["11:00-23:00"], url: "CCG" },
            "Halal Shack": { times: ["17:00-23:00"], url: "Halal_shack" }
          }
        },
        { name: "The Beanery Cafe", times: ["07:30-15:00"], url: "beanery-cafe" },
        { name: "Blitman Dining Hall", times: ["07:00-09:30 Breakfast", "10:30-13:30 Brunch", "17:00-20:00 Dinner"], url: "blitman-dining-hall" },
        { name: "BARH Dining Hall", times: ["07:00-09:30 Breakfast", "11:00-13:00 Brunch", "17:00-21:00 Dinner"], url: "barh-dining-hall" },
        { name: "Russell Sage Dining Hall", times: ["07:00-10:00 Breakfast", "10:00-11:00 Continental Breakfast", "11:00-14:30 Lunch", "16:00-20:00 Dinner"], url: "russell-sage" },
        { name: "Simply to Go", times: ["08:00-11:00 Breakfast", "11:00-15:30 Lunch"], url: "simply-to-go" },
        { name: "Commons Dining Hall", times: ["07:00-10:00 Breakfast", "10:00-11:00 Continental Breakfast", "11:00-15:30 Lunch", "16:30-21:00 Dinner", "21:00-22:30 Late Night"], url: "commons-dining-hall" }
      ],
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
.scrollable-content {
  max-height: 300px;
  overflow-y: auto;
}
</style>
