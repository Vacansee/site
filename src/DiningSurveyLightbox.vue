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
          @click="handleTabClick(index)">
          {{ option.name }}
        </div>
      </div>
      
      <!-- Content for each tab, including potential sub-options -->
      <div class="tab-content">
        <div v-for="(option, index) in diningOptions" :key="index" v-show="activeTab === index">
          <h3>{{ option.name }}</h3>
          <div v-if="option.subOptions" class="scrollable-content">
            <div v-for="(sub, subKey) in option.subOptions" :key="subKey"
                 class="sub-tab"
                 :class="{ active: activeSubTab[option.name] === subKey }"
                 @click.stop="handleSubTabClick(option.name, subKey)">
              <h4>{{ subKey }}</h4>
              <p v-show="activeSubTab[option.name] === subKey">Hours: {{ sub.times.join(', ') }}</p>
              <a v-show="activeSubTab[option.name] === subKey"
                 :href="sub.url.includes('http') ? sub.url : `https://${sub.url}`" 
                 target="_blank" rel="noopener noreferrer">More details</a>
            </div>
          </div>
          <div v-else>
            <p>Hours: {{ option.times.join(', ') }}</p>
            <a :href="option.url.includes('http') ? option.url : `https://${option.url}`" 
               target="_blank" rel="noopener noreferrer">More details</a>
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
      activeSubTab: {},
      diningOptions: [
        { name: "DCC Cafe", times: ["07:30-18:00"], url: "https://rpi.sodexomyway.com/dining-near-me/dcc-cafe" },
        { name: "Evelyn's Cafe", times: ["11:00-14:00"], url: "https://rpi.sodexomyway.com/dining-near-me/evelyns_cafe" },
        { name: "Argo Tea", times: ["09:00-18:00"], url: "https://rpi.sodexomyway.com/dining-near-me/library-cafe" },
        {
          name: "Student Union",
          subOptions: {
            "Father's Marketplace": { times: ["08:00-23:00"], url: "https://rpi.sodexomyway.com/dining-near-me/fathers-marketplace" },
            "Panera Bread": { times: ["08:00-20:00"], url: "https://rpi.sodexomyway.com/dining-near-me/mcneil-room" },
            "Thunder Mountain Curry": { times: ["11:00-15:00"], url: "https://rpi.sodexomyway.com/dining-near-me/mcneil-room" },
            "Wild Blue Sushi": { times: ["11:00-22:00"], url: "https://rpi-preview.sodexomyway.com/dining-near-me/wild_blue_sushi" },
            "Collar City Grill": { times: ["11:00-23:00"], url: "https://rpi.sodexomyway.com/dining-near-me/CCG" },
            "Halal Shack": { times: ["17:00-23:00"], url: "https://rpi.sodexomyway.com/dining-near-me/Halal_shack" }
          }
        },
        { name: "The Beanery Cafe", times: ["07:30-15:00"], url: "https://rpi.sodexomyway.com/dining-near-me/beanery-cafe" },
        { name: "Blitman Dining Hall", times: ["07:00-09:30 Breakfast", "10:30-13:30 Brunch", "17:00-20:00 Dinner"], url: "https://rpi.sodexomyway.com/dining-near-me/blitman-dining-hall" },
        { name: "BARH Dining Hall", times: ["07:00-09:30 Breakfast", "11:00-13:00 Brunch", "17:00-21:00 Dinner"], url: "https://rpi.sodexomyway.com/dining-near-me/barh-dining-hall" },
        { name: "Russell Sage Dining Hall", times: ["07:00-11:00 Breakfast", "11:00-14:30 Lunch", "16:00-20:00 Dinner"], url: "https://rpi.sodexomyway.com/dining-near-me/russell-sage" },
        { name: "Simply to Go", times: ["08:00-11:00 Breakfast", "11:00-15:30 Lunch"], url: "https://rpi.sodexomyway.com/dining-near-me/simply-to-go" },
        { name: "Commons Dining Hall", times: ["07:00-11:00 Breakfast", "11:00-15:30 Lunch", "16:30-22:30 Dinner"], url: "https://rpi.sodexomyway.com/dining-near-me/commons-dining-hall" }
      ],
    };
  },
  methods: {
    open() {
      this.visible = true;
    },
    close() {
      this.visible = false;
      this.activeSubTab = {};
    },
    handleTabClick(index) {
      this.activeTab = index;
      if (!this.diningOptions[index].subOptions) {
        this.activeSubTab = {}; // Reset sub-tabs if not in a sub-option tab
      }
    },
    handleSubTabClick(parentName, subKey) {
      this.activeSubTab[parentName] = this.activeSubTab[parentName] === subKey ? null : subKey;
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
  width: 80%; /* Responsive width */
  max-width: 800px; /* Increased maximum width */
  text-align: center;
  overflow: hidden; /* Ensures no overflow */
}
.tabs {
  display: flex;
  overflow-x: auto; /* Enables horizontal scrolling */
  white-space: nowrap; /* Prevents wrapping of tabs */
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
}
.tab {
  flex-shrink: 0; /* Prevents tabs from shrinking */
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
.sub-tab {
  cursor: pointer;
  display: block; 
}
.sub-tab h4 {
  font-weight: bold; 
}
.sub-tab p {
  font-weight: normal; 
}
</style>
