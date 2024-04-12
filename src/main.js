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

// Primevue resources
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import './assets/themes/theme.css';

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
	sFocus: false
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
		if (!resp.ok) throw new Error(`failed on 'deptToCRN.json': ${resp.status}`)
		return resp.json()
	}),
  ])
  .then(data => { // data is an array of the resolved values from promises
		global.data = data.shift()
		global.searchData = data
		// Adds an event listener to update resize when the window is resized
		window.addEventListener("resize", updateAspectRatio)
		console.log('Data loaded!')
		checkActive()
		global.firstCalc = true
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