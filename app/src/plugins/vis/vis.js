import nodefony from 'nodefony-client';

//import {vis} from 'vis-network'

import {
  Network,
} from "vis-network";

import moment$3 from "moment";

import "vis-network/styles/vis-network.css";
import {
  DataSet
  //DataView
} from "vis-data";

import {
  Graph2d
} from "vis-timeline";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";


import '@fortawesome/fontawesome-free/css/all.css'
//import '@fortawesome/fontawesome-free/js/all.js'

import routerCard from '@/plugins/mediasoup/components/routerCard';
import workerCard from '@/plugins/mediasoup/components/workerCard';
import userCard from '@/plugins/mediasoup/components/userCard';
import roomCard from '@/plugins/mediasoup/components/roomCard';


import imgMediasoup from "@/assets/mediasoup.png"

const defaultNetworkOptions = {
  autoResize: false,
  height: '100%',
  width: '100%',
  clickToUse: true,
  physics: {
    enabled: true
  },
  nodes: {
    size: 25,
  },
  interaction: {
    navigationButtons: true,
    keyboard: true,
  },
};

const defaultGraph2dOptions = {
  //moment:moment$3,
  start: moment$3().add(-30, 'seconds'), // changed so its faster
  end: moment$3(),
  dataAxis: {
    left: {
      range: {
        min: -10,
        max: 10,
      },
    },
  },
  drawPoints: {
    style: 'circle' // square, circle
  },
  shaded: {
    orientation: 'bottom' // top, bottom
  }
};

class Vis extends nodefony.Service {

  constructor(settings, service) {
    super('Vis', service.container, null, settings);
    //this.vis = vis;
    this.DataSet = DataSet;
    this.moment = moment$3;
  }
  // hooy plugins vue
  install(Vue, options) {
    Vue.prototype.$vis = this;
    this.vue = Vue;
    this.store = options.store;
    this.router = options.router;
    this.i18n = options.i18n;
    this.container = options.nodefony.container;
    this.syslog = this.get("syslog");
    this.set("store", this.store);
    this.set("router", this.router);
    this.set("i18n", this.i18n);
    this.log(`Add Plugin vis`, "INFO");
    Vue.prototype.$vis = this;
  }

  createGraph2d(container, data, options = {}) {
    let myopt = nodefony.extend(true, {}, defaultGraph2dOptions, options);
    return new Graph2d(container, data, myopt)
  }

  createNetwork(container, data, options = {}) {
    let myopt = nodefony.extend(true, {}, defaultNetworkOptions, options)
    return new Network(container, data, myopt)
  }

  createCard(container, type, props = {}, data = {}, parent = null) {
    container = container || this.application.$el;
    let ComponentClass = null;
    switch (type) {
    case "worker":
      ComponentClass = this.vue.extend({
        mixins: [workerCard],
        parent: parent
      });
      break;
    case "router":
      ComponentClass = this.vue.extend({
        mixins: [routerCard],
        parent: parent
      });
      break;
    case "user":
      ComponentClass = this.vue.extend({
        mixins: [userCard],
        parent: parent
      });
      break;
    case "room":
      ComponentClass = this.vue.extend({
        mixins: [roomCard],
        parent: parent
      });
      break;
    default:
      throw new Error(`Bad type network`);
    }
    const component = new ComponentClass({
      data: data,
      propsData: props
    });
    component.$on("close", () => {
      container.removeChild(component.$el);
      component.$destroy();
    });
    component.$mount();
    //container.appendChild(component.$el);
    return component.$el;
  }



  buildRouterNetwork(room, worker, peers, container, parent) {
    let nodes = [];
    let edges = [];
    return {
      nodes: new DataSet(nodes),
      edges: new DataSet(edges)
    }
  }
  buildWorkerNetwork(rooms, container, parent) {
    let nodes = [];
    let edges = [];
    return {
      nodes: new DataSet(nodes),
      edges: new DataSet(edges)
    }
  }
  buildUserNetwork(room, worker, peer, container, parent) {
    let nodes = [];
    let edges = [];
    return {
      nodes: new DataSet(nodes),
      edges: new DataSet(edges)
    }
  }

  buildRoomNetwork(room, peers, entity, container, parent) {
    let nodes = [];
    let edges = [];
    //console.log(this.room)
    if (room.id) {
      nodes.push({
        id: room.id,
        label: room.id,
        value: 0,
        group: 0,
        shape: 'icon',
        size: 100,
        fixed: true,
        title: this.createCard(container.$el, "room", {
          room,
          peers,
          entity
        }, room, parent),
        icon: {
          face: "'Font Awesome 5 Free'",
          code: "\uf1ad",
          size: 50,
          color: "#f0a30a",
          weight: "bold"
        }
      });
      if (room.status) {
        let router = room.status["router"];
        let worker = room.status["worker"];
        //console.log(worker, router, peers)
        for (let ele in room.status) {
          switch (ele) {
          case "router":
            {
              nodes.push({
                id: router.id,
                label: `Router`,
                value: 2,
                group: 2,
                //shape: 'circle',
                shape: "circularImage",
                image: imgMediasoup,
                title: this.createCard(container.$el, "router", {
                  room,
                  router
                }, router, parent),
                size: 20
              });
              edges.push({
                from: worker.pid,
                to: router.id
              })
              break;
            }
          case "worker":
            {
              nodes.push({
                id: worker.pid,
                label: `Worker`,
                value: 1,
                group: 1,
                //shape: 'circle',
                shape: "circularImage",
                image: imgMediasoup,
                //title: container.card.$el,
                title: this.createCard(container.$el, "worker", {
                  room,
                  worker
                }, worker, parent),
                size: 30
              });
              edges.push({
                from: room.id,
                to: worker.pid
              })
              break;
            }
          }
        }
        if (peers.length) {
          for (let user of peers) {
            nodes.push({
              id: user.id,
              label: `${user.id}`,
              value: 3,
              group: 3,
              shape: "icon",
              title: this.createCard(container.$el, "user", {
                room,
                user
              }, user, parent),
              icon: {
                face: "'Font Awesome 5 Free'",
                code: "\uf007",
                size: 20,
                color: "#aa00ff",
                weight: "bold"
              },

            });

            edges.push({
              from: room.id,
              to: user.id
            });
            /*if( user.transports){
              for( let size = 0 ;size < user.transports ;size++ ){
                edges.push({
                  from: router.id,
                  to: user.id
                });
              }
            }*/
          }

        }
      }
    }
    //console.log(nodes, edges);
    return {
      nodes: new DataSet(nodes),
      edges: new DataSet(edges)
    }
  }


}

export default new Vis(process.env, nodefony.kernel);
