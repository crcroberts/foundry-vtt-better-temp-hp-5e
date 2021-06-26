export class Draw {
    
    color = {
        black() { return 0x000000;},
        background() { return 0x000000; },
        border() { return 0x000000; },
        temp() { return 0x78daf3; },
        forValue(pct) {
          return PIXI.utils.rgb2hex([(1-(pct/2)), pct, 0]);
        }

    }
    
    constructor(bar, width, height, tempText) {
        this.bar = bar;
        this.bar.clear();
        this.w = width;
        this.barWidth = width;
        this.h = height;
        this.b = Math.clamped(this.h / 8, 1, 2);
        this.i = this.b + 1;
        this.text = tempText;
    }

    setSize(makeRoomForTemp) {
        if (makeRoomForTemp) {
            this.barWidth = this.w * 0.8;
        } else {
            this.barWidth = this.w;
        }
        return this;
    }
  
    background() {
        this.bar.beginFill(this.color.background(), 0.5)
            .lineStyle(0)
            .drawRoundedRect(0, 0, this.barWidth, this.h, 3);
        return this;
    }
  
    mainBorder(color=this.color.border()) {
      return this.border({ color });
    }
  
    current(pct, color) {
        if (pct <= 0) return this;
        if (!color) { 
            color = this.color.forValue(pct);
        }
        this.bar.beginFill(color, 1.0)
            .lineStyle(1, this.color.border(), 1.0)
            .drawRoundedRect(0, 0, pct*(this.barWidth), this.h, 2);
        return this;
    }
  
    temp(amount, color=this.color.temp(), opacity=1.0) {
        if (amount <= 0) return this;
        
        const x = 0.9*this.w;
        const y = (this.h / 2);
        const radius = 0.085*this.w;

        this.text.text = amount;
        this.text.style = {
            fontFamily : 'Arial',
            color: 0xffffff,
            fontSize: `${this.h + 3}px`
        };
        this.text.anchor.set(0.5, 0.5);
        this.text.position.set(x, y);

        this.bar.beginFill(color, 1.0)
            .lineStyle(this.b, this.color.border(), opacity)
            .drawCircle(x, y, radius)
            .addChild(this.text);
        return this;
    }
  
    border({ pct=1.0, inset=0, radius=3, color=this.color.border(), opacity=1.0 }={}) {
        this.bar.beginFill(0, 0.0)
            .lineStyle(this.b, color, opacity)
            .drawRoundedRect(inset, inset, (pct*this.barWidth)-(2*inset), this.h-(2*inset), radius);
        return this;
    }
}