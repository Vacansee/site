/* main.js
 * Global state, global.data updates, and Vue app initialization
 */
// App is created with createApp
// Reactive allows for global reactive variables
// Watch functions are called when the variable watched for is updated
import { createApp, reactive, watch } from 'vue'
// App.vue is general information about the app
import App from './App.vue'
// Imports file used for page routing
import Router from './router'
// Imports ability to check time
import Moment from 'moment-timezone'
// Basic CSS
import './assets/main.css'
// Import function for manually loading based on URL path
import {router_info, Routing} from "@/router";
// Import router to update URL
import router from "./router";

// Primevue resources
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import './assets/themes/theme.css';
import * as path from "path";

const global = reactive({ // The global reactive object!
	// Any changes to its members will trigger reactivity in components that 
	data: null,
	searchData: null,
	bldg: '',
	room: '',
	floor: null,
	flipScreen: 1.25,
	aspectRatio: window.innerHeight/window.innerWidth,
	time: Moment.tz('America/New_York').format('e:HHmm'),
	// time: Moment.tz('2023-11-29 11:55', 'America/New_York').format('e:HHmm'), // Test time
	firstCalc: false,
	sFocus: false,
	invalidLoadMessage: ""
})

// On page load, fetch building/room and search data from Vacansee/data:
Promise.all([
	fetch('https://raw.githubusercontent.com/Vacansee/data/main/data/data.json').then(resp => {
	  if (!resp.ok) throw new Error(`failed on 'data.json': ${resp.status}`)
	  return resp.json()
	}),
	fetch('https://raw.githubusercontent.com/Vacansee/data/main/data/search/byCRN.json').then(resp => {
	  if (!resp.ok) throw new Error(`failed on 'byCRN.json': ${resp.status}`)
	  return resp.json()
	}),
	fetch('https://raw.githubusercontent.com/Vacansee/data/main/data/search/deptToCRN.json').then(resp => {
		if (!resp.ok) throw new Error(`failed on 'deptToCRN.json': ${resp.status}`)
		return resp.json()
	}),
	// fetch('https://raw.githubusercontent.com/Vacansee/data/main/data/search/titleToCRN.json').then(resp => {
	// 	if (!resp.ok) throw new Error(`failed on 'titleToCRN.json': ${resp.status}`)
	// 	return resp.json()
	// }),
	fetch('https://raw.githubusercontent.com/Vacansee/data/main/data/search/toRoom.json').then(resp => {
		if (!resp.ok) throw new Error(`failed on 'toRoom.json': ${resp.status}`)
		return resp.json()
	}),
	// fetch('https://raw.githubusercontent.com/Vacansee/data/main/data/dining.json').then(resp => {
	// 	if (!resp.ok) throw new Error(`failed on 'dining.json': ${resp.status}`)
	// 	return resp.json()
	// }),
  ])
  .then(data => { // data is an array of the resolved values from promises
		global.data = data.shift()
		global.searchData = data
		// Adds an event listener to update resize when the window is resized
		window.addEventListener("resize", updateAspectRatio)
		console.log('Data loaded!')
		checkActive()
		global.firstCalc = true
	  	// Update global variables with URL path
	  	Routing(global)
	  	// Check user inputted values
	  	if (router_info.checkValues) {
			// Checks URL format
			if (global.bldg === "" && router.currentRoute.value.name !== "home") {
				console.log("Not a valid URL format")
				global.bldg = ""
				global.floor = null
				global.room = ""
				global.invalidLoadMessage = "Not a valid URL format"
			} else if (global.bldg !== "") {
				// Checks inputted building
				if (global.data[global.bldg] === undefined) {
					console.log("Invalid URL: not a valid building")
					global.bldg = ""
					global.floor = null
					global.room = ""
					global.invalidLoadMessage = "Not a valid building"
					router.push({name: 'home'})
				}
				// Sets the floor if only a building is entered (not an error)
				else if (router.currentRoute.value.fullPath.split('/').length === 3) {
					global.floor = global.data[global.bldg].meta.floors[1]
					router.push({name: 'buildingAndFloor', params: {building: global.bldg, floor: global.floor}})
				}
				// Checks inputted floor
				else if (global.floor > global.data[global.bldg].meta.floors[0]) {
					console.log("Invalid URL: not a valid floor")
					global.floor = global.data[global.bldg].meta.floors[1]
					global.invalidLoadMessage = "Not a valid floor"
					router.push({name: 'buildingAndFloor', params: {building: global.bldg, floor: global.floor}})
				}
				// Checks inputted room
				else if (global.room !== "" && !global.data[global.bldg].hasOwnProperty(global.room)) {
					console.log("Invalid URL: not a valid room")
					global.floor = global.data[global.bldg].meta.floors[1]
					global.room = ""
					global.invalidLoadMessage = "Not a valid room"
					router.push({name: 'buildingAndFloor', params: {building: global.bldg, floor: global.floor}})
				}
			}
			router_info.checkValues = false
		}
	})
  .catch(error => { this.$showToast({title: 'Failed to load data', body: error}) })


// Consider global.data a living document: most of it's values are pre-generated & retrieved from
// the Vacansee/data repo, but some are (re)calculated regularly and inserted/updated in the object.

