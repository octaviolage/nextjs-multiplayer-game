interface Velocity {
  x: number;
  y: number;
}

interface ProjectileProps {
  x: number;
  y: number;
  radius: number;
  color?: string;
  velocity: Velocity;
}

export default class Projectile {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: Velocity;

  constructor({ x, y, radius, color = 'white', velocity }: ProjectileProps) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw(cc: CanvasRenderingContext2D): void {
    cc.save();
    cc.shadowColor = this.color;
    cc.shadowBlur = 20;
    cc.beginPath();
    cc.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    cc.fillStyle = this.color;
    cc.fill();
    cc.restore();
  }

  update(cc: CanvasRenderingContext2D): void {
    this.draw(cc);
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
