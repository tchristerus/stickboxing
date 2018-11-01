# StickBoxing
<p align="center">
<img src="/game.PNG" alt="alt text" width="400">
</p>

## About
StickBoxing is a multiplayer boxing game I created for a JavaScript school assignment.
Every match will have 3 rounds of 30 seconds, you can score points by hitting the opponent in the face.

You can only hit the opponent if their cover is down.
There are several moments when the opponents cover will be gone:
1. If the enemy punches his/her
2. If the enemy kicks
3. If you kick the enemy their cover will be gone for some seconds.


## How to run

### Backend
```
1. cd backend
2. npm install
3. node Server.js
```

### Frontend
It's up to you what webserver you would like to use but I used https://www.npmjs.com/package/local-web-server

#### http-server installed
```
1. cd frontend
2. ws
```

#### local-web-server not installed
```
1. npm install -g local-web-server
2. cd frontend
3. ws
```

## Controls
This game is controlled by the arrow keys
```
UP = PUNCH
DOWN = KICK
LEFT, RIGHT = MOVE
```
