<!-- This will be a component of MapItem at some point (might need its own manager)-->

<!-- HTML scripts -->
<!-- <template>
  <svg viewBox="0 0 1024 1706" id="map" filter="url(#blur)">
  <foreignObject v-for="pin in pins" style="pointer-events: none;" :x="pin.x" :y="pin.y" width="100%" height="100%">
      <div class = "map-overlays-icons">
        <p class="pin" v-if=pin.pinned style=" position:absolute; color:rgb(255, 255, 255); font-weight:1000;"><span class="map-overlays-icons">📌</span></p>
      </div>
    </foreignObject>
    </svg>
</template>  -->

<!-- JS scripts -->
<script>
export default {
    // local variables
    data(){
    return {
      pins:new Map([
      ["DCC",{x:460, y:820, pinned: true}], ["Low", {x:498, y:820, pinned: false}], ["JEC", {x: 370, y: 800, pinned: false}], ["JROWL", {x:384, y:880, pinned: false}], ["CBIS", {x: 520, y:915, pinned: false}], ["Academy",{x:540, y: 996, pinned: false}],["Robinson", {x:635, y:925, pinned: false}],["Armory", {x:660, y:872, pinned: false}],["Mueller", {x:660, y:835, pinned: false}], 
      ["Commons", {x:865, y:855, pinned: false}], ["Union", {x:650, y:715, pinned: false}], ["Sage Dinning", {x:530, y:750, pinned: false}],["'87 Gym", {x:475, y: 660, pinned: false}], ["Ricketts", {x:395, y:655, pinned: false}], ["Troy", {x:330, y:655, pinned: false}],["Sage", {x:245, y:685, pinned: false}], ["Walker", {x:175, y: 700, pinned: false}], ["Pittsburgh", {x:110, y: 680, pinned: false}], 
      ["West", {x:115, y:  620, pinned: false}], ["Winslow", {x:45, y:715, pinned: false}], ["Carnegie", {x:137, y: 750, pinned: false}], ["Amos_Eaton", {x:190, y:770, pinned: false}], ["Lally", {x:245, y:770, pinned: false}], ["Greene", {x:300, y:768, pinned: false}], ["Folsom", {x:200, y:855, pinned: false}], ["VCC", {x:260, y:855, pinned: false}],["EMPAC", {x:120, y:925, pinned: false}], ["MRC", {x:205, y:950, pinned: false}], 
      ["Empire", {x:255, y:955, pinned: false}], ["Cogswell", {x:325, y:962, pinned: false}]
      ])
    };
  },
  methods: {
    getPins(){return this.pins;
    }
  },
  // give access to global variables
  inject: ["global"],
  props: [''],
  // will constantly check variables values
  watch: {
    // this might need to be a different variable
    'global.bldg': {
      handler() {
        if (this.global.bldg) {
          // show
          
          isPinned = true;
        } else {
          // hide
          isPinned = false;
        }
      }
    }
  },
  // code that runs every frame
  updated() {

  },
  // run on the start of the webpage
  mounted() {

  },
  methods: {
    getBldg() { return this.global.data[this.global.bldg] },
    addPin(buildings){
      value = this.pins.get(buildings);
      value.pinned = true;
    },

    // optional methods that could be added if needed
    placePin(x,y) {},
    removePin(building){},
    removePinByID(ID) {},
  }
}
</script>

<!-- CSS scripts -->
<style>
#pin{
  position: absolute;
  left: 500px;
  top: 1000px;
  will-change: transform;
  transform: translate(0%, 0%) scale(1) scaleX(1) scaleY(1) rotate(0) skew(0deg, 0deg);
}
</style>