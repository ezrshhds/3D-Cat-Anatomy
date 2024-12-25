import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126.1/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.1/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x3a3a3a);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth * (2 / 3) / (window.innerHeight - 120), 0.1, 1000);
camera.position.set(0, 2, 5);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('.webgl') });
renderer.setSize(window.innerWidth * (2 / 3), window.innerHeight - 120); // 2/3 width
renderer.setPixelRatio(window.devicePixelRatio);

//Lighting
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
directionalLight.position.set(8, 10, 8);
scene.add(directionalLight);

const directionalLightBelow = new THREE.DirectionalLight(0xffffff, 0.5); // Color and intensity
directionalLightBelow.position.set(0, -8, 0); // Position below the model
scene.add(directionalLightBelow);

// Raycasting setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Model loader
const loader = new GLTFLoader();

// track loaded models
let models = {
    atlas: null,
    femur: null,
    axis: null,
    calcaneum: null,
    carpus: null,
    cervicalvertebrae: null,
    caudalvertebrae: null,
    fibula: null,
    humerus: null,
    lumbarvertebrae: null,
    mandible: null,
    metacarpus: null,
    metatarsus: null,
    patella: null,
    pelvis: null,
    phalanges: null,
    radius: null,
    rib: null,
    sacrum: null,
    scapula: null,
    skull: null,
    tarsus: null,
    thoracicvertebrae: null,
    tibia: null,
    ulna: null,
    nonames: null,
};

