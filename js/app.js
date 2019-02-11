// app.js - saberhub
// Created by Noryx <contact@pawz.xyz> - github https://github.com/Eryux/saberhub
// MIT License

var hubApp = new Vue({

    el: '#hub',

    data: {
        host: '',

        port: '3700',

        ws: '',

        wss: '',

        refreshEvery: 15000,

        enableClearview: true,

        listener: null,

        status: "PENDING",

        version: '0.0.0',
        
        totalPlayers: 0,

        rooms: {},

        selectedRoom: null,
    },
    computed: {
        roomCount: function() {
            return Object.keys(this.rooms).length;
        }
    },
    methods: {
        start: function() {
            listener = (location.protocol == 'https:') ? listener = new hubListener(this.wss) : listener = new hubListener(this.ws);
            listener.actions.push(this.onHubUpdate);
            listener.connect(this.onHubConnect);
        },

        onHubConnect: function(event, status) {
            this.status = (status === true) ? "ONLINE" : "OFFLINE";
        },

        onHubUpdate: function(event) {
            let data = JSON.parse(event.data);

            if ('Version' in data) {
                this.version = data.Version;
            }

            if ('TotalClients' in data) {
                this.totalPlayers = data.TotalClients;
            }

            if ('Rooms' in data) {
                for (let i = 0; i < data.Rooms.length; ++i) {
                    let roomId = getRoomIdFromPath(data.Rooms[i].Path);
                    if (!(roomId in this.rooms)) {
                        this.addRoom(data.Rooms[i]);
                    }
                }
            }

            if ('rooms' in data) {
                let currentRooms = [];
                for (let i = 0; i < data.rooms.length; ++i) {
                    let roomId = getRoomIdFromPath(data.rooms[i].Path);
                    if (!(roomId in this.rooms)) {
                        this.addRoom(data.rooms[i]);
                    }
                    currentRooms.push(roomId);
                }

                // Remove closed rooms from rooms
                let pendingRemove = [];
                for (let key in this.rooms) {
                    if (currentRooms.indexOf(key) === -1) {
                        pendingRemove.push(key);
                    }
                }

                for (let i = 0; i < pendingRemove.length; ++i) {
                    this.removeRoom(this.rooms[pendingRemove[i]]);
                }

                // Refresh player number
                this.refreshPlayer();
            }
        },

        addRoom: function(data) {
            // Create new hub room and add it to rooms
            let room = (location.protocol == 'https:') ? new hubRoom(this.wss, data, this, this.refreshEvery) : new hubRoom(this.ws, data, this, this.refreshEvery);
            Vue.set(this.rooms, getRoomIdFromPath(data.Path), room);
            room.refresh; // Start room details refresh
        },

        removeRoom: function(room) {
            if (this.selectedRoom != null && this.selectedRoom.id == room.id) {
                this.selectedRoom = null;
            }
            
            room.destroy();
            Vue.delete(this.rooms, room.id);
        },

        toggleSelectedRoom: function(roomid, event) {
            if (this.selectedRoom != null) {
                this.selectedRoom.stop();

                if (this.selectedRoom.id == roomid) {
                    this.selectedRoom = null;
                    return;
                }
            }

            this.selectedRoom = this.rooms[roomid];
            this.selectedRoom.start();
        },

        refreshPlayer: function() {
            let p = 0;

            for (let key in this.rooms) {
                if (this.rooms[key].info) { p += this.rooms[key].info.players; }
            }

            this.totalPlayers = p;
        }
    },
    mounted() {
        setInterval(function() {
            this.refreshPlayer();
        }.bind(this), this.refreshEvery);
    }

});