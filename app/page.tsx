"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import * as THREE from 'three';

// LiquidEther component starts here
export interface LiquidEtherProps {
  mouseForce?: number;
  cursorSize?: number;
  isViscous?: boolean;
  viscous?: number;
  iterationsViscous?: number;
  iterationsPoisson?: number;
  dt?: number;
  BFECC?: boolean;
  resolution?: number;
  isBounce?: boolean;
  colors?: string[];
  style?: React.CSSProperties;
  className?: string;
  autoDemo?: boolean;
  autoSpeed?: number;
  autoIntensity?: number;
  takeoverDuration?: number;
  autoResumeDelay?: number;
  autoRampDuration?: number;
}

interface SimOptions {
  iterations_poisson: number;
  iterations_viscous: number;
  mouse_force: number;
  resolution: number;
  cursor_size: number;
  viscous: number;
  isBounce: boolean;
  dt: number;
  isViscous: boolean;
  BFECC: boolean;
}

interface LiquidEtherWebGL {
  output?: { simulation?: { options: SimOptions; resize: () => void } };
  autoDriver?: {
    enabled: boolean;
    speed: number;
    resumeDelay: number;
    rampDurationMs: number;
    mouse?: { autoIntensity: number; takeoverDuration: number };
    forceStop: () => void;
  };
  resize: () => void;
  start: () => void;
  pause: () => void;
  dispose: () => void;
}

const defaultColors = ['#5227FF', '#FF9FFC', '#B19EEF'];

