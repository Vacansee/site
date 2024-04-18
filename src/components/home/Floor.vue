<script setup>
// Basic imports
import moment from 'moment-timezone'
import tinycolor from "tinycolor2";
import router from '../../router';
</script>

<template>
  <div id="svgFloor">
    <component :is="floorSVG" ref="svgComponent"></component>
  </div>
</template>
  
<script>

const getFloorSVG = async (floorName) => {
  try {
    const module = await import(`../../assets/floors/${floorName}.svg`)
    return module.default
  }
  catch { console.error(`Map not yet implemented!`) }
}

export default {
  // Get references to global
  inject: ["global"],
  props: ["floorName"],
  data() {
    return { // Local variables
      floorSVG: null,
      roomSVG: null,
      colors: [
        "#66e099", // 4 hours (240 minutes)
        "#aeea77", // 2 hours (120 minutes)
        "#d8ed80", // 1 hour (60 minutes)
        "#fce68e", // 30 minutes free
        "#fdc675", // 15 minutes free
        "#f99a57", // 10 minutes free
        "#fc4e58", // occupied
      ]
    }
  },
  watch: {
    "floorName": {
      async handler(floorName) {
        if (floorName == "") {
          this.floorSVG = null;
          if (this.roomSVG != null)
            this.roomSVG.removeAttribute("id", "selected");
          this.roomSVG = null;
          this.global.room = ""
        }
        else {
          this.floorSVG = await getFloorSVG(floorName)
          router.push({ name: 'buildingAndFloor', params: { building: this.global.bldg, floor: this.global.floor } })
          if (!this.floorSVG) {this.$showToast({title: 'Map not yet implemented!'})}}
      },
      immediate: true,
    },
    'global.darkMode': {
            handler() {
                if (this.global.darkMode) {
                  this.colors = [
                    "#00e099",
                    "#00ea77",
                    "#00ed80",
                    "#00e68e",
                    "#00c675",
                    "#009a57",
                    "#004e58",
                  ];
                  this.applyRoomColors();
                } else {
                  this.colors = [
                    "#66e099",
                    "#aeea77",
                    "#d8ed80",
                    "#fce68e",
                    "#fdc675",
                    "#f99a57",
                    "#fc4e58",
                  ];
                  this.applyRoomColors();
                }
            }
        }
  },
  updated() {
    this.$nextTick(() => {
      this.applyRoomColors()
    })
  },
  methods: {
    // Gets the current building
    getBldg() { return this.global.data[this.global.bldg] },
    // get room color corresponding to room availability
    getRoomColor(minutes) {
      console.log(this.colors);
      if (minutes >= 240) return this.colors[0]
      if (minutes >= 120) return this.colors[1]
      if (minutes >=  60) return this.colors[2]
      if (minutes >=  30) return this.colors[3]
      if (minutes >=  15) return this.colors[4]
      if (minutes >=  10) return this.colors[5]
      else return this.colors[6]
    },
    getFloorColor(flow) {
      if (flow <= .15) return this.colors[0]
      if (flow <= .30) return this.colors[1]
      if (flow <= .45) return this.colors[2]
      if (flow <= .60) return this.colors[3]
      if (flow <= .75) return this.colors[4]
      if (flow <= .90) return this.colors[6]
      // console.log(flow)
      else return this.colors[6]
    },
    roomSelect(path) { // Select the room needed
      let roomName = path.id.substr(1)
      if (this.getBldg()[roomName]) {
        if (this.roomSVG != null) this.roomSVG.remove();
        this.roomSVG = path
        this.global.room = roomName
        const clonedPath = path.cloneNode(true);
        path.parentNode.appendChild(clonedPath);
        this.roomSVG = clonedPath;
        router.push({ name: 'buildingAndRoom', params: { room: this.global.room } })
        setTimeout(() => {
          clonedPath.setAttribute("id", "selected");
          let border = tinycolor(path.getAttribute("fill")).darken(30).toString();
          clonedPath.style.stroke = border
        }, 10);
      }
      else {
        if (this.roomSVG != null) this.roomSVG.remove()
        this.roomSVG = null
        this.global.room = ""
        router.push({ name: 'buildingAndFloor', params: { floor: this.global.floor }})
      }
    },
    getColorVal(name) {
        const rootStyles = getComputedStyle(document.documentElement);
        return rootStyles.getPropertyValue(`--${name}`)
    },
    applyRoomColors() { // Apply the room color to the popup
      const svgComponent = this.$refs.svgComponent

      if (svgComponent && svgComponent.$el) {
        const paths = svgComponent.$el.querySelectorAll("path")
        let floorColor = this.getFloorColor(this.getBldg().meta.flow)

        paths.forEach((path) => {
          let roomID = path.getAttribute("id");
          let roomName = roomID.substr(1);
          let roomInfo = this.getBldg()[roomName];
          
          if (roomID == 'floor') {
              path.style.stroke = tinycolor.mix(this.getColorVal("buildbord"), floorColor, 40).toString();
              let fill = tinycolor.mix(this.getColorVal("roomfill"), floorColor, 30).lighten(8).toString();
              path.setAttribute("fill", fill);
          }
          else if (!roomID.includes('excavated')) {
            if (roomInfo)
              path.addEventListener("mouseover", () => { this.$emit('room-hover', [roomName, true]) })
            else path.addEventListener("mouseover", () => { this.$emit('room-hover', [roomName, false]) })

            path.addEventListener("mouseleave", () => { this.$emit('room-hover', ['', false])  } )
          }
          if (roomInfo) {
            if (roomInfo.meta.cur) {
              path.setAttribute("fill", "#fc4e58");
              path.style.stroke = tinycolor("#fc4e58").darken(20).toString()
              path.setAttribute("cursor", "pointer")
            }
            else if (!roomInfo.meta.next) { // weekends
              path.style.stroke = tinycolor("#0eeb6f").darken(20).toString()
              path.setAttribute("fill", "#0eeb6f");
              path.setAttribute("cursor", "pointer")
            }
            else {
              let initial = moment(this.global.time, 'e:HHmm'), final = roomInfo.meta.next[2]
              let next = moment.duration(final.diff(initial)).asMinutes()
              let fill = this.getRoomColor(next)
              path.style.stroke = tinycolor(fill).darken(25).toString();
              path.setAttribute("fill", fill);
              path.setAttribute("cursor", "pointer")
            }
          }
          else { // !roomInfo
            path.setAttribute("cursor","not-allowed")
            if (roomID.includes('excavated')) path.setAttribute("fill", "var(--hardborder)")
            else if (roomID != 'floor') { // rooms w/o classes:
              path.style.stroke = tinycolor.mix(this.getColorVal("buildbord"), floorColor, 30).toString();
              let fill = tinycolor.mix(this.getColorVal("unusedfill"), floorColor, 15).lighten(1).toString();
              path.setAttribute("fill", fill);
            }
          }
          path.setAttribute("pointer-events", "all");
          path.addEventListener("click", () => { this.roomSelect(path); })
          // Room already requested (search, routing):
          if (this.global.room && this.global.room == path.id.substr(1)) this.roomSelect(path)
        })
      }
    }
  }
}
</script>

<style>
#svgFloor {
  /* fill: var(--roomfill); */
  stroke: var(--buildbord);
  stroke-width: 9px;
  will-change: transform;
  transition: width linear 2s, height linear 2s, opacity .8s;
  width: 50px;
  background: none;
  pointer-events: none;
}

#selected {
  opacity: 1 !important;
  transition: stroke-width 0.2s ease-in-out, stroke 0.2s ease-in-out;
  stroke-width: 15px;
  z-index: 6;
  position: absolute;
}
</style>