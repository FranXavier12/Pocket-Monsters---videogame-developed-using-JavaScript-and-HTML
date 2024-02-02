const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

//creating a traditional for loop for a new collitions array
const collisionsMap = []
for (let i = 0; i < collisions.length; i+=70) {
    //we are slicing 70 for every iteration
    collisionsMap.push(collisions.slice(i, 70 + i))
}

//creating a traditional for loop for a new battle zones array
const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i+=70) {
    //we are slicing 70 for every iteration
    battleZonesMap.push(battleZonesData.slice(i, 70 + i))
}

const boundaries = []
//in order to apply same offset from background to the colission we need the following collision block
const offset = {
    x:-736,
    y:-630
}

// to match collisionMap with boundaries i=height j=width 
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })    
            )               
    })
})

//this array will contain all the battle zones objects
const battleZones = []

// to match battleZonesMap with battleZones array i=height j=width 
battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
            battleZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })    
            )               
    })
})

//import and render map 
const image = new Image()
//reference the constant image
// to get the path for the image open image file in browser then copoy that path
image.src = './Images/Pellet Town.png'

//reference the constant of a foreground image
const foregroundImage = new Image()
foregroundImage.src = './Images/foregroundObjects.png'
//new image object
const playerDownImage = new Image()
playerDownImage.src = './Images/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './images/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = './Images/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './Images/playerRight.png'


//new constant of player set it equal to a new sprite
const player =  new Sprite({
    /*reference canvas width and height to calculate the middle position 
    of the canvas, then calculate the central position of the character 
    sprite, doing the same to center it*/
    position: {
        x: canvas.width / 2 - (192 / 4) / 2,
        y: canvas.height / 2 - 68 / 2 
    },
    image: playerDownImage,
    frames: {
        max: 4,
        hold: 10
    },
    sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerDownImage
    }
})

//reference an object with a property of position or velocity inside the constructor
const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage
})
//the constant keys reference the key we want to listen for (a,w,s,d)
const keys = {
    w: {
        pressed:false
    },
    a: {
        pressed:false
    },
    s: {
        pressed:false
    },
    d: {
        pressed:false
    }
}



//animation loop
// create and array that consists of all the items being able to move into the map
//using spread operator(...) to call al the itemes within the boundaries   
const movables = [background, ...boundaries, foreground, ...battleZones]

//new function: rectangular collision which evaluate if the condition regarding to the position of the collisions is true
function rectangularCollision({Rectangle1, Rectangle2}) {
    return (
        Rectangle1.position.x + Rectangle1.width >= Rectangle2.position.x &&
        Rectangle1.position.x <= Rectangle2.position.x + Rectangle2.width && 
        Rectangle1.position.y <= Rectangle2.position.y + Rectangle2.height && 
        Rectangle1.position.y + Rectangle1.height >= Rectangle2.position.y 

    )
}

//create a battle object with a property of initiated   
const battle = {
    initiated: false
}

