
import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import type Game from './game';
import type LifesourceManager from './lifesourceManager';
import { Helpers } from './helpers';
import { MAX_AMOUNT, MAX_FORCE, MAX_RADIUS, MAX_SIZE, MIN_AMOUNT, MIN_FORCE, MIN_RADIUS, MIN_SIZE } from './config';

export default class HUD {

    gui: GUI;
    game: Game

    //FOLDERS
    generalFolder: any;
    createLifesourceFolder: any;
    manageLifesourceFolder: any;
    createRuleFolder: any;

    constructor(game: Game) {
        this.gui = new GUI();
        this.game = game;

        this.initHUDs();
    }

    initHUDs() {
        this.create_Seed_GUI();
        this.create_NewLifesourceManager_GUI();
    }

    updateHUDs() {
        //remove general folder
        if (this.generalFolder != null) this.generalFolder.destroy();
        this.create_Seed_GUI();

        //remove createLifesource folder
        if (this.createLifesourceFolder != null) this.createLifesourceFolder.destroy();
        this.create_NewLifesourceManager_GUI();

        //remove manageLifesource folder
        if (this.manageLifesourceFolder != null) this.manageLifesourceFolder.destroy();
        this.create_ManageLifesourceManager_GUI();

        //remove createRule folder
        if (this.createRuleFolder != null) this.createRuleFolder.destroy();
        this.create_NewRule_GUI();
    }

    //create a seed input field
    create_Seed_GUI() {
        //Inputfield: seed
        //on change: update seed
        //folder general
        this.generalFolder = this.gui.addFolder('General');
        const obj = { seed: this.game.seed };
        this.generalFolder.add(obj, 'seed').name('Seed').onChange((seed: string) => {
            this.game.seed = seed;
            this.game.changeSeed(seed);
        });

        this.generalFolder.add({
            randomize: () => {
                this.game.randomize();
            }
        }, 'randomize').name('Randomize all');
    }

    //create GUI to create a new LifesourceManager
    create_NewLifesourceManager_GUI() {
        //Inputfields: name, amount (0 - 1000), color
        //Button: create

        const obj = { name: 'yellow', amount: 100, speed: 1, color: '#ffff00', size: 1 };

        this.createLifesourceFolder = this.gui.addFolder('Create Lifesources');
        this.createLifesourceFolder.add(obj, 'name').name('Name');
        this.createLifesourceFolder.add(obj, 'amount', MIN_AMOUNT, MAX_AMOUNT, 1).name('Amount');
        this.createLifesourceFolder.add(obj, 'size', MIN_SIZE, MAX_SIZE).name('Size');
        this.createLifesourceFolder.addColor(obj, 'color').name('Color');
        this.createLifesourceFolder.add({
            create: () => {

                this.game.createNewLifesourceManager(obj.name, obj.amount, obj.color, obj.size);
                this.create_ManageLifesourceManager_GUI();
                this.create_NewRule_GUI();
            }
        }, 'create').name('Create');


    }

    //create GUI to manage a LifesourceManager
    create_ManageLifesourceManager_GUI() {
        //create a selectbox with all the lifesources from game.LifeSourceManagers
        //create a button to delete the selected lifesource

        if (this.manageLifesourceFolder != null) this.manageLifesourceFolder.destroy();
        this.manageLifesourceFolder = this.gui.addFolder('Manage Lifesources');
        // Assuming this.game.LifeSourceManagers is an array of objects
        const objectNames = this.game.LifeSourceManagers.map(lsm => lsm.name);
        let selectedObject: LifesourceManager | null = null;

        let amountController: any = null;
        let sizeController: any = null;
        let colorController: any = null;
   

        let deleteButtonController: any = null;


        const controls = {
            selectedObject: null
        };

        // Create a dropdown menu for object selection
        const objectSelection = this.manageLifesourceFolder.add(controls, 'selectedObject', objectNames)
            .name('Select Object');

        objectSelection.onChange((name: string) => {
            // Find the object by name
            selectedObject = this.game.LifeSourceManagers.find(lsm => lsm.name === name) as LifesourceManager;


            //destroy amount controllers
            if (amountController != null) amountController.destroy();
            amountController = this.manageLifesourceFolder.add({amount: selectedObject.amount}, 'amount').name('Amount');
            amountController.domElement.style.pointerEvents = 'none';

            
            //destroy size controllers
            if (sizeController != null) sizeController.destroy();
            sizeController = this.manageLifesourceFolder.add({size: selectedObject.lifeSourceDimensions.x}, 'size').name('Size');
            sizeController.domElement.style.pointerEvents = 'none';


            //destroy color controllers
            if (colorController != null) colorController.destroy();

            colorController = this.manageLifesourceFolder.addColor({ color: selectedObject.color }, 'color').name('Color');
            colorController.onChange((color: string) => {
                selectedObject?.changeColorOfAllLifesources(color);
            });


            //delete button
            if (deleteButtonController != null) deleteButtonController.destroy();
            deleteButtonController = this.manageLifesourceFolder.add({
                delete: () => {
                    if (selectedObject != null) {
                        this.game.deleteLifesourceManager(selectedObject);
                        this.create_ManageLifesourceManager_GUI();
                    }
                }
            }, 'delete').name('Delete');

        });

        //call objectSelection on the first object
        objectSelection.setValue(objectNames[0]);
    }

    create_NewRule_GUI() {
        const obj = { lifesourceManager1: null, lifesourceManager2: null, radius: 40, force: 1 };

        if (this.createRuleFolder != null) this.createRuleFolder.destroy();
        this.createRuleFolder = this.gui.addFolder('Create Rule');

        this.createRuleFolder.add(obj, 'lifesourceManager1', this.game.LifeSourceManagers.map(lsm => lsm.name)).name('LifesourceManager 1');
        this.createRuleFolder.add(obj, 'lifesourceManager2', this.game.LifeSourceManagers.map(lsm => lsm.name)).name('LifesourceManager 2');
        this.createRuleFolder.add(obj, 'radius', MIN_RADIUS, MAX_RADIUS, 1).name('Radius');
        this.createRuleFolder.add(obj, 'force', MIN_FORCE, MAX_FORCE).name('Force');
        this.createRuleFolder.add({
            create: () => {
                if (obj.lifesourceManager1 == null || obj.lifesourceManager2 == null) return;
                //get the lifesourceManager objects from the names
                const lifesourceManager1 = this.game.LifeSourceManagers.find(lsm => lsm.name === obj.lifesourceManager1) as LifesourceManager;
                const lifesourceManager2 = this.game.LifeSourceManagers.find(lsm => lsm.name === obj.lifesourceManager2) as LifesourceManager;

                this.game.createNewRule(lifesourceManager1, lifesourceManager2, obj.radius, obj.force);
            }
        }, 'create').name('Create Rule');

    }
}