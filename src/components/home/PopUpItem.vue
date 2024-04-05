<script setup>
import moment from 'moment-timezone'
import { average } from 'color.js'
import Tag from 'primevue/tag';

import InfoIcon from '@/assets/icons/info.svg?component'

</script>


<template>
    <!-- HTML for the popup -->
    <div id="popup">
        <div id="breadcrumbs">
            {{ global.bldg.replace(/_/g, ' ') }}
            <span v-if="global.bldg"> > Floor {{ global.floor }}</span>
            <span v-if="!noneSelected()"> > Room {{ global.room }}</span>
        </div>
        <div id="fadeout"></div>
        <div v-if="global.bldg && getBldg()" class="body">
            <div class="block">
                <div id="photoBox">
                    <!-- <img :src="'src/assets/photos/' + global.bldg + '.jpg'" id="photo"> -->
                    <img :src="imgPath" id="photo">
                    <span>{{ getBldg().meta.name }}</span>
                </div>
                <p id="heat" v-if="interpretHeat()"><b style="color:var(--heatColor);">{{ interpretHeat() }}</b> (~{{
                getBldg().meta.heat.toFixed(2) * 100 }}%)</p>
                <p id="heat" v-else><b>N/A</b></p>
                <p id="flow" v-if="interpretFlow()">+ {{ interpretFlow() }} (~{{ getBldg().meta.flow.toFixed(2) * 100
                    }}%)&emsp;</p>
                <p id="time" ref="mySpan">{{ getRealTime(global.time) }}</p>
                <span v-if="getHist()">
                    <InfoIcon class="info" />
                    <a :href="'https://archives.rpi.edu/institute-history/building-histories/' + getHist()">
                        <em> Get historical info&emsp;</em>
                    </a>
                </span>
                <Tag value="Tag placeholder" rounded></Tag> <!-- Placeholder for the tag -->
            </div>
            <div v-if="getDining()" class="block"> <!-- Block: dining -->
                <b>Dining&emsp;</b>
                <InfoIcon class="info" />
                <a :href="'https://rpi.sodexomyway.com/dining-near-me/' + getDining().url">
                    <em> More info</em>
                </a>
                <p v-for="d in parseDiners()"> &emsp;{{ d }}: </p>
                <p>Test</p>
            </div>
            <div v-if="noneSelected()" class="block warn">No room selected</div>
            <div v-else-if="noData()" class="block warn">No classes in room</div>
            <div v-else> <!-- Room w/ data selected -->
                <div class="block"> <!-- Block #1: room information -->
                    <b>Overview</b><br><br>
                    <span>Capacity: ~{{ getRoom().meta.max }}&emsp;&emsp;</span>
                    <span v-if="!getPrinters()">Printers: none</span>
                    <p v-if="getRoom().meta.cur"><b>{{ getRoom().meta.cur[0] }}</b> ends in
                        <b>{{ getCur().hours() }}h</b> and
                        <b>{{ getCur().minutes() }}m</b>
                        <span v-if="getSecs('cur') > 0"> for section{{ (getSecs('cur') > 1) ? 's ' : ' ' }}</span>
                        <span v-for="item in getRoom().meta.cur[1]" class="sec">{{ item }}</span>
                    </p>
                    <p v-else>No class in session</p>
                    <p v-if="getRoom().meta.next">Next class (<b>{{ getRoom().meta.next[0] }}</b>) starts in
                        <b>{{ getNext().hours() }}h</b> and
                        <b>{{ getNext().minutes() }}m</b>
                        <span v-if="getSecs('next') > 0"> for section{{ (getSecs('next') > 1) ? 's ' : ' ' }}</span>
                        <span v-for="item in getRoom().meta.next[1]" class="sec">{{ item }}</span>
                    </p>
                    <p v-else class="warn"> No more classes this week</p>
                </div>
                <div v-if=isLibraryStudyRoom() class="library-study-room"> <!-- Block: library study room -->
                    <div class="block">
                        <b>Time Slots<br /><br /></b>
                        <div class="time-slots">
                            <button v-for="timeSlot in getTodaysClasses()" :key="timeSlot[1]" class="time-slot"
                                :class="{ unavailable: timeSlot[0] === 'Unavailable' }"
                                @click=" timeSlot[0] === 'Available' && openLink(timeSlot[2])"
                                :disabled="timeSlot[0] !== 'Available'">
                                {{ timeSlot[1] }}
                            </button>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div v-if="getTodaysClasses().length" class="block"> <!-- Block: today's room schedule -->
                        <b>Today</b>
                        <table>
                            <tr v-for="item in getTodaysClasses()">
                                {{ item[0] }}
                                <td>{{ item[1] }}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div v-if="getPrinters()" class="block"> <!-- Block: printers -->
                    <b>Printer{{ getPrinters().length > 1 ? 's' : '' }}</b>
                    <div v-for="p in getPrinters()" style="line-height: 0.5;">
                        <p>
                        <h4>{{ p[0] }}</h4>
                        </p>
                        <p>Dimensions: {{ p[1] }}&emsp;&emsp;Resolution: {{ p[2] }}</p>
                        <p>Color: {{ p[3] }}&emsp;&emsp;Duplex: {{ p[4] }}</p>
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
        return { imgPath: "" }
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
                } else { // If portrait mode
                    popup.style.height = "50vh"
                    popup.style.width = "100vw"
                    popup.style.left = `${(window.innerWidth - popup.offsetWidth) / 2}px`
                    popup.style.borderRadius = "15px 15px 0 0"
                    if (window.innerWidth > 800) buttonBox.style.bottom = "3vw"
                    else buttonBox.style.bottom = "52vh"
                }
            }
        },
        'global.bldg': {
            handler() {
                if (this.global.bldg) {
                    this.imgPath = new URL(`../../assets/photos/${this.global.bldg}.jpg`, import.meta.url).href
                    average(this.imgPath, { format: 'hex' })
                        .then(color => {
                            photoBox.style.backgroundColor = `${color}20`
                            photoBox.style.outlineColor = `${color}40`
                        })
                }
            }
        }
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
            popup.style.left = `${(window.innerWidth - popup.offsetWidth) / 2}px`
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
            switch (type) {
                case 'cur': return this.getRoom().meta.cur[1].length
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
        // Returns all data for the current room
        getRoom() { return this.getBldg()[this.global.room] },
        // Gets the current time
        getRealTime(date) { return moment(date, 'e:HHmm').tz('America/New_York').format('h:mm A') },
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
            else if (flow > .5) return 'foot traffic'
            else if (flow > .2) return 'some foot traffic'
            else return false
        },
        getHist() {
            let hist = this.getBldg().meta.hist
            if (hist === "") hist = this.getBldg().meta.name.toLowerCase().replace(/ /g, "-")
            return hist // for case: false
        },
        isLibraryStudyRoom() {
            return this.getBldg().meta.name == "Folsom Library"
        },
        openLink(){
            let roomName = this.getRoom().meta.name
            let baseUrl = 'https://cal.lib.rpi.edu/space/'
            if (roomName == '353a') {baseUrl += '161973'}
            else if (roomName == '353b') {baseUrl += '161974'}
            //add more conditionals for each study room
            window.open(baseUrl, '_blank')
        }
    }
}
</script>
<style scoped>
.library-study-room .time-slots {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 0.5rem;
}

