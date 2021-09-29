import * as THREE from "three";
import images from "../data/images";
import { lerp } from "../utils";
import fragmentShader from "../shaders/fragment.glsl";
import vertexShader from "../shaders/vertex.glsl";
export default class Canvas {
  constructor() {
    this.container = document.querySelector("main");
    this.links = [...document.querySelectorAll("li")];
    this.textureLoader = new THREE.TextureLoader();

    this.scene = new THREE.Scene();
    this.offset = new THREE.Vector2(0, 0);
    this.sizes = new THREE.Vector2(0, 0);
    this.perspective = 1000;

    this.uniforms = {
      uTexture: { value: new THREE.TextureLoader().load(images.imageOne) },
      uOffset: { value: new THREE.Vector2(0, 0) },
      uAlpha: { value: 1.0 },
    };

    this.mouse = {
      x: 0,
      y: 0,
    };

    this.target = {
      x: 0,
      y: 0,
    };

    this.textures = [];

    this.loadTextures();
    this.addLinkEvents();
    this.addEventListeners(document.querySelector("ul"));
    this.setupCamera();
    this.createMesh();
  }

  // Getter function used to get screen dimensions used for the camera and mesh materials
  get viewport() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let aspectRatio = width / height;
    return {
      width,
      height,
      aspectRatio,
    };
  }

  loadTextures() {
    for (const key in images) {
      const image = images[key];

      this.textureLoader.load(image, (texture) => {
        this.textures.push(texture);
      });
    }
  }

  setFov() {
    this.camera.fov =
      (180 * (2 * Math.atan(this.viewport.height / 2 / this.perspective))) /
      Math.PI;
  }

  setupCamera() {
    const fov =
      (180 * (2 * Math.atan(window.innerHeight / 2 / this.perspective))) /
      Math.PI; // see fov image for a picture breakdown of this fov setting.
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.viewport.aspectRatio,
      1,
      1000
    );
    this.camera.position.set(0, 0, this.perspective); // set the camera position on the z axis.

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.viewport.width, this.viewport.height); // uses the getter viewport function above to set size of canvas / renderer
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Import to ensure image textures do not appear blurred.
    this.container.appendChild(this.renderer.domElement); // append the canvas to the main element
  }

  createMesh() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 30, 30);
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    // Mesh Size
    this.sizes.set(250, 350);
    this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);

    // Mesh Position
    this.mesh.position.set(this.offset.x, this.offset.y, 0);
    this.scene.add(this.mesh);
  }

  // Events
  addLinkEvents() {
    this.links.forEach((link, i) => {
      link.addEventListener("mouseenter", () => {
        this.uniforms.uTexture.value = this.textures[i];
      });

      link.addEventListener("mouseleave", () => {
        this.uniforms.uAlpha.value = lerp(this.uniforms.uAlpha.value, 0.0, 0.1);
      });
    });
  }

  onResize() {
    this.camera.aspect = this.viewport.aspectRatio; // readjust the aspect ratio.
    this.setFov();
    this.camera.updateProjectionMatrix(); // Used to recalulate projectin dimensions.
    this.renderer.setSize(this.viewport.width, this.viewport.height);
  }

  onMouseMove(e) {
    this.target.x = e.clientX;
    this.target.y = e.clientY;
  }

  addEventListeners(element) {
    element.addEventListener("mouseenter", () => {
      this.linkHovered = true;
    });
    element.addEventListener("mouseleave", () => {
      this.linkHovered = false;
    });

    window.addEventListener("mousemove", (e) => {
      this.onMouseMove(e);
    });
  }

  update() {
    this.offset.x = lerp(this.offset.x, this.target.x, 0.1);
    this.offset.y = lerp(this.offset.y, this.target.y, 0.1);

    this.uniforms.uOffset.value.set(
      (this.target.x - this.offset.x) * 0.0009,
      -(this.target.y - this.offset.y) * 0.0009
    );

    this.mesh.position.set(
      this.offset.x - window.innerWidth / 2,
      -this.offset.y + window.innerHeight / 2,
      0
    );

    this.linkHovered
      ? (this.uniforms.uAlpha.value = lerp(
          this.uniforms.uAlpha.value,
          1.0,
          0.1
        ))
      : (this.uniforms.uAlpha.value = lerp(
          this.uniforms.uAlpha.value,
          0.0,
          0.1
        ));

    // for (let i = 0; i < this.links.length; i++) {
    //   if (this.linkHovered) {
    //     this.links[i].style.opacity = 0.2;
    //   } else {
    //     this.links[i].style.opacity = 1;
    //   }
    // }

    this.renderer.render(this.scene, this.camera);
  }
}
