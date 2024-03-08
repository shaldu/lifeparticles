import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer, EffectPass } from 'postprocessing';
import { RenderPass } from 'postprocessing';
import { BloomEffect } from 'postprocessing';

import Stats from 'three/examples/jsm/libs/stats.module';
import * as seedrandom from 'seedrandom';
import { Helpers } from './helpers';
import LifesourceManager from './lifesourceManager';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import HUD from './hud';
import SpatialGrid from './spatialGrid';
import Rule from './rule';
import { MAX_AMOUNT, MAX_FORCE, MAX_LIFESOURCE, MAX_RADIUS, MAX_RULES, MAX_SIZE, MIN_AMOUNT, MIN_FORCE, MIN_LIFESOURCE, MIN_RADIUS, MIN_RULES, MIN_SIZE } from './config';


export default class Game {
    private camera: THREE.OrthographicCamera;
    public scene: THREE.Scene;
    private composer: EffectComposer;
    private running: boolean = false;
    private renderer: THREE.WebGLRenderer;
    private frustumSize: number = 400;
    public seed: string;
    private controls;
    private clock: THREE.Clock = new THREE.Clock();
    private time: number = 0;
    hud: HUD;
    private stats: Stats;
    // public world: World = new World();
    public LifeSourceManagers: LifesourceManager[] = [];
    public spatialGrid: SpatialGrid;
    rules: Rule[] = [];

    constructor(main: HTMLElement, seed: string) {
        this.seed = seed
        this.scene = new THREE.Scene();
        this.renderer = this.newRenderer();
        this.camera = new THREE.OrthographicCamera((this.frustumSize * this.aspectRatio) / -2, (this.frustumSize * this.aspectRatio) / 2, this.frustumSize / 2, this.frustumSize / -2, -10, 1000);
      
        //ADD POSTPROCESSING
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        const bloomEffect: BloomEffect = new BloomEffect(
            {
                luminanceThreshold: 0.1,
                luminanceSmoothing: 0.1,
                intensity: 2
            }
        );  
        this.composer.addPass(new EffectPass(this.camera, bloomEffect));

        main.appendChild(this.renderer.domElement);

        //ORBITCONTROL
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        //STATS
        this.stats = new Stats();
        this.hud = new HUD(this);
        document.body.appendChild(this.stats.dom)
        
        this.initWorld();
        this.initEventListeners();

        this.spatialGrid = new SpatialGrid(16, new THREE.Box3(new THREE.Vector3(this.camera.left, this.camera.bottom, 0), new THREE.Vector3(this.camera.right, this.camera.top, 0)));
        // this.spatialGrid.drawGrid(this.scene);

        this.running = true;
    }

    get aspectRatio(): number {
        return this.renderer.domElement.width / this.renderer.domElement.height;
    }

    changeSeed(seed: string) {
        //@ts-ignore
        seedrandom(seed, { global: true });
    }

    //FOR ECS
    initWorld() {
        //@ts-ignore
        this.changeSeed(this.seed);
    }

    initEventListeners() {
        //on window resize
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    onWindowResize() {
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    randomize() {
        //get date time as seed
        this.seed = Date.now().toString();
        this.changeSeed(Date.now().toString());        


        //remove all lifesources
        for (let i = 0; i < this.LifeSourceManagers.length; i++) {
            this.deleteLifesourceManager(this.LifeSourceManagers[i]);
        }

        //remove all rules
        this.rules.splice(0, this.rules.length);

        //get random amount of lifesources
        const lifeSourceAmount = Helpers.getRandomInt(MIN_LIFESOURCE, MAX_LIFESOURCE);

        for (let i = 0; i < lifeSourceAmount; i++) {  
            //get random color
            const color = '#' + Math.floor(Math.random()*16777215).toString(16);
            //get random name
            const name = 'lifesource_' + Math.floor(Math.random()*167).toString(16);
            //get random size
            const size = Helpers.getRandomInt(MIN_SIZE, MAX_SIZE);
            //get amount
            const amount = Helpers.getRandomInt(MIN_AMOUNT, MAX_AMOUNT);
            this.createNewLifesourceManager (name, amount, color, size);
        }

        const ruleAmount = Helpers.getRandomInt(MIN_RULES, MAX_RULES);
        for (let i = 0; i < ruleAmount; i++) {
            const source1 = this.LifeSourceManagers[Helpers.getRandomInt(0, this.LifeSourceManagers.length - 1)];
            const source2 = this.LifeSourceManagers[Helpers.getRandomInt(0, this.LifeSourceManagers.length - 1)];
            const radius = Helpers.getRandomInt(MIN_RADIUS, MAX_RADIUS);
            const force = Helpers.getRandomInt(MIN_FORCE, MAX_FORCE);
            this.createNewRule(source1, source2, radius, force);
        }

        this.hud.updateHUDs();
    }

    createNewLifesourceManager(name: string, amount: number, color: string, size: number) {
        const boundingBox = new THREE.Box3(new THREE.Vector3(this.camera.left, this.camera.bottom, 0), new THREE.Vector3(this.camera.right, this.camera.top, 0));

        //check if the name is already taken
        let nameIsTaken = true;
        let nameCopy:string = name;
        let i = 0;
        while (nameIsTaken) {
            nameIsTaken = false;
            for (let i = 0; i < this.LifeSourceManagers.length; i++) {
                if (this.LifeSourceManagers[i].name === nameCopy) {
                    nameIsTaken = true;
                    nameCopy = name + '_' + i;
                }
            }
        }

        const lifesource = new LifesourceManager(nameCopy, amount, size, color, this.scene, boundingBox, this.spatialGrid);
        this.LifeSourceManagers.push(lifesource);
    }


    createNewRule(source1: LifesourceManager | null, source2: LifesourceManager | null, radius: number, force: number) {
        const rule = new Rule(source1, source2, this.spatialGrid, radius, force);
        this.rules.push(rule);
    }

    deleteLifesourceManager(lifesourceManager: LifesourceManager) {
        lifesourceManager.removeAllLifesources();
        this.scene.remove(lifesourceManager.meshLayer);
        this.LifeSourceManagers.splice(this.LifeSourceManagers.indexOf(lifesourceManager), 1);
    }

    newRenderer(): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setAnimationLoop(this.animation.bind(this));
        renderer.setClearColor(0x222222, 1);

        return renderer;
    }

    start() {
        this.running = true;
    }

    pause() {
        this.running = false;
    }

    animation() {
        let deltaTime = this.clock.getDelta();    
        this.composer.render(deltaTime);
        if (this.running === true) {
            this.controls.update();
            this.renderer.render(this.scene, this.camera);

            //run only every 60 fps
            if (this.time > 1 / 60) {
                this.time = 0;
                // this.spatialGrid.update(deltaTime);

                //for every rule
                for (let i = 0; i < this.rules.length; i++) {
                    this.rules[i].update(deltaTime);
                }
                
                // for (let i = 0; i < this.LifeSourceManagers.length; i++) {
                //     this.LifeSourceManagers[i].update();
                // }
            }
            this.time += deltaTime;


            
            
            // this.world.execute(deltaTime, 0);
        }
        this.stats.update()

    }
}