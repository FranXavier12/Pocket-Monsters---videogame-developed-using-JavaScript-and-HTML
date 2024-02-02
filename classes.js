/*in order to move the player or the map is necesary to edit the coordinates
for c.drawImage for either background or player images whenever press key down*/
class Sprite {
    constructor({
        position, 
        image, 
        frames = {max: 1, hold: 10}, 
        sprites, 
        animate = false, 
        rotation = 0,
        
    }) {
        //properties for Sprite class 
        this.position = position
        this.image = new Image()
        this.frames = { ...frames, val: 0, elapsed: 0 }
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.image.src = image.src
        
        // make the sprite moves only when a respective key is pressed
        this.animate = animate
        this.sprites = sprites
        this.opacity = 1
        this.rotation = rotation
    }

    //new method to begin drawing out an image directly within the Sprite class
    draw() {
        c.save()
        c.translate(
            this.position.x + this.width / 2, 
            this.position.y + this.height / 2
        )
        c.rotate(this.rotation)
        c.translate(
            -this.position.x - this.width / 2, 
            -this.position.y - this.height / 2
        )
        c.globalAlpha = this.opacity
        //draw image metod determine the x and y possition of the image 
        c.drawImage(
            //in order to add a croping for the c darw image we need to add four additional arguments
            //croping
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            //actual position
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height
        )
        c.restore()

        //iterate the frame of image each time we call draw until reach frames.max
        if (!this.animate) return

        if (this.frames.max > 1) {
            this.frames.elapsed++
        }

        if (this.frames.elapsed % this.frames.hold == 0){
            if (this.frames.val < this.frames.max - 1) this.frames.val++
            else this.frames.val = 0
        }
    }

}

class Monster extends Sprite {
    constructor({ 
        position, 
        image, 
        frames = {max: 1, hold: 10}, 
        sprites, 
        animate = false, 
        rotation = 0,
        isEnemy = false, 
        name,
        attacks 
    }) {
        super({
            position, 
            image, 
            frames, 
            sprites, 
            animate, 
            rotation,
        })
        this.health = 100
        this.isEnemy = isEnemy
        this.name = name
        this.attacks = attacks
    }

    faint () {
        console.log('faint')
        document.querySelector('#dialogueBox').innerHTML = this.name + ' fainted!'
        gsap.to(this.position, {
            y: this.position.y + 20
        })
        gsap.to(this, {
            opacity: 0
        })
        audio.battle.stop()
        audio.victory.play()
    }

    attack({ attack, recipient, renderedSprites}) { 
        document.querySelector('#dialogueBox').style.display = 'block'
        document.querySelector('#dialogueBox').innerHTML = 
            this.name + ' used ' + attack.name

        let healthBar = '#enemyHealthBar'
            if (this.isEnemy) healthBar = '#playerHealthBar'

            let rotation = 1
            if (this.isEnemy) rotation = -2.2

            recipient.health -= attack.damage    

        switch (attack.name) {
            case 'Fireball':
                audio.initFireball.play()
                const fireballImage = new Image()
                fireballImage.src = './Images/fireball.png'
                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImage,
                    frames: {
                        max: 4,
                        hold: 10
                    },
                    animate: true,
                    rotation
                })
                renderedSprites.splice(1, 0, fireball)

                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        //Enemy actually gets hit
                        audio.fireballHit.play()
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        })
                        gsap.to(recipient.position, {
                            x: recipient. position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })

                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })
                        renderedSprites.splice(1, 1)
                    }
                })

            break
            case 'Tackle':
                const tl = gsap.timeline()
    
                let movementDistance = 20
                if (this.isEnemy) movementDistance = -20
    
                tl.to(this.position, {
                    x: this.position.x - movementDistance
                })
                        .to(this.position, {
                        x: this.position.x + movementDistance * 2,
                        duration: 0.1,
                        onComplete: () => {
                            //Enemy actually gets hit
                            audio.tackleHit.play()
                            gsap.to(healthBar, {
                                width: recipient.health + '%'
                            })
                            gsap.to(recipient.position, {
                                x: recipient. position.x + 10,
                                yoyo: true,
                                repeat: 5,
                                duration: 0.08
                            })
    
                            gsap.to(recipient, {
                                opacity: 0,
                                repeat: 5,
                                yoyo: true,
                                duration: 0.08
                            })
                        }
                    })
                    .to(this.position, {
                        x: this.position.x
                    })
            break;
        }
        
    }

}

//creating objects to render out for the canvas
class Boundary {
    //static property to refer width and height
    static width = 48
    static height = 48
    constructor({position }) {
        this.position = position
        // since map is 12 X 12 but we aumented 400% it changes to 12 x 4 = 48
        this.width = 48
        this.height = 48
    }

    //we use a draw method for boundaries and we also use fillRect to take four arguments (x, y, width, height)
    draw() {
        c.fillStyle = 'rgba(255, 0, 0, 0)'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
} 