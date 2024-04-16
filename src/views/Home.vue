<script setup>
// Imports items used on the homepage
import MapItem from '../components/home/MapItem.vue'
import PopUpItem from '../components/home/PopUpItem.vue'
import FloorItem from '../components/home/FloorItem.vue'
</script>

<template>
  <!-- Loads Data -->
  <div id="nametag" :style="{ top: mouseTop + 'px', left: mouseLeft + 'px', opacity: ntVisible }"> {{ label }}</div>
  <!-- Creates mapitem, popupitem, flooritem -->
  <MapItem :bldgSVG="bldgSVG" />
  <div id="mask"></div>
  <PopUpItem />
  <FloorItem @room-hover="onRoomHover" />
</template>

<script>
export default {
  // Get reference to all global reactive variables
  inject: ['global'],
  // Components are the .vue files associated with the home page
  components: {
    MapItem,
    PopUpItem,
    FloorItem
  },
  data() {
    return {
      // Local variables used in this .vue file
      mouseTop: 0,
      mouseLeft: 0,
      ntVisible: 0,
      switch: 0,
      bldgSVG: "",
      label: '',
      mouseX: 0,
      mouseY: 0,
      initMouseX: 0,
      initMouseY: 0,
      clicked: false,
      buildingSelected: false,
      totalDisplacementX: 0,
      curMoveX: 0,
      totalDisplacementY: 0,
      curMoveY: 0,
      maxX: 750,
      maxY: 300,
    }
  },
  watch: {
    // Move the popup to the right spot off-view if popup isnt selected
    'global.aspectRatio': {
      handler() {
        // If landscape mode
        // Fixes issue where transitions when unselected would show the popup for a split second
        popup.style.transition = "transform .0s"
        if (!this.bldgSVG && this.global.aspectRatio < this.global.flipScreen) {
          popup.style.transform = "TranslateX(-50vw)"
        // If portrait mode
        } else if (!this.bldgSVG){
          popup.style.transform = "TranslateY(50vh)"
        }
      }
    },
    'global.bldg': {
      handler() {
        if ([...Object.keys(this.global.data)].includes(this.global.bldg)) {
          for (const b of buildings.children) {
            if (b.id === this.global.bldg) this.buildingSelect(b)
          }
        }
      }
    }
  },
  mounted() {
    // addEventListeners allow the file to call a function when 
    // an action occurs
    window.addEventListener("mousemove", (window) => {
      this.mouseX = window.clientX;
      this.mouseY = window.clientY;
      this.moveScreen()
    })
    mask.addEventListener("click", this.buildingDeselect)
    window.addEventListener("mouseup", () => {this.clicked = false, this.totalDisplacementX += this.curMoveX,  this.totalDisplacementY += this.curMoveY, this.moveInBounds()})
    window.addEventListener("mousedown", this.getInitMouse)
    window.addEventListener("mousemove", this.nameTagMove)
    Array.from(document.getElementsByClassName("nav-btn")).forEach((btn) => {
      btn.addEventListener("mouseover", () => { this.nameTagAppear(btn) })
      btn.addEventListener("mouseleave", () => {this.nameTagDisappear})
    })
    for (const b of buildings.children) {
      b.addEventListener("mouseover", () => { this.nameTagAppear(b) })
      b.addEventListener("mouseleave", this.nameTagDisappear)
      b.addEventListener("click", () => { this.buildingSelect(b) })
    }

    for (const o of other.children) {
      o.addEventListener("mouseover", () => { this.nameTagAppear(o) })
      o.addEventListener("mouseleave", this.nameTagDisappear)
      o.addEventListener("click", () => {
        this.$showToast({type: 'info', title: 'Unavailable', body: "This isn\'t a public facility", lasts: 2000}) })
    }

    // If landscape mode
    // Fixes issue where transitions when unselected would show the popup for a split second
    popup.style.transition = "transform .0s"
    if (!this.bldgSVG && this.global.aspectRatio < this.global.flipScreen) {
      popup.style.transform = "TranslateX(-50vw)"
    // If portrait mode
    } else if (!this.bldgSVG){
      popup.style.transform = "TranslateY(50vh)"
    }
  },
  methods: {
    runFind() {
      console.clear()
      let count = 0 
      for (const b of buildings.children) {
        console.log(b.id)
        count++
      }
      console.log(count)

      // for (const o of other.children) {
      //   if (!(o.id in this.global.data)) console.log(o.id)
      // }
    },
    moveInBounds() {
      if (!this.buildingSelected) {
        if (this.totalDisplacementX > this.maxX) {
          this.totalDisplacementX = this.maxX
        } else if (this.totalDisplacementX < -this.maxX) {
          this.totalDisplacementX = -this.maxX
        }
        if (this.totalDisplacementY > this.maxY) {
          this.totalDisplacementY = this.maxY
        } else if (this.totalDisplacementY < -this.maxY) {
          this.totalDisplacementY = -this.maxY
        }
        var xPos = -1.5*window.innerWidth/100 - this.totalDisplacementX
        var yPos = -4.95*window.innerHeight/100 - this.totalDisplacementY
        mapBox.style.transition = "800ms ease all"
        mapBox.style.transform = `scale(1) translate(${xPos}px, ${yPos}px)`
    }
    },
    moveScreen(c) {
      if (!this.buildingSelected && this.clicked) {
        this.curMoveX =  this.initMouseX - this.mouseX 
        this.curMoveY = this.initMouseY - this.mouseY
        var xPos = -1.5*window.innerWidth/100 - (this.totalDisplacementX + this.curMoveX)
        var yPos = -4.95*window.innerHeight/100 - (this.totalDisplacementY + this.curMoveY)
        var pushbackScale = 10
        if (this.curMoveX + this.totalDisplacementX > this.maxX) {
          xPos = -1.5*window.innerWidth/100 - (this.maxX + pushbackScale*Math.sqrt(this.totalDisplacementX + this.curMoveX-this.maxX))
        } else if (this.curMoveX + this.totalDisplacementX < -this.maxX) {
          xPos = -1.5*window.innerWidth/100 + (this.maxX + pushbackScale*Math.sqrt(-this.totalDisplacementX - this.curMoveX-this.maxX))
        }
        if (this.curMoveY + this.totalDisplacementY > this.maxY) {
          var yPos = -4.95*window.innerHeight/100 - (this.maxY + pushbackScale*Math.sqrt(this.totalDisplacementY + this.curMoveY-this.maxY))
        } else if (this.curMoveY + this.totalDisplacementY < -this.maxY) {
          var yPos = -4.95*window.innerHeight/100 + (this.maxY + pushbackScale*Math.sqrt(-this.totalDisplacementY - this.curMoveY-this.maxY))
        }
        mapBox.style.transition = "0ms ease all"
        mapBox.style.transform = `scale(1) translate(${xPos}px, ${yPos}px)`
      }
    },
    getInitMouse() {
      this.initMouseX = this.mouseX
      this.initMouseY = this.mouseY
      this.curMoveX = 0
      this.curMoveY = 0
      this.clicked = true
    },
    // Make the name tag pop up
    nameTagAppear(b) {
      // Only show nametag on unselected buildings
      if (this.global.data && !this.bldgSVG) {
        this.ntVisible = 1
        if (b.ariaLabel) this.label = b.ariaLabel
        else if(this.global.data[b.id] != undefined) this.label = this.global.data[b.id].meta.name
        else this.label = b.id.replace(/_/g, ' ')
      }
    },
    // Make the name tag go away
    nameTagDisappear() {
      this.ntVisible = 0
    },
    // Have the name tag move along with the cursor
    nameTagMove(c) {
      let clickX = c.clientX
      let clickY = c.clientY
      if (this.label == "GitHub" || this.label == "Feedback")
        this.mouseTop = clickY + 30
      else this.mouseTop = clickY - 50

      let tagWidth = 20
      if (this.ntVisible == 1)
        tagWidth = nametag.getBoundingClientRect().width
      this.mouseLeft = clickX - (tagWidth / 2.2)
    },
    // events that occur when a room is hovered over
    onRoomHover(roomHover) {
      let nametag = document.getElementById('nametag');
      if (roomHover[0]) {
        this.ntVisible = 1
        this.label = roomHover[0] 
        if (roomHover[1]) nametag.style.fontSize = '24px'
        else nametag.style.fontSize = '16px'
      }
      else if (roomHover[0] == '') {
        this.ntVisible = 0
        nametag.style.fontSize = '14px'
      }
    },
    // On selection of a building (when clicked on)
    buildingSelect(b) {
      if (this.global.data && !this.bldgSVG) {
        this.buildingSelected = true
        // this.$router.push({ name: 'home', params: { bldg } });
        let bBox = b.getBoundingClientRect()
        let boxCenterX = bBox.x + this.totalDisplacementX + bBox.width / 2
        let boxCenterY = bBox.y + this.totalDisplacementY + bBox.height / 2

        this.bldgSVG = b
        this.global.bldg = b.id
        this.ntVisible = 0 // hide nametag when building selected

        mask.style.opacity = 0.65
        mask.style.pointerEvents = "inherit"
        mapBox.style.transition = "800ms ease all"
        console.log(window.innerWidth / 2 - boxCenterX + this.totalDisplacementX);
        console.log(window.innerHeight / 2 - boxCenterY - 50);
        console.log(boxCenterX, boxCenterY);
        console.log(this.totalDisplacementX, this.totalDisplacementY)

        mapBox.style.transform = `scale(3) translate(${window.innerWidth / 2 - boxCenterX}px, ${window.innerHeight / 2 - boxCenterY - 50}px)`
        // Bring the popup to 0,0
        popup.style.transition = "transform .5s"
        popup.style.transform = "translateY(0vh)"
        popup.style.minWidth = "400px"
      }
    },
    // On deselection of a building (when clicked off)
    buildingDeselect() {
      try {
        this.buildingSelected = false
        this.bldgSVG = ""
        this.global.bldg = ""
        this.moveInBounds()
        mask.style.pointerEvents = "none"
        mask.style.opacity = 0
        popup.style.transition = "transform .5s"
        popup.style.minWidth = "unset"
        // Landscape mode
        if (this.global.aspectRatio <= this.global.flipScreen) {
          popup.style.transform = "TranslateX(-50vw)"
        // If portrait mode
        } else {
          popup.style.transform = "TranslateY(50vh)"
        }
      } catch { /* pass */ }
    }
  }
}
</script>

<style scoped>

#mask {
  width: 100vw;
  height: 100vh;
  z-index: 5;
  opacity: 0;
  background: black !important;
  stroke: none !important;
  pointer-events: none;
}

#nametag {
  z-index: 10;
  color: black;
  font-size: 14px;
  position: absolute;
  background-color: white;
  width: fit-content;
  padding: 2px 6px 4.5px;
  border: 2px solid var(--softborder);
  border-radius: 5px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
  transition-duration: .1s;
  pointer-events: none;
}
</style>