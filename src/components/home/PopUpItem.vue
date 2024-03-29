<script setup>
import moment from 'moment-timezone'
import Tag from 'primevue/tag';
</script>

<template>
    <!-- HTML for the popup -->
    <div id="popup">
        <div id="breadcrumbs">
            {{ global.bldg.replace(/_/g, ' ') }}
            <span v-if="global.bldg"> > Floor {{ global.floor }}</span>
            <span v-if="!noneSelected()"> > Room {{ global.room }}</span>
        </div>
        <div v-if="global.bldg && getBldg()" class="body">
            <div class="block">
                <div id="photo-box">
                    <img :src="'src/assets/photos/' + global.bldg + '.jpg'" id="photo">
                    <!-- <img :src="`../../assets/photos/${global.bldg}.jpg`" id="photo"> -->
                    <span>{{ getBldg().meta.name }}</span>
                </div>
                <p id="heat" v-if="interpretHeat()"><b style="color:var(--heatColor);">{{ interpretHeat() }}</b> (~{{ Math.trunc(getBldg().meta.heat.toFixed(2)*100) }}%)</p>
                <p id="heat" v-else><b>N/A</b></p>
                <p id="flow" v-if="interpretFlow()">+ {{ interpretFlow() }} (~{{ Math.trunc(getBldg().meta.flow.toFixed(2)*100) }}%)&emsp;</p>
                <p id="time" ref="mySpan">{{ getRealTime(global.time) }}</p>
                <span v-if="getHist()"> 
                    <img src="../../assets/icons/info.svg" height="20" width="20" />
                    <a :href="'https://archives.rpi.edu/institute-history/building-histories/' + getHist()">
                        <em> Get historical info&emsp;</em>
                    </a>
                </span>
                <Tag value="Tag placeholder" rounded></Tag> <!-- Placeholder for the tag -->
            </div>
            <div v-if="noneSelected()" class="block warn">No room selected</div>
            <div v-else-if="noData()" class="block warn">No classes in room</div>
            <div v-else> <!-- Room w/ data selected -->
                <div class="block"> <!-- Block #1: room information -->
                    <span>Capacity: ~{{ getData().meta.max }}&emsp;&emsp;</span>
                    <span v-if="!getPrinters()">Printers: none</span>
                    <p v-if="getData().meta.cur"><b>{{ getData().meta.cur[0] }}</b> ends in
                        <b>{{ getCur().hours() }}h</b> and
                        <b>{{ getCur().minutes() }}m</b>
                        <span v-if="getSecs('cur')>0"> for section{{(getSecs('cur') > 1) ? 's':''}}</span>
                        <span v-for="item in getData().meta.cur[1]" class="sec">{{ item }}</span>
                    </p>
                    <p v-else>No class in session</p>
                    <p v-if="getData().meta.next">Next class (<b>{{ getData().meta.next[0] }}</b>) starts in
                        <b>{{ getNext().hours() }}h</b> and
                        <b>{{ getNext().minutes() }}m</b>
                        <span v-if="getSecs('next')>0"> for section{{(getSecs('next') > 1) ? 's':''}}</span>
                        <span v-for="item in getData().meta.next[1]" class="sec">{{ item }}</span>
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
    watch: {
        'global.aspectRatio': {
            handler() {
                // If landscape mode
                if (this.global.aspectRatio <= 1.2) {
                    popup.style.height = "100vh"
                    popup.style.width = "33vw"
                    popup.style.borderRadius = "0 15px 15px 0"
                    buttonBox.style.bottom = "5vh"
                } else { // If portrait mode
                    popup.style.height = "50vh"
                    popup.style.width = "100vw"
                    popup.style.borderRadius = "15px 15px 0 0"
                    buttonBox.style.bottom = "52vh"
                }
            }
        }
    },
    mounted() {
        if (this.global.aspectRatio <= 1.2) {
                popup.style.height = "100vh"
                popup.style.width = "33vw"
                popup.style.borderRadius = "0 15px 15px 0"
                buttonBox.style.bottom = "5vh"
        } else { // If portrait mode
                popup.style.height = "50vh"
                popup.style.width = "100vw"
                popup.style.borderRadius = "15px 15px 0 0"
                buttonBox.style.bottom = "52vh"
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
                case  'cur': return this.getData().meta.cur[1].length
                case 'next': return this.getData().meta.next[1].length
            }
        },
        // Gets the cur from meta data
        getCur() {
            const i = moment(this.global.time, 'e:HHmm'), f = this.getData().meta.cur[2]
            return moment.duration(f.diff(i))
        },
        // Gets next from meta data
        getNext() {
            const i = moment(this.global.time, 'e:HHmm'), f = this.getData().meta.next[2]
            return moment.duration(f.diff(i))
        },
        // Returns all data for the current room
        getData() { return this.getBldg()[this.global.room] },
        // Gets the current time
        getRealTime(date) { return moment(date, 'e:HHmm').tz('America/New_York').format('h:mm A') },
        // Returns the printers in a building
        getPrinters() {
            if (!this.getData().meta.hasOwnProperty("printers")) return false
            else return this.getData().meta.printers
        },
        // Gathers the classes for the building
        getTodaysClasses() {
            let classes = []
            let roomData = this.getData() 
            for (let time in roomData) {
                if (time.split(':')[0] == this.global.time.split(':')[0])
                    classes.push([roomData[time][0], this.getRealTime(time)])
            } return classes
        },
        // Turns the heat from a number into a representative phrase
        interpretHeat() {
            let heat = this.getBldg().meta.heat
            if (heat > 80) return 'very busy'
            else if (heat > 60) return 'busy'
            else if (heat > 40) return 'usual'
            else if (heat > 10) return 'not busy'
            else return 'vacant'
        },
        getHist() {
            let hist = this.getBldg().meta.hist
            if (hist === "") hist = this.getBldg().meta.name.toLowerCase().replace(/ /g, "-")
            return hist // for case: false
        }
    }
}
</script>

<style scoped>
#popup {
    width: 100vw;
    min-width: unset;
    height: 50vh;
    position: absolute;
    pointer-events: all;
    display:inline-block;
    bottom: 0;
    z-index: 6;
    transform: translateY(250px);
    transition: transform .5s;
    box-sizing: border-box;
    background-color: white;
    border: 3px solid var(--softborder);
    border-bottom-style: none;
    box-shadow: 0px -2px 25px rgba(0, 0, 0, 0.08);
    border-radius: 15px 15px 0 0;
    overflow-x: hidden;
    overflow-y: auto;
}

#breadcrumbs {
    padding: 10px 0px 0px 20px;
    color: rgb(0, 0, 0);
    font-weight: 600;
    font-size: x-large;
}

#photo {
    min-width: 300px;
    max-width: 70%;
    display: block;
    margin-left: auto;
    margin-right: auto;

    border-radius: 10px;
    display: flex;
}

#photo-box {
    text-align: center;
}

#busy {
    font-size: larger;
    line-height: 0;
    text-align: center;
}

#time {
    text-align: center;
    color: var(--hardborder);
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
    color: red;
    text-align: center;
    font-weight: 500;
}

.sec {
    padding: 1px 5px 2px 5px;
    margin: 3px;
    background-color: var(--roomfill);
    border-radius: 30%;
}

.block {
    /* background-color: paleturquoise; */
    margin: 10px;
    padding: 10px;    
    border-radius: 10px;
    border: 1px solid var(--softborder);
}

li {
    line-height: 1.5;
}


</style>
