import Igloo, { Program } from "igloo-ts";
const vertexShader = require("../../loader/raw-loader!../../shaders/vertex.glsl");
const pixelShader = require("../../loader/raw-loader!../../shaders/pixel.glsl");
import Color = require("color");
import TextureData from "./texture-data";
import { IEdge as IModelEdge, IPoint } from "../model"

export interface IParticleEdge extends IModelEdge {
}

// texture buffer used to hold vertex information
const COLOR_ROW = 0;
const VERTEX_ROW = 1;
const VARIATION_ROW = 2;
const SHAPE_ROW = 3;
const END_COLOR_ROW = 4;
const BEZIER_ROW = 4;
const edgeRows = 6;

export default class Particles {
    private worldsize: Float32Array;
    private color: string;
    private running = false;
    private igloo: Igloo;
    private program: Program;
    private raf: number = 0;

    public backgroundColor: { r: number, g: number, b: number } = null;
    private count: number;
    private textureData: TextureData;

    /**
     * @param nparticles initial particle count
     * @param [size=5] particle size in pixels
     */
    constructor(private canvas: HTMLCanvasElement, private size: number = 8) {
        const igloo = this.igloo = new Igloo(this.canvas);
        const vertexShaderText = vertexShader;
        const pixelShaderText = pixelShader;

        this.program = this.igloo.program(vertexShaderText, pixelShaderText);
        const gl = igloo.gl;

        gl.getExtension('OES_texture_float_linear');
        gl.getExtension('OES_texture_float');
        const w = canvas.width;
        const h = canvas.height;
        gl.disable(gl.DEPTH_TEST);
        this.worldsize = new Float32Array([w, h]);
        this.textureData = new TextureData(2, edgeRows);
        /* Drawing parameters. */
        this.color = "blue";
        console.log("Initialized Particle system")
    }

    public get isRunning() {
        return this.running;
    }


