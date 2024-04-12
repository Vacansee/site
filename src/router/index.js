/* index.js
 * Setting up a router with vue-router
 * 
 * Routing on a single-page lets us trick the browser into
 * thinking it's navigating to a new page, when it's actually
 * just updating the URL and rendering a new view.
 * (This improves link sharing and page navigation)
 */

import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import {reactive, inject} from "vue";
import home from "@/views/Home.vue";
// import About from '../views/About.vue' // currently unused, could be a settings page

// URL path values
export const router_info = reactive({
  pathBuilding: '',
  pathFloor: null,
  pathRoom: '',
  firstLoad: true,
  invalidLoad: false,
  invalidMessage: ""
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Route for overall map
    {
      path: '/',
      name: 'home',
      component: Home
    },
    // Dynamic route for buildings, floors, rooms
    {
      path: '/:building/:floor/',
      name: 'buildingAndFloor',
      component: Home,
      children: [
        {
          path: '/:building/:room/',
          name: 'buildingAndRoom',
          component: Home
        }
      ]
    },
   // Catch all redirect to home page
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
});

// Stores URL path values after each page reload
router.beforeResolve((to, from, next) => {
  if (router_info.firstLoad) {
    const pathComponents = to.path.split('/').filter(component => component !== '');
    if (!isNaN(pathComponents[1]) && pathComponents[0] !== "") {
      router_info.pathBuilding = pathComponents[0]
      if (pathComponents[1] <= 9) {
        router_info.pathFloor = Number(pathComponents[1])
        if (router_info.pathFloor < 0) {
          router_info.pathBuilding = ""
          router_info.pathFloor = null
        }
        router_info.pathFloor = Math.floor(router_info.pathFloor)
      } else {
        router_info.pathRoom = pathComponents[1]
      }
    }
  }
  next();
});

// REMOVE COMMENTED CODE BELOW ONCE MAIN.JS is finished

// Function to check URL path?
// router.afterEach((to, from) => {
//   router_info.afterEachCount += 1
//   if (router_info.afterEachCount === 2) {
//     console.log("afterEach()")
//     const globalState = inject('global');
//     console.log(globalState.bldg)
//     if (router_info.invalidLoad) {
//       console.log("invalid load change")
//       globalState.bldg = ""
//       globalState.floor = null
//       globalState.room = ""
//       router_info.invalidLoad = false
//       router.push({name: 'home'})
//       console.log(globalState.bldg)
//     }
//   }
// })

// router.afterEach((to, from) => {
//   const globalState = inject('global');
//   if (globalState.bldg !== router_info.pathBuilding) {
//     console.log("change")
//
//   }
//
// })

// Sets global variables to user inputted URL path values
export function Routing(mainGlobal) {
  if (router_info.pathBuilding) {
    mainGlobal.bldg = router_info.pathBuilding.toUpperCase()
    mainGlobal.floor = router_info.pathFloor
    mainGlobal.room = router_info.pathRoom
  }
}

export default router
