<script setup>
import moment from 'moment-timezone'
import { average } from 'color.js'
import InfoIcon from '@/assets/icons/info.svg?component'
import CopyIcon from '@/assets/icons/copy.svg?component'
import tinycolor from "tinycolor2"
</script>

<template>
    <!-- HTML for the popup -->
    <div id="popup">
        <CopyIcon id="copy" @click="copyURL"/>
        <div id="breadcrumbs">
            {{ global.bldg.replace(/_/g, ' ') }}
            <span v-if="global.bldg"> <span id="slash">/</span> Floor {{ global.floor }}</span>
            <span v-if="!noneSelected()"> <span id="slash"> /</span> Room {{ global.room }}</span>
        </div>
        <div id="fadeout"></div>
        <div v-if="global.bldg && getBldg()" class="body">
            <div class="block">
                <img :src="imgPath" id="photo">
                <div id="img-fadeout"></div>
                <div id="title">
                    <span>{{ getBldg().meta.name }}</span>
                </div>
                    <a v-if="getHist()" :href="'https://archives.rpi.edu/institute-history/building-histories/' + getHist()">
                        <InfoIcon id="info"/>
                    </a>
                <div id="stats">
                    <span id="heat" v-if="interpretHeat()"><b style="color:var(--heatColor);">{{ interpretHeat() }}</b>
                    <span> (~{{ Math.trunc(getBldg().meta.heat.toFixed(2)*100) }}%)</span></span>
                    <span id="heat" v-else><b>N/A</b></span>
                    <span id="flow" v-if="interpretFlow()"> &emsp;+ 👣 <span v-if="!compact">{{ interpretFlow() }}</span>
                    &emsp; </span>
                    <span id="hours" v-if="getAccess()"> &emsp;{{ getAccess()[0] + " - " + getAccess()[1] }}</span>
                    <span v-if="!getAccess()"> &emsp; 🔒 <span v-if="!compact">locked</span></span>
                </div>
            </div>
            <div v-if="getDining()" class="block"> <!-- Block: dining -->
                <b>Dining&emsp;</b>
                <a :href="'https://rpi.sodexomyway.com/dining-near-me/' + getDining().url">
                    <InfoIcon class="i"/>
                </a>
                <p v-for="d in parseDiners()"> &emsp;{{ d }}: </p>
                <p>Test</p>
            </div>
            <div v-if="noneSelected()" class="block warn">No room selected</div>
            <div v-else-if="noData()" class="block warn">No classes in room</div>
            <div v-else> <!-- Room w/ data selected -->
                <div class="block"> <!-- Block #1: room information -->
                    <b>Overview</b><br><br>
                    <span>👤 Capacity: ~{{ getRoom().meta.max }}&emsp;&emsp;</span>
                    <span v-if="!getPrinters()">&emsp;&emsp;🖨️ Printers: none</span>
                    <p v-if="getRoom().meta.cur"><b>{{ getRoom().meta.cur[0] }}</b> ends in
                        <b>{{ getCur().hours() }}h</b> and
                        <b>{{ getCur().minutes() }}m</b>
                        <span v-if="getSecs('cur')>0"> for section{{(getSecs('cur') > 1) ? 's ':' '}}</span>
                        <span v-for="item in getRoom().meta.cur[1].map(Number)" class="sec">{{ item }}</span>
                    </p>
                    <p v-else>No class in session</p>
                    <p v-if="getRoom().meta.next">Next class (<b>{{ getRoom().meta.next[0] }}</b>) starts in
                        <b>{{ getNext().hours() }}h</b> and
                        <b>{{ getNext().minutes() }}m</b>
                        <span v-if="getSecs('next')>0"> for section{{(getSecs('next') > 1) ? 's ':' '}}</span>
                        <span v-for="item in getRoom().meta.next[1].map(Number)" class="sec">{{ item }}</span>
                    </p>
                    <p v-else class="warn"> No more classes this week</p>
                </div>
                <div v-if="getTodaysClasses().length" class="block"> <!-- Block: today's room schedule -->
                    <b>Today</b>
                    <table>
                        <tr v-for="item in getTodaysClasses()">
                            {{ item[0] }}
                            <td>{{ item[1] }}</td>
                        </tr>
                    </table>
                </div>
                <div v-if="getPrinters()" class="block"> <!-- Block: printers -->
                    <b>Printer{{ getPrinters().length > 1 ? 's' : '' }}</b>
                    <div v-for="p in getPrinters()" style="line-height: 0.5;">
                        <p><h4>{{p[0]}}</h4></p>
                        <p>Dimensions: {{p[1]}}&emsp;&emsp;Resolution: {{p[2]}}</p>
                        <p>Color: {{p[3]}}&emsp;&emsp;Duplex: {{p[4]}}</p>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="global.bldg" class="block warn">No classes here!</div>
    </div>
