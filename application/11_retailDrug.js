'use strict';

/**
 * This is a Node.JS application to add a new company on the network.
 */

const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
let gateway;

async function main(organisation,drugName, serialNo, retailerCRN, customerAadhar) {

	try {

		const pharmanetContract = await getContractInstance(organisation);

		// Retail Drug
		console.log('.....Retail Drug');
		const retailDrugBuffer = await pharmanetContract.submitTransaction('retailDrug', drugName, serialNo, retailerCRN, customerAadhar);

		// process response
		console.log('.....Processing Retail Drug Transaction Response \n\n');
		let retailDrug = JSON.parse(retailDrugBuffer.toString());
		console.log(retailDrug);
		console.log('\n\n....Retail Drug Transaction Complete!');
		return retailDrug;

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

  if (organization !== "Retailer"){
   throw new Error('Only Retailer can initiate' + organization );
  }

	// A wallet is where the credentials to be used for this transaction exist
var wallet;
var fabricUserName;
var connectionProfile;
		 wallet = new FileSystemWallet('./identity/retailer');

		// What is the username of this Client user accessing the network?
		 fabricUserName = 'RETAILER_ADMIN';
		 connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile-retailer.yaml', 'utf8'));




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

 /*main('Retailer','Parace', 'D10001', 'CRN0005','A1111').then(() => {
	console.log('Retail Drug ');
});*/

module.exports.execute = main;