function loadModel(name, path) {
    let description = ""; // default

    //custom descriptions for specific objects
    switch(name) {
        case 'Skull':
            description = "The skull is attached to the spinal column at the atlas. The skull actually consists of many bones all fused into one functional unit.";
            break;
        case 'Mandible':
            description = "The cat mandible is small and has some peculiarities relative to the dentition (only three incisors, a prominent canine, two premolars and one molar); a conical and horizontally oriented condyle, and a protudent angular process in its ventrocaudal part.";
            break;
        case 'Atlas':
            description = "The first cervical vertebra (Atlas; C1) differs considerably from other cervical vertebrae to allow free movement of the head: The atlas posses no body and is composed by two lateral masses joined by dorsal and ventral arches, constituting a bony ring for the beginning of the vertebral canal.";
            break;
        case 'Axis':
            description = "The second cervical vertebra (Axis; C2) is the pivot for rotation of head and atlas (C1), so it differs from other cervical vertebrae by:\n - A cylindrical body with a well marked ventral crest \n - The dens at the cranial extremity of the body.";
            break;
        case 'Canine':
            description = "Canine is a term that refers to fang-like teeth. Cats use their four large canine teeth to puncture, rip, and tear apart food or prey.";
            break;
        case 'Cervical Vertebrae':
            description = "In vertebrates, cervical vertebrae are the vertebrae of the neck, immediately below the skull. All mammals have 7 cervical vertebrae (C1 to C7).\nThe first (atlas) and second (axis) cervical vertebrae differ considerably from others to allow free movement of the head.";
            break;
        case 'Scapula':
            description = "The scapula, commonly known as the shoulder blade, is a flat, triangular bone that connects the humerus (upper arm bone) with the clavicle (collarbone) and forms the back part of the shoulder girdle. It serves as a critical site for muscle attachment, allowing for a wide range of shoulder and arm movements. The scapula provides stability and support to the shoulder joint while also facilitating flexibility, making it essential for locomotion and upper limb function. Its structure, including the spine, acromion, and glenoid cavity, helps anchor various muscles, such as the deltoid, trapezius, and rotator cuff muscles, which contribute to arm rotation, lifting, and extension. Additionally, the scapula plays a role in protecting vital structures like nerves and blood vessels that pass through the shoulder region.";
            break;
        case 'Humerus':
            description = "The humerus is the only bone of the skeleton of the arm (thoracic stylopodium). \n\nIt is composed by three basic segments:\n - The proximal extremity, articulating with the scapula and bearing the head and the major and lesser tubercles\n- The body (shaft) bearing the deltoid tuberosity\n- The distal extremity bearing the humeral condyle and articulating with the radius and ulna";
            break;
        case 'Radius':
            description = "The radius is the main load-bearing bone of the lower forelimb. Its structure is similar in most terrestrial tetrapods, but it may be fused with the ulna in some mammals and reduced or modified in animals with flippers or vestigial forelimbs.";
            break;
        case 'Ulna':
            description = "The ulna is the caudolateral bone of forearm, divide into three segments:\n - Proximal extremity with the olecranon\n - Body (shaft) of ulna\n - Distal extremity with the head of ulna.";
            break;
        case 'Carpus':
            description = "The carpus, or wrist, of a feline (cat) is a complex structure made up of several small bones that connect the forelimb to the metacarpus (the part of the paw above the digits). It plays a crucial role in supporting the cat's front limbs during movement and provides flexibility for activities such as walking, climbing, and pouncing.";
            break;
        case 'Metacarpus':
            description = "the metacarpal bones or metacarpus, form the intermediate part of the skeletal hand located between the phalanges of the fingers and the carpal bones. The metacarpus forms part of the forefeet, and are frequently reduced in number, appropriate to the number of toes. The metacarpals are greatly extended and strengthened, forming an additional segment to the limb, a feature that typically enhances the animal's speed.";
            break;
        case 'Phalanges':
            description = "The phalanges are the bones that make up the toes of the cat. They connect to each metacarpal/metatarsal bone and form the digits of the foot.";
            break;
        case 'Thoracic Vertebrae':
            description = "The thoracic vertebrae in cats are part of the spine and are located in the middle section, forming the region between the neck (cervical) and lower back (lumbar). These vertebrae are responsible for providing structural support to the rib cage and protecting vital organs such as the heart and lungs.";
            break;
        case 'Costal Cartilage':
            description = "The costal cartilage is the ventral cartilagenous part of the rib (opposite to the dorsal bony part). It is connected to the bony rib at the costochondral junction and articulates by its sternal extremity with the sternum (forming the sternocostal joints).";
            break;
        case 'Lumbar Vertebrae':
            description = "The lumbar vertebrae in cats are the vertebrae located in the lower back region of the spine, between the thoracic (mid-back) and sacral (pelvic) regions. These vertebrae are key to supporting the cat's body weight and allowing for the flexibility and movement that are essential for activities such as running, jumping, and twisting.";
            break;
        case 'Pelvis':
            description = "The pelvis in cats is the bony structure that forms the base of the spine and connects the vertebral column to the hind limbs. It serves as an anchor for the muscles of the back and legs and plays a critical role in supporting the cat's weight, enabling movement, and providing protection to vital organs in the lower abdomen.";
            break;
        case 'Femur':
            description = "The femur bone spans the distance between the hip and stifle (knee) joints. Large muscle groups attach to the femur to allow flexion and extension of the rear limb. The top of the femur forms the ball in the ball and socket hip joint, while the bottom of the femur articulates with the tibia in the knee joint";
            break;
        case 'Tibia':
            description = "The tibia is one of the two bones (with fibula) of the skeleton of the leg but the tibia is the only one to support the weight of the animal, which is reflected in an increase in stoutness of this bone.\n\nThe tibia is divided in 3 parts:\n- The proximal extremity with an articular surface for the tibiofemoral joint (major part of the stifle joint)\n- The body (shaft)\n- The distal extremity with its articular surface (cochlea tibiae) for the tarsocrural joint.";
            break;
        case 'Fibula':
            description = "The fibula is the second bone of the skeleton of the leg: it runs along the lateral border of the tibia and does not articulate with the femur proximally.\n\nAs the tibia carries the most of the weight of animal, the fibula is reduced: this reduction differs between species but is correlated as the reduction of the ulna in the thoracic limb. For example, the fibula is reduced  in diameter but not in length in carnivores, whereas in horses the distal part of fibula is completely fused with the tibia.";
            break;
        case 'Tarsus':
            description = "The tarsus in cats refers to the group of bones that make up the ankle joint and the area just above the paw (hind foot). It plays a crucial role in supporting the cat's weight and enabling movement in the hind limbs, particularly during walking, running, and jumping.\n\nAlso a compound and complex joint that is a common site of acute and chronic disease in dogs and cats";
            break;
        case 'Calcaneum':
            description = "The calcaneum (or calcaneus) in cats is the heel bone, located in the tarsus (hind foot). It plays a key role in providing leverage for movement and supporting the cat's weight during locomotion. The calcaneum is part of the ankle joint and contributes to the overall flexibility and agility of the cat's hind limbs.";
            break;
        case 'Metatarsus':
            description = "The metatarsus in cats is the portion of the hind limb located between the tarsus (ankle) and the digits (toes). It is analogous to the metacarpus in the forelimb, with a similar function in supporting the foot and aiding in movement. However, unlike in humans or some other mammals, the metatarsus in cats and many other carnivores does not have a thumb.";
            break;
        case 'Sacrum':
            description = "The sacral vertebrae fuse together and with their ossified intervertebral discs, to form the sacrum, a single bone in all domestic species.\n\nThe cranial part of the sacrum (mainly first sacral vertebra) articulates cranially with the lumbar spine (lumbosacral joint at the lumbosacral vertebral junction) and with the pelvic girdle (sacroiliac joints). The caudal part of sacrum forms the roof of the pelvic cavity.";
            break;
        case 'Caudal Vertebrae':
            description = "The caudal vertebrae (also called coccygeal vertebrae) in cats are the vertebrae located in the tail region. These vertebrae exhibit a progressive reduction in size and complexity as they move toward the tip of the tail. For cats, the caudal vertebrae are important for the function of the tail, which is a vital feature that aids in balance, communication, and agility.";
            break;
    }

    loader.load(
        path,
        (gltf) => {
            const model = gltf.scene;
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0xf0e6d2, // Bone color
                        metalness: 0.1,
                        roughness: 0.7,
                        emissive: 0x000000,  // Ensure no emissive effect
                        emissiveIntensity: 1, // No emissive glow
                    });

                    // assign a name to each object
                    child.name = name;
                    child.userData = { description: description }; // Set description in userData
                }
            });
            model.name = name;  // Set the model's name
            models[name] = model;
            scene.add(model);
        },
        undefined,
        (error) => console.error(`Error loading ${name}:`, error)
    );
}