// checkActive() is run regularly and updates "meta" properties for both rooms and buildings
function checkActive() {
	// Loop through the global reactive variable data
	for (let b in global.data) {
		let bldg = global.data[b],
		sum = 0, longest = 0, outflow = 0, inflow = 0
		// If heat isn't in bldg.meta, set heat to 0
		// Loop thorugh building data
		for (let r in bldg) {
			if (r == 'meta') continue // skip meta properties
			// Get reference to room
			let room = bldg[r]
			room.meta.active = false
			room.meta.cur = room.meta.next = ''
			
			for (let time in room) {
				if (time == 'meta') continue
				// Get the current time
				let now = global.time, [beg, end] = time.split('-')
				// if class is in session, toggle room state, set cur class, and add to bulding sum
				if (beg <= now && end > now) {
					const i = Moment(now, 'e:HHmm'), f = Moment(end, 'e:HHmm')
					const left = Moment.duration(f.diff(i))
					room.meta.cur = [ room[time][0], room[time][2], f ]; room.meta.active = true
					// Sum up max people in all rooms used
					sum += room.meta.max
				}
				let [dBeg, tBeg] = beg.split(':'), [dEnd, tEnd] = end.split(':'),
					[dNow, tNow] = now.split(':')
				if (dNow === dEnd && tNow > tEnd) {
					outflow += 1/(tNow - tEnd) * room.meta.max
					// console.log('outflow:', tNow, '-' , tEnd, '=', tNow - tEnd, '\n\n')
				}
				if (now < beg) {
					if (dNow === dBeg) {
						inflow += 1/(tBeg - tNow) * room.meta.max
						// console.log('inflow:', tBeg, '-' , tNow, '=', tBeg - tNow)
					}
					const i = Moment(now, 'e:HHmm'), f = Moment(beg, 'e:HHmm')
                    const until = Moment.duration(f.diff(i))
					if (until.asMinutes() > longest) longest = until.asMinutes()
					// Set as next class and stop searching:
					room.meta.next = [ room[time][0], room[time][2], f ] 
					break
				}
			}
		}
		
		// Determine whether the building is open
		let access = global.data[b].meta.access, times = "",
		[day, time] = global.time.split(":")
		if (day >= 1 && day <= 4) { times = access[1] } // Mon-Thu
		else if (day == 5) { times = access[2] } // Fri
		else if (day == 6) { times = access[3] } // Sat
		else if (day == 0) { times = access[0] } // Sun
		if (times) {
			let [open, close] = times.split("-")
			let hours = [
				Moment(open, 'HHmm').format('hA'),
				Moment(close, 'HHmm').format('hA')
			]
			if (time > open && time < close) { bldg.meta.open = hours }
		}
		else { bldg.meta.open = false }
		
		if ("dining" in bldg.meta) {
			if (isNaN(Object.keys(bldg.meta.dining)[0][0]))
				for (let d in bldg.meta.dining) checkOpen(bldg.meta.dining[d])
			else checkOpen(bldg.meta.dining)
		}
		// Sum/total people that can exist in the building = % filled
		bldg.meta.occu = (sum/bldg.meta.max)
		bldg.meta.flow = (1 - Math.exp((-2/(bldg.meta.max/5))*(inflow + outflow)))
		bldg.meta.heat = parseFloat((bldg.meta.occu + 0.8*bldg.meta.flow).toFixed(2))
		bldg.meta.heat = (bldg.meta.heat > 1.0) ? 1.0 : bldg.meta.heat
		// console.log(b, bldg.meta.flow.toFixed(2), bldg.meta.max, (logisitc).toFixed(2) )
		bldg.meta.longest = longest
		// if (oldHeat != bldg.meta.heat) console.log(`${oldHeat} -> ${bldg.meta.heat}`)
	}
}

function checkOpen(times) {
	for (let t in times) {
		if (t == "url") continue
		// console.log(t, times[t])
	}
}

setInterval(() => { // Update current time every second
	global.time = Moment.tz('America/New_York').format('e:HHmm')
	// global.time = Moment.tz('2023-11-29 11:55', 'America/New_York').format('e:HHmm') // Test time
	let seconds = Number(Moment.tz('America/New_York').format('ss'))
	// let seconds = Number(Moment.tz('2023-11-28 11:55', 'America/New_York').format('ss')) // Test time
	// Every 5 minutes, check data for buildings (update heat and room availability)
	if (!(global.time.split(':')[1] % 5) && !seconds) { // update states every 5m (on the dot)
		checkActive()
		console.log(`Updating states @ ${global.time}:${seconds}`)
	}
	// else console.log(`${global.time}:${seconds}`)
}, 1000)

function updateAspectRatio() { // Updates the aspect ratio globally
	global.aspectRatio = window.innerHeight/window.innerWidth
}
// Creates the app 
const app = createApp(App)
app.provide('global', global);
app.use(Router)
app.use(Moment)
app.use(ToastService)
app.use(PrimeVue, { ripple: true })
app.config.globalProperties.$showToast =
function({ type = 'error', title = 'Default', body = '', lasts = '' } = {}) {
	this.$toast.add({ severity: type, summary: title, detail: body, life: lasts });
}
app.config.globalProperties.$clearToasts = function() { this.$toast.removeAllGroups() } 
app.mount('#app')