.library-study-room .time-slot {    /* Available slot color */
    background-color: #7eff96;
    padding: 0.5rem;
    width: 100%;
    box-sizing: border-box;
    border-radius: 10px;
}

.library-study-room .time-slot.unavailable {    /* Unavailable slot color */
    background-color: #ff5757;
    border-radius: 10px;
}

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
    color: rgb(0, 0, 0);
    font-size: x-large;
    font-weight: 600;
    height: 50px;
    border-radius: 12px 12px 0 0;
    background-color: white;
}

#fadeout {
    background-image: linear-gradient(white, transparent);
    position: relative;
    z-index: 1;
    height: 25px;
}

.body {
    position: absolute;
    top: 50px;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-color: var(--hardborder) transparent;
    scroll-snap-stop: always;
}

#photo {
    width: 100%;
    border-radius: 9px 9px 0 0;
    display: flex;
}

#photoBox {
    max-width: 80%;
    display: block;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    line-height: 2.5;
    outline: 3px solid;
    border-radius: 10px;
}

#heat {
    font-size: larger;
    line-height: 0;
    padding-bottom: .5rem;
    text-align: center;
}

#flow {
    line-height: 0;
    text-align: center;
}

#time {
    text-align: center;
    color: var(--hardborder);
}

table,
td {
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
    font-family: monospace;
    padding: 4px 5px 1px 5px;
    margin: 0 5px 0 0;
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
}

.info {
    fill: #1e3050;
    margin: 0 4px -4px 0;
    height: 20px;
    width: 20px;
}

li {
    line-height: 1.5;
}
</style>
