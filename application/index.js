const express = require('express');
const app = express();
const cors = require('cors');
const port = 4000;

// Import all function modules

const addToWallet_manufacturer = require('./1_addToWallet_manufacturer');
const addToWallet_distributor = require('./2_addToWallet_distributor');
const addToWallet_transporter = require('./3_addToWallet_transporter');
const addToWallet_consumer = require('./4_addToWallet_consumer');
const addToWallet_retailer = require('./5_addToWallet_retailer');
const registerCompany = require('./6_registerCompany');
const addDrug = require('./7_addDrug');
const createPO = require('./8_createPO');
const createShipment = require('./9_createShipment');
const updateShipment = require('./10_updateShipment');
const retailDrug = require('./11_retailDrug');
const viewHistory = require('./12_viewHistory');
const viewDrugCurrentState = require('./13_viewDrugCurrentState');

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharma Network App');

app.get('/', (req, res) => res.send('Hello There!'));

app.post('/addToWallet_manufacturer', (req, res) => {
	addToWallet_manufacturer.execute(req.body.certificatePath, req.body.privateKeyPath)
			.then(() => {
				console.log('Manufacturer credentials added to wallet');
				const result = {
					status: 'success',
					message: 'Manufacturer credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/addToWallet_distributor', (req, res) => {
	addToWallet_distributor.execute(req.body.certificatePath, req.body.privateKeyPath)
			.then(() => {
				console.log('Distributor credentials added to wallet');
				const result = {
					status: 'success',
					message: 'Distributor credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/addToWallet_transporter', (req, res) => {
	addToWallet_transporter.execute(req.body.certificatePath, req.body.privateKeyPath)
			.then(() => {
				console.log('Transporter credentials added to wallet');
				const result = {
					status: 'success',
					message: 'Transporter credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/addToWallet_consumer', (req, res) => {
	addToWallet_consumer.execute(req.body.certificatePath, req.body.privateKeyPath)
			.then(() => {
				console.log('Consumer credentials added to wallet');
				const result = {
					status: 'success',
					message: 'Consumer credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/addToWallet_retailer', (req, res) => {
	addToWallet_retailer.execute(req.body.certificatePath, req.body.privateKeyPath)
			.then(() => {
				console.log('Retailer credentials added to wallet');
				const result = {
					status: 'success',
					message: 'Retailer credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/registerCompany', (req, res) => {
	registerCompany.execute(req.body.organisation,req.body.companyCRN, req.body.companyName, req.body.location, req.body.organisationRole)
			.then((company) => {
				console.log('New Company created');
				const result = {
					status: 'success',
					message: 'New Company created',
					company: company
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/addDrug', (req, res) => {
	addDrug.execute(req.body.organisation,req.body.drugName, req.body.serialNo, req.body.mfgDate, req.body.expDate,req.body.companyCRN)
			.then((drug) => {
				console.log('New Drug Added');
				const result = {
					status: 'success',
					message: 'New Drug added',
					drug: drug
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/createPO', (req, res) => {
	createPO.execute(req.body.organisation,req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity)
			.then((po) => {
				console.log('New PO created');
				const result = {
					status: 'success',
					message: 'New PO added',
					po: po
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/createShipment', (req, res) => {
	createShipment.execute(req.body.organisation,req.body.buyerCRN, req.body.drugName, req.body.listOfAssets, req.body.transporterCRN)
			.then((Shipment) => {
				console.log('New Shipment created');
				const result = {
					status: 'success',
					message: 'New Shipment created',
					Shipment: Shipment
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/updateShipment', (req, res) => {
	updateShipment.execute(req.body.organisation,req.body.buyerCRN, req.body.drugName, req.body.transporterCRN)
			.then((Shipment) => {
				console.log(' Shipment updated');
				const result = {
					status: 'success',
					message: 'Shipment Added',
					Shipment: Shipment
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/retailDrug', (req, res) => {
	retailDrug.execute(req.body.organisation,req.body.drugName, req.body.serialNo, req.body.retailerCRN, req.body.customerAadhar)
			.then((retailer) => {
				console.log(' retail drug');
				const result = {
					status: 'success',
					message: 'retail Added',
					retail: retailer
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/viewHistory', (req, res) => {
	viewHistory.execute(req.body.organisation,req.body.drugName, req.body.serialNo)
			.then((History) => {
				console.log(' History');
				const result = {
					status: 'success',
					message: 'History',
					retail: History
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/viewDrugCurrentState', (req, res) => {
	viewDrugCurrentState.execute(req.body.organisation,req.body.drugName, req.body.serialNo)
			.then((Current) => {
				console.log(' Current State');
				const result = {
					status: 'success',
					message: 'Current State',
					Current: Current
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.listen(port, () => console.log(`Distributed Pharma App listening on port ${port}!`));
