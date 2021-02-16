import nodefony from 'nodefony-client';

const state = {
  connected: false,
  activity: false,
  joined: false,
  webcam: {
    device: null,
    resolution: "hd"
  },
  microphone: {
    device: null
  },
  devices: null,
  audioDevices: null,
  videoDevices: null,
};

const getters = {
  // webcam
  webcam(state) {
    return state.webcam;
  },
  microphone(state) {
    return state.microphone;
  },
  webcamResolution(state) {
    return state.webcam.resolution;
  },
  webcamDevice(state) {
    return state.webcam.device;
  },
  // audio

  // devices
  videoDevices(state) {
    return state.videoDevices;
  },
  audioDevices(state) {
    return state.audioDevices;
  },

  getDevices(state) {
    return state.devices;
  },

  getAudioDeviceByValue: (state) => (id) => {
    let device = null;
    if (state.audioDevices.size) {
      state.audioDevices.forEach((value, key) => {
        if (!key) {
          device = {
            label: 'Default',
            deviceId: "default"
          };
          return;
        }
        if (value.deviceId === id || value.label === id) {
          device = value;
        }
      });
      return device;
    }
    return device;
  },

  getDevicesAudioLabels(state) {
    let tab = [];
    if (state.audioDevices && state.audioDevices.size) {
      state.audioDevices.forEach((value, key) => {
        if (!key) {
          tab.push({
            text: "Default",
            value: 'default'
          })
        } else {
          tab.push({
            text: value.label,
            value: value.deviceId
          })
        }
      });
    }
    return tab
  },
  getDevicesVideoLabels(state) {
    let tab = [];
    if (state.videoDevices && state.videoDevices.size) {
      state.videoDevices.forEach((value, key) => {
        if (!key) {
          tab.push({
            text: "Default",
            value: 'default'
          })
        } else {
          tab.push({
            text: value.label,
            value: value.deviceId
          })
        }
      });
    }
    return tab
  },
  getVideoDeviceByValue: (state) => (id) => {
    let device = null;
    if (state.videoDevices.size) {
      state.videoDevices.forEach((value, key) => {
        if (!key) {
          device = {
            label: 'Default',
            deviceId: "default"
          };
          return;
        }
        if (value.deviceId === id || value.label === id) {
          device = value;
        }
      });
      return device;
    }
  },
  // status
  getMediasoupStatus(state) {
    return state.connected;
  },
  getMediasoupActivity(state) {
    return state.activity;
  }
};

const mutations = {
  setConnected(state, value) {
    state.connected = value;
    if (!state.connected) {
      state.activity = false;
    }
  },
  mediasoupActivity(state) {
    state.activity = !state.activity;
  },
  changeWebcamResolution(state, value) {
    if (state.webcam) {
      state.webcam.resolution = value;
    }
  },
  changeWebcamDevice(state, value) {
    //console.log(`Change videos device`)
    if (state.webcam) {
      state.webcam.device = value;
    }
  },
  changeAudioDevice(state, value) {
    //console.log(`Change audio device ${value.label}`)
    if (state.microphone) {
      state.microphone.device = value;
    }
  },

};

const actions = {
  async getDevices({
    commit,
    state
  }) {
    return await nodefony.medias.getDevices()
      .then((devices) => {
        state.devices = devices;
        state.audioDevices = nodefony.medias.audioDevices;
        state.videoDevices = nodefony.medias.webcams;
        return devices
      })
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
