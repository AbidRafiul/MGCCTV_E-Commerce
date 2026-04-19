const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: 'Mid-server-NWg9EMzol2K_aDmh65H_YWPf',
    clientKey: 'Mid-client-6nV0GlnBuPQjhagM'
});

snap.createTransaction({
    transaction_details: {
        order_id: 'TEST-' + Date.now(),
        gross_amount: 10000
    }
}).then(r => console.log('SUKSES:', r))
  .catch(e => console.log('ERROR:', e.message));