    /** If the vertices have changed then update the buffers   */
    public updateBuffers(edges: IParticleEdge[], width: number, height: number) {
        try {
            const gl = this.igloo.gl;
            const particleCount = edges.reduce((p, c) => (c.ratePerSecond || 0) + p, 0);
            const edgeCount = edges.length;
            this.worldsize = new Float32Array([width, height]);

            // const scale = { x: width, y: height };
            const convertBezierPoints = (edgePoint: IPoint, defaultPoint: IPoint) =>
                edgePoint ? { x: edgePoint.x, y: edgePoint.y } : { x: defaultPoint.x, y: defaultPoint.y };

            // if the total particle count has changed then we need to change the associations
            // between the particle and the vertex data (edge) 
            if (particleCount != this.count) {
                console.log("Updating Edge Data: " + particleCount);
                this.count = particleCount;
                let i = 0;
                const edgeIndexArray = new Float32Array(particleCount);
                const timeOffsetArray = new Float32Array(particleCount);
                let edgeIndex = 0;
                for (let edge of edges) {
                    if (!edge.ratePerSecond) {
                        edgeIndex++;
                        continue;
                    }
                    for (let n = 0; n < edge.ratePerSecond; n++) {
                        timeOffsetArray[i] = edge.nonrandom ? (n / edge.ratePerSecond) : Math.random();
                        edgeIndexArray[i] = edgeIndex;
                        i++;
                    }
                    edgeIndex++;
                }
                this.program.use();
                // update time
                const timeBuffer = this.igloo.array(timeOffsetArray, gl.STATIC_DRAW);
                timeBuffer.update(timeOffsetArray, gl.STATIC_DRAW);
                this.program.attrib('time', timeBuffer, 1);
                // update edge Index
                const edgeIndexBuffer = this.igloo.array(edgeIndexArray, gl.STATIC_DRAW);
                edgeIndexBuffer.update(edgeIndexArray, gl.STATIC_DRAW);
                this.program.attrib('edgeIndex', edgeIndexBuffer, 1);
            }

            if (this.textureData.length != edgeCount) {
                this.textureData = new TextureData(edgeRows, edgeCount);
                console.log(`Allocated Texture ${this.textureData.lengthPower2} x ${this.textureData.rowsPower2}`)
            }
            let edgeIndex = 0;
            // update the texture Data, each row is a different attribute of the edge
            for (let edge of edges) {
                const variationMin = (edge.particleStyle.variationMin === undefined) ? -0.01 : edge.particleStyle.variationMin;
                const variationMax = (edge.particleStyle.variationMax === undefined) ? 0.01 : edge.particleStyle.variationMax;
                // set-up vertices in edgedata
                this.textureData.setVec2(VERTEX_ROW, edgeIndex,
                    convertBezierPoints(edge.p0, edge.p0),
                    convertBezierPoints(edge.p3, edge.p3));
                // random variation of the particles
                this.textureData.setValue(VARIATION_ROW, edgeIndex, variationMin, variationMax, variationMax - variationMin, Math.random());
                // set-up color in edge Data
                this.textureData.setColor(COLOR_ROW, edgeIndex, edge.particleStyle.color || this.color);
                this.textureData.setColor(END_COLOR_ROW, edgeIndex, edge.particleStyle.endingColor || edge.particleStyle.color || this.color);
                // set-up shape
                this.textureData.setValue(SHAPE_ROW, edgeIndex, (edge.particleStyle.size || this.size || 8.0) / 256, edge.particleStyle.roundness || 0.0, 0.0, 0.0);
                // bezier
                this.textureData.setVec2(BEZIER_ROW, edgeIndex,
                    convertBezierPoints(edge.p1, edge.p1),
                    convertBezierPoints(edge.p2, edge.p2));
                edgeIndex++;
            }
            this.program.use();

            this.program.uniform('edgeCount', this.textureData.lengthPower2);
            this.program.uniform('variationRow', (VARIATION_ROW + 0.5) / this.textureData.rowsPower2);
            this.program.uniform('colorRow', (COLOR_ROW + 0.5) / this.textureData.rowsPower2);
            this.program.uniform('vertexRow', (VERTEX_ROW + 0.5) / this.textureData.rowsPower2);
            this.program.uniform('endColorRow', (END_COLOR_ROW + 0.5) / this.textureData.rowsPower2);
            this.program.uniform('shapeRow', (SHAPE_ROW + 0.5) / this.textureData.rowsPower2);
            this.program.uniform('bezierRow', (BEZIER_ROW + 0.5) / this.textureData.rowsPower2);

            this.textureData.bindTexture(this.igloo.gl, gl.TEXTURE0);

            this.program.uniform('edgeData', 0, true);
        }
        catch (e) {
            console.error("UpdateBuffers", e);
        }
    };

    /** Draw the current simulation state to the display. */
    public draw() {
        const igloo = this.igloo;
        const gl = igloo.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        igloo.defaultFramebuffer.bind();
        gl.viewport(0, 0, this.worldsize[0], this.worldsize[1]);
        gl.clearColor(
            this.backgroundColor ? this.backgroundColor.r / 256 : 0,
            this.backgroundColor ? this.backgroundColor.g / 256 : 0,
            this.backgroundColor ? this.backgroundColor.b / 256 : 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.program.use();
        this.program.uniform('second', ((new Date().valueOf() % 2000) / 2000.0));
        this.program.uniform('worldsize', this.worldsize);
        // this.drawProgram.uniform('size', this.size);
        this.program.uniform('edgeData', 0, true);

        const background = Color(this.color).array();
        this.program.uniform('color', [background[0] / 255, background[1] / 255, background[2] / 255, 1.0]);
        if (this.count > 0) this.program.draw(gl.POINTS, this.count);
        return this;
    };

    /** Register with requestAnimationFrame to step and draw a frame.*/
    public frame() {
        this.raf = window.requestAnimationFrame(() => {
            if (this.running) {
                this.draw();
                this.frame();
            } else {
                console.log("Stopped");
            }
        });
    };

    /** Start animating the simulation if it isn't already.*/
    public start() {
        if (!this.running) {
            this.running = true;
            this.frame();
        }
    };

    /** Immediately stop the animation. */
    public stop() {
        this.running = false;
        if (this.raf) window.cancelAnimationFrame(this.raf);
    }
}