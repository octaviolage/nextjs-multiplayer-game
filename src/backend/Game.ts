import { useStore } from '@/context'
import Player from './classes/Player'
import Projectile from './classes/Projectile'
import { socket } from '@/socket'
import type { BackEndPlayer, BackEndProjectile, Players, Projectiles, PlayerInput } from '@/types'

class Game {
  private canvas: HTMLCanvasElement
  private cc: CanvasRenderingContext2D
  private players: Players = {}
  private projectiles: Projectiles = {}
  private keys: Record<string, { pressed: boolean }> = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false }
  }
  private playerInputs: PlayerInput[] = []
  private sequenceNumber: number = 0
  private animationId?: number
  private SPEED: number = 5

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.cc = canvas.getContext('2d')!
    this.initialize()
  }

  private initialize(): void {

    socket.on('updateProjectiles', this.handleUpdateProjectiles.bind(this))
    socket.on('updatePlayers', this.handleUpdatePlayers.bind(this))

    this.animate()
    this.setupInputHandlers()
  }

  private handleUpdateProjectiles(backEndProjectiles: Record<string, BackEndProjectile>): void {
    for (const id in backEndProjectiles) {
      const backEndProjectile = backEndProjectiles[id]

      if (!this.projectiles[id]) {
        this.projectiles[id] = new Projectile({
          x: backEndProjectile.x,
          y: backEndProjectile.y,
          radius: 5,
          color: this.players[backEndProjectile.playerId]?.color,
          velocity: backEndProjectile.velocity
        })
      } else {
        this.projectiles[id].x += backEndProjectile.velocity.x
        this.projectiles[id].y += backEndProjectile.velocity.y
      }
    }

    for (const frontEndProjectileId in this.projectiles) {
      if (!backEndProjectiles[frontEndProjectileId]) {
        delete this.projectiles[frontEndProjectileId]
      }
    }
  }

  private handleUpdatePlayers(backEndPlayers: Record<string, BackEndPlayer>): void {
    const { setScene, setPlayers } = useStore.getState()

    for (const id in backEndPlayers) {
      const backEndPlayer = backEndPlayers[id]

      if (!this.players[id]) {
        this.players[id] = new Player({
          x: backEndPlayer.x,
          y: backEndPlayer.y,
          radius: 10,
          color: backEndPlayer.color,
          username: backEndPlayer.username
        })
      } else {
        this.players[id].score = backEndPlayer.score

        this.players[id].target = {
          x: backEndPlayer.x,
          y: backEndPlayer.y
        }

        if (id === socket.id) {
          const lastBackendInputIndex = this.playerInputs.findIndex((input) => {
            return backEndPlayer.sequenceNumber === input.sequenceNumber
          })

          if (lastBackendInputIndex > -1) {
            this.playerInputs.splice(0, lastBackendInputIndex + 1)
          }

          this.playerInputs.forEach((input) => {
            this.players[id].target!.x += input.dx
            this.players[id].target!.y += input.dy
          })
        }
      }
    }

    for (const id in this.players) {
      if (!backEndPlayers[id]) {
        if (id === socket.id) setScene('login')
        delete this.players[id]
      }
    }

    setPlayers(this.players)
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this))
    this.cc.clearRect(0, 0, this.canvas.width, this.canvas.height)

    for (const id in this.players) {
      const frontEndPlayer = this.players[id]

      if (frontEndPlayer.target) {
        frontEndPlayer.x += (frontEndPlayer.target.x - frontEndPlayer.x) * 0.5
        frontEndPlayer.y += (frontEndPlayer.target.y - frontEndPlayer.y) * 0.5
      }

      frontEndPlayer.draw(this.cc)
    }

    for (const id in this.projectiles) {
      const frontEndProjectile = this.projectiles[id]
      frontEndProjectile.draw(this.cc)
    }
  }

  private setupInputHandlers(): void {
    setInterval(() => {
      if (this.keys.w.pressed) {
        this.sendPlayerInput('KeyW', 0, -this.SPEED)
      }

      if (this.keys.a.pressed) {
        this.sendPlayerInput('KeyA', -this.SPEED, 0)
      }

      if (this.keys.s.pressed) {
        this.sendPlayerInput('KeyS', 0, this.SPEED)
      }

      if (this.keys.d.pressed) {
        this.sendPlayerInput('KeyD', this.SPEED, 0)
      }
    }, 15)

    window.addEventListener('keydown', this.handleKeyDown.bind(this))
    window.addEventListener('keyup', this.handleKeyUp.bind(this))
    window.addEventListener('click', this.handleClick.bind(this))
  }

  private sendPlayerInput(keycode: string, dx: number, dy: number): void {
    this.sequenceNumber++
    this.playerInputs.push({ sequenceNumber: this.sequenceNumber, dx, dy })
    socket.emit('keydown', { keycode, sequenceNumber: this.sequenceNumber })
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (socket.id === undefined) return

    switch (event.code) {
      case 'KeyW':
        this.keys.w.pressed = true
        break
      case 'KeyA':
        this.keys.a.pressed = true
        break
      case 'KeyS':
        this.keys.s.pressed = true
        break
      case 'KeyD':
        this.keys.d.pressed = true
        break
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (socket.id === undefined) return

    switch (event.code) {
      case 'KeyW':
        this.keys.w.pressed = false
        break
      case 'KeyA':
        this.keys.a.pressed = false
        break
      case 'KeyS':
        this.keys.s.pressed = false
        break
      case 'KeyD':
        this.keys.d.pressed = false
        break
    }
  }

  private handleClick(event: MouseEvent): void {
    if (socket.id === undefined) return

    const player = this.players[socket.id]
    if (!player) return

    const { top, left } = this.canvas.getBoundingClientRect()
    const angle = Math.atan2(event.clientY - top - player.y, event.clientX - left - player.x)

    socket.emit('shoot', {
      x: player.x,
      y: player.y,
      angle
    })
  }
}

function StartGame(canvas: HTMLCanvasElement): Game {
  return new Game(canvas)
}

export default StartGame
