"use strict"

/**
 * This is a Node.JS module to load a user's Identity to his wallet.
 * This Identity will be used to sign transactions initiated by this user.
 * Defaults:
 *  User Name: ORG1_ADMIN
 *  User Organization: ORG1
 *  User Role: Admin
 *
 */

const fs = require("fs") // FileSystem Library
const { Wallets } = require("fabric-network") // Wallet Library provided by Fabric

async function main(certificatePath, privateKeyPath) {
  // Main try/catch block
  try {
    // A wallet is a filesystem path that stores a collection of Identities
    const wallet = await Wallets.newFileSystemWallet("./identity/transprator")

    // Fetch the credentials from our previously generated Crypto Materials required to create this user's identity
    const certificate = fs.readFileSync(certificatePath).toString()
    const privatekey = fs.readFileSync(privateKeyPath).toString()

    // Load credentials into wallet
    const identityLabel = "ORG1_ADMIN"
    const identity = {
      credentials: {
        certificate: certificate,
        privateKey: privatekey,
      },
      mspId: "ConsumerMSP",
      type: "X.509",
    }

    await wallet.put(identityLabel, identity)
  } catch (error) {
    console.log(`Error adding to wallet. ${error}`)
    console.log(error.stack)
    throw new Error(error)
  }
}

// const certificatePath =
//   "/Users/gautamkolluru/hyper-ledger-2.4/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem"
// const privateKeyPath =
//   "/Users/gautamkolluru/hyper-ledger-2.4/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/priv_sk"

const certificatePath =
  "/Users/gautamkolluru/vcscode/Pharma-network/new-network/organizations/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/signcerts/cert.pem"
const privateKeyPath =
  "/Users/gautamkolluru/vcscode/Pharma-network/new-network/organizations/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/keystore/e7810c431017182e9cf5ac02ad05aeb86421c465bcc2bf2ae71bbc54953666e1_sk"

main(certificatePath, privateKeyPath)
