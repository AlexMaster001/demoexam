// preload/index.js
const { contextBridge, ipcRenderer } = require('electron');

const api = {
  authorizeUser: (user) => ipcRenderer.invoke('authorizeUser', user),
  getGoods: () => ipcRenderer.invoke('getGoods'),
  addGood: (good) => ipcRenderer.invoke('addGood', good),
  updateGood: (good) => ipcRenderer.invoke('updateGood', good),
  deleteGood: (id) => ipcRenderer.invoke('deleteGood', id),
  getOrders: () => ipcRenderer.invoke('getOrders'),
  getUsers: () => ipcRenderer.invoke('getUsers'),
  getPickupPoints: () => ipcRenderer.invoke('getPickupPoints'),
  getStatuses: () => ipcRenderer.invoke('getStatuses'),
  addOrder: (data) => ipcRenderer.invoke('addOrder', data),
  updateOrder: (data) => ipcRenderer.invoke('updateOrder', data),
  deleteOrder: (id) => ipcRenderer.invoke('deleteOrder', id)
};

contextBridge.exposeInMainWorld('api', api);
