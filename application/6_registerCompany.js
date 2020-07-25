'use strict';

/**
 * This is a Node.JS application to add a new company on the network.
 */

const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
let gateway;

async function main(organisation,companyCRN, companyName, location, organisationRole) {

	try {

		const pharmanetContract = await getContractInstance(organisation);

		// Create a new company account
		console.log('.....Create a new company');
		const companyBuffer = await pharmanetContract.submitTransaction('registerCompany', companyCRN, companyName, location, organisationRole);

		// process response
		console.log('.....Processing Register Company Transaction Response \n\n');
		let newCompany = JSON.parse(companyBuffer.toString());
		console.log(newCompany);
		console.log('\n\n.....Create Company Transaction Complete!');
		return newCompany;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		console.log('.....Disconnecting from Fabric Gateway');
		gateway.disconnect();

	}
}

async function getContractInstance(organization) {

	// A gateway defines which peer is used to access Fabric network
	// It uses a common connection profile (CCP) to connect to a Fabric Peer
	// A CCP is defined manually in file connection-profile.yaml
	gateway = new Gateway();

	// A wallet is where the credentials to be used for this transaction exist
var wallet;
var fabricUserName;
var connectionProfile;
	if(organization==="Manufacturer")
	{
		 wallet = new FileSystemWallet('./identity/manufacturer');

		// What is the username of this Client user accessing the network?
		 fabricUserName= 'MANUFACTURER_ADMIN';
		 connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile-manufacturer.yaml', 'utf8'));
	}
	else if (organization==="Retailer") {
		 wallet = new FileSystemWallet('./identity/retailer');

		// What is the username of this Client user accessing the network?
		 fabricUserName = 'RETAILER_ADMIN';
		 connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile-retailer.yaml', 'utf8'));

	}

	else if (organization === "Consumer") {
		 wallet = new FileSystemWallet('./identity/consumer');

		// What is the username of this Client user accessing the network?
		 fabricUserName = 'CONSUMER_ADMIN';
		 connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile-consumer.yaml', 'utf8'));
	}
	else if (organization === "Transporter") {
		 wallet = new FileSystemWallet('./identity/transporter');

		// What is the username of this Client user accessing the network?
		 fabricUserName = 'TRANSPORTER_ADMIN';
		 connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile-transporter.yaml', 'utf8'));

	}
	else if (organization === "Distributor") {
		 wallet = new FileSystemWallet('./identity/distributor');

		// What is the username of this Client user accessing the network?
		 fabricUserName = 'DISTRIBUTOR_ADMIN';
		 connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile-distributor.yaml', 'utf8'));

	}


	// Set connection options; identity and wallet
	let connectionOptions = {
		wallet: wallet,
		identity: fabricUserName,
		discovery: { enabled: false, asLocalhost: true }
	};

	// Connect to gateway using specified parameters
	console.log('.....Connecting to Fabric Gateway');
	await gateway.connect(connectionProfile, connectionOptions);

	// Access certification channel
	console.log('.....Connecting to channel - pharmachannel');
	const channel = await gateway.getNetwork('pharmachannel');

	// Get instance of deployed Phamrmanet contract
	// @param Name of chaincode
	// @param Name of smart contract
	console.log('.....Connecting to Pharmanet Smart Contract');
	return channel.getContract('pharmanet', 'org.pharma-network.pharmanet');
}

/* main('Manufacturer','CRN0005', 'Sun Pharma', 'Delhi','Manufacturer').then(() => {
	console.log('Company account created');
});*/

module.exports.execute = main;
