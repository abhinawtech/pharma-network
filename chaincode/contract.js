'use strict';

const {Contract} = require('fabric-contract-api');

class PharmaContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.pharma-network.pharmanet');
	}

	/* ****** All custom functions are defined below ***** */

	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Pharma Net Smart Contract Instantiated');
	}

	/**
		 * Create a new user account on the network
		 * @param ctx - The transaction context object
		 * @param name - Name of the user
		 * @param email - Email ID of the user
		 * @param phone_no - phone_no of the user
		 * @param aadhar_no - aadhar_no of the user
		 * @returns
		 */
		async registerCompany(ctx, companyCRN, companyName, location, organisationRole) {

			if(organisationRole!== "Manufacturer"  && organisationRole !== "Transporter" && organisationRole  !== "Retailer" && organisationRole !== "Distributor")
			{
				throw new Error('Organisation Role is not correct'+organisationRole);
			}

			// Create a new composite key for the new company account
			const requestKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [companyCRN,companyName]);

			let hierarchy;
			if(organisationRole==="Manufacturer")
			{
				hierarchy=1;
			}
			else if (organisationRole === "Distributor") {
				hierarchy=2;
			}
			else if (organisationRole==="Retailer") {
				hierarchy=3;
			}

				// Create a users object to be stored in blockchain
				let newRequestObject = {
					companyID: requestKey,
					name: companyName,
					location: location,
					organisationRole: organisationRole,
					hierarchyKey: hierarchy,
					createdAt: new Date(),
						updatedAt: new Date(),

				};

				// Convert the JSON object to a buffer and send it to blockchain for storage
				let dataBuffer = Buffer.from(JSON.stringify(newRequestObject));
				await ctx.stub.putState(requestKey, dataBuffer);
				// Return value of new student account created to user
				return newRequestObject;


		}

		/**
			 * Create a new user account on the network
			 * @param ctx - The transaction context object
			 * @param name - Name of the user
			 * @param email - Email ID of the user
			 * @param phone_no - phone_no of the user
			 * @param aadhar_no - aadhar_no of the user
			 * @returns
			 */
			async addDrug(ctx,drugName, serialNo,mfgDate, expDate, companyCRN) {
				// Create a new composite key for the new company account

			let companyObject=await this.getCompanyObject(ctx,companyCRN);

			//console.log(companyObject);

			if(companyObject.organisationRole !== "Manufacturer")
			{
				throw new Error("Only Manufacturer can initiate addDrug function"+companyObject.organisationRole);
			}

			const drugKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [drugName,serialNo]);
			let drugObject = {
			drugName: drugName,
			serialNo: serialNo,
			manufacturer: companyObject.companyID,
			mfgDate: mfgDate,
			expDate: expDate,
			companyCRN: companyCRN,
			owner: "Manufacturer",
			shipment: [],
			createdAt: new Date(),
			updatedAt: new Date(),
			};


			let drugBuffer = Buffer.from(JSON.stringify(drugObject));

      await ctx.stub.putState(drugKey, drugBuffer);

