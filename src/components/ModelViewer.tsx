import { useEffect, useRef, useState } from 'react';
import { alpha, blueprint, font, label } from '../design/tokens';
import { useReducedMotion } from '../hooks/useMediaQuery';

/**
 * A rotatable reference model, drawn as white line work on the blueprint field
 * so it reads as part of the drawing rather than a 3D preview bolted on.
 *
 * three.js is pulled in with a dynamic import, so none of it reaches the main
 * bundle. It only downloads when somebody actually opens a reference, which
 * for most visitors is never.
 */

type Props = { src: string; caption: string };

export default function ModelViewer({ src, caption }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const reduced = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const [THREE, { STLLoader }, { OrbitControls }] = await Promise.all([
          import('three'),
          import('three/examples/jsm/loaders/STLLoader.js'),
          import('three/examples/jsm/controls/OrbitControls.js'),
        ]);
        if (disposed) return;

        const width = host.clientWidth || 400;
        const height = host.clientHeight || 260;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 5000);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        host.appendChild(renderer.domElement);

        const geometry = await new STLLoader().loadAsync(src);
        if (disposed) {
          renderer.dispose();
          return;
        }

        geometry.computeVertexNormals();
        geometry.center();

        /*
         * Two passes: a translucent solid so the form reads, and crisp white
         * edges over it. Edges alone look like a wireframe puzzle; the solid
         * alone loses the drafted look the rest of the site has.
         */
        const solid = new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.14,
          }),
        );

        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry, 18),
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 }),
        );

        const part = new THREE.Group();
        part.add(solid, edges);
        // Z-up in CAD, Y-up in three.
        part.rotation.x = -Math.PI / 2;
        scene.add(part);

        /*
         * Framed from the model's own size rather than a guessed distance.
         *
         * Pulled in to 0.8 of the exact fit: that distance fits the bounding
         * SPHERE, and for a flat part like the nameplate the sphere is far
         * bigger than anything visible, which left the model looking lost in
         * the frame.
         */
        const sphere = new THREE.Box3()
          .setFromObject(part)
          .getBoundingSphere(new THREE.Sphere());
        const fit = (sphere.radius / Math.sin((camera.fov * Math.PI) / 360)) * 0.8;
        camera.position.copy(
          new THREE.Vector3(0.62, 0.52, 0.72).normalize().multiplyScalar(fit),
        );
        camera.lookAt(0, 0, 0);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.minDistance = sphere.radius * 0.9;
        controls.maxDistance = fit * 2.6;
        controls.autoRotate = !reduced;
        controls.autoRotateSpeed = 1.1;

        setStatus('ready');

        let frame = 0;
        const tick = () => {
          frame = requestAnimationFrame(tick);
          controls.update();
          renderer.render(scene, camera);
        };
        tick();

        const onResize = () => {
          const w = host.clientWidth || width;
          const h = host.clientHeight || height;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        const observer = new ResizeObserver(onResize);
        observer.observe(host);

        cleanup = () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          controls.dispose();
          geometry.dispose();
          solid.material.dispose();
          edges.geometry.dispose();
          (edges.material as { dispose(): void }).dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        if (!disposed) setStatus('failed');
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [src, reduced]);

  return (
    <figure style={{ margin: 0 }}>
      <div
        style={{
          position: 'relative',
          border: `1px solid ${alpha.line55}`,
          background: alpha.line08,
          padding: 8,
        }}
      >
        <div
          ref={hostRef}
          style={{ width: '100%', height: 260, cursor: status === 'ready' ? 'grab' : 'default' }}
        />

        {status !== 'ready' && (
          <span
            style={{
              ...label,
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: alpha.line55,
              pointerEvents: 'none',
            }}
          >
            {status === 'loading' ? 'Loading model…' : 'Model could not be loaded'}
          </span>
        )}
      </div>

      <figcaption
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 16,
          marginTop: 8,
          ...label,
          fontSize: 10,
          color: alpha.line55,
        }}
      >
        <span style={{ minWidth: 0 }}>{caption}</span>
        <span
          style={{ fontFamily: font.mono, color: blueprint.line, flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          DRAG TO ROTATE
        </span>
      </figcaption>
    </figure>
  );
}
