interface PlayerProps {
  x: number;
  y: number;
  radius: number;
  color: string;
  username: string;
}

export default class Player {
  x: number;
  y: number;
  radius: number;
  color: string;
  username: string;
  score?: number;
  target?: { x: number; y: number };

  constructor({ x, y, radius, color, username }: PlayerProps) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.username = username;
    this.score = 0;
  }

  draw(cc: CanvasRenderingContext2D): void {
    cc.font = '12px sans-serif';
    cc.fillStyle = 'white';
    cc.fillText(this.username, this.x - 10, this.y + 20);
    cc.save();
    cc.shadowColor = this.color;
    cc.shadowBlur = 20;
    cc.beginPath();
    cc.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    cc.fillStyle = this.color;
    cc.fill();
    cc.restore();
  }
}
