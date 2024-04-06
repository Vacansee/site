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
</template> -->

<!-- JS scripts -->
<script>

export default {
  // give access to global variables
  inject: ["global"],
  props: [''],
  //Export pins variable to be used in any other file
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
  // local variables
  data() {
    return {pins : [{name: "DCC", x:460, y:820, pinned: false}, {name: "Low", x:498, y:820, pinned: false}, {name:"JEC", x: 370, y: 800, pinned: false}, {name:"JROWL", x:384, y:880, pinned: false}, {name:"CBIS", x: 520, y:915, pinned: false}, {name:"Academy",x:540, y: 996, pinned: false},{name:"Robinson", x:635, y:925, pinned: false},{name:"Armory", x:660, y:872, pinned: false},{name:"Mueller", x:660, y:835, pinned: false}, 
      {name:"Commons", x:865, y:855, pinned: false}, {name: "Union", x:650, y:715, pinned: false}, {name:"Sage Dinning", x:530, y:750, pinned: false},{name:"'87 Gym", x:475, y: 660, pinned: false}, {name:"Ricketts", x:395, y:655, pinned: false}, {name:"Troy", x:330, y:655, pinned: false},{name:"Sage", x:245, y:685, pinned: false}, {name:"Walker", x:175, y: 700, pinned: false}, {name:"Pittsburgh", x:110, y: 680, pinned: false}, 
      {name:"West", x:115, y:  620, pinned: false}, {name:"Winslow", x:45, y:715, pinned: false}, {name:"Carnegie", x:137, y: 750, pinned: false}, {name:"Amos_Eaton", x:190, y:770, pinned: false}, {name:"Lally", x:245, y:770, pinned: false}, {name:"Greene", x:300, y:768, pinned: false}, {name:"Folsom", x:200, y:855, pinned: false}, {name:"VCC", x:260, y:855, pinned: false},{name:"EMPAC", x:120, y:925, pinned: false}, {name:"MRC", x:205, y:950, pinned: false}, 
      {name:"Empire", x:255, y:955, pinned: false}, {name:"Cogswell", x:325, y:962, pinned: false}],
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
    getPins(){return this.pins},
    addPin(buildings){
      this.pins.findIndex(i => i.id === buildings);
      if(i != -1)
      {
        this.pins[i].pinned = true;
      }
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