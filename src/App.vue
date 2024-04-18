<script setup>
// Basic Imports
import { RouterLink, RouterView } from 'vue-router'
import Logo from '@/assets/logo.svg?component'
import DiningIcon from '@/assets/icons/dining.svg?component'
import PollIcon from '@/assets/icons/poll.svg?component'
import GHIcon from '@/assets/icons/github.svg?component'
import AutoComplete from 'primevue/autocomplete'
import Button from "primevue/button"
import Toast from 'primevue/toast'
import DiningSurveyLightbox from './DiningSurveyLightbox.vue'
</script>

<template>
  <Toast/>
  <!-- HTML For Header -->
  <header id="header">
      <div id="left-nav">
        <RouterLink to="/"> <Logo class="logo" height="75" width="75"/>
        </RouterLink>
      </div>

      <div id="right-nav" v-show="!isLightboxVisible">
        <a href="#" @click.prevent="openDiningSurvey"><Button class="nav-btn dining" aria-label="Dining" >
            <DiningIcon height="25" width="25"/>
        </Button></a>
        <a href="https://forms.gle/Tu5xSSjK1MkZDXK69" target="_blank" rel="noopener noreferrer"><Button class="nav-btn" aria-label="Feedback" >
            <PollIcon height="25" width="25"/>
        </Button></a>
        <a href="https://github.com/Vacansee/app" target="_blank" rel="noopener noreferrer"><Button class="nav-btn" aria-label="GitHub" >
            <GHIcon height="25" width="25"/>
        </Button></a>
      </div>
    </header>
    <div id="mobile-nav">
        <Teleport to="#left-nav" :disabled="global.aspectRatio > 1.5">
          <AutoComplete class="search" :style="{'width':'100%'}" :input-style="{'width': '100%'}" v-model="selection" :placeholder="ex" :suggestions="suggest" @complete="filterRes" @item-select="goTo" @focus.native="searchFocus(true)" @blur.native="searchFocus(false)"></AutoComplete>
        </Teleport>
    </div>

  <RouterView />
  
  <DiningSurveyLightbox ref="diningSurveyLightbox" @update:visible="handleLightboxVisibility">
    <!-- Your survey form will go here -->
  </DiningSurveyLightbox>

</template>

<script>
export default {
  data() {
    return {
      isLightboxVisible: false,
      exs: [
        "a building:  Russell Sage",
        "a dept. code:  CSCI 1200",
        "a room:  DCC 308",
        "a CRN:  80385"
      ],
      ex: "",
      suggest: [],
      selection: ""
    }
  },
  inject: ["global"],
  watch: {
    'global.bldg': {
      handler() {
        this.$clearToasts()
        // Only shows header when a building is not selected
        if (this.global.bldg)
          document.getElementById("header").style.opacity = "0";
        else
          document.getElementById("header").style.opacity = "1";
      }
    }
  },
  mounted() {
    this.changeEx()
    setInterval(this.changeEx, 5000);
  },
  methods: {
    openDiningSurvey() {
      this.$refs.diningSurveyLightbox.open();
    },
    handleLightboxVisibility(isVisible) {
      this.isLightboxVisible = isVisible; 
    },
    changeEx() {
      const ex = this.exs.shift()
      this.ex = `Try ${ex}`; this.exs.push(ex)
    },
    searchFocus(is) {
      this.global.sFocus = is
      // console.log("sFocus:", is)
    },
    filterRes(event) { 
      // Case & whitespace insensitive, ignore some characters:
      const query = event.query.toLowerCase().replace(/\s{2,}/g, ' ').replace(/["#]/g, '')
      setTimeout(() => {
        this.suggest = []
        // Transform, sort, filter global.data + global.searchData:
        this.suggest = Object.keys(this.global.data).concat(this.global.searchData.flatMap(Object.keys))
        .map(key => {
          if (key in this.global.data) return `${key.toString()} (${this.global.data[key].meta.name.toString()})`
          else return key
        })
        .filter(s => s.toLowerCase().includes(query))
        .sort()
        .map(s => s.replace(/_/g, ' '));
      }, 100);
    },
    goTo() {
      const abbrev = this.selection.substring(0, this.selection.indexOf("(") - 1)
      if (abbrev in this.global.data) {
        this.global.bldg = abbrev, this.selection = ""
        console.log(`Building "${abbrev}" selected`)
        return
      }
      else if (this.selection in this.global.searchData[2]) { // toRoom
        const [bldg, room] = this.selection.split(" ")
        this.global.floor = parseInt(room[0]) // TODO: non-numerical room #s
        this.global.room = room, this.global.bldg = bldg 
        console.log(`Room "${this.selection}" selected`)
        this.selection = ""
        return
      }
      let CRN = ""
      if (this.selection in this.global.searchData[1]) { // deptToCRN
        CRN = this.global.searchData[1][this.selection]
        console.log(`Using dept code "${this.selection}"`)
      }
      else if (this.selection in this.global.searchData[0]) CRN = this.selection // byCRN
      // TODO: show all locations (pins), calc time 'til begin/end
      const [bldg, room] = Object.keys(this.global.searchData[0][CRN])[0].split(" ")
      this.global.floor = parseInt(room[0])
      this.global.room = room, this.global.bldg = bldg, this.selection = ""
      console.log(`Room w/ CRN #${CRN} selected`)
    }
  }
}
</script>
<style scoped>
@import './assets/main.css';
/* Everything from here on in the file is  basic css */

header {
  pointer-events: none;
  position: absolute;
  z-index: 6;
}

.logo {
  margin-right: 1rem; 
  pointer-events: all;
  filter: drop-shadow(0px 5px 20px white);
}

.nav-btn {
  fill: #205C5B;
  margin: .5rem;
  width: 3.25rem;
  height: 3.25rem;
  justify-content: center;
  align-items: center;
  background-color: var(--unusedfill);
  border: 2px solid var(--buildbord);
  box-shadow: 0px 5px 25px rgba(0, 10, 20, 0.08);
  pointer-events: all;
  padding: 0; 
}

.nav-btn:hover,
.nav-btn:active {
  fill: white;
}

#left-nav {
  display: flex;
  padding: .5rem 1rem;
}

.search {
  width: 250px !important;
  border: 2px solid var(--walkpath);
  box-shadow: 0px 5px 25px rgba(0, 10, 20, 0.08);
  border-radius: 10px;
  align-self: center;
  pointer-events: all;
}

#right-nav {
  position: fixed;
  padding: .8rem 1rem;
  top: 0;
  right: 0;
}

#mobile-nav {
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none;
  position: absolute;
  bottom: 2vh;
  z-index: 6;
}

</style>