// load all models (glb paths)
loadModel('Atlas', '/glb/atlas.glb');
loadModel('Femur', '/glb/femur1.glb');
loadModel('Femur', '/glb/femur2.glb');
loadModel('Axis', '/glb/axis.glb');
loadModel('Canine', '/glb/canine.glb')
loadModel('Canine', '/glb/canine2.glb')
loadModel('Canine', '/glb/canine3.glb')
loadModel('Canine', '/glb/canine4.glb')
loadModel('Calcaneum', '/glb/calcaneum.glb');
loadModel('Carpus', '/glb/carpus1.glb');
loadModel('Carpus', '/glb/carpus2.glb');
loadModel('Cervical Vertebrae', '/glb/cervical vertebrae.glb');
loadModel('Caudal Vertebrae', '/glb/caudal vertebrae.glb');
loadModel('Fibula', '/glb/fibula1.glb');
loadModel('Fibula', '/glb/fibula2.glb');
loadModel('Humerus', '/glb/humerus1.glb');
loadModel('Humerus', '/glb/humerus2.glb');
loadModel('Lumbar Vertebrae', '/glb/lumbar vertebrae.glb');
loadModel('Mandible', '/glb/mandible.glb');
loadModel('Metacarpus', '/glb/metacarpus1.glb');
loadModel('Metacarpus', '/glb/metacarpus2.glb');
loadModel('Metatarsus', '/glb/metatarsus1.glb');
loadModel('Metatarsus', '/glb/metatarsus2.glb');
loadModel('Patella', '/glb/patella1.glb');
loadModel('Patella', '/glb/patella2.glb');
loadModel('Pelvis', '/glb/pelvis.glb');
loadModel('Phalanges', '/glb/phalanges1.glb');
loadModel('Phalanges', '/glb/phalanges2.glb');
loadModel('Phalanges', '/glb/phalanges3.glb');
loadModel('Phalanges', '/glb/phalanges4.glb');
loadModel('Radius', '/glb/radius1.glb');
loadModel('Radius', '/glb/radius2.glb');
loadModel('Costal Cartilage', '/glb/rib.glb');
loadModel('Sacrum', '/glb/sacrum.glb');
loadModel('Scapula', '/glb/scapula1.glb');
loadModel('Scapula', '/glb/scapula2.glb');
loadModel('Skull', '/glb/skull.glb');
loadModel('Tarsus', '/glb/tarsus1.glb');
loadModel('Tarsus', '/glb/tarsus2.glb');
loadModel('Thoracic Vertebrae', '/glb/thoracic vertebrae.glb');
loadModel('Tibia', '/glb/tibia1.glb');
loadModel('Tibia', '/glb/tibia2.glb');
loadModel('Ulna', '/glb/ulna1.glb');
loadModel('Ulna', '/glb/ulna2.glb');
loadModel('Molar', '/glb/molar.glb');
loadModel('Teeth', '/glb/teeth.glb');
loadModel('Unnamed', '/glb/unnamed.glb');