</template>

<script>

export default {
    // Gets reference to global
    inject: ['global'],
    data() {
        return { imgPath: "", compact: false }
    },
    watch: {
        'global.aspectRatio': {
            handler() {
                // If landscape mode
                if (this.global.aspectRatio <= this.global.flipScreen) {
                    popup.style.height = "100vh"
                    popup.style.width = "33vw"
                    popup.style.left = "unset"
                    popup.style.borderRadius = "0 15px 15px 0"
                    buttonBox.style.bottom = "3vw"
                    this.compact = (this.global.aspectRatio >= .75) ? true : false
                } else { // If portrait mode
                    popup.style.height = "50vh"
                    popup.style.width = "100vw"
                    popup.style.left = `${(window.innerWidth-popup.offsetWidth)/2}px`
                    popup.style.borderRadius = "15px 15px 0 0"
                    if (window.innerWidth > 800) buttonBox.style.bottom = "3vw"
                    else buttonBox.style.bottom = "52vh"
                    this.compact = (this.global.aspectRatio >= 2.4) ? true : false
                }
            }
        },
        'global.bldg': {
            handler() {
                if (this.global.bldg) {
                    this.imgPath = new URL(`../../assets/photos/${this.global.bldg}.jpg`, import.meta.url).href
                    const img = new Image()
                    img.src = this.imgPath

                img.onload = () => {
                    // Observe image's top-left 50x50 px:
                    const canvas = document.createElement('canvas')
                    const ctx = canvas.getContext('2d')
                    canvas.width = 50; canvas.height = 50
                    ctx.drawImage(img, 0, 0, 50, 50, 0, 0, 50, 50)

                    const cropPath = canvas.toDataURL()

                    average(cropPath, { format: 'hex' })
                        .then(color => {
                            let lum = tinycolor(color).getLuminance()
                            console.log("luminance", lum)
                            info.style.fill = ( lum > 0.3) ? '#000000aa' : '#ffffffdd'
                        })
                    average(this.imgPath, { format: 'hex' })
                        .then(color => {
                            title.style.color = color
                            photo.style.borderColor = `${color}80`
                        })
                    }
                }
            },
        },
    },
    mounted() {
        if (this.global.aspectRatio <= this.global.flipScreen) {
            popup.style.height = "100vh"
            popup.style.width = "33vw"
            popup.style.left = "unset"
            popup.style.borderRadius = "0 15px 15px 0"
            buttonBox.style.bottom = "3vw"
        } else { // If portrait mode
            popup.style.height = "50vh"
            popup.style.width = "100vw"
            popup.style.left = `${(window.innerWidth-popup.offsetWidth)/2}px`
            popup.style.borderRadius = "15px 15px 0 0"
            if (window.innerWidth > 800) buttonBox.style.bottom = "3vw"
            else buttonBox.style.bottom = "52vh"
        }
    },
    methods: {
        // return if a room is selected
        noneSelected() { return !this.global.room },
        // Returns the current building
        getBldg() {
            let bldg = this.global.data[this.global.bldg]
            return bldg ? bldg : console.warn(`No classes here!`)
        },
        noData() { return !this.getBldg().hasOwnProperty(this.global.room) },
        getSecs(type) { 
            switch(type) {
                case  'cur': return this.getRoom().meta.cur[1].length
                case 'next': return this.getRoom().meta.next[1].length
            }
        },
        // Gets the cur from meta data
        getCur() {
            const i = moment(this.global.time, 'e:HHmm'), f = this.getRoom().meta.cur[2]
            return moment.duration(f.diff(i))
        },
        // Gets next from meta data
        getNext() {
            const i = moment(this.global.time, 'e:HHmm'), f = this.getRoom().meta.next[2]
            return moment.duration(f.diff(i))
        },
        getAccess() { // Returns whether building is open/closed
            if (!this.getBldg().meta.hasOwnProperty("open")) return false
            else return this.getBldg().meta.open
        },
        // Returns all data for the current room
        getRoom() { return this.getBldg()[this.global.room] },
        // Gets the current time
        getRealTime(date) {  return moment(date, 'e:HHmm').format('h:mm A') },
        // Returns the printers in a building
        getPrinters() {
            if (!this.getRoom().meta.hasOwnProperty("printers")) return false
            else return this.getRoom().meta.printers
        },
        getDining() {
            if (!this.getBldg().meta.hasOwnProperty("dining")) return false
            else return this.getBldg().meta.dining
        },
        parseDiners() { // Test
            if (isNaN(Object.keys(this.getBldg().meta.dining)[0][0])) {
                let diners = []        
                for (let diner in this.getBldg().meta.dining) {
                    if (diner == "url") continue
                    diners.push(diner)
                } return diners
            }
        },
        // Gathers the classes for the building
        getTodaysClasses() {
            let classes = []
            let roomData = this.getRoom() 
            for (let time in roomData) {
                if (time.split(':')[0] == this.global.time.split(':')[0])
                    classes.push([roomData[time][0], this.getRealTime(time)])
            } return classes
        },
        // Turns the heat from a number into a representative phrase
        interpretHeat() {
            let heat = this.getBldg().meta.heat
            if (isNaN(heat)) return false
            if (heat > .8) return 'very busy'
            else if (heat > .6) return 'busy'
            else if (heat > .4) return 'usual'
            else if (heat > .1) return 'not busy'
            else return 'vacant'
        },
        interpretFlow() {
            let flow = this.getBldg().meta.flow
            if (flow > .8) return 'heavy foot traffic'
            else if (flow > .5) return 'heavy foot traffic'
            else if (flow > .2) return 'some foot traffic'
            else return false
        },
        getHist() {
            let hist = this.getBldg().meta.hist
            if (hist === "") hist = this.getBldg().meta.name.toLowerCase().replace(/ /g, "-")
            return hist // for case: false
        },
        copyURL() {
          navigator.clipboard.writeText(window.location.href)
          this.$showToast({type: 'info', title: 'Link to location copied', lasts: 1000})
        }
    }
}
</script>