// Return value of new drug
     return drugObject;

			}

		async	getCompanyObject(ctx,companyCRN) {

	// Return value of property from blockchain

	let companyIterator = await ctx.stub
	.getStateByPartialCompositeKey('org.pharma-network.pharmanet.company', [companyCRN])
	.catch(err => console.log(err));

	 const res = await companyIterator.next();
	let companyKey = res.value.key;
	await companyIterator.close();
	let companyBuffer = await ctx.stub
	.getState(companyKey)
	.catch(err => console.log(err));

	// Make sure that approved company exist .

	if (companyBuffer.length === 0 ) {
	throw new Error('No such company exists: ' + companyKey);
	}
	let companyObject =  JSON.parse(companyBuffer.toString());
	     return companyObject;
	}

	async createPO (ctx,buyerCRN, sellerCRN, drugName, quantity){

		let buyerObject = await this.getCompanyObject(ctx,buyerCRN);
		const buyerKey = buyerObject.companyID;
		let sellerObject = await this.getCompanyObject(ctx,sellerCRN);
		const sellerKey = sellerObject.companyID;

		if (buyerObject.organisationRole !== "Distributor" && buyerObject.organisationRole !== "Retailer"){
		 throw new Error('Only Distributor and Retailer can initiate a PO and not the this org which is of type ' + buyerObject.organisationRole );
		}
		if (sellerObject.organisationRole === "Munufacturer" && buyerObject.organisationRole !== "Distributor"){
		 throw new Error('Manufacturer can only sell to buyer of type Manfacturer but here the buyer is ' + buyerObject.organisationRole );
		}
		if (sellerObject.organisationRole === "Distributor" && buyerObject.organisationRole !== "Retailer"){
		 throw new Error('Distributor can only sell to buyer of type Retailer but here the buyer is ' + buyerObject.organisationRole );
		}

		// define a new addDrug object to be stored on ledger

		  // (drugName, serialNo, mfgDate, expDate, companyCRN)

let orderObject = {
		drugName: drugName,
		quantity: quantity,
		buyer: buyerKey,
		seller: sellerKey,
		createdAt: new Date(),
		updatedAt: new Date(),
		  };

		  const orderKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.pos', [buyerCRN,drugName]);
		  // Convert the JSON object to a buffer and send it to blockchain for storage
		  let orderBuffer = Buffer.from(JSON.stringify(orderObject));
		  await ctx.stub.putState(orderKey, orderBuffer);
		  // Return value of new company
		  return orderObject;
	}

	async createShipment (ctx, buyerCRN, drugName, listOfAssets, transporterCRN)
{

let buyerObject1=await this.getCompanyObject(ctx,buyerCRN);
var assets=listOfAssets.split(",");
const orderKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.pos', [buyerCRN,drugName]);

let orderBuffer = await ctx.stub
.getState(orderKey)
.catch(err => console.log(err));

// Make sure that a PO was created .

if (orderBuffer.length === 0 ) {
throw new Error('No such PO created: ' + orderKey);
}

let orderObject =  JSON.parse(orderBuffer.toString());

console.log(orderObject.quantity+ "---" +assets.length);

if (parseInt(orderObject.quantity) !== assets.length)
{
throw new Error('PO quantity does not match with listOfAssets' + listOfAssets );
}

// Updating the owner of each batch
for(var i=0;i<assets.length;i++)
{
	const drugKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [drugName,assets[i]]);

	let drugBuffer = await ctx.stub
	.getState(drugKey)
	.catch(err => console.log(err));

		const drug=JSON.parse(drugBuffer.toString());

	let drugObject = {
	drugName: drug.drugName,
	serialNo: drug.serialNo,
	manufacturer: drug.manufacturer,
	mfgDate: drug.mfgDate,
	expDate: drug.expDate,
	companyCRN: drug.companyCRN,
	owner: buyerObject1.companyID,
	shipment: [],
	createdAt: drug.createdAt,
	updatedAt: new Date(),
	};

	let drugBuffer1 = Buffer.from(JSON.stringify(drugObject));

	await ctx.stub.putState(drugKey, drugBuffer1);

// Return value of new company

}

const shipmentKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipment', [buyerCRN,drugName]);

let buyerObject = await this.getCompanyObject(ctx, buyerCRN);

const buyerKey = buyerObject.companyID;
const transporterName = buyerObject.name;

const transporterKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.transporter', [transporterName,transporterCRN]);

let shipmentObject = {
shipmentID: shipmentKey,
creator: buyerKey,
assets: assets,
transporter: transporterKey,
status: "in-transit",
createdAt: new Date(),
updatedAt: new Date(),
	};

	let shipmentBuffer = Buffer.from(JSON.stringify(shipmentObject));

	await ctx.stub.putState(shipmentKey, shipmentBuffer);

// Return value of new company
 return shipmentObject;
}

