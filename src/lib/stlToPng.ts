/**
 * Turns an uploaded STL into pictures the review endpoint can actually judge.
 *
 * A vision model cannot open a mesh, so the alternative to this was telling
 * people to go and screenshot their own work. The browser already has three.js
 * for the reference viewer, so it renders the upload here instead.
 *
 * Three orthogonal-ish views, because a single angle hides exactly the things
 * the rubrics ask about: whether holes go all the way through, whether a corner
 * has a gusset, how thick a wall is.
 *
 * Returns the views both ways round, and the reason is cost. The reviewer is
 * sent the three views as three separate images, because each pane is 420px and
 * the cheap model's "low detail" mode fits an image into 512x512 -- so a single
 * 1260x420 contact sheet arrives downsampled to a third and the model then
 * cannot tell a finished bracket from a plain block. Measured: as one sheet it
 * scored a correct bracket and a featureless box identically. As three images
 * it separates them, at a fifth of the price of the large model. The composite
 * sheet is what the reader sees on screen, where one picture is friendlier than
 * three.
 *
 * Rendered dark-on-white rather than in the site's white-on-blue. These images
 * are for the model to read, and light backgrounds with dark edges are
 * considerably easier for one to interpret.
 */

const VIEW = 420;
const VIEWS: [number, number, number][] = [
  [1, 0.75, 1], // three-quarter
  [0, 1, 0.001], // top
  [1, 0.05, 0], // side
];
export const VIEW_LABELS = ['THREE-QUARTER', 'TOP', 'SIDE'];

export type StlRender = {
  /** The contact sheet, for showing the reader what they uploaded. */
  blob: Blob;
  url: string;
  /** One image per view, which is what actually gets reviewed. */
  views: Blob[];
  triangles: number;
};

const toBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('could not encode the render'))), 'image/png'),
  );

export async function stlToPng(file: File): Promise<StlRender> {
  const [THREE, { STLLoader }] = await Promise.all([
    import('three'),
    import('three/examples/jsm/loaders/STLLoader.js'),
  ]);

  const geometry = new STLLoader().parse(await file.arrayBuffer());
  geometry.computeVertexNormals();
  geometry.center();

  const triangles = (geometry.getAttribute('position')?.count ?? 0) / 3;

  const sheet = document.createElement('canvas');
  sheet.width = VIEW * VIEWS.length;
  sheet.height = VIEW;
  const sheetCtx = sheet.getContext('2d');
  if (!sheetCtx) throw new Error('no 2d context');

  sheetCtx.fillStyle = '#ffffff';
  sheetCtx.fillRect(0, 0, sheet.width, sheet.height);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(VIEW, VIEW, false);
  renderer.setClearColor(0xffffff, 1);

  const scene = new THREE.Scene();
  const part = new THREE.Group();

  part.add(
    new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ color: 0xb8bfc8, flatShading: true }),
    ),
  );
  part.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 18),
      new THREE.LineBasicMaterial({ color: 0x111418 }),
    ),
  );
  part.rotation.x = -Math.PI / 2;
  scene.add(part);

  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(1, 1.4, 1);
  scene.add(key);

  const sphere = new THREE.Box3().setFromObject(part).getBoundingSphere(new THREE.Sphere());
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 5000);
  const fit = (sphere.radius / Math.sin((camera.fov * Math.PI) / 360)) * 0.92;

  const views: Blob[] = [];

  for (let i = 0; i < VIEWS.length; i++) {
    camera.position.copy(new THREE.Vector3(...VIEWS[i]).normalize().multiplyScalar(fit));
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);

    // Each view as its own image, labelled in the corner so the model can tell
    // which is which even without the accompanying text.
    const pane = document.createElement('canvas');
    pane.width = VIEW;
    pane.height = VIEW;
    const paneCtx = pane.getContext('2d');
    if (!paneCtx) throw new Error('no 2d context');
    paneCtx.fillStyle = '#ffffff';
    paneCtx.fillRect(0, 0, VIEW, VIEW);
    paneCtx.drawImage(renderer.domElement, 0, 0);
    paneCtx.font = '600 15px monospace';
    paneCtx.fillStyle = '#111418';
    paneCtx.fillText(VIEW_LABELS[i], 14, VIEW - 14);
    views.push(await toBlob(pane));

    sheetCtx.drawImage(pane, i * VIEW, 0);
  }

  // Dividers on the composite, so the reader sees three views not one shape.
  sheetCtx.strokeStyle = '#111418';
  sheetCtx.lineWidth = 1;
  for (let i = 1; i < VIEWS.length; i++) {
    sheetCtx.beginPath();
    sheetCtx.moveTo(i * VIEW, 0);
    sheetCtx.lineTo(i * VIEW, VIEW);
    sheetCtx.stroke();
  }

  geometry.dispose();
  renderer.dispose();

  const blob = await toBlob(sheet);
  return { blob, url: URL.createObjectURL(blob), views, triangles };
}
