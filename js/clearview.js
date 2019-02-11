// clearview.js - saberhub
// Created by Noryx <contact@pawz.xyz> - github https://github.com/Eryux/saberhub
// MIT License

var roomApp = new Vue({

    el: "#clearview",

    data: {
        host: '',

        port: '3700',

        ws: '',

        wss: '',

        selectedRoom: null,
    },
    methods: {
        start: function() {
            let room = {'RoomName':'', 'Path':window.location.search.substring(1)};
            if (room['Path'] !== '') {
                this.selectedRoom = new hubRoom(this.ws, room, this);
                this.selectedRoom.start();
            }
        }
    }

});