<template>
  <div v-if="visible" class="lightbox-backdrop" @click.self="close">
    <div class="lightbox-content">
      <div class="tabs-container">
        <div class="tabs">
          <div v-for="(option, index) in diningOptions" :key="index"
               :class="{ 'tab': true, 'active': activeTab === index, 'student-union': option.name === 'Student Union' }"
               @click="handleTabClick(index)">
            {{ option.name }}
          </div>
        </div>
      </div>
      <div class="tab-content">
        <div v-for="(option, index) in diningOptions" :key="index" v-show="activeTab === index">
          <h3>{{ option.name }}</h3>
          <div v-if="option.subOptions" class="scrollable-content">
            <div v-for="(sub, subKey) in option.subOptions" :key="subKey"
                :class="{ 'sub-tab': true, 'active': activeSubTab[option.name] === subKey }"
                @click.stop="handleSubTabClick(option.name, subKey)">
              <h4>{{ subKey }}</h4>
              <div v-for="time in formatTimes(sub.times)" :key="time">
                <p v-show="activeSubTab[option.name] === subKey">{{ time }}</p>
              </div>
              <a v-show="activeSubTab[option.name] === subKey"
                :href="sub.url.includes('http') ? sub.url : `https://${sub.url}`"
                target="_blank" rel="noopener noreferrer">More details</a>
            </div>
          </div>
          <div v-else>
            <div v-for="time in formatTimes(option.times)" :key="time">
              <p>{{ time }}</p>
            </div>
            <a :href="option.url.includes('http') ? option.url : `https://${option.url}`"
              target="_blank" rel="noopener noreferrer" class="details-link">More details</a>
          </div>
        </div>
      </div>
      <button class="close-button" @click="close">Close</button>
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
      this.$emit('update:visible', true);
    },
    close() {
      this.visible = false;
      this.activeSubTab = {};
      this.$emit('update:visible', false);
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
    formatTime24to12(time, label) {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const suffix = hour >= 12 ? 'PM' : 'AM';
      const adjustedHour = hour % 12 || 12; 
      const formattedTime = `${adjustedHour}:${minutes} ${suffix}`;
      return label ? `${label} ${formattedTime}` : formattedTime;
    },
    formatTimes(times) {
      return times.map(time => {
        let label = "";
        time = time.replace(/(Breakfast|Brunch|Lunch|Dinner)\s*/, (match) => {
          label = match.trim();
          return "";
        });

        const [start, end] = time.split('-');
        const formattedStart = this.formatTime24to12(start, label);
        const formattedEnd = this.formatTime24to12(end);
        return label ? `${formattedStart} - ${formattedEnd}` : `Hours: ${formattedStart} - ${formattedEnd}`;
      });
    }
  },
};
</script>

<style>
.lightbox-backdrop {
  position: fixed;
  top: 80px;
  right: 10px;
  width: 100vw; 
  height: calc(100vh - 100px); 
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  justify-content: flex-end; 
}

.lightbox-content {
  background: white;
  padding: 10px 20px 40px;
  border-radius: 8px 0 0 8px; 
  width: 100%; 
  max-width: 370px; 
  height: 100%; 
  overflow-y: auto; 
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1); 
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tabs-container {
  max-height: 180px; 
  overflow-y: auto; 
}

.tabs {
  display: flex;
  flex-wrap: wrap; 
  align-items: center;
  justify-content: flex-start;
}

.tab {
  flex-basis: calc(50% - 10px); 
  margin: 1px;
  text-align: center;
  cursor: pointer;
  padding: 2px;
  font-size: 0.82rem; 
}

.tab.active {
  font-weight: bold;
  border-bottom: 2px solid blue;
}

.tab-content {
  margin-top: 5px;
  flex-grow: 1; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
}

.tab.active, .student-union.active {
  font-weight: bold;
  border-bottom: 2px solid blue;
}

.tab.student-union.active + .tab-content {
  padding-top: -5px; 
  margin-top: -5px;
}

.h3, .sub-tab p, .details-link {
  margin: 3px 0;
}

.close-button {
  margin-top: 12px;
}

.scrollable-content {
  max-height: 300px;
  overflow-y: auto;
}

.sub-tab {
  display: block;
  margin-top: -15px;
}

.sub-tab h4 {
  font-weight: bold;
  margin-bottom: 4px;
}

.sub-tab p {
  font-weight: normal;
}
</style>