let selectedObject = null;
let previousHighlightedObject = null; // To track the previous highlighted object
let originalTransforms = {}; // Store original position, rotation, and scale for each bone
let originalParents = {}; // Store original parent for each bone

// Create the "Return to Full Model" button
const returnButton = document.createElement('button');
returnButton.textContent = "Return to Full Model";
returnButton.style.position = 'absolute';
returnButton.style.top = '90px';
returnButton.style.left = '20px';
returnButton.style.zIndex = 1000;
returnButton.style.display = 'none'; // Initially hidden
document.body.appendChild(returnButton);

// Function to isolate the clicked bone
function isolateBone(clickedObject) {
    // Remove highlight from the previous object
    if (previousHighlightedObject && previousHighlightedObject !== clickedObject) {
        previousHighlightedObject.material.emissive.set(0x000000); // Reset emissive color
        previousHighlightedObject.material.emissiveIntensity = 0;  // Reset emissive intensity
    }

    // Save the original transforms (position, rotation, scale) and parent of the clicked object
    originalTransforms[clickedObject.uuid] = {
        position: clickedObject.position.clone(),
        rotation: clickedObject.rotation.clone(),
        scale: clickedObject.scale.clone()
    };

    // Save the original parent of the clicked object
    originalParents[clickedObject.uuid] = clickedObject.parent;

    // Hide all bones except the clicked one
    scene.children.forEach(child => {
        if (child instanceof THREE.Group || child instanceof THREE.Mesh) {
            child.visible = child === clickedObject || child === clickedObject.parent;
        }
    });

    // Ensure the clicked object is visible
    clickedObject.visible = true;

    // Detach the clicked object from its parent and add it directly to the scene
    clickedObject.parent.remove(clickedObject);
    scene.add(clickedObject); // Add it directly to the scene

    // Highlight the clicked object
    clickedObject.material.emissive.set(0xff0000);
    clickedObject.material.emissiveIntensity = 0.5;

    // Center the object in the view
    const bbox = new THREE.Box3().setFromObject(clickedObject);
    const size = bbox.getSize(new THREE.Vector3()).length();
    const center = bbox.getCenter(new THREE.Vector3());

    // Adjust the camera position based on the size of the object
    const cameraOffset = size * 2;
    camera.position.set(center.x, center.y, center.z + cameraOffset);
    controls.target.set(center.x, center.y, center.z);
    controls.update();

    // Set the selected object reference
    selectedObject = clickedObject;

    // Show the return button
    returnButton.style.display = 'block';

    // Update previousHighlightedObject
    previousHighlightedObject = clickedObject;
}

