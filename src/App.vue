<script setup>
// Basic Imports
import { RouterLink, RouterView } from 'vue-router'
import Logo from '@/assets/logo.svg?component'
import AutoComplete from 'primevue/autocomplete'
import Button from "primevue/button"
import Toast from 'primevue/toast'
</script>

<template>
  <Toast/>
  <!-- HTML For Header -->
  <header id="header" v-bind:class="{ 'homePageLogo': $route.path == '/' }">
    
      <div class="left-nav">
        <RouterLink to="/"> <Logo class="logo" height="75" width="75"/> </RouterLink>
        <div class="search">
          <AutoComplete v-model="selection" placeholder="Search for a building or class..." :suggestions="filteredResults" @complete="filterResults" @item-select="searchFunc"></AutoComplete> 
        </div>
      </div>

      <div class="right-nav">
        <a href="mailto:rpi.vacansee@gmail.com"><Button class="nav-btn">
            <img src="./assets/icons/poll.svg" height="30" width="30" />
        </Button></a>
        <a href="https://github.com/Vacansee"><Button class="nav-btn">
            <img src="./assets/icons/github.svg" height="30" width="30"/>
        </Button></a>
      </div>

      <div class="bot-right-nav">
        <Button class="nav-btn" @click="getLocation">
            <img src="./assets/icons/location.svg" height="30" width="30"/>
        </Button>
      </div>
  </header>


  <RouterView />
</template>

