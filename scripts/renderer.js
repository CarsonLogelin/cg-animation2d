import * as CG from './transforms.js';
import { Matrix } from "./matrix.js";

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // limit_fps_flag:      bool 
    // fps:                 int
    constructor(canvas, limit_fps_flag, fps) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.slide_idx = 0;
        this.limit_fps = limit_fps_flag;
        this.fps = fps;
        this.start_time = null;
        this.prev_time = null;
        this.xvelocity = 1;
        this.yvelocity = .5;
        this.position = { x: 0, y: 0 };
        this.color = [65, 105, 255, 255];
        this.sqScaleX = 1;
        this.sqScaleY = 1;
        this.sqScaleXVelocity = .5;
        this.sqScaleYVelocity = 1;
        this.hexScaleX = 1;
        this.hexScaleY = 1;
        this.hexScaleXVelocity = .5;
        this.hexScaleYVelocity = .5;
        this.models = {
            slide0: [

                {
                    vertices: Array.from({ length: 100 }, (_, i) => {
                        const angle = (2 * Math.PI * i) / 100;
                        const radius = 50;

                        return CG.Vector3(
                            400 + radius * Math.cos(angle),
                            300 + radius * Math.sin(angle),
                            1
                        );
                    }),
                    transform: new Matrix(3, 3)
                 }],
            slide1: [{
                vertices: [
                    CG.Vector3(100, 100, 1),
                    CG.Vector3(200, 100, 1),
                    CG.Vector3(200, 200, 1),
                    CG.Vector3(100, 200, 1)
                ],
                transform: new Matrix(3, 3)
            }, {
                vertices:[
                    CG.Vector3(400, 525, 1),
                    CG.Vector3(425, 450, 1),
                    CG.Vector3(500, 450, 1),
                    CG.Vector3(450, 400, 1),
                    CG.Vector3(475, 325, 1),
                    
                    CG.Vector3(400, 375, 1),
                    CG.Vector3(325, 325, 1),
                    CG.Vector3(350, 400, 1),
                    CG.Vector3(300, 450, 1),
                    CG.Vector3(375, 450, 1)
                ],
                transform: new Matrix(3, 3)
            }, {
                vertices:[
                    CG.Vector3(600, 200, 1),
                    CG.Vector3(700, 100, 1),
                    CG.Vector3(500, 100, 1)
                ],
                transform: new Matrix(3, 3)
            }],
            slide2: [{
                vertices: [
                    CG.Vector3(550, 350, 1),
                    CG.Vector3(550, 250, 1),
                    CG.Vector3(650, 250, 1),
                    CG.Vector3(650, 350, 1)
                ],
                transform: new Matrix(3, 3)
            }, {
                vertices: [
                    CG.Vector3(150, 375, 1),
                    CG.Vector3(100, 325, 1),
                    CG.Vector3(100, 275, 1),
                    CG.Vector3(150, 225, 1),
                    CG.Vector3(200, 275, 1),
                    CG.Vector3(200, 325, 1)
                ],
                transform: new Matrix(3, 3)
            }],
            slide3: [{
                vertices: [
                    CG.Vector3(350, 350, 1),
                    CG.Vector3(350, 250, 1),
                    CG.Vector3(450, 250, 1),
                    CG.Vector3(450, 350, 1)
                ],
                transform: new Matrix(3, 3)
            }]
        };
    }

    // flag:  bool
    limitFps(flag) {
        this.limit_fps = flag;
    }

    // n:  int
    setFps(n) {
        this.fps = n;
    }

    // idx: int
    setSlideIndex(idx) {
        this.slide_idx = idx;
    }

    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time;
        let delta_time = timestamp - this.prev_time;
        //console.log('animate(): t = ' + time.toFixed(1) + ', dt = ' + delta_time.toFixed(1));

        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.drawSlide();

        // Invoke call for next frame in animation
        if (this.limit_fps) {
            setTimeout(() => {
                window.requestAnimationFrame((ts) => {
                    this.animate(ts);
                });
            }, Math.floor(1000.0 / this.fps));
        }
        else {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }

    //
    updateTransforms(time, delta_time) {
        // Slide 0
        if (this.models.slide0[0].vertices[0].values[0][0] + this.position.x + this.xvelocity * delta_time > this.canvas.width || this.models.slide0[0].vertices[50].values[0][0] + this.position.x + this.xvelocity * delta_time < 0) {

            this.xvelocity = -this.xvelocity;
            this.color[0] = Math.random() * 255;
            this.color[1] = Math.random() * 255;
            this.color[2] = Math.random() * 255;    
        }
        if (this.models.slide0[0].vertices[25].values[1][0] + this.position.y + this.yvelocity * delta_time > this.canvas.height || this.models.slide0[0].vertices[75].values[1][0] + this.position.y + this.yvelocity * delta_time < 0) {

            this.yvelocity = -this.yvelocity;
            this.color[0] = Math.random() * 255;
            this.color[1] = Math.random() * 255;
            this.color[2] = Math.random() * 255;   
        }
        this.position.x += this.xvelocity * delta_time;
        this.position.y += this.yvelocity * delta_time;
        CG.mat3x3Translate(this.models.slide0[0].transform, this.position.x, this.position.y);

        // Slide 1

        // Square rotation
        this.angularVelocity = 45 * Math.PI / 180 / 1000;
        let theta = this.angularVelocity * time;

        this.models.slide1[0].transform = this.rotateAround(150, 150, theta);

        // Star Rotation
        this.angularVelocity = -45 * Math.PI / 180 / 1000;
        theta = this.angularVelocity * time;

        this.models.slide1[1].transform = this.rotateAround(400, 415, theta);

        // Triangle Rotation
        this.angularVelocity = 180 * Math.PI / 180 / 1000;
        theta = this.angularVelocity * time;

        this.models.slide1[2].transform = this.rotateAround(600, 400/3, theta);

        // Slide 2
        if((this.sqScaleX >= 2 && this.sqScaleXVelocity > 0) || (this.sqScaleX <=0 && this.sqScaleXVelocity < 0)) {
            this.sqScaleXVelocity *= -1;
        }
        if((this.sqScaleY >= 2  && this.sqScaleYVelocity > 0) || (this.sqScaleY <=0  && this.sqScaleYVelocity < 0)) {
            this.sqScaleYVelocity *= -1;
        }
        
        this.sqScaleX += this.sqScaleXVelocity * delta_time/1000;
        this.sqScaleY += this.sqScaleYVelocity * delta_time/1000;

        this.models.slide2[0].transform = this.updateTransformsKindOf(600, 300, 0, this.sqScaleX, this.sqScaleY);

        if(this.hexScaleX >= 2 || this.hexScaleX <= .5) {
            this.hexScaleXVelocity *= -1;
        }
        if(this.hexScaleY >= 2 || this.hexScaleY <= .5) {
            this.hexScaleYVelocity *= -1;
        }
        
        this.hexScaleX += this.hexScaleXVelocity * delta_time/1000;
        this.hexScaleY += this.hexScaleYVelocity * delta_time/1000;

        this.models.slide2[1].transform = this.updateTransformsKindOf(150, 300, 0, this.hexScaleX, this.hexScaleY);

        //Slide 3

        this.models.slide3[0].transform = this.updateTransformsKindOf(this.position.x, this.position.y, theta, this.sqScaleX, this.sqScaleY);

    }

    rotateAround(x, y, theta){
        let toOrigin = new Matrix(3, 3);
        let rot = new Matrix(3, 3);
        let back = new Matrix(3, 3);

        CG.mat3x3Translate(toOrigin, -x, -y);
        CG.mat3x3Rotate(rot, theta);
        CG.mat3x3Translate(back, x, y);

        return Matrix.multiply([back, rot, toOrigin]);
    }

    updateTransformsKindOf(x, y, theta, sx, sy) {
        let toOrigin = new Matrix(3, 3);
        let rot = new Matrix(3, 3);
        let scale = new Matrix(3, 3);
        let back = new Matrix(3, 3);

        CG.mat3x3Translate(toOrigin, -x, -y);
        CG.mat3x3Scale(scale, sx, sy);
        CG.mat3x3Rotate(rot, theta);
        CG.mat3x3Translate(back, x, y);

        return Matrix.multiply([back, scale, rot, toOrigin]);
    }
    
    //
    drawSlide() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.slide_idx) {
            case 0:
                this.drawSlide0();
                break;
            case 1:
                this.drawSlide1();
                break;
            case 2:
                this.drawSlide2();
                break;
            case 3:
                this.drawSlide3();
                break;
        }
    }

    //
    drawSlide0() {
        // use blue if you don't want random colors otherwise use this.color for random colors whenever the ball hits the sides
        // let blue = [65, 105, 255, 255];  
        

        this.drawConvexPolygon(this.applyTransform(this.models.slide0[0].transform, this.models.slide0[0].vertices), this.color);

    }

    // Takes the transformation matrix and the list of vectors(vertices) and then changes the vectors based on the transformation matrix
    applyTransform(TransformMatrix, Vertices){
        let A = []

        for (let i = 0; i < Vertices.length; i++) {
            A.push(Matrix.multiply([TransformMatrix, Vertices[i]]));
        }

        return A;
    }

    //
    drawSlide1() {
        let blue = [65, 105, 255, 255];  
        let green = [0, 255, 0, 255];
        let red = [255, 0, 0, 255];

        this.drawConvexPolygon(this.applyTransform(this.models.slide1[0].transform, this.models.slide1[0].vertices), blue);
        this.drawConvexPolygon(this.applyTransform(this.models.slide1[1].transform, this.models.slide1[1].vertices), green);
        this.drawConvexPolygon(this.applyTransform(this.models.slide1[2].transform, this.models.slide1[2].vertices), red);
    }


    //
    drawSlide2() {
        // TODO: draw at least 2 polygons grow and shrink about their own centers
        //   - have each polygon grow / shrink different sizes
        //   - try at least 1 polygon that grows / shrinks non-uniformly in the x and y directions
        this.drawConvexPolygon(this.applyTransform(this.models.slide2[0].transform, this.models.slide2[0].vertices), [175, 0, 255, 255]);
        this.drawConvexPolygon(this.applyTransform(this.models.slide2[1].transform, this.models.slide2[1].vertices), [175, 255, 125, 255]);
        
    }

    //
    drawSlide3() {
        // TODO: get creative!
        //   - animation should involve all three basic transformation types
        //     (translation, scaling, and rotation)
        
        this.drawConvexPolygon(this.applyTransform(this.models.slide3[0].transform, this.models.slide3[0].vertices), [175, 0, 255, 255]);
    }
    
    // vertex_list:  array of object [Matrix(3, 1), Matrix(3, 1), ..., Matrix(3, 1)]
    // color:        array of int [R, G, B, A]
    drawConvexPolygon(vertex_list, color) {
        this.ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (color[3] / 255) + ')';
        this.ctx.beginPath();
        let x = vertex_list[0].values[0][0] / vertex_list[0].values[2][0];
        let y = vertex_list[0].values[1][0] / vertex_list[0].values[2][0];
        this.ctx.moveTo(x, y);
        for (let i = 1; i < vertex_list.length; i++) {
            x = vertex_list[i].values[0][0] / vertex_list[i].values[2][0];
            y = vertex_list[i].values[1][0] / vertex_list[i].values[2][0];
            this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
};

export { Renderer };