async updateShipment(ctx, buyerCRN, drugName, transporterCRN)
{
let buyerObject1=await this.getCompanyObject(ctx,buyerCRN);

	if(ctx.clientIdentity.getMSPID()=="transporterMSP")
	{
		throw new Error("Only Transporter can initiate this function"+ ctx.clientIdentity.getMSPID());
	}

	const shipmentKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipment', [buyerCRN,drugName]);

	let shipmentBuffer = await ctx.stub
	.getState(shipmentKey)
	.catch(err => console.log(err));

	const shipment=JSON.parse(shipmentBuffer.toString());

	const assets=shipment.assets;

	console.log(assets);

	for (var i = 0; i < assets.length; i++) {
const drugKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [drugName,assets[i]]);

		let drugBuffer = await ctx.stub
		.getState(drugKey)
		.catch(err => console.log(err));
		const drug=JSON.parse(drugBuffer.toString());

		let drugObject = {
		drugName: drug.drugName,
		serialNo: drug.serialNo,
		manufacturer: drug.manufacturer,
		mfgDate: drug.mfgDate,
		expDate: drug.expDate,
		companyCRN: drug.companyCRN,
		owner: buyerObject1.companyID,
		shipment: shipmentKey,
		createdAt: drug.createdAt,
		updatedAt: new Date(),
		};


		let drugBuffer1 = Buffer.from(JSON.stringify(drugObject));

		await ctx.stub.putState(drugKey, drugBuffer1);

	// Return value of new drug
}

let shipmentObject = {
shipmentID: shipment.shipmentKey,
creator: shipment.buyerKey,
assets: shipment.assets,
transporter: shipment.transporterKey,
status: "delivered",
createdAt: shipment.createdAt,
updatedAt: new Date(),
	};

	let shipmentBuffer1 = Buffer.from(JSON.stringify(shipmentObject));

	await ctx.stub.putState(shipmentKey, shipmentBuffer1);

// Return value of new company
 return shipmentObject;

}

 async retailDrug (ctx,drugName, serialNo, retailerCRN, customerAadhar)
 {

	 const drugKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [drugName,serialNo]);

	 let drugBuffer = await ctx.stub
	 .getState(drugKey)
	 .catch(err => console.log(err));

		const drug=JSON.parse(drugBuffer.toString());

		let companyBuffer = await ctx.stub
		.getState(drug.owner)
		.catch(err => console.log(err));

		const company=JSON.parse(companyBuffer.toString());

	let	owner=company.organisationRole;


	 let drugObject = {
	 drugName: drug.drugName,
	 serialNo: drug.serialNo,
	 manufacturer: drug.manufacturer,
	 mfgDate: drug.mfgDate,
	 expDate: drug.expDate,
	 companyCRN: drug.companyCRN,
	 owner: customerAadhar,
	 shipment: drug.shipment,
	 createdAt: drug.createdAt,
	 updatedAt: new Date(),
	 };


	 let drugBuffer1 = Buffer.from(JSON.stringify(drugObject));

	 await ctx.stub.putState(drugKey, drugBuffer1);

 // Return value of ne
	  return drugObject;
 }

	async viewHistory (ctx, drugName, serialNo)
	{
		 const drugKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [drugName,serialNo]);
		 let iterator = await ctx.stub
		 .getHistoryForKey(drugKey)
		 .catch(err => console.log(err));

		 const allResults = [];
 while (true) {
 const res = await iterator.next();

 if (res.value && res.value.value.toString()) {
 /// console.log(res.value.value.toString('utf8'));

 const Key = res.value.key;
 let Record;
 try {
 Record = JSON.parse(res.value.value.toString('utf8'));
 } catch (err) {
 console.log(err);
 Record = res.value.value.toString('utf8');
 }
 allResults.push({ Key, Record });
 }
 if (res.done) {
 // console.log('end of data');
 await iterator.close();
 // console.info(allResults);
 var comp = allResults[0];

 return JSON.stringify(allResults);


 }

 }


	}

	async viewDrugCurrentState (ctx, drugName, serialNo)
	{
		const drugKey=ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [drugName,serialNo]);
	 let drugBuffer = await ctx.stub
	 .getState(drugKey)
	 .catch(err => console.log(err));

	 return JSON.parse(drugBuffer.toString());
	}

}

module.exports = PharmaContract;