<script>
export default {
  data() {
    return {
      filteredResults: [],
      selection: "",
      RAD2DEG: 180/Math.PI,
      DEG2RAD: Math.PI/180,
      CONSTPOS1: [42.730790, -73.680281],
      CONSTPOS2: [42.731036, -73.680240],
      ANGLE: 0.0,
      // top left corner: 42.733115, -73.683526 with (65, 478)
      // bottom right corner 42.724859, -73.673789 with (970, 1205)
      // CURRENT NOT WORKING 
      XSCALE: (65-970)/(42.733115-42.724859),
      YSCALE: (478-1205)/(-73.683526- -73.673789),
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
    },
    'global.error': {
      handler() {
        if (this.global.error) this.$showToast({title: 'Failed to load data', body: this.global.error})
      }
    }
  },
  mounted() {
    this.ANGLE = Math.atan((this.CONSTPOS2[1]-this.CONSTPOS1[1])/(this.CONSTPOS2[0]-this.CONSTPOS1[0]));
  },
  methods: {
    filterResults(event) {
      // filter buildings and classes
      setTimeout(() => {
        this.filteredResults = [];
        Object.keys(this.global.data).map((bid) => {
          this.filteredResults.push(bid.toString() + " (" + this.global.data[bid].meta.name.toString() + ")");
        })
        this.filteredResults.sort();
        this.filteredResults = this.filteredResults.map((bid) => {
            return bid.replace(/_/g, ' ');
        })
        .filter((result) => {
            return result.toLowerCase().includes(event.query.toLowerCase());
        });
      }, 250);
    },
    searchFunc() {
      // select building or class here
      this.global.bldg = this.selection.substring(0, this.selection.indexOf("(") - 1);
      this.selection = "";
    }
  },
  methods: {
    
    getLocation() {
      /**
       * Gets the location of the current device
       * First param runs if the it successfully got location
       * Second param runs if it didn't get location
       * last param is for options
       */
      navigator.geolocation.getCurrentPosition(this.calcPosition, this.locationError)
    },

    locationError(err) {
      this.$showToast({title: 'Failed to get location', body: err.message})
    },
    // currently not working correctly 
    latituteToY(lat) { return Math.log(Math.tan(Math.PI/4 + lat * this.DEG2RAD / 2)) * this.R},
    longituteToX(lon) { return lon * this.DEG2RAD * this.R; },

    locationCheck(x,y,accuracy) {
      if(x < 0 || x > 1100 || y < 0 || y > 1300) {
        this.$showToast({title: 'Location is too far away from map'})
        return;
      }
      if (accuracy > 50)  {
        this.$showToast({title: 'Location is too inaccurate to locate user', body: 'The accuracy is off by ' + accuracy.toFixed(2) + ' meters. Try checking your wifi connection.'})
        return
      }
    },
    convert(lon, lat) {
      const pos = [];
      pos[0] = -(this.XSCALE * (lat- -73.683526) * Math.sin(this.ANGLE) ) +295//+282;
      pos[1] = -(this.YSCALE * (lon- 42.733115) / Math.cos(this.ANGLE) ) +527//+575;
      return pos;
    },
    calcPosition(pos) {

      // // old code from Matt Sweet (lead fall 23)
      /*
        https://math.stackexchange.com/questions/3968248/how-do-i-find-the-x-and-y-position-given-a-latitude-and-longitude-coordinate
      */

      // hardcoded positions
      // const eigthAndSageCoords = [42.733139437397675 * this.DEG2RAD, -73.68350452317202 * this.DEG2RAD, 65, 478]
      // const burdettAndTibbitsCoords = [42.724868915490866 * this.DEG2RAD, -73.67381709414943 * this.DEG2RAD, 970, 1205]
      
      // const _0_H_coords = [42.726440 * this.DEG2RAD, -73.685017 * this.DEG2RAD]
      // const W_0_coords = [42.73163480043761 * this.DEG2RAD, -73.6721845516856 * this.DEG2RAD]

      // const DCCLocation = [42.72939854575586 * this.DEG2RAD, -73.67956579999999 * this.DEG2RAD]

      // const C_0_0 = [Math.cos(eigthAndSageCoords[0]) * Math.cos(eigthAndSageCoords[1]), Math.cos(eigthAndSageCoords[0]) * Math.sin(eigthAndSageCoords[1])]
      // const C_W_0 = [Math.cos(W_0_coords[0]) * Math.cos(W_0_coords[1]), Math.cos(W_0_coords[0]) * Math.sin(W_0_coords[1])]
      // const C_0_H = [Math.cos(_0_H_coords[0]) * Math.cos(_0_H_coords[1]), Math.cos(_0_H_coords[0]) * Math.sin(_0_H_coords[1])]
      // const U_xy = [Math.cos(DCCLocation[0]) * Math.cos(DCCLocation[1]), Math.cos(DCCLocation[0]) * Math.sin(DCCLocation[1])]

      // const U = C_0_H.map(function(item, index) { return item - C_0_0[index] })
      // const V = C_W_0.map(function(item, index) { return item - C_0_0[index] })
      // const W = U_xy.map(function(item, index) { return item - C_0_0[index] })

      // const D = ((U[0] * V[1]) - (V[0] * U[1]))
      // const D_x = ((W[0] * V[1]) - (V[0] * W[1]))
      // const D_y = ((U[0] * W[1]) - (W[0] * U[1]))
      
      // const svgX = ((burdettAndTibbitsCoords[2] - eigthAndSageCoords[2]) * (D_x / D)) + eigthAndSageCoords[2]
      // const svgY = ((burdettAndTibbitsCoords[3] - eigthAndSageCoords[3]) * (D_y / D)) + eigthAndSageCoords[3]
      // const westLocation = [42.73178763583408, -73.68341264293338]
      // const commonsLocation = [42.728455878577684, -73.67448701676955]


      // console.log('here')
      // // console.log(this.lon2x(crd.longitude) + " " + this.lat2y(crd.latitude))
      // const lonDiff = this.lon2x(burdettAndTibbitsCoords[1]) - this.lon2x(eigthAndSageCoords[1])
      // const latDiff = this.lat2y(eigthAndSageCoords[0]) - this.lat2y(burdettAndTibbitsCoords[0])
      // console.log(latDiff)
      // const scaleX = (burdettAndTibbitsCoords[2] - eigthAndSageCoords[2]) / lonDiff
      // const scaleY = (burdettAndTibbitsCoords[3] - eigthAndSageCoords[3]) / latDiff

      // const svgX = (this.lon2x(burdettAndTibbitsCoords[1]) - this.lon2x(DCCLocation[1])  ) * scaleX + eigthAndSageCoords[2]
      // const svgY = ( this.lat2y(DCCLocation[0]) - this.lat2y(burdettAndTibbitsCoords[0])) * scaleY + eigthAndSageCoords[3]
      // console.log(svgX + ' ' + svgY)
      
      // const scaleY = (/*crd.latitude*/ DCCLocation[0] - burdettAndTibbitsCoords[0]) / (eigthAndSageCoords[0] - burdettAndTibbitsCoords[0])
      // const scaleX = (/*crd.longitude*/ DCCLocation[1] - burdettAndTibbitsCoords[1]) / (eigthAndSageCoords[1] - burdettAndTibbitsCoords[1])
      // const svgX = burdettAndTibbitsCoords[2] + scaleX * (eigthAndSageCoords[2] - burdettAndTibbitsCoords[2])
      // const svgY = burdettAndTibbitsCoords[3] + scaleY * (eigthAndSageCoords[3] - burdettAndTibbitsCoords[3])


      // wifi network to find location (an idea)

      const crd = pos.coords;
      const svgX = this.longituteToX(crd.longitude);
      const svgY = this.latituteToY(crd.latitude);
      
      // this.global.userCoords = [svgX, svgY]
      // this.global.userCoords = [svgX2, svgY2]
      console.log("Your current position is:");
      console.log(`Latitude : ${crd.latitude}`);
      console.log(`Longitude: ${crd.longitude}`);
      console.log('svg coords: ' + svgX + ' '  + svgY)
      console.log(`More or less ${crd.accuracy} meters.`);
      // this.locationCheck(svgX,svgY,crd.accuracy);

      // harcode attempts
      // 42.730772, -73.680271 (353.6582396771582, 704.3499788833127) +282, +575;
      // 42.729179, -73.681097 (325.7729229420523, 872.9297980730382) +295, +527;
      // 42.730779, -73.677217
      
      const convertedPos = this.convert(42.729179, -73.681097)//this.convert(crd.longitude, crd.latitude);
      // convertedPos[0] = svgX;
      // convertedPos[1] = svgY;
      this.global.userCoords = [convertedPos[0], convertedPos[1]];
    }
  },
  
}
</script>
<style scoped>
@import './assets/main.css';
/* Everything from here on in the file is  basic css */
.homePageLogo {
  position: absolute;
}

header {
  z-index: 7;
  display: flex;
  padding: 1rem;
}

.logo {
  display: block;
  margin: 0 1rem 0 0;
  pointer-events: all;
}

.nav-btn {
  margin: .5rem;
  pointer-events: all;
}

.left-nav {
  position: fixed;
  display: flex;
  pointer-events: none;
  padding: .5rem 1rem;
  top: 0;
  left: 0;
}

.search {
  align-self: center;
  pointer-events: all;
}

.right-nav {
  position: fixed;
  pointer-events: none;
  padding: .8rem 1rem;
  top: 0;
  right: 0;
}

.bot-right-nav {
  position: fixed;
  pointer-events: none;
  padding: .8rem 1rem;
  bottom: 0;
  right: 0;
}
</style>