function LiquidEther({
  mouseForce = 20,
  cursorSize = 100,
  isViscous = false,
  viscous = 30,
  iterationsViscous = 32,
  iterationsPoisson = 32,
  dt = 0.014,
  BFECC = true,
  resolution = 0.5,
  isBounce = false,
  colors = defaultColors,
  style = {},
  className = '',
  autoDemo = true,
  autoSpeed = 0.5,
  autoIntensity = 2.2,
  takeoverDuration = 0.25,
  autoResumeDelay = 1000,
  autoRampDuration = 0.6
}: LiquidEtherProps): React.ReactElement {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const webglRef = useRef<LiquidEtherWebGL | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const rafRef = useRef<number | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const isVisibleRef = useRef<boolean>(true);
  const resizeRafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    function makePaletteTexture(stops: string[]): THREE.DataTexture {
      let arr: string[];
      if (Array.isArray(stops) && stops.length > 0) {
        arr = stops.length === 1 ? [stops[0], stops[0]] : stops;
      } else {
        arr = ['#ffffff', '#ffffff'];
      }
      const w = arr.length;
      const data = new Uint8Array(w * 4);
      for (let i = 0; i < w; i++) {
        const c = new THREE.Color(arr[i]);
        data[i * 4 + 0] = Math.round(c.r * 255);
        data[i * 4 + 1] = Math.round(c.g * 255);
        data[i * 4 + 2] = Math.round(c.b * 255);
        data[i * 4 + 3] = 255;
      }
      const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      return tex;
    }

    const paletteTex = makePaletteTexture(colors);
    const bgVec4 = new THREE.Vector4(0, 0, 0, 0);

    class CommonClass {
      width = 0;
      height = 0;
      aspect = 1;
      pixelRatio = 1;
      isMobile = false;
      breakpoint = 768;
      fboWidth: number | null = null;
      fboHeight: number | null = null;
      time = 0;
      delta = 0;
      container: HTMLElement | null = null;
      renderer: THREE.WebGLRenderer | null = null;
      clock: THREE.Clock | null = null;
      init(container: HTMLElement) {
        this.container = container;
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        this.resize();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.autoClear = false;
        this.renderer.setClearColor(new THREE.Color(0x000000), 0);
        this.renderer.setPixelRatio(this.pixelRatio);
        this.renderer.setSize(this.width, this.height);
        const el = this.renderer.domElement;
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.display = 'block';
        this.clock = new THREE.Clock();
        this.clock.start();
      }
      resize() {
        if (!this.container) return;
        const rect = this.container.getBoundingClientRect();
        this.width = Math.max(1, Math.floor(rect.width));
        this.height = Math.max(1, Math.floor(rect.height));
        this.aspect = this.width / this.height;
        if (this.renderer) this.renderer.setSize(this.width, this.height, false);
      }
      update() {
        if (!this.clock) return;
        this.delta = this.clock.getDelta();
        this.time += this.delta;
      }
    }
    const Common = new CommonClass();

    class MouseClass {
      mouseMoved = false;
      coords = new THREE.Vector2();
      coords_old = new THREE.Vector2();
      diff = new THREE.Vector2();
      timer: number | null = null;
      container: HTMLElement | null = null;
      isHoverInside = false;
      hasUserControl = false;
      isAutoActive = false;
      autoIntensity = 2.0;
      takeoverActive = false;
      takeoverStartTime = 0;
      takeoverDuration = 0.25;
      takeoverFrom = new THREE.Vector2();
      takeoverTo = new THREE.Vector2();
      onInteract: (() => void) | null = null;
      private _onMouseMove = this.onDocumentMouseMove.bind(this);
      private _onTouchStart = this.onDocumentTouchStart.bind(this);
      private _onTouchMove = this.onDocumentTouchMove.bind(this);
      private _onMouseEnter = this.onMouseEnter.bind(this);
      private _onMouseLeave = this.onMouseLeave.bind(this);
      private _onTouchEnd = this.onTouchEnd.bind(this);
      init(container: HTMLElement) {
        this.container = container;
        container.addEventListener('mousemove', this._onMouseMove);
        container.addEventListener('touchstart', this._onTouchStart, { passive: true });
        container.addEventListener('touchmove', this._onTouchMove, { passive: true });
        container.addEventListener('mouseenter', this._onMouseEnter);
        container.addEventListener('mouseleave', this._onMouseLeave);
        container.addEventListener('touchend', this._onTouchEnd);
      }
      dispose() {
        const c = this.container;
        if (!c) return;
        c.removeEventListener('mousemove', this._onMouseMove);
        c.removeEventListener('touchstart', this._onTouchStart);
        c.removeEventListener('touchmove', this._onTouchMove);
        c.removeEventListener('mouseenter', this._onMouseEnter);
        c.removeEventListener('mouseleave', this._onMouseLeave);
        c.removeEventListener('touchend', this._onTouchEnd);
      }
      setCoords(x: number, y: number) {
        if (!this.container) return;
        if (this.timer) window.clearTimeout(this.timer);
        const rect = this.container.getBoundingClientRect();
        const nx = (x - rect.left) / rect.width;
        const ny = (y - rect.top) / rect.height;
        this.coords.set(nx * 2 - 1, -(ny * 2 - 1));
        this.mouseMoved = true;
        this.timer = window.setTimeout(() => {
          this.mouseMoved = false;
        }, 100);
      }
      setNormalized(nx: number, ny: number) {
        this.coords.set(nx, ny);
        this.mouseMoved = true;
      }
      onDocumentMouseMove(event: MouseEvent) {
        if (this.onInteract) this.onInteract();
        if (this.isAutoActive && !this.hasUserControl && !this.takeoverActive) {
          if (!this.container) return;
          const rect = this.container.getBoundingClientRect();
          const nx = (event.clientX - rect.left) / rect.width;
          const ny = (event.clientY - rect.top) / rect.height;
          this.takeoverFrom.copy(this.coords);
          this.takeoverTo.set(nx * 2 - 1, -(ny * 2 - 1));
          this.takeoverStartTime = performance.now();
          this.takeoverActive = true;
          this.hasUserControl = true;
          this.isAutoActive = false;
          return;
        }
        this.setCoords(event.clientX, event.clientY);
        this.hasUserControl = true;
      }
      onDocumentTouchStart(event: TouchEvent) {
        if (event.touches.length === 1) {
          const t = event.touches[0];
          if (this.onInteract) this.onInteract();
          this.setCoords(t.pageX, t.pageY);
          this.hasUserControl = true;
        }
      }
      onDocumentTouchMove(event: TouchEvent) {
        if (event.touches.length === 1) {
          const t = event.touches[0];
          if (this.onInteract) this.onInteract();
          this.setCoords(t.pageX, t.pageY);
        }
      }
      onTouchEnd() {
        this.isHoverInside = false;
      }
      onMouseEnter() {
        this.isHoverInside = true;
      }
      onMouseLeave() {
        this.isHoverInside = false;
      }
      update() {
        if (this.takeoverActive) {
          const t = (performance.now() - this.takeoverStartTime) / (this.takeoverDuration * 1000);
          if (t >= 1) {
            this.takeoverActive = false;
            this.coords.copy(this.takeoverTo);
            this.coords_old.copy(this.coords);
            this.diff.set(0, 0);
          } else {
            const k = t * t * (3 - 2 * t);
            this.coords.copy(this.takeoverFrom).lerp(this.takeoverTo, k);
          }
        }
        this.diff.subVectors(this.coords, this.coords_old);
        this.coords_old.copy(this.coords);
        if (this.coords_old.x === 0 && this.coords_old.y === 0) this.diff.set(0, 0);
        if (this.isAutoActive && !this.takeoverActive) this.diff.multiplyScalar(this.autoIntensity);
      }
    }
    const Mouse = new MouseClass();

    class AutoDriver {
      mouse: MouseClass;
      manager: WebGLManager;
      enabled: boolean;
      speed: number;
      resumeDelay: number;
      rampDurationMs: number;
      active = false;
      current = new THREE.Vector2(0, 0);
      target = new THREE.Vector2();
      lastTime = performance.now();
      activationTime = 0;
      margin = 0.2;
      private _tmpDir = new THREE.Vector2();
      constructor(
        mouse: MouseClass,
        manager: WebGLManager,
        opts: { enabled: boolean; speed: number; resumeDelay: number; rampDuration: number }
      ) {
        this.mouse = mouse;
        this.manager = manager;
        this.enabled = opts.enabled;
        this.speed = opts.speed;
        this.resumeDelay = opts.resumeDelay || 3000;
        this.rampDurationMs = (opts.rampDuration || 0) * 1000;
        this.pickNewTarget();
      }
      pickNewTarget() {
        const r = Math.random;
        this.target.set((r() * 2 - 1) * (1 - this.margin), (r() * 2 - 1) * (1 - this.margin));
      }
      forceStop() {
        this.active = false;
        this.mouse.isAutoActive = false;
      }
      update() {
        if (!this.enabled) return;
        const now = performance.now();
        const idle = now - this.manager.lastUserInteraction;
        if (idle < this.resumeDelay) {
          if (this.active) this.forceStop();
          return;
        }
        if (this.mouse.isHoverInside) {
          if (this.active) this.forceStop();
          return;
        }
        if (!this.active) {
          this.active = true;
          this.current.copy(this.mouse.coords);
          this.lastTime = now;
          this.activationTime = now;
        }
        if (!this.active) return;
        this.mouse.isAutoActive = true;
        let dtSec = (now - this.lastTime) / 1000;
        this.lastTime = now;
        if (dtSec > 0.2) dtSec = 0.016;
        const dir = this._tmpDir.subVectors(this.target, this.current);
        const dist = dir.length();
        if (dist < 0.01) {
          this.pickNewTarget();
          return;
        }
        dir.normalize();
        let ramp = 1;
        if (this.rampDurationMs > 0) {
          const t = Math.min(1, (now - this.activationTime) / this.rampDurationMs);
          ramp = t * t * (3 - 2 * t);
        }
        const step = this.speed * dtSec * ramp;
        const move = Math.min(step, dist);
        this.current.addScaledVector(dir, move);
        this.mouse.setNormalized(this.current.x, this.current.y);
      }
    }

    const face_vert = `
  attribute vec3 position;
  uniform vec2 px;
  uniform vec2 boundarySpace;
  varying vec2 uv;
  precision highp float;
  void main(){
  vec3 pos = position;
  vec2 scale = 1.0 - boundarySpace * 2.0;
  pos.xy = pos.xy * scale;
  uv = vec2(0.5)+(pos.xy)*0.5;
  gl_Position = vec4(pos, 1.0);
}
`;
    const line_vert = `
  attribute vec3 position;
  uniform vec2 px;
  precision highp float;
  varying vec2 uv;
  void main(){
  vec3 pos = position;
  uv = 0.5 + pos.xy * 0.5;
  vec2 n = sign(pos.xy);
  pos.xy = abs(pos.xy) - px * 1.0;
  pos.xy *= n;
  gl_Position = vec4(pos, 1.0);
}
`;
    const mouse_vert = `
    precision highp float;
    attribute vec3 position;
    attribute vec2 uv;
    uniform vec2 center;
    uniform vec2 scale;
    uniform vec2 px;
    varying vec2 vUv;
    void main(){
    vec2 pos = position.xy * scale * 2.0 * px + center;
    vUv = uv;
    gl_Position = vec4(pos, 0.0, 1.0);
}
`;
    const advection_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform float dt;
    uniform bool isBFECC;
    uniform vec2 fboSize;
    uniform vec2 px;
    varying vec2 uv;
    void main(){
    vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
    if(isBFECC == false){
        vec2 vel = texture2D(velocity, uv).xy;
        vec2 uv2 = uv - vel * dt * ratio;
        vec2 newVel = texture2D(velocity, uv2).xy;
        gl_FragColor = vec4(newVel, 0.0, 0.0);
    } else {
        vec2 spot_new = uv;
        vec2 vel_old = texture2D(velocity, uv).xy;
        vec2 spot_old = spot_new - vel_old * dt * ratio;
        vec2 vel_new1 = texture2D(velocity, spot_old).xy;
        vec2 spot_new2 = spot_old + vel_new1 * dt * ratio;
        vec2 error = spot_new2 - spot_new;
        vec2 spot_new3 = spot_new - error / 2.0;
        vec2 vel_2 = texture2D(velocity, spot_new3).xy;
        vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio;
        vec2 newVel2 = texture2D(velocity, spot_old2).xy; 
        gl_FragColor = vec4(newVel2, 0.0, 0.0);
    }
}
`;
    const color_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform sampler2D palette;
    uniform vec4 bgColor;
    varying vec2 uv;
    void main(){
    vec2 vel = texture2D(velocity, uv).xy;
    float lenv = clamp(length(vel), 0.0, 1.0);
    vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb;
    vec3 outRGB = mix(bgColor.rgb, c, lenv);
    float outA = mix(bgColor.a, 1.0, lenv);
    gl_FragColor = vec4(outRGB, outA);
}
`;
    const divergence_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform float dt;
    uniform vec2 px;
    varying vec2 uv;
    void main(){
    float x0 = texture2D(velocity, uv-vec2(px.x, 0.0)).x;
    float x1 = texture2D(velocity, uv+vec2(px.x, 0.0)).x;
    float y0 = texture2D(velocity, uv-vec2(0.0, px.y)).y;
    float y1 = texture2D(velocity, uv+vec2(0.0, px.y)).y;
    float divergence = (x1 - x0 + y1 - y0) / 2.0;
    gl_FragColor = vec4(divergence / dt);
}
`;
    const externalForce_frag = `
    precision highp float;
    uniform vec2 force;
    uniform vec2 center;
    uniform vec2 scale;
    uniform vec2 px;
    varying vec2 vUv;
    void main(){
    vec2 circle = (vUv - 0.5) * 2.0;
    float d = 1.0 - min(length(circle), 1.0);
    d *= d;
    gl_FragColor = vec4(force * d, 0.0, 1.0);
}
`;
    const poisson_frag = `
    precision highp float;
    uniform sampler2D pressure;
    uniform sampler2D divergence;
    uniform vec2 px;
    varying vec2 uv;
    void main(){
    float p0 = texture2D(pressure, uv + vec2(px.x * 2.0, 0.0)).r;
    float p1 = texture2D(pressure, uv - vec2(px.x * 2.0, 0.0)).r;
    float p2 = texture2D(pressure, uv + vec2(0.0, px.y * 2.0)).r;
    float p3 = texture2D(pressure, uv - vec2(0.0, px.y * 2.0)).r;
    float div = texture2D(divergence, uv).r;
    float newP = (p0 + p1 + p2 + p3) / 4.0 - div;
    gl_FragColor = vec4(newP);
}
`;
    const pressure_frag = `
    precision highp float;
    uniform sampler2D pressure;
    uniform sampler2D velocity;
    uniform vec2 px;
    uniform float dt;
    varying vec2 uv;
    void main(){
    float step = 1.0;
    float p0 = texture2D(pressure, uv + vec2(px.x * step, 0.0)).r;
    float p1 = texture2D(pressure, uv - vec2(px.x * step, 0.0)).r;
    float p2 = texture2D(pressure, uv + vec2(0.0, px.y * step)).r;
    float p3 = texture2D(pressure, uv - vec2(0.0, px.y * step)).r;
    vec2 v = texture2D(velocity, uv).xy;
    vec2 gradP = vec2(p0 - p1, p2 - p3) * 0.5;
    v = v - gradP * dt;
    gl_FragColor = vec4(v, 0.0, 1.0);
}
`;
    const viscous_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform sampler2D velocity_new;
    uniform float v;
    uniform vec2 px;
    uniform float dt;
    varying vec2 uv;
    void main(){
    vec2 old = texture2D(velocity, uv).xy;
    vec2 new0 = texture2D(velocity_new, uv + vec2(px.x * 2.0, 0.0)).xy;
    vec2 new1 = texture2D(velocity_new, uv - vec2(px.x * 2.0, 0.0)).xy;
    vec2 new2 = texture2D(velocity_new, uv + vec2(0.0, px.y * 2.0)).xy;
    vec2 new3 = texture2D(velocity_new, uv - vec2(0.0, px.y * 2.0)).xy;
    vec2 newv = 4.0 * old + v * dt * (new0 + new1 + new2 + new3);
    newv /= 4.0 * (1.0 + v * dt);
    gl_FragColor = vec4(newv, 0.0, 0.0);
}
`;

    type Uniforms = Record<string, { value: any }>;

    class ShaderPass {
      props: any;
      uniforms?: Uniforms;
      scene: THREE.Scene | null = null;
      camera: THREE.Camera | null = null;
      material: THREE.RawShaderMaterial | null = null;
      geometry: THREE.BufferGeometry | null = null;
      plane: THREE.Mesh | null = null;
      constructor(props: any) {
        this.props = props || {};
        this.uniforms = this.props.material?.uniforms;
      }
      init(..._args: any[]) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        if (this.uniforms) {
          this.material = new THREE.RawShaderMaterial(this.props.material);
          this.geometry = new THREE.PlaneGeometry(2, 2);
          this.plane = new THREE.Mesh(this.geometry, this.material);
          this.scene.add(this.plane);
        }
      }
      update(..._args: any[]) {
        if (!Common.renderer || !this.scene || !this.camera) return;
        Common.renderer.setRenderTarget(this.props.output || null);
        Common.renderer.render(this.scene, this.camera);
        Common.renderer.setRenderTarget(null);
      }
    }

    class Advection extends ShaderPass {
      line!: THREE.LineSegments;
      constructor(simProps: any) {
        super({
          material: {
            vertexShader: face_vert,
            fragmentShader: advection_frag,
            uniforms: {
              boundarySpace: { value: simProps.cellScale },
              px: { value: simProps.cellScale },
              fboSize: { value: simProps.fboSize },
              velocity: { value: simProps.src.texture },
              dt: { value: simProps.dt },
              isBFECC: { value: true }
            }
          },
          output: simProps.dst
        });
        this.uniforms = this.props.material.uniforms;
        this.init();
      }
      init() {
        super.init();
        this.createBoundary();
      }
      createBoundary() {
        const boundaryG = new THREE.BufferGeometry();
        const vertices_boundary = new Float32Array([
          -1, -1, 0, -1, 1, 0, -1, 1, 0, 1, 1, 0, 1, 1, 0, 1, -1, 0, 1, -1, 0, -1, -1, 0
        ]);
        boundaryG.setAttribute('position', new THREE.BufferAttribute(vertices_boundary, 3));
        const boundaryM = new THREE.RawShaderMaterial({
          vertexShader: line_vert,
          fragmentShader: advection_frag,
          uniforms: this.uniforms!
        });
        this.line = new THREE.LineSegments(boundaryG, boundaryM);
        this.scene!.add(this.line);
      }
      update(...args: any[]) {
        const { dt, isBounce, BFECC } = (args[0] || {}) as { dt?: number; isBounce?: boolean; BFECC?: boolean };
        if (!this.uniforms) return;
        if (typeof dt === 'number') this.uniforms.dt.value = dt;
        if (typeof isBounce === 'boolean') this.line.visible = isBounce;
        if (typeof BFECC === 'boolean') this.uniforms.isBFECC.value = BFECC;
        super.update();
      }
    }

    class ExternalForce extends ShaderPass {
      mouse!: THREE.Mesh;
      constructor(simProps: any) {
        super({ output: simProps.dst });
        this.init(simProps);
      }
      init(simProps: any) {
        super.init();
        const mouseG = new THREE.PlaneGeometry(1, 1);
        const mouseM = new THREE.RawShaderMaterial({
          vertexShader: mouse_vert,
          fragmentShader: externalForce_frag,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          uniforms: {
            px: { value: simProps.cellScale },
            force: { value: new THREE.Vector2(0, 0) },
            center: { value: new THREE.Vector2(0, 0) },
            scale: { value: new THREE.Vector2(simProps.cursor_size, simProps.cursor_size) }
          }
        });
        this.mouse = new THREE.Mesh(mouseG, mouseM);
        this.scene!.add(this.mouse);
      }
      update(...args: any[]) {
        const props = args[0] || {};
        const forceX = (Mouse.diff.x / 2) * (props.mouse_force || 0);
        const forceY = (Mouse.diff.y / 2) * (props.mouse_force || 0);
        const cellScale = props.cellScale || { x: 1, y: 1 };
        const cursorSize = props.cursor_size || 0;
        const cursorSizeX = cursorSize * cellScale.x;
        const cursorSizeY = cursorSize * cellScale.y;
        const centerX = Math.min(
          Math.max(Mouse.coords.x, -1 + cursorSizeX + cellScale.x * 2),
          1 - cursorSizeX - cellScale.x * 2
        );
        const centerY = Math.min(
          Math.max(Mouse.coords.y, -1 + cursorSizeY + cellScale.y * 2),
          1 - cursorSizeY - cellScale.y * 2
        );
        const uniforms = (this.mouse.material as THREE.RawShaderMaterial).uniforms;
        uniforms.force.value.set(forceX, forceY);
        uniforms.center.value.set(centerX, centerY);
        uniforms.scale.value.set(cursorSize, cursorSize);
        super.update();
      }
    }

    class Viscous extends ShaderPass {
      constructor(simProps: any) {
        super({
          material: {
            vertexShader: face_vert,
            fragmentShader: viscous_frag,
            uniforms: {
              boundarySpace: { value: simProps.boundarySpace },
              velocity: { value: simProps.src.texture },
              velocity_new: { value: simProps.dst_.texture },
              v: { value: simProps.viscous },
              px: { value: simProps.cellScale },
              dt: { value: simProps.dt }
            }
          },
          output: simProps.dst,
          output0: simProps.dst_,
          output1: simProps.dst
        });
        this.init();
      }
      update(...args: any[]) {
        const { viscous, iterations, dt } = (args[0] || {}) as { viscous?: number; iterations?: number; dt?: number };
        if (!this.uniforms) return;
        let fbo_in: any, fbo_out: any;
        if (typeof viscous === 'number') this.uniforms.v.value = viscous;
        const iter = iterations ?? 0;
        for (let i = 0; i < iter; i++) {
          if (i % 2 === 0) {
            fbo_in = this.props.output0;
            fbo_out = this.props.output1;
          } else {
            fbo_in = this.props.output1;
            fbo_out = this.props.output0;
          }
          this.uniforms.velocity_new.value = fbo_in.texture;
          this.props.output = fbo_out;
          if (typeof dt === 'number') this.uniforms.dt.value = dt;
          super.update();
        }
        return fbo_out;
      }
    }

    class Divergence extends ShaderPass {
      constructor(simProps: any) {
        super({
          material: {
            vertexShader: face_vert,
            fragmentShader: divergence_frag,
            uniforms: {
              boundarySpace: { value: simProps.boundarySpace },
              velocity: { value: simProps.src.texture },
              px: { value: simProps.cellScale },
              dt: { value: simProps.dt }
            }
          },
          output: simProps.dst
        });
        this.init();
      }
      update(...args: any[]) {
        const { vel } = (args[0] || {}) as { vel?: any };
        if (this.uniforms && vel) {
          this.uniforms.velocity.value = vel.texture;
        }
        super.update();
      }
    }

    class Poisson extends ShaderPass {
      constructor(simProps: any) {
        super({
          material: {
            vertexShader: face_vert,
            fragmentShader: poisson_frag,
            uniforms: {
              boundarySpace: { value: simProps.boundarySpace },
              pressure: { value: simProps.dst_.texture },
              divergence: { value: simProps.src.texture },
              px: { value: simProps.cellScale }
            }
          },
          output: simProps.dst,
          output0: simProps.dst_,
          output1: simProps.dst
        });
        this.init();
      }
      update(...args: any[]) {
        const { iterations } = (args[0] || {}) as { iterations?: number };
        let p_in: any, p_out: any;
        const iter = iterations ?? 0;
        for (let i = 0; i < iter; i++) {
          if (i % 2 === 0) {
            p_in = this.props.output0;
            p_out = this.props.output1;
          } else {
            p_in = this.props.output1;
            p_out = this.props.output0;
          }
          if (this.uniforms) this.uniforms.pressure.value = p_in.texture;
          this.props.output = p_out;
          super.update();
        }
        return p_out;
      }
    }

    class Pressure extends ShaderPass {
      constructor(simProps: any) {
        super({
          material: {
            vertexShader: face_vert,
            fragmentShader: pressure_frag,
            uniforms: {
              boundarySpace: { value: simProps.boundarySpace },
              pressure: { value: simProps.src_p.texture },
              velocity: { value: simProps.src_v.texture },
              px: { value: simProps.cellScale },
              dt: { value: simProps.dt }
            }
          },
          output: simProps.dst
        });
        this.init();
      }
      update(...args: any[]) {
        const { vel, pressure } = (args[0] || {}) as { vel?: any; pressure?: any };
        if (this.uniforms && vel && pressure) {
          this.uniforms.velocity.value = vel.texture;
          this.uniforms.pressure.value = pressure.texture;
        }
        super.update();
      }
    }

    class Simulation {
      options: SimOptions;
      fbos: Record<string, THREE.WebGLRenderTarget | null> = {
        vel_0: null,
        vel_1: null,
        vel_viscous0: null,
        vel_viscous1: null,
        div: null,
        pressure_0: null,
        pressure_1: null
      };
      fboSize = new THREE.Vector2();
      cellScale = new THREE.Vector2();
      boundarySpace = new THREE.Vector2();
      advection!: Advection;
      externalForce!: ExternalForce;
      viscous!: Viscous;
      divergence!: Divergence;
      poisson!: Poisson;
      pressure!: Pressure;
      constructor(options?: Partial<SimOptions>) {
        this.options = {
          iterations_poisson: 32,
          iterations_viscous: 32,
          mouse_force: 20,
          resolution: 0.5,
          cursor_size: 100,
          viscous: 30,
          isBounce: false,
          dt: 0.014,
          isViscous: false,
          BFECC: true,
          ...options
        };
        this.init();
      }
      init() {
        this.calcSize();
        this.createAllFBO();
        this.createShaderPass();
      }
      getFloatType() {
        const isIOS = /(iPad|iPhone|iPod)/i.test(navigator.userAgent);
        return isIOS ? THREE.HalfFloatType : THREE.FloatType;
      }
      createAllFBO() {
        const type = this.getFloatType();
        const opts = {
          type,
          depthBuffer: false,
          stencilBuffer: false,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          wrapS: THREE.ClampToEdgeWrapping,
          wrapT: THREE.ClampToEdgeWrapping
        } as const;
        for (const key in this.fbos) {
          this.fbos[key] = new THREE.WebGLRenderTarget(this.fboSize.x, this.fboSize.y, opts);
        }
      }
      createShaderPass() {
        this.advection = new Advection({
          cellScale: this.cellScale,
          fboSize: this.fboSize,
          dt: this.options.dt,
          src: this.fbos.vel_0,
          dst: this.fbos.vel_1
        });
        this.externalForce = new ExternalForce({
          cellScale: this.cellScale,
          cursor_size: this.options.cursor_size,
          dst: this.fbos.vel_1
        });
        this.viscous = new Viscous({
          cellScale: this.cellScale,
          boundarySpace: this.boundarySpace,
          viscous: this.options.viscous,
          src: this.fbos.vel_1,
          dst: this.fbos.vel_viscous1,
          dst_: this.fbos.vel_viscous0,
          dt: this.options.dt
        });
        this.divergence = new Divergence({
          cellScale: this.cellScale,
          boundarySpace: this.boundarySpace,
          src: this.fbos.vel_viscous0,
          dst: this.fbos.div,
          dt: this.options.dt
        });
        this.poisson = new Poisson({
          cellScale: this.cellScale,
          boundarySpace: this.boundarySpace,
          src: this.fbos.div,
          dst: this.fbos.pressure_1,
          dst_: this.fbos.pressure_0
        });
        this.pressure = new Pressure({
          cellScale: this.cellScale,
          boundarySpace: this.boundarySpace,
          src_p: this.fbos.pressure_0,
          src_v: this.fbos.vel_viscous0,
          dst: this.fbos.vel_0,
          dt: this.options.dt
        });
      }
      calcSize() {
        const width = Math.max(1, Math.round(this.options.resolution * Common.width));
        const height = Math.max(1, Math.round(this.options.resolution * Common.height));
        this.cellScale.set(1 / width, 1 / height);
        this.fboSize.set(width, height);
      }
      resize() {
        this.calcSize();
        for (const key in this.fbos) {
          this.fbos[key]!.setSize(this.fboSize.x, this.fboSize.y);
        }
      }
      update() {
        if (this.options.isBounce) this.boundarySpace.set(0, 0);
        else this.boundarySpace.copy(this.cellScale);
        this.advection.update({ dt: this.options.dt, isBounce: this.options.isBounce, BFECC: this.options.BFECC });
        this.externalForce.update({
          cursor_size: this.options.cursor_size,
          mouse_force: this.options.mouse_force,
          cellScale: this.cellScale
        });
        let vel: any = this.fbos.vel_1;
        if (this.options.isViscous) {
          vel = this.viscous.update({
            viscous: this.options.viscous,
            iterations: this.options.iterations_viscous,
            dt: this.options.dt
          });
        }
        this.divergence.update({ vel });
        const pressure = this.poisson.update({ iterations: this.options.iterations_poisson });
        this.pressure.update({ vel, pressure });
      }
    }

    class Output {
      simulation: Simulation;
      scene: THREE.Scene;
      camera: THREE.Camera;
      output: THREE.Mesh;
      constructor() {
        this.simulation = new Simulation();
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        this.output = new THREE.Mesh(
          new THREE.PlaneGeometry(2, 2),
          new THREE.RawShaderMaterial({
            vertexShader: face_vert,
            fragmentShader: color_frag,
            transparent: true,
            depthWrite: false,
            uniforms: {
              velocity: { value: this.simulation.fbos.vel_0!.texture },
              boundarySpace: { value: new THREE.Vector2() },
              palette: { value: paletteTex },
              bgColor: { value: bgVec4 }
            }
          })
        );
        this.scene.add(this.output);
      }
      resize() {
        this.simulation.resize();
      }
      render() {
        if (!Common.renderer) return;
        Common.renderer.setRenderTarget(null);
        Common.renderer.render(this.scene, this.camera);
      }
      update() {
        this.simulation.update();
        this.render();
      }
    }

    class WebGLManager implements LiquidEtherWebGL {
      props: any;
      output!: Output;
      autoDriver?: AutoDriver;
      lastUserInteraction = performance.now();
      running = false;
      private _loop = this.loop.bind(this);
      private _resize = this.resize.bind(this);
      private _onVisibility?: () => void;
      constructor(props: any) {
        this.props = props;
        Common.init(props.$wrapper);
        Mouse.init(props.$wrapper);
        Mouse.autoIntensity = props.autoIntensity;
        Mouse.takeoverDuration = props.takeoverDuration;
        Mouse.onInteract = () => {
          this.lastUserInteraction = performance.now();
          if (this.autoDriver) this.autoDriver.forceStop();
        };
        this.autoDriver = new AutoDriver(Mouse, this as any, {
          enabled: props.autoDemo,
          speed: props.autoSpeed,
          resumeDelay: props.autoResumeDelay,
          rampDuration: props.autoRampDuration
        });
        this.init();
        window.addEventListener('resize', this._resize);
        this._onVisibility = () => {
          const hidden = document.hidden;
          if (hidden) {
            this.pause();
          } else if (isVisibleRef.current) {
            this.start();
          }
        };
        document.addEventListener('visibilitychange', this._onVisibility);
      }
      init() {
        if (!Common.renderer) return;
        this.props.$wrapper.prepend(Common.renderer.domElement);
        this.output = new Output();
      }
      resize() {
        Common.resize();
        this.output.resize();
      }
      render() {
        if (this.autoDriver) this.autoDriver.update();
        Mouse.update();
        Common.update();
        this.output.update();
      }
      loop() {
        if (!this.running) return;
        this.render();
        rafRef.current = requestAnimationFrame(this._loop);
      }
      start() {
        if (this.running) return;
        this.running = true;
        this._loop();
      }
      pause() {
        this.running = false;
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      }
      dispose() {
        try {
          window.removeEventListener('resize', this._resize);
          if (this._onVisibility) document.removeEventListener('visibilitychange', this._onVisibility);
          Mouse.dispose();
          if (Common.renderer) {
            const canvas = Common.renderer.domElement;
            if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
            Common.renderer.dispose();
          }
        } catch {
          /* noop */
        }
      }
    }

    const container = mountRef.current;
    if (container) {
      container.style.position = container.style.position || 'relative';
      container.style.overflow = container.style.overflow || 'hidden';
    }

    const webgl = new WebGLManager({
      $wrapper: container,
      autoDemo,
      autoSpeed,
      autoIntensity,
      takeoverDuration,
      autoResumeDelay,
      autoRampDuration
    });
    webglRef.current = webgl;

    const applyOptionsFromProps = () => {
      if (!webglRef.current) return;
      const sim = webglRef.current.output?.simulation;
      if (!sim) return;
      const prevRes = sim.options.resolution;
      Object.assign(sim.options, {
        mouse_force: mouseForce,
        cursor_size: cursorSize,
        isViscous,
        viscous,
        iterations_viscous: iterationsViscous,
        iterations_poisson: iterationsPoisson,
        dt,
        BFECC,
        resolution,
        isBounce
      });
      if (resolution !== prevRes) sim.resize();
    };
    applyOptionsFromProps();
    webgl.start();

    const io = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        const isVisible = entry.isIntersecting && entry.intersectionRatio > 0;
        isVisibleRef.current = isVisible;
        if (!webglRef.current) return;
        if (isVisible && !document.hidden) {
          webglRef.current.start();
        } else {
          webglRef.current.pause();
        }
      },
      { threshold: [0, 0.01, 0.1] }
    );
    if (container) io.observe(container);
    intersectionObserverRef.current = io;

    const ro = new ResizeObserver(() => {
      if (!webglRef.current) return;
      if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
      resizeRafRef.current = requestAnimationFrame(() => {
        if (!webglRef.current) return;
        webglRef.current.resize();
      });
    });
    if (container) ro.observe(container);
    resizeObserverRef.current = ro;

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resizeObserverRef.current) {
        try {
          resizeObserverRef.current.disconnect();
        } catch {
          /* noop */
        }
      }
      if (intersectionObserverRef.current) {
        try {
          intersectionObserverRef.current.disconnect();
        } catch {
          /* noop */
        }
      }
      if (webglRef.current) {
        webglRef.current.dispose();
      }
      webglRef.current = null;
    };
  }, [
    BFECC,
    cursorSize,
    dt,
    isBounce,
    isViscous,
    iterationsPoisson,
    iterationsViscous,
    mouseForce,
    resolution,
    viscous,
    colors,
    autoDemo,
    autoSpeed,
    autoIntensity,
    takeoverDuration,
    autoResumeDelay,
    autoRampDuration
  ]);

  useEffect(() => {
    const webgl = webglRef.current;
    if (!webgl) return;
    const sim = webgl.output?.simulation;
    if (!sim) return;
    const prevRes = sim.options.resolution;
    Object.assign(sim.options, {
      mouse_force: mouseForce,
      cursor_size: cursorSize,
      isViscous,
      viscous,
      iterations_viscous: iterationsViscous,
      iterations_poisson: iterationsPoisson,
      dt,
      BFECC,
      resolution,
      isBounce
    });
    if (webgl.autoDriver) {
      webgl.autoDriver.enabled = autoDemo;
      webgl.autoDriver.speed = autoSpeed;
      webgl.autoDriver.resumeDelay = autoResumeDelay;
      webgl.autoDriver.rampDurationMs = autoRampDuration * 1000;
      if (webgl.autoDriver.mouse) {
        webgl.autoDriver.mouse.autoIntensity = autoIntensity;
        webgl.autoDriver.mouse.takeoverDuration = takeoverDuration;
      }
    }
    if (resolution !== prevRes) sim.resize();
  }, [
    mouseForce,
    cursorSize,
    isViscous,
    viscous,
    iterationsViscous,
    iterationsPoisson,
    dt,
    BFECC,
    resolution,
    isBounce,
    autoDemo,
    autoSpeed,
    autoIntensity,
    takeoverDuration,
    autoResumeDelay,
    autoRampDuration
  ]);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full relative overflow-hidden pointer-events-none touch-none ${className || ''}`}
      style={style}
    />
  );
}
// LiquidEther component ends here


export default function Home() {
  const [isDark, setIsDark] = useState(true)
  const [activeSection, setActiveSection] = useState("")
  const sectionsRef = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: "0px 0px -20% 0px" },
    )

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  // Definisci i dati dei progetti qui per renderli accessibili al popup (ora non più in uso)
  const projectsData = [
    {
      title: "Stationary Industrial Scanners, Photocell-Operated, interfaced to MES/ERP with custom Middleware",
      excerpt: "Implementation of fixed Industrial Scanning Systems, activated by photocells for automated data collection. Development of custom middleware to route information in real time to MES/ERP systems, optimizing production line efficiency",
      readTime: "Auto-ID",
      date: "2025",
    },
    {
      title: "RFID label Tags Serializator, Ink-jet Marker combined with RFID Reader and Keyence System Visions",
      excerpt: "Engineered a PLC-controlled RFID and inkjet label serialization system. This project ensures comprehensive traceability for each label and RFID tag, complemented by Keyence vision systems for quality control and data verification.",
      readTime: "Automation - Traceability",
      date: "2025",
    },
    {
      title: "Print and Apply system made by combining an integrated Cobot, mini-PC and an Industrial Thermal Printer",
      excerpt: "Design of an advanced Print and Apply system that uses a Cobot for precise label application. The system includes an integrated mini-PC for software management and a 6-inch thermal printer, ensuring extreme flexibility.",
      readTime: "Print & Apply",
      date: "2024",
    },
    {
      title: "Industrial Android devices Fleets, deployed with MDM and AS400 emulator, configured with SE58 Scan Engine",
      excerpt: "Management and configuration of multiple fleets of industrial Android devices. Each device is equipped with an AS400 emulator and managed via MDM for centralized control, and configured with a powerful SE58 scan engine for lightning-fast barcode reading.",
      readTime: "Auto-ID",
      date: "2023",
    },
  ]

  // Mappa i link di Wikipedia specifici per ogni skill
  const wikipediaLinks = {
    "Auto-ID": "https://en.wikipedia.org/wiki/Automatic_identification_and_data_capture",
    "Print & Apply": "https://en.wikipedia.org/wiki/Label_printer_applicator",
  };

  // Funzione per generare l'URL di Wikipedia
  const getWikipediaUrl = (skill) => {
    // Usa il link specifico se esiste, altrimenti genera quello generico
    if (wikipediaLinks[skill]) {
      return wikipediaLinks[skill];
    }
    const pageName = skill.replace(/ /g, '_').replace(/&/g, 'and');
    return `https://en.wikipedia.org/wiki/${pageName}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Sfondo animato a tutto schermo */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <LiquidEther
          colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="flex flex-col gap-4">
          {["intro", "work", "projects", "connect"].map((section) => (
            <button
              key={section}
              onClick={() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" })}
              className={`w-2 h-8 rounded-full transition-all duration-500 ${
                activeSection === section ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Maps to ${section}`}
            />
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 z-10 relative">
        <header
          id="intro"
          ref={(el) => (sectionsRef.current[0] = el)}
          className="min-h-screen flex items-center opacity-0"
        >
          <div className="grid lg:grid-cols-5 gap-12 sm:gap-16 w-full">
            <div className="lg:col-span-3 space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-2">
                <div className="text-sm text-muted-foreground font-mono tracking-wider">PORTFOLIO / 2025</div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
                  Marco
                  <br />
                  <span className="text-muted-foreground">Gardelli</span>
                </h1>
              </div>

              <div className="space-y-6 max-w-md">
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  Seasoned Senior Technical Specialist focused on solving complex challenges in industrial hardware,
                  bridging the gap between
                  <span className="text-foreground"> technical specs</span> and
                  <span className="text-foreground"> real-world application</span>.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Available for work
                  </div>
                  <div>Italy - Forlì</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-end space-y-6 sm:space-y-8 mt-8 lg:mt-0">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-mono">CURRENTLY</div>
                <div className="space-y-2">
                  <div className="text-foreground">Senior Technical Specialist</div>
                  <div className="text-muted-foreground">@ Pluriservice SPA</div>
                  <div className="text-xs text-muted-foreground">2016 — Present</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-mono">FOCUS</div>
                <div className="flex flex-wrap gap-2">
                  {["Auto-ID", "RFID", "Print & Apply", "Industrial Automation", "Traceability"].map((skill) => (
                    <a
                      key={skill}
                      href={getWikipediaUrl(skill)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-xs border border-border rounded-full hover:border-muted-foreground/50 transition-colors duration-300"
                    >
                      {skill}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section
          id="work"
          ref={(el) => (sectionsRef.current[1] = el)}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl font-light">Selected Work</h2>
              <div className="text-sm text-muted-foreground font-mono">2016 — 2025</div>
            </div>

            <div className="space-y-8 sm:space-y-12">
              {[
                {
                  year: "2022 - Present",
                  role: "Technical Consultant / Specialist",
                  company: "Pluriservice SPA",
                  description:
                    "For projects in Food, Pharma, Automotive or Manufacturing that require item-level Traceability and Labeling.",
                  tech: ["Traceability", "Labeling", "MES/ERP", "Automation", "WMS"],
                },
                {
                  year: "2020 - Present",
                  role: "Systems Integrator / Solutions Architect",
                  company: "Pluriservice SPA",
                  description:
                    "PLC wiring. Coding (Scripting, APIs, Middleware). Enabling real-time communication between shop floor and management software, full-stack traceability from production to shipping.",
                  tech: ["APIs", "PLC", "Middleware", "Scripting"],
                },
                {
                  year: "2018 - Present",
                  role: "Industrial Automation Specialist",
                  company: "Pluriservice SPA",
                  description:
                    "Print & Apply (Zebra, Honeywell, TSC, SATO, Toshiba). RFID + Industrial Scanners (Datalogic). Custom software and integration with MES/ERP/WMA systems.",
                  tech: ["Print & Apply", "RFID", "Industrial Scanners", "Custom Software"],
                },
                {
                  year: "2016 - Present",
                  role: "Technical Specialist",
                  company: "Pluriservice SPA",
                  description:
                    "Started career focusing on Auto-ID solutions, Industrial Hardware Repairs and Failure Analysis for manufacturing environments.",
                  tech: ["Auto-ID", "Industrial Hardware", "Laboratory", "Manufacturing"],
                },
              ].map((job, index) => (
                <div
                  key={index}
                  className="group grid lg:grid-cols-12 gap-4 sm:gap-8 py-6 sm:py-8 border-b border-border/50 hover:border-border transition-colors duration-500"
                >
                  <div className="lg:col-span-2">
                    <div className="text-xl sm:text-2xl font-light text-muted-foreground group-hover:text-foreground transition-colors duration-500">
                      {job.year}
                    </div>
                  </div>

                  <div className="lg:col-span-6 space-y-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-medium">{job.role}</h3>
                      <div className="text-muted-foreground">{job.company}</div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed max-w-lg">{job.description}</p>
                  </div>

                  <div className="lg:col-span-4 flex flex-wrap gap-2 lg:justify-end mt-2 lg:mt-0">
                    {job.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs text-muted-foreground rounded group-hover:border-muted-foreground/50 transition-colors duration-500"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="projects"
          ref={(el) => (sectionsRef.current[2] = el)}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <h2 className="text-3xl sm:text-4xl font-light">Recent Projects</h2>

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
              {projectsData.map((post, index) => (
                <article
                  key={index}
                  className="group p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-medium leading-tight group-hover:text-muted-foreground transition-colors duration-300">
                      {post.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{post.excerpt}</p>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      <span>® </span>
                      <svg
                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="connect" ref={(el) => (sectionsRef.current[3] = el)} className="py-20 sm:py-32 opacity-0">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl font-light">Let's Connect</h2>

              <div className="space-y-6">
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  Always interested in new opportunities, collaborations, and conversations about industrial automation
                  and traceability solutions.
                </p>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="text-sm text-muted-foreground font-mono">CONTACT</div>
              <div className="space-y-4">
                <a
                  href="mailto:gardellimarco3@gmail.com"
                  className="group flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
                >
                  <span className="text-base sm:text-lg">gardellimarco3@gmail.com</span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a
                  href="tel:+393468691548"
                  className="group flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
                >
                  <span className="text-base sm:text-lg">+39 346 869 1548</span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-12 sm:py-16 border-t border-border">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">© 2025 Marco Gardelli. All rights reserved.</div>
              <div className="text-xs text-muted-foreground">Built with v0.dev by Marco Gardelli</div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              <button className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300">
                <svg
                  className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </footer>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
    </div>
  )
}