// Function to restore the full skeleton
function restoreSkeleton() {
    if (selectedObject) {
        // Restore the selected object to its original position, rotation, and scale
        selectedObject.position.copy(originalTransforms[selectedObject.uuid].position);
        selectedObject.rotation.copy(originalTransforms[selectedObject.uuid].rotation);
        selectedObject.scale.copy(originalTransforms[selectedObject.uuid].scale);

        // Reattach the object to its original parent
        originalParents[selectedObject.uuid].add(selectedObject);

        // Restore visibility of all objects in the scene, not just bones
        scene.children.forEach(child => {
            if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
                child.visible = true; // Make all objects visible again
            }
        });

        // Reset the camera to its original position and target
        camera.position.set(0, 5, 5); // Default camera position
        controls.target.set(0, 0, 0);
        controls.update();

        // Reset the highlight of the selected object
        selectedObject.material.emissive.set(0x000000);
        selectedObject.material.emissiveIntensity = 0;

        // Hide the return button
        returnButton.style.display = 'none';

        // Clear selected object reference
        selectedObject = null;

        // Clear previous highlight reference
        previousHighlightedObject = null;
    }
}

// Create tooltip element
const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
tooltip.style.color = '#fff';
tooltip.style.padding = '6px 10px';
tooltip.style.borderRadius = '4px';
tooltip.style.fontSize = '12px';
tooltip.style.pointerEvents = 'none';
tooltip.style.display = 'none'; // Initially hidden
document.body.appendChild(tooltip);

// Mousemove event for highlighting objects
window.addEventListener('mousemove', (event) => {
    event.preventDefault();

    const canvas = document.querySelector('.webgl');
    const rect = canvas.getBoundingClientRect();

    const mouse = {
        x: ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1,
        y: -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1,
    };

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children.filter(obj => obj.visible), true);

    if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;

        if (hoveredObject instanceof THREE.Mesh && hoveredObject.visible) {
            // Highlight hovered object
            if (previousHighlightedObject !== hoveredObject) {
                // Remove previous highlight if it's different
                if (previousHighlightedObject) {
                    previousHighlightedObject.material.emissive.set(0x000000);
                    previousHighlightedObject.material.emissiveIntensity = 0;
                }

                hoveredObject.material.emissive.set(0xff0000); // Set emissive color to red
                hoveredObject.material.emissiveIntensity = 0.5;  // Set emissive intensity

                // Update previousHighlightedObject
                previousHighlightedObject = hoveredObject;
            }

            // Display tooltip with the name
            tooltip.innerHTML = `<strong>${hoveredObject.name}</strong>`;
            tooltip.style.display = 'block';
            tooltip.style.left = `${event.clientX + 10}px`;
            tooltip.style.top = `${event.clientY + 10}px`;
        }
    } else {
        // Reset highlight if no object is hovered
        if (previousHighlightedObject) {
            previousHighlightedObject.material.emissive.set(0x000000);
            previousHighlightedObject.material.emissiveIntensity = 0;
            previousHighlightedObject = null;
        }

        // Hide tooltip
        tooltip.style.display = 'none';
    }
});

// Click event for selecting a bone
window.addEventListener('click', (event) => {
    event.preventDefault();

    const canvas = document.querySelector('.webgl');
    const rect = canvas.getBoundingClientRect();

    const mouse = {
        x: ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1,
        y: -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1,
    };

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children.filter(obj => obj.visible), true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        // Only proceed if the clicked object is visible and not already selected
        if (clickedObject instanceof THREE.Mesh && clickedObject.visible && selectedObject !== clickedObject) {
            isolateBone(clickedObject); // Isolate the clicked bone

            // Display full description in the anatomy info section
            const description = clickedObject.userData.description || "No description provided.";
            document.getElementById('anatomy-info').innerHTML = `
                <h3>${clickedObject.name}</h3>
                <p>${description}</p>
            `;
        }
    }
});

// Return button event
returnButton.addEventListener('click', () => {
    restoreSkeleton(); // Call the function to restore the full skeleton

    // Clear the anatomy info section
    document.getElementById('anatomy-info').innerHTML = "Click on a bone to learn more about it!";

    // Clear any selected object
    selectedObject = null;
});

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // for smooth movement of camera
controls.dampingFactor = 0.1;
controls.rotateSpeed = 1;
  
// Handle resizing
window.addEventListener('resize', () => {
    camera.aspect = (window.innerWidth * (2 / 3)) / (window.innerHeight - 120);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth * (2 / 3), window.innerHeight - 120);
});
  
// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
