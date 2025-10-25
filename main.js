// main.js — FINAL: RESET = PUSH BUTTON → ONLY "true"
const MQTT_BROKER = 'wss://39833c887da946b98b908a271cab3a25.s1.eu.hivemq.cloud:8884/mqtt';
const MQTT_USER = 'Izamora32';
const MQTT_PASS = '9005Zamora@';
const BASE_TOPIC = 'packageUnit5Ton_1/monitoring/';
const ONOFF_TOPIC = 'packageUnit5Ton_1/control/onOff';
const RESET_TOPIC = 'packageUnit5Ton_1/control/reset';

let client = null;
let systemState = false;

function connectMQTT() {
  client = mqtt.connect(MQTT_BROKER, {
    username: MQTT_USER,
    password: MQTT_PASS,
    rejectUnauthorized: false
  });

  client.on('connect', () => {
    console.log('Connected to HiveMQ');
    ['supplyAirTemperature', 'returnTemperature', 'tempExt', 'humeExt', 'returnHumidity']
      .forEach(t => client.subscribe(BASE_TOPIC + t));
  });

  client.on('message', (topic, message) => {
    const key = topic.split('/').pop();
    const value = parseFloat(message.toString()).toFixed(1);
    updateValue(key, isNaN(value) ? '--' : value);
  });
}

function updateValue(id, value) {
  const el = document.querySelector(`[data-topic="${id}"] .value`);
  if (el) {
    const unit = el.querySelector('.unit').textContent;
    el.innerHTML = value + `<span class="unit">${unit}</span>`;
  }
}

// ON/OFF
function publishOnOff(state) {
  if (client?.connected) {
    client.publish(ONOFF_TOPIC, state ? 'true' : 'false');
    console.log(`Sent → ${ONOFF_TOPIC} = ${state ? 'true' : 'false'}`);
  }
}

// RESET = PUSH BUTTON → ONLY "true"
function publishReset() {
  if (client?.connected) {
    client.publish(RESET_TOPIC, 'true');
    console.log(`Sent → ${RESET_TOPIC} = true (PUSH BUTTON)`);
  }
}

// BUTTONS
function confirmSystemToggle() {
  const willBeOn = !systemState;
  if (confirm(`Turn system ${willBeOn ? 'ON' : 'OFF'}?`)) {
    systemState = willBeOn;
    const btn = document.getElementById('onOffBtn');
    btn.innerHTML = systemState ? 'System ON' : 'System OFF';
    btn.style.background = systemState ? '' : '#ef4444';
    btn.style.color = systemState ? '' : 'white';
    publishOnOff(systemState);
  }
}

function confirmResetAlarms() {
  if (confirm('Reset all alarms?')) {
    publishReset();  // ONLY sends "true" — like a push button
    alert('Reset command sent!');
  }
}

function setSetpoint(val) {
  document.getElementById('setpointValue').innerHTML = val + '<span class="unit">°C</span>';
}

function logout() {
  if (confirm('Logout?')) alert('Logged out');
}

// START
document.addEventListener('DOMContentLoaded', connectMQTT);
console.log('%cFINAL — RESET = PUSH BUTTON → ONLY "true"', 'color: #00E0FF; font-size: 16px; font-weight: bold;');