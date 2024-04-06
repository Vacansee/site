<script setup>
import Floor from './Floor.vue'
</script>

<template>
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

  <div id='floorBox'>
    <Floor @room-hover="onRoomHover" :floorName="floorName" />
  </div>

  <div id='buttonBox'>
    <button id="up" v-bind:class="{ 'disabled': !btnUp }" class="floor-button" type="button" @click="increaseFloor">
    <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.24 3.957l-8.422 14.06a1.989 1.989 0 0 0 1.7 2.983h16.845a1.989 1.989 0 0 0 1.7 -2.983l-8.423 -14.06a1.989 1.989 0 0 0 -3.4 0z"></path>
    </svg>
    </button>

    <button id="down" v-bind:class="{ 'disabled': !btnDown }" class="floor-button" type="button" @click="decreaseFloor">
      <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.24 3.957l-8.422 14.06a1.989 1.989 0 0 0 1.7 2.983h16.845a1.989 1.989 0 0 0 1.7 -2.983l-8.423 -14.06a1.989 1.989 0 0 0 -3.4 0z"></path>
    </svg>
    </button>

  </div>
</template>

<script>
export default {
  // Get reference to global
  inject: ["global"],
  emits: ["roomHover"],
  components: { Floor },
  data() {
    // Local variables
    return {
      threshold: 1,
      doResize: "",
      btnUp: true,
      btnDown: true,
      onPopup: false,
      dragging: false,
      dsHist: 0,
      floorName: "",
      zoom:0,
    }
  },
  watch: {
    'global.aspectRatio': {
      handler() {
        this.moveMap();
      },
    },
    'global.bldg' : {
      handler() {
        if (this.global.bldg) { // selected
          if (this.getBldg()) {
            if (!this.global.floor) this.global.floor = this.getBldg().meta.floors[1]
            // else: floor already requested (search, routing)
            this.floorName = this.global.bldg + this.global.floor
          }
          floorBox.style.opacity = 1;
          up.style.opacity = down.style.opacity = 1;
          buttonBox.style.pointerEvents = "auto";
          down.style.transform = "rotate(180deg)";
        } else { // unselected
          this.floorName = ""
          this.global.floor = null
          floorBox.style.opacity = 0;
          up.style.opacity = down.style.opacity = 0;
          buttonBox.style.pointerEvents = "none";
        } 
      }
      
    },
    // When floor num changes
    'global.floor': {
      handler() {
        // Disable Up Arrow if on the Highest floor
        if (this.getBldg() && this.global.floor == this.getBldg().meta.floors[0]){
          this.btnUp = false 
        } else if (this.global.floor) {
          this.btnUp = true
        } 

        // Disable Up Arrow if on the Lowest floor
        if (this.global.floor == 1) {
          this.btnDown = false;
        } else if (this.global.floor) {
          this.btnDown = true
        }
      }
    },
    btnUp(turnedOn) {
      if (turnedOn) up.style.opacity = 1;
      else        up.style.opacity = 0.6;
    },
    btnDown(turnedOn) {
      if (turnedOn) down.style.opacity = 1;
      else        down.style.opacity = 0.6;
    },
  },
  mounted() {
    // On load, set floorBox transition
    setTimeout(() => floorBox.style.transition = "transform .2s, width .4s", 500);
    this.moveMap();
    popup.addEventListener("mouseleave", () => { this.onPopup = false })
    popup.addEventListener("mouseenter", () => { this.onPopup = true })
    window.addEventListener("wheel", this.onMouseScroll);
    window.addEventListener("mousedown", () => {
      window.addEventListener("mousemove", this.onMouseDrag);
    });
    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", this.onMouseDrag);
      this.dragging = false
      this.dsHist = 0
    });
  },
  methods: {
    moveMap() {
      var popupWidth = popup.style.width;
        if (400 > 0.33 * window.innerWidth) {
          popupWidth = "400px";
        }

        /* 
            Might be a good idea to make a method for this
            if thinner landscape mode 
            else if wide landscape
            else if portrait wide mode
            else if portrait tall mode
            else
        */
        if ((this.global.aspectRatio <= this.global.flipScreen) && (this.global.aspectRatio >= 0.5)) {
          floorBox.style.transform = 
            `translate(calc(${popupWidth} + (${window.innerWidth}px - ${popupWidth}) * 0.45 - 50px), 
             calc(45vh)) scale(calc(${window.innerHeight * 0.9 / 50 + this.zoom}))` + `rotate(90deg)`;
        } else if (this.global.aspectRatio <= this.global.flipScreen) { 
          floorBox.style.transform = 
              `translate(calc(67vw - 25px), calc(45vh)) scale(${(window.innerWidth) * 0.57 / 50 + this.zoom})`;
        } else if (this.global.aspectRatio <= 1.85) {
          floorBox.style.transform = 
            `translate(calc(50vw - 25px), calc((${window.innerHeight}px - ${popup.style.height}) / 2)) 
             scale(${window.innerWidth * 0.9 / 50 + this.zoom})`;
        } else {
          floorBox.style.transform = 
            `translate(calc(45vw - 25px), calc(25vh - 25px)) scale(calc(${window.innerHeight * 0.45 / 50 + this.zoom}))` + `rotate(90deg)`;
        }
    },

    //clientX and Y will be used to scroll about mouse
    onMouseScroll({clientX, clientY, deltaX, deltaY}) {
      if (!this.onPopup && this.global.bldg){
        let dirwheel = 0;
        if (deltaY>0) {
          dirwheel = -1;
        } else if (deltaY<0) {
          dirwheel = 1;
        }
        let x = window.innerWidth;
        let y = window.innerHeight;
        let ratio = x / y;
        let portraitMode = false;
        if (this.ratio < this.threshold) {
          portraitMode = true;
        }
        let tempZoom=0;
        if (portraitMode) {
          tempZoom = y/50+this.zoom+dirwheel*5;
        } else {
          tempZoom = x/50+this.zoom+dirwheel*5;
        }

        this.zoom +=dirwheel*10;
        if (dirwheel == -1 && this.zoom < 20) this.zoom  = 20 - (30 - this.zoom)*0.5;
        if (dirwheel == 1 && this.zoom >= 20) this.zoom  = 20 + (this.zoom-10)*0.5;
        if (this.zoom > 100) this.zoom  = 100;
        // console.log(dirwheel, this.zoom)
        this.moveMap();
      }
    },
    onMouseDrag({movementX, movementY}) {
      if (!this.onPopup && this.global.bldg) {
        // console.log(floorBox.offsetLeft, floorBox.offsetTop)
        let changeX = (movementX*((this.zoom+100)/100));
        let changeY = (movementY*((this.zoom+100)/100));
        let dsCur =  Math.abs(changeX) + Math.abs(changeY)
        // console.log(dsCur, this.dsHist)
        if (this.dragging || (dsCur > 1 && this.dsHist > 10)) {
          floorBox.style.left = floorBox.offsetLeft + changeX + "px"; 
          floorBox.style.top = floorBox.offsetTop + changeY + "px";
          this.dragging = true
        }
        if (dsCur > 1) this.dsHist++
        // else this.dsHist = 0
      }
    },
    // gets the current building
    getBldg() { return this.global.data[this.global.bldg] },
    bringToFront(f) {
      let group = f.parentNode
      group.appendChild(f)
    },
    // When a room is hovered over
    onRoomHover(roomHover) {
      this.$emit('room-hover', roomHover); // pass it up one more time
    },
    // Increases the floor
    increaseFloor() {
      if (this.getBldg() && this.global.floor < this.getBldg().meta.floors[0]) {
        this.global.floor++;
        this.global.floor = this.global.floor;
        this.floorName = this.global.bldg + this.global.floor
        this.global.room = ""
      }
    },
    // Decreases the floor
    decreaseFloor() {
      if (this.global.floor != 1) {
        this.global.floor--;
        this.global.floor = this.global.floor;
        this.floorName = this.global.bldg + this.global.floor
        this.global.room = ""
      }
    }
  }
}
</script>

<style >
#floorBox {
  position: absolute;
  left: 0%;
  /* left: 50% */
  top: 0%;
  /* top: calc(50% - 125px); */
  transform: translate(-50%, 5%) scale(1) scaleX(1) scaleY(1) rotate(0) skew(0deg, 0deg);
  will-change: transform;
  justify-content: center;
  align-items: center;
  transition: 800ms ease all;
  opacity: 0;
  pointer-events: none;
}

#buttonBox {
  position: absolute;
  justify-content: center;
  align-items: right;
  right: 4vw;
  bottom: 3vw;
  width: 60px;
  height: 150px;
  display: flex;
  flex-wrap: wrap;
  pointer-events: none;
}

.disabled {
  background-color: #dedede !important;
  border-color: var(--hardborder) !important;
  color: #afafaf !important;
  cursor: not-allowed !important;
}

.floor-button {
  position: flex;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  color: #222222;
  border: 3px solid var(--softborder);
  padding: 0;
  opacity: 0;
  cursor: pointer;
}

.floor-button:hover {
  background-color: var(--roomfill);
  border: 3px solid #86b0ac;
  color: #4d6d6b;
}

.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 48
}
</style>