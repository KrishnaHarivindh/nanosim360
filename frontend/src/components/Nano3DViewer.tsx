import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface NanoViewerProps {
  structureType: 'graphene' | 'cnt' | 'nanoparticle' | 'quantum_dot';
  rows?: number;
  cols?: number;
  cntN?: number;
  cntM?: number;
  cntRadius?: number;
  cntLength?: number;
  particleDiameter?: number;
  particleShape?: 'sphere' | 'polyhedron' | 'core_shell';
  showBonds?: boolean;
}

export const Nano3DViewer: React.FC<NanoViewerProps> = ({
  structureType,
  rows = 8,
  cols = 8,
  cntN = 10,
  cntM = 10,
  cntRadius = 1.5,
  cntLength = 10,
  particleDiameter = 4.0,
  particleShape = 'sphere',
  showBonds = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b101b);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x818cf8, 0.8);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Group for object rotation
    const group = new THREE.Group();
    scene.add(group);

    // Reusable Materials
    const carbonMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.3,
      metalness: 0.7,
    });
    const bondMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.5,
      metalness: 0.3,
    });
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.2,
      metalness: 0.9,
    });
    const coreShellMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      metalness: 0.6,
      transparent: true,
      opacity: 0.85,
    });

    // 3. Build Structures
    if (structureType === 'graphene') {
      // Hexagonal Honeycomb Monolayer Lattice
      const a = 1.42; // C-C bond length scale
      const atomGeom = new THREE.SphereGeometry(0.2, 16, 16);
      const points: THREE.Vector3[] = [];

      for (let i = -rows; i <= rows; i++) {
        for (let j = -cols; j <= cols; j++) {
          const x = Math.sqrt(3) * a * (i + j / 2);
          const y = (3 / 2) * a * j;
          points.push(new THREE.Vector3(x, y, 0));
          points.push(new THREE.Vector3(x, y + a, 0));
        }
      }

      // Add instanced/mesh atoms
      points.forEach(pt => {
        const atom = new THREE.Mesh(atomGeom, carbonMaterial);
        atom.position.copy(pt);
        group.add(atom);
      });

      // Add Hexagonal C-C bonds
      if (showBonds) {
        const bondGeom = new THREE.CylinderGeometry(0.04, 0.04, a, 8);
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            const dist = points[i].distanceTo(points[j]);
            if (Math.abs(dist - a) < 0.1) {
              const bond = new THREE.Mesh(bondGeom, bondMaterial);
              const midpoint = new THREE.Vector3().addVectors(points[i], points[j]).multiplyScalar(0.5);
              bond.position.copy(midpoint);
              bond.quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3().subVectors(points[j], points[i]).normalize()
              );
              group.add(bond);
            }
          }
        }
      }
      group.scale.set(0.6, 0.6, 0.6);
    } 
    else if (structureType === 'cnt') {
      // Carbon Nanotube: Chiral Geometry wrapping
      // a = 0.2461 nm, dt = (a / pi) * sqrt(n^2 + nm + m^2)
      // Visual scale: 1 nm = 4.0 Three.js units
      const aGraphene = 0.2461;
      const chNm = aGraphene * Math.sqrt(cntN * cntN + cntN * cntM + cntM * cntM);
      const computedDiameterNm = chNm / Math.PI;
      const r = (computedDiameterNm / 2.0) * 4.0; // Scaled radius
      const l = cntLength * 2.0;
      const circSegments = Math.max(12, cntN + cntM);
      const axialSegments = 24;

      const atomGeom = new THREE.SphereGeometry(0.18, 16, 16);
      const ringPoints: THREE.Vector3[][] = [];

      for (let z = 0; z <= axialSegments; z++) {
        const zPos = (z / axialSegments - 0.5) * l;
        const ring: THREE.Vector3[] = [];
        // Apply helical twist based on chiral indices ratio m / (2n + m)
        const chiralTwist = (z / axialSegments) * (cntM / (2 * cntN + cntM || 1)) * Math.PI * 2;
        const stagger = (z % 2) * (Math.PI / circSegments);

        for (let th = 0; th < circSegments; th++) {
          const angle = (th / circSegments) * Math.PI * 2 + stagger + chiralTwist;
          const x = r * Math.cos(angle);
          const y = r * Math.sin(angle);
          const pt = new THREE.Vector3(x, y, zPos);
          ring.push(pt);

          const atom = new THREE.Mesh(atomGeom, carbonMaterial);
          atom.position.copy(pt);
          group.add(atom);
        }
        ringPoints.push(ring);
      }

      if (showBonds) {
        // Connect circumferential and axial bonds
        for (let z = 0; z <= axialSegments; z++) {
          for (let th = 0; th < circSegments; th++) {
            const nextTh = (th + 1) % circSegments;
            // Circumferential bond
            const p1 = ringPoints[z][th];
            const p2 = ringPoints[z][nextTh];
            const d = p1.distanceTo(p2);
            const bGeom = new THREE.CylinderGeometry(0.04, 0.04, d, 8);
            const b = new THREE.Mesh(bGeom, bondMaterial);
            b.position.copy(new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5));
            b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(p2, p1).normalize());
            group.add(b);

            // Axial bond
            if (z < axialSegments) {
              const pAxial = ringPoints[z + 1][th];
              const dAx = p1.distanceTo(pAxial);
              const bAxGeom = new THREE.CylinderGeometry(0.04, 0.04, dAx, 8);
              const bAx = new THREE.Mesh(bAxGeom, bondMaterial);
              bAx.position.copy(new THREE.Vector3().addVectors(p1, pAxial).multiplyScalar(0.5));
              bAx.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(pAxial, p1).normalize());
              group.add(bAx);
            }
          }
        }
      }
      group.scale.set(0.8, 0.8, 0.8);
    } 
    else if (structureType === 'nanoparticle') {
      // Metallic Nanoparticle / Polyhedron
      const r = particleDiameter / 2.0;
      if (particleShape === 'polyhedron') {
        const polyGeom = new THREE.IcosahedronGeometry(r, 1);
        const poly = new THREE.Mesh(polyGeom, goldMaterial);
        group.add(poly);

        const wireframeGeom = new THREE.WireframeGeometry(polyGeom);
        const line = new THREE.LineSegments(wireframeGeom, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }));
        group.add(line);
      } else {
        const sphereGeom = new THREE.SphereGeometry(r, 32, 32);
        const sphere = new THREE.Mesh(sphereGeom, goldMaterial);
        group.add(sphere);

        // Surrounding hydration/ligand shell ring
        const shellRingGeom = new THREE.TorusGeometry(r * 1.3, 0.04, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
        const ring = new THREE.Mesh(shellRingGeom, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
      }
    } 
    else if (structureType === 'quantum_dot') {
      // CdSe/ZnS Core-Shell Quantum Dot
      const coreR = (particleDiameter / 2.0) * 0.7;
      const shellR = particleDiameter / 2.0;

      // CdSe Core
      const coreGeom = new THREE.SphereGeometry(coreR, 28, 28);
      const core = new THREE.Mesh(coreGeom, coreShellMaterial);
      group.add(core);

      // ZnS Protective Shell
      const shellGeom = new THREE.SphereGeometry(shellR, 28, 28);
      const shellMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });
      const shell = new THREE.Mesh(shellGeom, shellMat);
      group.add(shell);
    }

    // 4. Interactive Mouse Orbit / Rotation Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      group.rotation.y += deltaX * 0.008;
      group.rotation.x += deltaY * 0.008;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      camera.position.z = Math.max(5, Math.min(40, camera.position.z + e.deltaY * 0.02));
      e.preventDefault();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // 5. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        group.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [structureType, rows, cols, cntN, cntM, cntRadius, cntLength, particleDiameter, particleShape, showBonds]);

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950/70 shadow-2xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300 pointer-events-none flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>Three.js Interactive Nanoscale Viewport &bull; Drag to rotate, scroll to zoom</span>
      </div>
    </div>
  );
};
