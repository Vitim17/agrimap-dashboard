// src/api/agriMapApi.js
export async function getNDVI() {
  const res = await fetch("http://127.0.0.1:8001/ndvi");
  return res.json();
}

export async function getWeather() {
  const res = await fetch("http://127.0.0.1:8001/weather");
  return res.json();
}

export async function getAlerts() {
  const res = await fetch("http://127.0.0.1:8001/alerts");
  return res.json();
}
