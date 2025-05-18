import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RenderPixelatedPass } from './render-pixelated-pass';
import { PixelatePass } from './pixelate-pass';
import { stopGoEased } from './math';

interface ThreeSceneOptions {
  pixelation: number;
  bloom: number;
}

export function initThreeScene(container: HTMLElement, options: ThreeSceneOptions) {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x151729);

  // Get container dimensions
  const width = container.clientWidth;
  const height = container.clientHeight;
  const aspectRatio = width / height;

  // Camera
  const camera = new THREE.OrthographicCamera(-aspectRatio, aspectRatio, 1, -1, 0.1, 10);
  camera.position.z = 2;
  camera.position.y = 2 * Math.tan(Math.PI / 6);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Handle resize
  const handleResize = () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    const newAspectRatio = newWidth / newHeight;

    camera.left = -newAspectRatio;
    camera.right = newAspectRatio;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
    composer.setSize(newWidth, newHeight);
  };

  window.addEventListener('resize', handleResize);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  // Pixelation setup
  const screenResolution = new THREE.Vector2(width, height);
  const renderResolution = screenResolution.clone().divideScalar(options.pixelation);
  renderResolution.x |= 0;
  renderResolution.y |= 0;

  // Post-processing
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPixelatedPass(renderResolution, scene, camera));

  const bloomPass = new UnrealBloomPass(screenResolution, options.bloom, 0.1, 0.9);
  composer.addPass(bloomPass);
  composer.addPass(new PixelatePass(renderResolution));

  // Texture loader
  const texLoader = new THREE.TextureLoader();

  // Load textures
  const loadTexture = (url: string) => {
    const texture = texLoader.load(url);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  const tex_checker = loadTexture(
    'https://threejsfundamentals.org/threejs/resources/images/checker.png'
  );
  const tex_checker2 = loadTexture(
    'https://threejsfundamentals.org/threejs/resources/images/checker.png'
  );
  tex_checker.repeat.set(3, 3);
  tex_checker2.repeat.set(1.5, 1.5);

  // Create objects
  // Box
  const boxMaterial = new THREE.MeshPhongMaterial({ map: tex_checker2 });

  function addBox(boxSideLength: number, x: number, z: number, rotation: number) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(boxSideLength, boxSideLength, boxSideLength),
      boxMaterial
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.rotation.y = rotation;
    mesh.position.y = boxSideLength / 2;
    mesh.position.set(x, boxSideLength / 2 + 0.0001, z);
    scene.add(mesh);
    return mesh;
  }

  addBox(0.4, 0, 0, Math.PI / 4);
  addBox(0.2, -0.4, -0.15, Math.PI / 4);

  // Floor
  const planeSideLength = 2;
  const planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(planeSideLength, planeSideLength),
    new THREE.MeshPhongMaterial({
      map: tex_checker,
    })
  );
  planeMesh.receiveShadow = true;
  planeMesh.rotation.x = -Math.PI / 2;
  scene.add(planeMesh);

  // Crystal
  const radius = 0.2;
  const geometry = new THREE.IcosahedronGeometry(radius);
  const crystalMesh = new THREE.Mesh(
    geometry,
    new THREE.MeshPhongMaterial({
      color: 0x2379cf,
      emissive: 0x143542,
      shininess: 100,
      specular: 0xffffff,
    })
  );
  crystalMesh.receiveShadow = true;
  crystalMesh.castShadow = true;
  scene.add(crystalMesh);

  // Lights
  scene.add(new THREE.AmbientLight(0x2d3645, 1.5));

  const directionalLight = new THREE.DirectionalLight(0xfffc9c, 0.5);
  directionalLight.position.set(100, 100, 100);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(2048, 2048);
  scene.add(directionalLight);

  const spotLight = new THREE.SpotLight(0xff8800, 1, 10, Math.PI / 16, 0.02, 2);
  spotLight.position.set(2, 2, 0);
  const target = spotLight.target;
  scene.add(target);
  target.position.set(0, 0, 0);
  spotLight.castShadow = true;
  scene.add(spotLight);

  // Add a point light at a 45-degree angle from the back
  const pointLight = new THREE.PointLight(0x4d7cff, 2, 3);
  // Position the light behind and above the cube (45-degree angle)
  pointLight.position.set(0, 0.8, 0.8); // x, y, z - this creates roughly a 45-degree angle from the back
  scene.add(pointLight);

  // Add a small sphere to visualize the point light position
  const pointLightHelper = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x4d7cff })
  );
  pointLightHelper.position.copy(pointLight.position);
  scene.add(pointLightHelper);

  // Animation loop
  let animationFrameId: number;

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    const t = performance.now() / 1000;

    const mat = crystalMesh.material as THREE.MeshPhongMaterial;
    mat.emissiveIntensity = Math.sin(t * 3) * 0.5 + 0.5;
    crystalMesh.position.y = 0.7 + Math.sin(t * 2) * 0.05;
    crystalMesh.rotation.y = stopGoEased(t, 2, 4) * 2 * Math.PI;

    composer.render();
  };

  animate();

  // Cleanup function
  const cleanup = () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', handleResize);
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };

  return { cleanup };
}