<style scoped>
#popup {
    width: 100vw;
    min-width: unset;
    max-width: 600px;
    height: 50vh;
    position: absolute;
    pointer-events: all;
    bottom: 0;
    left: unset;
    z-index: 6;
    user-select: none;
    transform: translateY(250px);
    transition: all 1.5s;
    box-sizing: border-box;
    background-color: white;
    border: 3px solid var(--softborder);
    border-bottom-style: none;
    box-shadow: 0px -2px 40px rgba(0, 0, 0, 0.20);
    background-color: var(--soft-bg);
    border-radius: 15px 15px 0 0;
}

#breadcrumbs {
    padding: 10px 0px 0px 20px;
    font-size: x-large;
    font-weight: 600;
    height: 45px;
    border-radius: 12px 12px 0 0;
    background-color: white;
}

#slash {
    font-weight: 500;
    color: #000000a0;
}

#fadeout {
    background-image: linear-gradient(white, transparent);
    position:relative;
    z-index: 1;
    height: 25px;
}

#img-fadeout {
    background-image:
        linear-gradient(185deg, transparent 20%, white 55%, white),
        linear-gradient(182deg, transparent 30%, white 60%, white);

    position: absolute;
    height: 160px;
    width:  97%;
    bottom: 0px;
}

.body {
    position: absolute;
    top: 45px;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-color: var(--hardborder) transparent;
    scroll-snap-stop: always;
}

#photo {
    width: 100%;
    border-radius: 9px 9px 0 0;
    position: relative;
    border: 2px solid var(--softborder);
}


#title {
    line-height: 2.5;
    font-weight: 500;
    left: 1.2rem;
    text-shadow: white 4px -2px 20px;
    font-size: x-large;
    position: absolute;
    bottom: 14%;

}

#heat {
    font-size: larger;
}

#flow {
    color: #000000aa;
}

table, td {
    line-height: 2.5;
    padding-left: 15px;
}

table {
    width: 80% !important;
    min-width: 350px;
    padding-bottom: 15px;
}

td {
    border-left: solid 1px var(--softborder);
}

tr:nth-child(even) {
    background-color: #d4e5e280;
}

.warn {
    color: #dc3545;
    text-align: center;
    font-weight: 500;
}

.sec {
    font-size: small;
    padding: 2px 6px 2px 6px;
    margin-right: 6px;
    background-color: var(--roomfill);
    border-radius: 30%;
}

.block {
    /* background-color: paleturquoise; */
    margin: 10px;
    padding: 10px;    
    border-radius: 10px;
    border: 1px solid var(--softborder);
    box-shadow: 0px -2px 5px rgba(0, 0, 0, 0.05);
    background-color: white;
    position: relative;
}

#stats {
    position: absolute;
    vertical-align: middle;
    bottom: 7%;
    left: 1.2rem;
}

#hours {
    font-size: smaller
}

.i {
    position: absolute;
    fill: #000000aa;
    height: 20px;
}

#info {
    fill: var(--buildfill);
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    height: 25px;
}

#copy {
    fill: black;
    width: 28px;
    z-index: 2;
    position: absolute;
    top: 12px;
    right: 22px;
    transition: all 0.2s;
}

#copy:hover {
    fill: #000000b0;
}

li {
    line-height: 1.5;
}

</style>
 