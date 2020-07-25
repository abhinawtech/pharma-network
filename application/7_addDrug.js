'use strict';

/**
 * This is a Node.JS application to add a new drug on the network.
 */

const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
let gateway;

async function main(organisation,drugName, serialNo,mfgDate, expDate, companyCRN) {

	try {

		const pharmanetContract = await getContractInstance(organisation);

		// CAdd a new Drug
		console.log('....Add a New Drug');
		const drugBuffer = await pharmanetContract.submitTransaction('addDrug', drugName, serialNo,mfgDate, expDate, companyCRN);

		// process response
		console.log('.....Processing Add Drug Transaction Response \n\n');
		let newDrug = JSON.parse(drugBuffer.toString());
		console.log(newDrug);
		console.log('\n\n.....Add Drug Transaction Complete!');
		return newDrug;

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

if(organization!=="Manufacturer")
{
  throw new Error("Only Manufacturer can add drug"+organization);
}
	// A wallet is where the credentials to be used for this transaction exist
var wallet;
var fabricUserName;
var connectionProfile;

		 wallet = new FileSystemWallet('./identity/manufacturer');

		// What is the username of this Client user accessing the network?
		 fabricUserName= 'MANUFACTURER_ADMIN';
		 connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile-manufacturer.yaml', 'utf8'));


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

 /*main('Manufacturer', 'Parace','D10001', '22-09-2009','22-09-2029','CRN0001').then(() => {
	console.log('New Drug added');
});*/

module.exports.execute = main;
