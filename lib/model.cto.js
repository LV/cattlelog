'use strict';

/* global getAssetRegistry getParticipantRegistry getFactory */

/**
 *
 * @param {com.cattlelog.AnimalDeparture} departure - model instance
 * @transaction
 */
async function onAnimalDeparture(departure) {  // eslint-disable-line no-unused-vars
    console.log('onAnimalDeparture');
    if (departure.animal.movementStatus !== 'IN_FIELD') {
        throw new Error('Animal is already IN_TRANSIT');
    }

     // set the movement status of the animal
    departure.animal.movementStatus = 'IN_TRANSIT';

     // save the animal
    const ar = await getAssetRegistry('com.cattlelog.Animal');
    await ar.update(departure.animal);

    // add the animal to the incoming animals of the
    // destination farm
    if (departure.to.incomingAnimals) {
        departure.to.incomingAnimals.push(departure.animal);
    } else {
        departure.to.incomingAnimals = [departure.animal];
    }

    // save the farm
    const br = await getAssetRegistry('com.cattlelog.Farm');
    await br.update(departure.to);
}

/**
 *
 * @param {com.cattlelog.AnimalArrival} arrival - model instance
 * @transaction
 */
async function onAnimalArrival(arrival) {  // eslint-disable-line no-unused-vars
    console.log('onAnimalArrival');

    if (arrival.animal.movementStatus !== 'IN_TRANSIT') {
        throw new Error('Animal is not IN_TRANSIT');
    }

     // set the movement status of the animal
    arrival.animal.movementStatus = 'IN_FIELD';

     // set the new owner of the animal
     // to the owner of the 'to' farm
    arrival.animal.owner = arrival.to.owner;

     // set the new location of the animal
    arrival.animal.location = arrival.arrivalField;

     // save the animal
    const ar = await getAssetRegistry('com.cattlelog.Animal');
    await ar.update(arrival.animal);

    // remove the animal from the incoming animals
    // of the 'to' farm
    if (!arrival.to.incomingAnimals) {
        throw new Error('Incoming farms should have incomingAnimals on AnimalArrival.');
    }

    arrival.to.incomingAnimals = arrival.to.incomingAnimals
      .filter(function(animal) {
          return animal.animalId !== arrival.animal.animalId;
      });

    // save the farm
    const br = await getAssetRegistry('com.cattlelog.Farm');
    await br.update(arrival.to);
}

/**
 *
 * @param {com.cattlelog.SetupDemo} setupDemo - SetupDemo instance
 * @transaction
 */
async function setupDemo(setupDemo) {  // eslint-disable-line no-unused-vars
    const factory = getFactory();
    const NS = 'com.cattlelog';

    const farmers = [
        factory.newResource(NS, 'Farmer', 'FARMER_1'),
        factory.newResource(NS, 'Farmer', 'FARMER_2')
    ];

    const farms = [
        factory.newResource(NS, 'Farm', 'FARM_1'),
        factory.newResource(NS, 'Farm', 'FARM_2')
    ];

    const fields = [
        factory.newResource(NS, 'Field','FIELD_1'),
        factory.newResource(NS, 'Field','FIELD_2'),
        factory.newResource(NS, 'Field','FIELD_3'),
        factory.newResource(NS, 'Field','FIELD_4')
    ];

    const animals = [
        factory.newResource(NS, 'Animal', 'ANIMAL_1'),
        factory.newResource(NS, 'Animal', 'ANIMAL_2'),
        factory.newResource(NS, 'Animal', 'ANIMAL_3'),
        factory.newResource(NS, 'Animal', 'ANIMAL_4'),
        factory.newResource(NS, 'Animal', 'ANIMAL_5'),
        factory.newResource(NS, 'Animal', 'ANIMAL_6'),
        factory.newResource(NS, 'Animal', 'ANIMAL_7'),
        factory.newResource(NS, 'Animal', 'ANIMAL_8')
    ];

    const regulator = factory.newResource(NS, 'Regulator', 'REGULATOR');
    regulator.email = 'REGULATOR';
    regulator.firstName = 'Ronnie';
    regulator.lastName = 'Regulator';
    const regulatorRegistry = await getParticipantRegistry(NS + '.Regulator');
    await regulatorRegistry.addAll([regulator]);

    farmers.forEach(function(farmer) {
        const sbi = 'FARM_' + farmer.getIdentifier().split('_')[1];
        farmer.firstName = farmer.getIdentifier();
        farmer.lastName = '';
        farmer.address1 = 'Address1';
        farmer.address2 = 'Address2';
        farmer.county = 'County';
        farmer.postcode = 'PO57C0D3';
        farmer.farm = factory.newResource(NS, 'Farm', sbi);
    });
    const farmerRegistry = await getParticipantRegistry(NS + '.Farmer');
    await farmerRegistry.addAll(farmers);

    farms.forEach(function(farm, index) {
        const farmer = 'FARMER_' + (index + 1);
        farm.address1 = 'Address1';
        farm.address2 = 'Address2';
        farm.county = 'County';
        farm.postcode = 'PO57C0D3';
        farm.owner = factory.newRelationship(NS, 'Farmer', farmer);
    });
    const farmRegistry = await getAssetRegistry(NS + '.Farms');
    await farmRegistry.addAll(farms);

    fields.forEach(function(field, index) {
        const farms = 'FARMS_' + ((index % 2) + 1);
        field.name = 'FIELD_' + (index + 1);
        field.farms = factory.newRelationship(NS, 'Farm', farm);
    });
    const fieldRegistry = await getAssetRegistry(NS + '.Field');
    await fieldRegistry.addAll(fields);

    animals.forEach(function(animal, index) {
        const field = 'FIELD_' + ((index % 2) + 1);
        const farmer = 'FARMER_' + ((index % 2) + 1);
        animal.species = 'SHEEP_GOAT';
        animal.movementStatus = 'IN_FIELD';
        animal.productionType = 'MEAT';
        animal.location = factory.newRelationship(NS, 'Field', field);
        animal.owner = factory.newRelationship(NS, 'Farmer', farmer);
    });
    const animalRegistry = await getAssetRegistry(NS + '.Animal');
    await animalRegistry.addAll(animals);
}