function animate () {
    const animationId = window.requestAnimationFrame(animate)
    // call draw method within animation loop
    background.draw()
    /*we call draw method for boundaries after 
    background, but before player, thus, first we call the boundaries that currently looping over*/
    boundaries.forEach((boundary) => {
        boundary.draw()    
    })
    // to render out the battlezones referencig the battlezones array
    battleZones.forEach((battleZone) => {
        battleZone.draw()
    })
    player.draw()
    foreground.draw()

    //to control the sprite moving even if battle is initiated or game stop
    let moving = true
    player.animate = false

    if (battle.initiated) return
    //if any key (w,a,s,d) are press down at any point in the battlezone call the loops throughout battle zones 
    //activate a battle
    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        // a loop to detetc our battle zones
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i]
            /*we are going to need to use a little bit of geometry. we are gonna get
                the area associated with our player and also the area asociated with one 
                one of the tiles of our battlezone to block any intersection when both 
                sprite and area touch each other even when they are out of the battle 
                zones boundaries */
            const overlapingArea = 
                (Math.min(
                    player.position.x + player.width,
                    battleZone.position.x + battleZone.width
                ) -
                    Math.max(player.position.x, battleZone.position.x)) *
                (Math.min(
                    player.position.y + player.height,
                    battleZone.position.y + player.height
                ) -
                    Math.max(player.position.y, battleZone.position.y))
            if (
                rectangularCollision({
                    Rectangle1: player,
                    Rectangle2: battleZone
                }) &&    
                // the chances that a battle inside the battle zones occurs are calculated below      
                overlapingArea > (player.width * player.height) / 2 &&
                Math.random() < 0.01
            ) {
                //deactivate current animation loop
                window.cancelAnimationFrame(animationId)

                audio.map.stop()
                audio.initBattle.play()
                audio.battle.play()

                battle.initiated = true
                /*to select an html eleemnt from GSAP library and then 
                determine what property you want to animate in this case to active our batlle scene*/
                gsap.to('#overlappingDiv', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    // to swap our canvas scene to go to a battle view instead of a map view
                    onComplete() {
                        gsap.to(overlappingDiv, {
                            opacity: 1,
                            duration: 0.4,
                            onComplete () {
                                //activate a new animation loop to transition to the new scene
                                initBattle()
                                animateBattle()
                                gsap.to(overlappingDiv, {
                                    opacity: 0,
                                    duration: 0.4
                                })
                            }
                        })                       
                    }                    
                }) 
                break
            }  
        }
    }

    /* object to set if press w,a,s,d properties wether or not 
    they are press down correctly*/
    // if key press down we can begin moving the properties of our background
    /* this makes the ilussion that the sprite is moving but really 
    it's just the background image moving*/
    //when key is pressed we wnat to move the position property(x,y)
    // press w = moving up
    /*for the if loop we need to use a boolean operators (and) to know also wether
    or not the current key that is pressed down was the last key beign pressed*/
    //in order our boundary stay still we need wrap background position 
    
    if (keys.w.pressed && lastkey === 'w') {
        player.animate = true
        player.image = player.sprites.up
        /*a loop to detected for collisions when we press a key. as well as when our player 
        is currently overlaping with the boundary*/
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    Rectangle1: player,
                    Rectangle2: {
                        ...boundary, 
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y + 3
                        }
                    }
                })
                //&&
               // player.position.Y <= testBoundary.position.y + testBoundary.height &&
               // player.position.y + player.height >= testBoundary.position.y
            ) {
                moving = false
                break
            }  
        }

        if (moving)
            movables.forEach((movable) => {
                movable.position.y += 3
            })
    } 
    // press a = moving to the left
    else if (keys.a.pressed && lastkey === 'a') {
        player.animate = true
        player.image = player.sprites.left
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    Rectangle1: player,
                    Rectangle2: {
                        ...boundary, 
                        position: {
                            x: boundary.position.x + 3,
                            y: boundary.position.y
                        }
                    }
                })
                //&&
               // player.position.Y <= testBoundary.position.y + testBoundary.height &&
               // player.position.y + player.height >= testBoundary.position.y
            ) {
                moving = false
                break
            }  
        }

        if (moving)    
            movables.forEach((movable) => {
                movable.position.x += 3
            })
    }        
    // press s = moving down
    else if (keys.s.pressed && lastkey === 's') {
        player.animate = true
        player.image = player.sprites.down
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    Rectangle1: player,
                    Rectangle2: {
                        ...boundary, 
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 3
                        }
                    }
                })
                //&&
               // player.position.Y <= testBoundary.position.y + testBoundary.height &&
               // player.position.y + player.height >= testBoundary.position.y
            ) {
                moving = false
                break
            }  
        }

        if (moving)
            movables.forEach((movable) => {
                movable.position.y -= 3
            }) 
    }       
    // press d = moving to the right
    else if (keys.d.pressed && lastkey === 'd') {
        player.animate = true
        player.image = player.sprites.right
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    Rectangle1: player,
                    Rectangle2: {
                        ...boundary, 
                        position: {
                            x: boundary.position.x - 3,
                            y: boundary.position.y 
                        }
                    }
                })
                //&&
               // player.position.Y <= testBoundary.position.y + testBoundary.height &&
               // player.position.y + player.height >= testBoundary.position.y
            ) {
                moving = false
                break
            }  
        }

        if (moving)
            movables.forEach((movable) => {
                movable.position.x -= 3
            })    
    }
}
//animate()

//to listen what was the last key pressed and moving according to that
let lastkey = ''
/* to move the character we need to start listening for events. 
therefore we are going to call the window object. we need to add 
an event argument (e) is going to be passed through by default 
whewnever we key down */
//listen for a key down
window.addEventListener('keydown', (e) => {
    //to create an event when a key is pressed
    switch (e.key) {
        /*whenever e.key is equal to 'w' 
        then we wnant to call whatever code is between case and break*/
        case 'w':
            keys.w.pressed = true
            lastkey = 'w'
            break

        case 'a':
            keys.a.pressed = true
            lastkey = 'a'
            break
            
        case 's':
            keys.s.pressed = true
            lastkey = 's'
            break
            
        case 'd':
            keys.d.pressed = true
            lastkey = 'd'
            break    
    }
})
//set a key deafult whenever key lift up
//listen for a key up
window.addEventListener('keyup', (e) => {
    //to create an event when a key is pressed
    switch (e.key) {
        /*whenever e.key is equal to 'w' 
        then we wnant to call whatever code is between case and break*/
        case 'w':
            keys.w.pressed = false
            break

        case 'a':
            keys.a.pressed = false
            break
            
        case 's':
            keys.s.pressed = false
            break
            
        case 'd':
            keys.d.pressed = false
            break    
    }
})

let clicked = false
addEventListener('click', ( ) => {
    if (!clicked) {
        audio.map.play()
        clicked = true
    }
})
 