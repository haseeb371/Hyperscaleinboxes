import { useEffect, useRef, useMemo } from 'react';
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  Vector3,
  Clock
} from 'three';

// Type for shader uniforms
interface ShaderUniforms {
  iTime: { value: number };
  iResolution: { value: Vector3 };
  animationSpeed: { value: number };
  lineCount: { value: number };
  lineDistance: { value: number };
  wavePosition: { value: Vector3 };
  lineGradient: { value: Vector3[] };
  lineGradientCount: { value: number };
}

const vertexShader = `
precision mediump float;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;

uniform int lineCount;
uniform float lineDistance;
uniform vec3 wavePosition;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

const vec3 BLACK = vec3(0.0);
const vec3 PINK  = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE  = vec3(47.0,  75.0, 162.0) / 255.0;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 background_color(vec2 uv) {
  vec3 col = vec3(0.0);
  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;
  col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return col * 0.5;
}

vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) {
    return baseColor;
  }

  if (lineGradientCount == 1) {
    return lineGradient[0] * 0.5;
  }

  float clampedT = clamp(t, 0.0, 0.9999);
  float scaled = clampedT * float(lineGradientCount - 1);
  int idx = int(floor(scaled));
  float f = fract(scaled);
  int idx2 = min(idx + 1, lineGradientCount - 1);

  return mix(lineGradient[idx], lineGradient[idx2], f) * 0.5;
}

float wave(vec2 uv, float offset) {
  float time = iTime * animationSpeed;
  float x_offset   = offset;
  float x_movement = time * 0.1;
  float amp        = sin(offset + time * 0.2) * 0.3;
  float y          = sin(uv.x + x_offset + x_movement) * amp;
  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;

  vec3 col = vec3(0.0);
  vec3 b = lineGradientCount > 0 ? vec3(0.0) : background_color(baseUv);
  
  float angle = wavePosition.z * log(length(baseUv) + 1.0);
  vec2 ruv = baseUv * rotate(angle);

  for (int i = 0; i < lineCount; ++i) {
    float fi = float(i);
    float t = fi / max(float(lineCount - 1), 1.0);
    vec3 lineCol = getLineColor(t, b);
    
    col += lineCol * wave(
      ruv + vec2(lineDistance * fi + wavePosition.x, wavePosition.y),
      2.0 + 0.15 * fi
    );
  }

  fragColor = vec4(col, 1.0);
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

const MAX_GRADIENT_STOPS = 8;

type WavePosition = {
  x: number;
  y: number;
  rotate: number;
};

type FloatingLinesProps = {
  linesGradient?: string[];
  lineCount?: number;
  lineDistance?: number;
  wavePosition?: WavePosition;
  animationSpeed?: number;
  mixBlendMode?: React.CSSProperties['mixBlendMode'];
};

function hexToVec3(hex: string): Vector3 {
  let value = hex.trim();

  if (value.startsWith('#')) {
    value = value.slice(1);
  }

  let r = 255;
  let g = 255;
  let b = 255;

  if (value.length === 3) {
    r = parseInt(value[0] + value[0], 16);
    g = parseInt(value[1] + value[1], 16);
    b = parseInt(value[2] + value[2], 16);
  } else if (value.length === 6) {
    r = parseInt(value.slice(0, 2), 16);
    g = parseInt(value.slice(2, 4), 16);
    b = parseInt(value.slice(4, 6), 16);
  }

  return new Vector3(r / 255, g / 255, b / 255);
}

export default function FloatingLines({
  linesGradient,
  lineCount = 6,
  lineDistance = 5,
  wavePosition = { x: 5.0, y: 0.0, rotate: 0.2 },
  animationSpeed = 1,
  mixBlendMode = 'screen'
}: FloatingLinesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const uniformsRef = useRef<ShaderUniforms | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  // Memoize gradient computation
  const gradientVectors = useMemo(() => {
    if (!linesGradient || linesGradient.length === 0) {
      return { vectors: [], count: 0 };
    }

    const stops = linesGradient.slice(0, MAX_GRADIENT_STOPS);
    const vectors = stops.map(hex => hexToVec3(hex));
    
    return { vectors, count: stops.length };
  }, [linesGradient]);

  // Scene creation - only runs once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const renderer = new WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    containerRef.current.appendChild(renderer.domElement);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new Vector3(1, 1, 1) },
      animationSpeed: { value: animationSpeed },

      lineCount: { value: lineCount },
      lineDistance: { value: lineDistance * 0.01 },

      wavePosition: {
        value: new Vector3(
          wavePosition.x,
          wavePosition.y,
          wavePosition.rotate
        )
      },

      lineGradient: {
        value: Array.from({ length: MAX_GRADIENT_STOPS }, () => new Vector3(1, 1, 1))
      },
      lineGradientCount: { value: gradientVectors.count }
    };

    // Set gradient colors
    gradientVectors.vectors.forEach((vec, i) => {
      uniforms.lineGradient.value[i].copy(vec);
    });

    uniformsRef.current = uniforms;

    const material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    });

    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const clock = new Clock();

    const setSize = () => {
      const el = containerRef.current!;
      const width = el.clientWidth || 1;
      const height = el.clientHeight || 1;

      renderer.setSize(width, height, false);

      const canvasWidth = renderer.domElement.width;
      const canvasHeight = renderer.domElement.height;
      uniforms.iResolution.value.set(canvasWidth, canvasHeight, 1);
    };

    setSize();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(setSize) : null;
    if (ro && containerRef.current) {
      ro.observe(containerRef.current);
    }

    // Intersection observer for lazy rendering
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && containerRef.current) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisibleRef.current = entry.isIntersecting;
          });
        },
        { threshold: 0 }
      );
      io.observe(containerRef.current);
    }

    let raf = 0;
    const renderLoop = () => {
      // Only render if visible
      if (isVisibleRef.current) {
        uniforms.iTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
      }
      
      raf = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
      cancelAnimationFrame(raf);
      
      if (ro) {
        ro.disconnect();
      }
      
      if (io) {
        io.disconnect();
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      uniformsRef.current = null;
    };
  }, []); // Only mount/unmount

  // Update uniforms when props change
  useEffect(() => {
    if (!uniformsRef.current) return;

    const uniforms = uniformsRef.current;

    uniforms.animationSpeed.value = animationSpeed;
    uniforms.lineCount.value = lineCount;
    uniforms.lineDistance.value = lineDistance * 0.01;

    uniforms.wavePosition.value.set(
      wavePosition.x,
      wavePosition.y,
      wavePosition.rotate
    );

    // Update gradient
    uniforms.lineGradientCount.value = gradientVectors.count;
    gradientVectors.vectors.forEach((vec, i) => {
      uniforms.lineGradient.value[i].copy(vec);
    });
  }, [
    animationSpeed,
    lineCount,
    lineDistance,
    wavePosition,
    gradientVectors
  ]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden floating-lines-container"
      style={{
        mixBlendMode: mixBlendMode
      }}
    />
  );
}