// common.js - saberhub
// Created by Noryx <contact@pawz.xyz> - github https://github.com/Eryux/saberhub
// MIT License

var getRoomIdFromPath = function(path) {
    return path.split('/').pop();
};

var hubListener = function(url) {

    this.url = url;

    this.socket = null;

    this.actions = [];

    this.connect = function(callback = null) {
        let self = this;

        self.socket = new WebSocket(url);

        self.socket.onerror = function(event) {
            console.log(event);

            if (self.isConnected() === false && callback !== null) {
                callback(event, false);
            }
        };

        self.socket.onopen = function(event) {
            //console.log("Connected to " + self.url);

            if (callback !== null) {
                callback(event, true);
            }

            this.onclose = function(event) {
                // console.log("Connection to " + self.url + " closed");
            };

            this.onmessage = function(event) {
                for (let i = 0; i < self.actions.length; ++i) {
                    self.actions[i](event);
                }
            };
        };
    };

    this.close = function() {
        if (this.socket != null) { this.socket.close(); }
    };

    this.isConnected = function() {
        return (this.socket !== null && this.socket.readyState === WebSocket.OPEN);
    };

};

var hubRoom = function(service, room, app, refreshInterval = 15000) {

    var self = this;
    
    this.listener = new hubListener(service + room.Path);
    
    this.app = app;

    this.refresh = setInterval(function() { self.onRefresh(); }, refreshInterval);
    
    this.name = room.RoomName;

    this.path = room.Path;

    this.id = getRoomIdFromPath(this.path);

    this.info = null;

    this.players = [];

    this.difficulty = -1;

    this.song = null;

    this.cover = "";

    this.playing = false;

    this.start = function() {
        if (self.listener.isConnected() == false) {
            this.listener.actions.push(this.onRoomUpdate);
            this.listener.connect(this.onRoomConnect);
        }
    };

    this.stop = function() {
        this.listener.actions = [];
        this.listener.close();
    };

    this.onRoomConnect = function(event, status) {
        // pass
    };

    this.onRefresh = function() {
        self.start();
    };

    this.onRoomUpdate = function(event) {
        let data = JSON.parse(event.data);
        
        if (data.commandType == "GetRoomInfo") {
            self.info = data.data;

            self.name = self.info.name;

            if (self.info.roomState == 'Results') {
                self.playing = false;
            }
            else if (self.info.roomState == 'InGame') {
                self.playing = true;
            }

            if (self.info.selectedDifficulty) {
                self.difficulty = self.info.selectedDifficulty;
            }

            if (self.info.selectedSong) {
                self.song = self.info.selectedSong;

                if (self.song === null) {
                    self.difficulty = -1;
                }
                
                self.updateCover();
            }

            if (app.selectedRoom == null || app.selectedRoom.id != self.id) {
                self.stop(); // It's only a refresh no need to update more
            }
        }
        else if (data.commandType == "SetSelectedSong") {
            self.song = data.data;

            if (self.song === null) {
                self.difficulty = -1;
            }
            
            self.updateCover();
        }
        else if (data.commandType == "StartLevel") {
            self.difficulty = data.data.difficulty;
            self.song = data.data.song;
            self.playing = true;
            self.updateCover();
        }
        else if (data.commandType == "UpdatePlayerInfo") {
            self.players = data.data;
        }
    };

    this.updateCover = function() {
        self.cover = (self.song) ? "https://scoresaber.com/imports/images/songs/" + self.song.levelId + ".png" : "";
    };

    this.destroy = function() {
        clearInterval(self.refresh);
        if (self.listener.isConnected()) {
            self.stop();
        }
    };

    // Fetch room details by refreshing one time when room is created
    this.onRefresh();

};